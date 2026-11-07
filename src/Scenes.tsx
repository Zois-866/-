import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {
  BAR,
  BEAT,
  DURATION,
  FLASH_AT,
  FPS,
  HIGHS,
  SCENES,
  Scene,
  SectionId,
  Transition,
  bar,
  s2f,
  sectionAt,
} from './timeline';

// 每種轉場的進場幀數
const T_LEN: Record<Transition, number> = {fade: 9, iris: 13, spiral: 15, cut: 0, flash: 0, glitch: 5};

// 分段調色：intro 對講機綠、chorus 洋紅暖光、verse 越來越藍、pre 金色
const GRADE: Record<SectionId, string> = {
  intro: 'grayscale(0.8) sepia(0.45) hue-rotate(62deg) saturate(1.7) contrast(1.18) brightness(0.88)',
  chorus: 'saturate(1.3) contrast(1.08) brightness(1.02)',
  verse: 'saturate(0.85) contrast(1.06) brightness(0.9)',
  pre: 'saturate(1.25) contrast(1.12) brightness(1.04)',
  end: 'saturate(1.1) contrast(1.05)',
};

export const sceneBounds = (i: number) => {
  const from = s2f(bar(SCENES[i].at));
  const to = i + 1 < SCENES.length ? s2f(bar(SCENES[i + 1].at)) : DURATION;
  return {from, to};
};

const SceneImage: React.FC<{scene: Scene; span: number; style?: React.CSSProperties; extraFilter?: string}> = ({
  scene,
  span,
  style,
  extraFilter = '',
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, span], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const [z0, z1] = scene.zoom ?? [1.08, 1.2];
  const [x0, y0, x1, y1] = scene.pan ?? [0, 0, 0, 0];
  const ease = Easing.inOut(Easing.sin)(p);
  const z = z0 + (z1 - z0) * ease;
  const x = x0 + (x1 - x0) * ease;
  const y = y0 + (y1 - y0) * ease;
  const sec = sectionAt(bar(scene.at)).id;
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(`images/${scene.img}.jpg`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: scene.pos ?? '50% 50%',
          transform: `translate(${x}%, ${y}%) scale(${z})`,
          filter: `${GRADE[sec]} ${extraFilter}`,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{i: number; span: number}> = ({i, span}) => {
  const f = useCurrentFrame();
  const scene = SCENES[i];
  const T = T_LEN[scene.t];
  const k = T === 0 ? 1 : interpolate(f, [0, T], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const absT = (s2f(bar(scene.at)) + f) / FPS;

  // 閃電那張：閃之前是暗的、會抽搐，閃的瞬間過曝
  let extra = '';
  if (scene.img === '15_lightning') {
    const before = absT < FLASH_AT;
    const flicker = random(`lt-${Math.floor(absT * 12)}`) > 0.82 ? 0.25 : 0;
    const b = before
      ? 0.28 + flicker
      : interpolate(absT, [FLASH_AT, FLASH_AT + 0.5], [2.2, 1.05], {extrapolateRight: 'clamp'});
    extra = `brightness(${b})`;
  }
  // 第三個 high：鳥群推一下
  let punch = 1;
  if (scene.img === '18_birds') {
    punch = interpolate(absT, [HIGHS[2], HIGHS[2] + 0.12, HIGHS[2] + 0.6], [1, 1.14, 1.08], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const img = <SceneImage scene={scene} span={span} extraFilter={extra} />;
  const wrap = (child: React.ReactNode, style: React.CSSProperties) => (
    <AbsoluteFill style={{...style}}>{child}</AbsoluteFill>
  );

  let content: React.ReactNode;
  switch (scene.t) {
    case 'iris': {
      const [cx, cy] = scene.iris ?? [50, 50];
      const r = interpolate(k, [0, 1], [0, 120]);
      content = wrap(img, {clipPath: `circle(${r}% at ${cx}% ${cy}%)`});
      break;
    }
    case 'spiral': {
      const rot = interpolate(k, [0, 1], [-38, 0]);
      const sc = interpolate(k, [0, 1], [1.7, 1]);
      content = wrap(img, {opacity: k, transform: `rotate(${rot}deg) scale(${sc})`});
      break;
    }
    case 'glitch': {
      if (f < T + 2) {
        const slices = 9;
        content = (
          <>
            {new Array(slices).fill(0).map((_, s) => {
              const dx = (random(`g-${i}-${s}-${f}`) - 0.5) * 22 * (1 - f / (T + 2));
              const top = (s / slices) * 100;
              const bottom = 100 - ((s + 1) / slices) * 100;
              return (
                <AbsoluteFill key={s} style={{clipPath: `inset(${top}% 0 ${bottom}% 0)`, transform: `translateX(${dx}%)`}}>
                  {img}
                </AbsoluteFill>
              );
            })}
          </>
        );
      } else content = img;
      break;
    }
    default:
      content = wrap(img, {opacity: scene.t === 'fade' ? k : 1});
  }
  return <AbsoluteFill style={{transform: `scale(${punch})`}}>{content}</AbsoluteFill>;
};

// 段落色層（疊在圖上面）
const Tint: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fadeIn = (from: number, d = 0.5) => interpolate(t, [from - d / 2, from + d / 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chorus = fadeIn(bar(4)) * (1 - fadeIn(bar(12)));
  const verse = fadeIn(bar(12)) * (1 - fadeIn(bar(20), 0.3));
  const verseDeep = interpolate(t, [bar(12), bar(20)], [0.25, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pre = fadeIn(bar(20), 0.3) * (1 - fadeIn(bar(28), 0.3));
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(160deg, #ff2fa0 0%, #7a2cff 55%, #ff8a3d 100%)', mixBlendMode: 'soft-light', opacity: chorus * 0.55}} />
      <AbsoluteFill style={{background: '#0a3dff', mixBlendMode: 'color', opacity: verse * verseDeep}} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, #ffb300 0%, #ff5e3a 100%)', mixBlendMode: 'soft-light', opacity: pre * 0.45}} />
    </>
  );
};

// 白閃：flash 轉場 + "like a flash"
const FLASHES = [...SCENES.filter((s) => s.t === 'flash').map((s) => bar(s.at)), FLASH_AT];
const Flash: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  let o = 0;
  for (const at of FLASHES) {
    o = Math.max(o, interpolate(t, [at - 0.02, at, at + 0.33], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  }
  return <AbsoluteFill style={{background: '#fff', opacity: o}} />;
};

// 鼓點脈衝：每拍輕輕一推，副歌和 pre 更用力
const PULSE: Record<SectionId, number> = {intro: 0.006, chorus: 0.02, verse: 0.007, pre: 0.022, end: 0.004};

export const Scenes: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const phase = (t % BEAT) / BEAT;
  const amp = PULSE[sectionAt(t).id];
  const pulse = 1 + amp * Math.exp(-phase * 5);
  // 收尾淡出
  const out = interpolate(t, [59.55, 60], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${pulse})`, opacity: out}}>
        {SCENES.map((s, i) => {
          const {from, to} = sceneBounds(i);
          const nextT = i + 1 < SCENES.length ? T_LEN[SCENES[i + 1].t] : 0;
          const dur = Math.min(DURATION - from, to - from + nextT + 1);
          return (
            <Sequence key={s.img} from={from} durationInFrames={dur} layout="none">
              <SceneLayer i={i} span={dur} />
            </Sequence>
          );
        })}
        <Tint />
      </AbsoluteFill>
      <Flash />
    </AbsoluteFill>
  );
};

export {BAR};

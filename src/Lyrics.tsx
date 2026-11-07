import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {MONO, SPACE} from './fonts';
import {FPS, HIGHS, LYRICS, Lyric} from './timeline';

const CHAR_S = 0.045; // 打字速度：每字 45ms
const RGB = '3px 0 rgba(255,40,110,0.75), -3px 0 rgba(0,225,255,0.75), 0 0 6px rgba(0,0,0,0.9), 0 0 26px rgba(0,0,0,0.65)';

const typed = (l: Lyric, t: number) => {
  const dur = Math.min(l.text.length * CHAR_S, (l.to - l.from) * 0.5);
  const n = Math.floor(interpolate(t, [l.from, l.from + dur], [0, l.text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return {shown: l.text.slice(0, n), done: n >= l.text.length};
};

const Cursor: React.FC<{t: number; done: boolean; color: string}> = ({t, done, color}) => {
  const on = !done || Math.floor(t * 2.6) % 2 === 0;
  return <span style={{display: 'inline-block', width: '0.5em', height: '0.85em', marginLeft: '0.08em', background: on ? color : 'transparent', verticalAlign: '-0.08em', boxShadow: on ? `0 0 18px ${color}` : 'none'}} />;
};

const Line: React.FC<{l: Lyric; t: number}> = ({l, t}) => {
  const {shown, done} = typed(l, t);
  // 結尾 0.22 秒：訊號掉線式消失
  const outK = interpolate(t, [l.to - 0.22, l.to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const jitter = outK > 0 ? (random(`j-${Math.floor(t * 30)}`) - 0.5) * 40 * outK : 0;
  const base: React.CSSProperties = {
    opacity: 1 - outK,
    transform: `translateX(${jitter}px)`,
    filter: outK > 0 ? `blur(${outK * 6}px)` : undefined,
    textAlign: 'center',
    lineHeight: 1.02,
    whiteSpace: l.style === 'call' ? 'nowrap' : 'pre-wrap',
    textWrap: 'balance',
  };

  if (l.style === 'call') {
    const color = '#a8ffb0';
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 70px'}}>
        <div style={{...base, fontFamily: MONO, fontSize: Math.min(150, 1500 / (l.text.length + 2)), color, textShadow: `0 0 30px rgba(120,255,150,0.6), ${RGB}`}}>
          <span style={{opacity: 0.55}}>&gt; </span>
          {shown}
          <Cursor t={t} done={done} color={color} />
        </div>
      </AbsoluteFill>
    );
  }

  if (l.style === 'end') {
    const k = interpolate(t, [l.from, l.from + 0.25], [0, 1], {extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontFamily: SPACE, fontWeight: 700, fontSize: 50, letterSpacing: `${0.12 + 0.2 * k}em`, color: '#fff', opacity: k, textShadow: RGB}}>
          ✦ {shown} ✦
        </div>
      </AbsoluteFill>
    );
  }

  if (l.style === 'high') {
    // "Sending me" 正常打字；三個 high 跟著人聲一個比一個大、一個比一個高
    const head = 'Sending me';
    const headTyped = typed({...l, text: head}, t);
    return (
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520}}>
        <div style={{...base, fontFamily: MONO, color: '#fff', textShadow: RGB, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center'}}>
          <div style={{fontSize: 100}}>{headTyped.shown}</div>
          {HIGHS.map((h, i) => {
            const k = interpolate(t, [h - 0.02, h + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={h} style={{fontSize: 110 + i * 46, opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})`, color: i === 2 ? '#ffe27a' : '#fff'}}>
                high{i < 2 ? ',' : ''}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  const isFlash = l.style === 'flash';
  const shake = isFlash ? interpolate(t, [l.from, l.from + 0.4], [18, 0], {extrapolateRight: 'clamp'}) * (random(`s-${Math.floor(t * 30)}`) - 0.5) : 0;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: isFlash ? 760 : 520, paddingLeft: 70, paddingRight: 70}}>
      <div
        style={{
          ...base,
          fontFamily: MONO,
          fontSize: isFlash ? 150 : 100,
          color: isFlash ? '#111' : '#fff',
          textShadow: isFlash ? '0 0 40px #fff, 0 0 80px #fff' : RGB,
          transform: `translate(${jitter + shake}px, ${shake * 0.6}px)`,
        }}
      >
        {shown}
        <Cursor t={t} done={done} color={isFlash ? '#111' : '#fff'} />
      </div>
    </AbsoluteFill>
  );
};

export const Lyrics: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const active = LYRICS.filter((l) => t >= l.from && t < l.to);
  return (
    <>
      {active.map((l) => (
        <Line key={l.from} l={l} t={t} />
      ))}
    </>
  );
};

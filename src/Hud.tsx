import React from 'react';
import {AbsoluteFill, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {MONO, SPACE} from './fonts';
import {FPS, SCENES, bar, sectionAt} from './timeline';
import {sceneBounds} from './Scenes';
import credits from '../credits.json';

export const AUDIO = staticFile('audio/stream-edit.wav');

type Credit = {file: string; author: string; license: string};
const CREDITS = credits as unknown as Credit[];

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

// 底片顆粒（SVG 噪點，每兩幀換 seed）
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.2, pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`n${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#n${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const audio = useAudioData(AUDIO);
  const sec = sectionAt(t);

  // 訊號強度條
  const bars = audio ? visualizeAudio({fps: FPS, frame: f, audioData: audio, numberOfSamples: 16, smoothing: true}) : new Array(16).fill(0);
  const level = Math.min(1, bars.slice(0, 6).reduce((a, b) => a + b, 0) * 1.8);

  // 示波器：當前幀附近的波形
  let wave = '';
  if (audio) {
    const ch = audio.channelWaveforms[0];
    const center = Math.floor(t * audio.sampleRate);
    const N = 140;
    const win = 2400;
    const pts: string[] = [];
    for (let i = 0; i < N; i++) {
      const idx = center - win / 2 + Math.floor((i / N) * win);
      const v = idx >= 0 && idx < ch.length ? ch[idx] : 0;
      pts.push(`${(i / (N - 1)) * 1000},${50 - v * 90}`);
    }
    wave = pts.join(' ');
  }

  // 當前圖的署名
  const idx = SCENES.findIndex((_, i) => {
    const {from, to} = sceneBounds(i);
    return f >= from && f < to;
  });
  const cr = CREDITS.find((c) => c.file === `${SCENES[Math.max(0, idx)].img}.jpg`);

  const blink = Math.floor(t * 2) % 2 === 0;
  const tc = `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}:${pad(f % FPS)}`;
  const freq = (1420.405 + (random(`fq-${Math.floor(t * 6)}`) - 0.5) * 0.004).toFixed(3);
  const hudOpacity = interpolate(t, [0, 0.4, 59.6, 60], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const green = '#a8ffb0';

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* 掃描線 + 暗角 */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 45%, rgba(0,0,0,0.75) 100%)'}} />
      <Grain />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 30%, transparent 52%)'}} />

      <AbsoluteFill style={{opacity: hudOpacity, fontFamily: MONO, color: green, textShadow: '0 0 10px rgba(120,255,150,0.6)'}}>
        {/* 頂部 */}
        <div style={{position: 'absolute', top: 70, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{width: 22, height: 22, borderRadius: 11, background: blink ? '#ff3b5c' : 'transparent', border: '2px solid #ff3b5c', boxShadow: blink ? '0 0 14px #ff3b5c' : 'none'}} />
            RX {freq} MHz
          </div>
          <div>{sec.label} / {sec.tag}</div>
        </div>
        {/* 訊號格 */}
        <div style={{position: 'absolute', top: 128, left: 64, display: 'flex', gap: 6, alignItems: 'flex-end', height: 40}}>
          {new Array(10).fill(0).map((_, i) => (
            <div key={i} style={{width: 12, height: 10 + i * 3, background: level * 10 > i ? green : 'rgba(168,255,176,0.18)'}} />
          ))}
          <span style={{marginLeft: 14, fontSize: 30, opacity: 0.8}}>SIG {Math.round(level * 100)}%</span>
        </div>
        {/* 示波器 */}
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{position: 'absolute', left: 64, right: 64, bottom: 220, width: 952, height: 110, opacity: 0.85}}>
          <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(168,255,176,0.2)" strokeWidth="1" />
          <polyline points={wave} fill="none" stroke={green} strokeWidth="2.5" />
        </svg>
        {/* 底部 */}
        <div style={{position: 'absolute', bottom: 150, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', fontSize: 34}}>
          <span>T+{tc}</span>
          <span>IMG {pad(Math.max(0, idx) + 1)}/{SCENES.length}</span>
        </div>
        {cr ? (
          <div style={{position: 'absolute', bottom: 92, left: 64, right: 64, fontFamily: SPACE, fontSize: 22, color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 4px #000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            Photo: {cr.author} · {cr.license} · Wikimedia Commons
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const sectionStart = bar;

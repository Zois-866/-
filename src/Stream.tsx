import React from 'react';
import {AbsoluteFill, Audio} from 'remotion';
import {Scenes} from './Scenes';
import {Lyrics} from './Lyrics';
import {AUDIO, Hud} from './Hud';
import {loadFonts} from './fonts';

loadFonts();

export const Stream: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Scenes />
      <Hud />
      <Lyrics />
      <Audio src={AUDIO} />
    </AbsoluteFill>
  );
};

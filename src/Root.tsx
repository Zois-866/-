import React from 'react';
import {Composition} from 'remotion';
import {Stream} from './Stream';
import {DURATION, FPS} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Stream"
      component={Stream}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

import {continueRender, delayRender, staticFile} from 'remotion';

export const MONO = '"VT323", monospace';
export const SPACE = '"Space Mono", monospace';

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('fonts');
  const faces = [
    new FontFace('VT323', `url(${staticFile('fonts/VT323.woff2')}) format('woff2')`),
    new FontFace('Space Mono', `url(${staticFile('fonts/SpaceMono.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('Space Mono', `url(${staticFile('fonts/SpaceMono-Bold.woff2')}) format('woff2')`, {weight: '700'}),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff))))
    .catch((e) => console.error('font load failed', e))
    .finally(() => continueRender(handle));
};

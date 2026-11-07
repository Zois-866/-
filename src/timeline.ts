// ─────────────────────────────────────────────────────────────
//  所有時間都在這。想微調歌詞或換圖時機，只改這個文件。
//  音頻 public/audio/stream-edit.wav 是按小節線剪好的 60 秒唱段，
//  所以輸出時間軸本身就是一條連續的小節網格（0 秒 = 強拍）。
// ─────────────────────────────────────────────────────────────

export const FPS = 30;
export const DURATION_S = 60;
export const DURATION = FPS * DURATION_S; // 1800

export const BPM = 113.5;
export const BEAT = 0.52862; // 秒（從原曲 onset 擬合出來）
export const BAR = BEAT * 4; // 2.11448 秒

export const s2f = (s: number) => Math.round(s * FPS);
export const bar = (n: number) => n * BAR; // 第 n 小節的秒數

// 原曲 → 輸出 的剪接表（只用於記錄，音頻已經剪好）
export const AUDIO_EDIT = [
  {src: [6.577, 15.035], out: [0, bar(4)], what: 'Intro: Hello? / Do you read me?'},
  {src: [42.524, 59.439], out: [bar(4), bar(12)], what: 'Chorus'},
  {src: [61.554, 96.18], out: [bar(12), 60], what: 'Verse 1 + Pre-Chorus (+ 下一段副歌的強拍)'},
];

// 特殊時刻
export const FLASH_AT = 45.18; // "like a flash" 白閃
// 三個 high：whisper 給的太擠，改用人聲頻段能量峰（原曲 84.57 / 85.03 / 85.64s）
export const HIGHS = [48.39, 48.85, 49.46];

export type SectionId = 'intro' | 'chorus' | 'verse' | 'pre' | 'end';

export const SECTIONS: {id: SectionId; from: number; label: string; tag: string}[] = [
  {id: 'intro', from: bar(0), label: 'CH-01', tag: 'INCOMING'},
  {id: 'chorus', from: bar(4), label: 'CH-02', tag: 'MESSAGE'},
  {id: 'verse', from: bar(12), label: 'CH-03', tag: 'DRIFT'},
  {id: 'pre', from: bar(20), label: 'CH-04', tag: 'RESCUE'},
  {id: 'end', from: bar(28), label: 'CH-05', tag: 'RECEIVED'},
];

export const sectionAt = (t: number) => {
  let cur = SECTIONS[0];
  for (const s of SECTIONS) if (t >= s.from) cur = s;
  return cur;
};

// 轉場類型：
//  fade   普通疊化
//  iris   圓形擴散（圓接圓：碟、星軌、地球、救生圈、太陽）
//  spiral 旋轉 + 縮放（螺旋接螺旋）
//  cut    硬切（卡鼓點）
//  flash  白閃
//  glitch 訊號撕裂
export type Transition = 'fade' | 'iris' | 'spiral' | 'cut' | 'flash' | 'glitch';

export type Scene = {
  img: string; // public/images/<img>.jpg
  at: number; // 開始小節（可以是小數）
  t: Transition;
  link: string; // 跟上一張的勾連（寫給人看的）
  pos?: string; // object-position，取景焦點
  zoom?: [number, number]; // Ken Burns 起止縮放
  pan?: [number, number, number, number]; // 起止位移 x0,y0,x1,y1（%）
  iris?: [number, number]; // iris 圓心（%）
};

export const SCENES: Scene[] = [
  // ① Intro — Hello? Do you read me?
  {img: '01_handset', at: 0, t: 'fade', link: '開場：拿起聽筒', pos: '50% 40%', zoom: [1.25, 1.1]},
  {img: '02_cord', at: 1, t: 'glitch', link: '聽筒 → 它的捲線（螺旋）', pos: '18% 55%', zoom: [1.15, 1.35]},
  {img: '03_dish', at: 2, t: 'iris', link: '聽筒的圓耳承 → 碟形天線（圓）', pos: '50% 75%', zoom: [1.05, 1.2], iris: [50, 45]},
  {img: '04_array', at: 3, t: 'fade', link: '一個碟 → 一排碟，朝向星空', pos: '45% 50%', zoom: [1.2, 1.05]},
  // ② Chorus — I get messages from the stars
  {img: '05_startrails', at: 4, t: 'spiral', link: '天線指向的天空 → 星軌（同心圓弧）', pos: '40% 45%', zoom: [1.3, 1.1]},
  {img: '06_fireflies', at: 4.75, t: 'fade', link: '星軌光點 → 地上的螢火蟲光點', pos: '50% 60%', zoom: [1.1, 1.2]},
  {img: '07_couple', at: 5.5, t: 'fade', link: '螢火蟲的暖光 → 黃昏裡的兩個人', pos: '50% 50%', zoom: [1.0, 1.07], pan: [1, 0, -1, 0]},
  {img: '08_fireworks', at: 7.5, t: 'flash', link: '心裡炸開 → 煙火（放射）', pos: '78% 40%', zoom: [1.0, 1.15]},
  {img: '09_dandelion', at: 8.5, t: 'iris', link: '煙火的放射 → 蒲公英的放射', pos: '50% 45%', zoom: [1.1, 1.3], iris: [50, 40]},
  {img: '10_galaxy', at: 9.5, t: 'spiral', link: '蒲公英的球 → 螺旋星系 “another galaxy”', pos: '50% 50%', zoom: [1.0, 1.35]},
  // ③ Verse 1 — all alone… fading into blue
  {img: '11_astronaut', at: 12, t: 'fade', link: '星系的黑 → 黑裡一個人在漂', pos: '50% 50%', zoom: [1.25, 1.05], pan: [0, 2, 0, -2]},
  {img: '12_earth', at: 14, t: 'iris', link: '漂離的人 → 遠處的家（藍色的圓）', pos: '50% 50%', zoom: [1.35, 1.1], iris: [50, 50]},
  {img: '13_deepblue', at: 16, t: 'fade', link: '地球的藍 → 沉進深海的藍 “fading into blue”', pos: '50% 22%', zoom: [1.05, 1.2], pan: [0, -3, 0, 3]},
  {img: '14_jellyfish', at: 18, t: 'fade', link: '漂浮的人 → 漂浮的水母（無能為力）', pos: '50% 50%', zoom: [1.1, 1.25]},
  // ④ Pre-Chorus — like a flash… high, high, high… rescue me
  {img: '15_lightning', at: 20, t: 'fade', link: '水母的觸鬚 → 閃電的分叉', pos: '42% 50%', zoom: [1.15, 1.05]},
  {img: '16_rocket', at: 22, t: 'cut', link: '閃電劈下 → 火箭衝上 “sending me”', pos: '50% 55%', zoom: [1.1, 1.3], pan: [0, 4, 0, -4]},
  {img: '17_balloon', at: HIGHS[0] / BAR, t: 'cut', link: 'high → 熱氣球', pos: '62% 30%', zoom: [1.15, 1.3], pan: [0, 3, 0, -3]},
  {img: '18_birds', at: HIGHS[1] / BAR, t: 'cut', link: 'high → 更高的鳥群（第三個 high 打一下推鏡）', pos: '30% 35%', zoom: [1.1, 1.3], pan: [0, 3, 0, -3]},
  {img: '19_hand', at: 24, t: 'fade', link: '飛向天空 → 伸向天空的手 “you rescue me”', pos: '50% 50%', zoom: [1.2, 1.05]},
  {img: '20_lighthouse', at: 25, t: 'fade', link: '伸出的手 → 黑暗裡伸出的光', pos: '50% 40%', zoom: [1.05, 1.18]},
  {img: '21_lifebuoy', at: 26, t: 'iris', link: '燈塔的救援 → 救生圈（圓）', pos: '20% 50%', zoom: [1.1, 1.25], iris: [35, 50]},
  {img: '22_sunrise', at: 27, t: 'iris', link: '救生圈的圓 → 太陽的圓：得救了', pos: '50% 45%', zoom: [1.05, 1.2], iris: [60, 40]},
  // ⑤ End — 回到星空，閉環
  {img: '23_milkyway', at: 28, t: 'flash', link: '太陽的光 → 射向銀河的一道光：回到星空，訊息送達', pos: '48% 50%', zoom: [1.15, 1.05]},
];

// 歌詞（輸出時間，秒）。起點來自 whisper 詞級時間戳，換算到剪接後的時間軸。
export type Lyric = {from: number; to: number; text: string; style?: 'call' | 'normal' | 'high' | 'flash' | 'end'};

export const LYRICS: Lyric[] = [
  {from: 0.06, to: 3.9, text: 'Hello?', style: 'call'},
  {from: 4.82, to: 8.3, text: 'Do you read me?', style: 'call'},
  {from: 8.75, to: 11.8, text: 'I get messages from the stars'},
  {from: 11.89, to: 15.9, text: "When you're making love to me"},
  {from: 16.03, to: 20.3, text: 'I get messages from the stars'},
  {from: 20.41, to: 25.1, text: 'You must be from another galaxy'},
  {from: 25.84, to: 29.95, text: "When I'm out there, all alone"},
  {from: 30.06, to: 33.8, text: 'And feeling far from home'},
  {from: 33.92, to: 37.9, text: "I'm fading into blue"},
  {from: 38.04, to: 42.2, text: "And there's nothing I can do"},
  {from: 42.38, to: 45.05, text: 'Then out of the sky,'},
  {from: 45.18, to: 46.55, text: 'like a flash', style: 'flash'},
  {from: 46.66, to: 50.3, text: 'Sending me high, high, high', style: 'high'},
  {from: 50.44, to: 53.5, text: 'You rescue me'},
  {from: 53.62, to: 59.0, text: 'You save me from a certain tragedy'},
  {from: 59.25, to: 60, text: 'MESSAGE RECEIVED', style: 'end'},
];


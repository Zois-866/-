# Messages From The Stars — 意識流 MV（Remotion）

60 秒 · 1080×1920 豎屏 · 30fps。歌：The RAH Band — *Messages From The Stars*（只用唱段）。

```bash
npm install
npm run studio     # Remotion Studio 預覽
npm run render     # → out/stream.mp4
```

## 剪接（只留唱段）

原曲 113.5 BPM，所有剪點都落在小節線上，輸出本身是一條連續的小節網格（1 小節 = 2.11448 秒）。

| 輸出 | 原曲 | 內容 |
|---|---|---|
| 0 – 8.46s | 6.58 – 15.04s | Hello? … Do you read me? |
| 8.46 – 25.37s | 42.52 – 59.44s | Chorus |
| 25.37 – 60s | 61.55 – 96.18s | Verse 1 + Pre-Chorus（最後落在下一段副歌的強拍，淡出） |

歌詞時間來自 whisper 詞級時間戳；三個 “high” 用人聲頻段能量峰校正過。
**想微調任何時間，只改 `src/timeline.ts`。**

## 聯想鏈（23 張）

| # | 小節 | 圖 | 跟上一張的勾連 |
|---|---|---|---|
| 1 | 0 | 老式電話 | 開場：拿起聽筒 |
| 2 | 1 | 捲曲電話線 | 聽筒 → 捲線（螺旋） |
| 3 | 2 | 碟形射電望遠鏡 | 聽筒的圓 → 碟（圓） |
| 4 | 3 | ALMA 天線陣 | 一個碟 → 一排碟，朝向星空 |
| 5 | 4 | 星軌 + 天文台 | 天線指向的天空 → 同心圓星軌 |
| 6 | 4.75 | 螢火蟲 + 星軌 | 天上的光點 → 地上的光點 |
| 7 | 5.5 | 黃昏海邊兩個人 | 暖光 → making love to me |
| 8 | 7.5 | 煙火 | 心裡炸開 → 放射 |
| 9 | 8.5 | 蒲公英 | 煙火的放射 → 種子的放射 |
| 10 | 9.5 | 螺旋星系 M83 | 圓球 → 螺旋 “another galaxy” |
| 11 | 12 | 太空人無繩漂浮 | 星系的黑 → 黑裡一個人 “all alone” |
| 12 | 14 | 藍色地球 | 漂離的人 → 遠處的家 “far from home” |
| 13 | 16 | 深藍自由潛水 | 地球的藍 → 深海的藍 “fading into blue” |
| 14 | 18 | 水母 | 漂浮的人 → 漂浮的水母 “nothing I can do” |
| 15 | 20 | 閃電 | 觸鬚 → 分叉 “like a flash”（白閃） |
| 16 | 22 | 阿波羅 11 號升空 | 閃電劈下 → 火箭衝上 “sending me” |
| 17 | high① | 熱氣球 | high |
| 18 | high② | 鳥群 | higher（high③ 推鏡） |
| 19 | 24 | 海灘上像手一樣伸出的枯木 + 遠處的船 | 飛向天空 → 伸向天空的「手」，船來了 “you rescue me” |
| 20 | 25 | 燈塔 | 船 → 為船指路的光 |
| 21 | 26 | 救生圈 | 救援 → 圓 |
| 22 | 27 | 太陽 | 救生圈的圓 → 太陽的圓：得救 |
| 23 | 28 | 射向銀河中心的雷射 | 回到星空，訊息送達（閉環） |

## 圖片來源

全部來自 Wikimedia Commons（公有領域 / CC0 / CC BY / CC BY-SA），每張的來源網址、作者、授權都在
[`credits.json`](credits.json)，畫面左下角也會即時顯示當前圖片的署名。
CC BY-SA 的圖片，其衍生作品需以相同授權分享。

字體：VT323、Space Mono（SIL Open Font License，經 @fontsource）。
歌曲版權屬於原作者；本專案僅供學習與個人創作練習。

## 結構

```
src/timeline.ts   所有時間：剪接表、段落、23 個場景、歌詞
src/Scenes.tsx    Ken Burns、轉場（fade/iris/spiral/cut/flash/glitch）、分段調色、鼓點脈衝
src/Lyrics.tsx    電報式打字機歌詞
src/Hud.tsx       接收機 HUD：訊號強度（跟音頻）、示波器、掃描線、顆粒、署名
public/audio/stream-edit.wav   剪好的 60 秒音頻
public/images/                 23 張圖
credits.json                   圖片來源與授權
scripts/                       找圖、下載、生成 credits 的腳本
```

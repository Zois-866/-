import hashlib, urllib.request, urllib.parse, urllib.error, time, os, subprocess, json, sys
UA = "StreamMV/1.0 (https://github.com/Zois-866/-; educational music-video project) Python-urllib/3.13"
STD = [960, 1280, 1920, 3840]
LIST = [
 ("05_startrails","Gemini North with circumpolar star trails (noao-gntr).jpg",1648,2307),
 ("06_fireflies","Fireflies and Star Trails - PGL57 - Tyler Savitski.jpg",5520,8280),
 ("07_couple","A couple silhouette at Ras jebel beach during a golden sunset.jpg",3648,2736),
 ("08_fireworks","Fireworks Burst Through the Night Sky.jpg",5712,3213),
 ("09_dandelion","Seed head dandelion.jpg",2175,3263),
 ("10_galaxy","Messier83 - Heic1403a.jpg",11405,7419),
 ("11_astronaut","Bruce McCandless II during EVA in 1984.jpg",3072,3072),
 ("12_earth","The Blue Marble, AS17-148-22727.jpg",6750,6750),
 ("13_deepblue","Freediving in the Ocean Liv & Big Blue (1045709386).jpg",2136,2848),
 ("14_jellyfish","JellyfishBlue.jpg",6000,4000),
 ("15_lightning","Denver Lightning.jpg",1303,1519),
 ("16_rocket","Apollo 11 Launch - GPN-2000-000630.jpg",2400,3000),
 ("17_balloon","Illuminated hot air balloon.jpg",2592,3888),
 ("18_birds","Flock of Birds in the Sky.jpg",3024,4032),
 ("19_hand","Reaching out for more.jpg",1080,1920),
 ("20_lighthouse","SIDI BOU AFI LIGHTHOUSE - EL JADIDA - MOROCCO.jpg",3503,5253),
 ("21_lifebuoy","Lifebuoy Hollihaka Marina Oulu 20260131.jpg",3376,4500),
 ("22_sunrise","Goleta Sunrise1.jpg",2639,2664),
 ("23_milkyway","Laser Towards Milky Ways Centre.jpg",4000,3631),
]
def url(name, W):
    n = name.replace(" ", "_"); h = hashlib.md5(n.encode()).hexdigest()
    base = f"https://upload.wikimedia.org/wikipedia/commons/"
    q = urllib.parse.quote(n)
    return base+f"{h[0]}/{h[:2]}/{q}" if W is None else base+f"thumb/{h[0]}/{h[:2]}/{q}/{W}px-{q}"
out = sys.argv[1]; dl = {}
dp = os.path.join(out, "direct.json")
if os.path.exists(dp): dl = json.load(open(dp))
for key, name, w, h in LIST:
    fn = os.path.join(out, key + ".jpg")
    if os.path.exists(fn): continue
    need = max(1300, 2100 * w / h)
    W = next((s for s in STD if s >= need and s < w), None)
    if W is None: W = max([s for s in STD if s < w] or [960])
    u = url(name, W)
    data = None
    for k in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=120).read(); break
        except urllib.error.HTTPError as e:
            print(" ", key, e.code, flush=True)
            if e.code == 429: time.sleep(45); continue
            raise
    if data is None: print('  skip', key); continue
    tmp = fn + ".tmp"; open(tmp, "wb").write(data)
    subprocess.run(["ffmpeg","-v","error","-y","-i",tmp,"-vf","scale='if(gt(iw,ih),-2,min(1600,iw))':'if(gt(iw,ih),min(2400,ih),-2)'","-frames:v","1","-q:v","3",fn], check=True)
    os.remove(tmp); dl[key] = {"title": "File:" + name, "downloaded": u}
    json.dump(dl, open(dp, "w"), indent=1, ensure_ascii=False)
    print(key, "W=", W, flush=True); time.sleep(5)

import sys, json, urllib.request, urllib.parse, urllib.error
UA = "StreamMV/1.0 (https://github.com/Zois-866/-; educational music-video project) Python-urllib/3.13"
import time
def get(u):
    for k in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent":UA})))
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(int(e.headers.get("retry-after","20"))+5); continue
            raise

def search(q, n=8):
    p = {"action":"query","format":"json","generator":"search","gsrsearch":f"filetype:bitmap {q}","gsrnamespace":"6","gsrlimit":str(n),
         "prop":"imageinfo","iiprop":"url|size|extmetadata","iiurlwidth":"1600"}
    u = "https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(p)
    d = get(u); time.sleep(6)
    res=[]
    for pg in (d.get("query",{}).get("pages",{}) or {}).values():
        ii=pg["imageinfo"][0]; em=ii.get("extmetadata",{})
        g=lambda k: (em.get(k,{}).get("value","") or "")
        import re
        res.append(dict(title=pg["title"], w=ii["width"], h=ii["height"], thumb=ii.get("thumburl"), page=ii["descriptionurl"],
            artist=re.sub("<[^>]+>","",g("Artist")).strip()[:80], lic=g("LicenseShortName")))
    return res
for q in sys.argv[1:]:
    print("##", q)
    for r in search(q):
        print(f"  {r['w']}x{r['h']} [{r['lic']}] {r['artist'][:30]} | {r['title'][5:90]}")

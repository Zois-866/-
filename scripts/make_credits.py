import json, re, sys, urllib.request, urllib.parse, urllib.error, time, os
UA = "StreamMV/1.0 (https://github.com/Zois-866/-; educational music-video project) Python-urllib/3.13"
final = sys.argv[1]; out = sys.argv[2]; timeline = sys.argv[3]
meta = json.load(open(os.path.join(final, "meta.json")))
direct = json.load(open(os.path.join(final, "direct.json"))) if os.path.exists(os.path.join(final, "direct.json")) else {}
keys = sorted(set(meta) | set(direct))
titles = {k: (direct.get(k) or meta[k])["title"] for k in keys}
p = {"action": "query", "format": "json", "titles": "|".join(titles.values()), "prop": "imageinfo", "iiprop": "url|size|extmetadata"}
u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)
for k in range(8):
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=60)); break
    except urllib.error.HTTPError as e:
        if e.code != 429: raise
        print("429, wait 60", flush=True); time.sleep(60)
else:
    raise SystemExit("API still rate-limited")
norm = {n["from"]: n["to"] for n in d["query"].get("normalized", [])}
pages = {pg["title"]: pg for pg in d["query"]["pages"].values()}
# scene link text from timeline.ts
links = dict(re.findall(r"img: '([^']+)'.*?link: '([^']+)'", open(timeline).read()))
clean = lambda v: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", v or "")).strip()
res = []
for k in keys:
    t = norm.get(titles[k], titles[k]); pg = pages[t]; ii = pg["imageinfo"][0]; em = ii["extmetadata"]
    g = lambda f: clean(em.get(f, {}).get("value"))
    res.append({
        "file": k + ".jpg",
        "title": t,
        "source_url": ii["descriptionurl"],
        "author": g("Artist") or g("Credit"),
        "credit": g("Credit"),
        "license": g("LicenseShortName"),
        "license_url": g("LicenseUrl") or None,
        "original_size": f'{ii["width"]}x{ii["height"]}',
        "downloaded_from": (direct.get(k) or meta[k]).get("downloaded"),
        "source_site": "Wikimedia Commons",
        "link_to_previous": links.get(k),
    })
json.dump(res, open(out, "w"), indent=2, ensure_ascii=False)
for r in res: print(r["file"], "|", r["license"], "|", r["author"][:50])

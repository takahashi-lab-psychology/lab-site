/* ==========================================================================
   ORCID からの論文リスト自動取得。編集不要です。
   設定は assets/content.js の orcid: {...} で行います。

   仕組み
     1. ORCID から「自分の論文のDOI一覧」を取る
     2. 各DOIについて Crossref から著者名・雑誌名・巻号を取る
        （ORCIDは著者リストを持っていないため、ここはCrossrefに頼ります）
     3. 手動で書いた論文と統合する。DOIが同じなら手動側を優先
     4. 結果を24時間ブラウザに保存し、毎回取りに行かないようにする

   取得に失敗した場合は、手動リストだけが表示されます。
   ========================================================================== */

const ORCID = (() => {

  const CACHE_KEY = "labPubCache";
  const CACHE_HOURS = 24;
  const MAX_WORKS = 200;
  const CONCURRENCY = 4;

  const cleanDoi = d => !d ? "" :
    String(d).trim().toLowerCase()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
      .replace(/^doi:/, "");

  /* ---- ORCID: DOIと基本情報の一覧 ---- */
  async function fetchOrcidWorks(id){
    const res = await fetch(`https://pub.orcid.org/v3.0/${id}/works`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error("ORCID responded " + res.status);
    const data = await res.json();

    return (data.group || []).slice(0, MAX_WORKS).map(g => {
      const s = (g["work-summary"] || [])[0];
      if (!s) return null;
      const ids = ((g["external-ids"] || {})["external-id"]) || [];
      const doiId = ids.find(x => (x["external-id-type"] || "").toLowerCase() === "doi");
      return {
        title:   ((s.title || {})["title"] || {}).value || "",
        venue:   (s["journal-title"] || {}).value || "",
        year:    parseInt((((s["publication-date"] || {}).year) || {}).value, 10) || 0,
        doi:     cleanDoi(doiId && doiId["external-id-value"]),
        type:    (s.type || "").toLowerCase()
      };
    }).filter(Boolean);
  }

  /* ---- Crossref: 著者名や巻号など詳しい情報 ---- */
  async function fetchCrossref(doi, mailto){
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}` +
                (mailto ? `?mailto=${encodeURIComponent(mailto)}` : "");
    const res = await fetch(url);
    if (!res.ok) return null;
    const m = (await res.json()).message;
    if (!m) return null;

    const authors = (m.author || [])
      .map(a => {
        const family = a.family || a.name || "";
        const given  = (a.given || "").split(/[\s.]+/).filter(Boolean).map(s => s[0]).join("");
        return family + (given ? " " + given : "");
      })
      .filter(Boolean)
      .join(", ");

    const parts = (m.issued && m.issued["date-parts"] && m.issued["date-parts"][0]) || [];
    let venue = (m["container-title"] || [])[0] || (m.institution || [{}])[0].name || "";
    if (m.volume) venue += " " + m.volume;
    if (m.page)   venue += ":" + m.page;

    return {
      authors,
      venue: venue.trim(),
      year: parts[0] || 0,
      title: (m.title || [])[0] || "",
      isPreprint: (m.type || "") === "posted-content"
    };
  }

  /* ---- 少しずつ並列に処理する ---- */
  async function mapLimit(items, limit, fn){
    const out = new Array(items.length);
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length){
        const k = i++;
        try { out[k] = await fn(items[k]); } catch(e){ out[k] = null; }
      }
    }));
    return out;
  }

  /* ---- 取得の本体 ---- */
  async function fetchAll(cfg, mailto){
    const works = await fetchOrcidWorks(cfg.id);
    const exclude = (cfg.exclude || []).map(cleanDoi);

    const usable = works.filter(w =>
      w.doi &&
      !exclude.includes(w.doi) &&
      (!cfg.since || !w.year || w.year >= cfg.since)
    );

    const details = await mapLimit(usable, CONCURRENCY, w => fetchCrossref(w.doi, mailto));

    return usable.map((w, k) => {
      const d = details[k] || {};
      return {
        year:    d.year || w.year || 0,
        authors: d.authors || "",
        title:   d.title || w.title,
        venue:   d.venue || w.venue,
        note:    d.isPreprint ? { ja:"プレプリント", en:"Preprint" } : { ja:"", en:"" },
        doi:     "https://doi.org/" + w.doi,
        pdf:     "",
        _key:    w.doi,
        _auto:   true
      };
    }).filter(p => p.title && p.year);
  }

  /* ---- キャッシュ ---- */
  function readCache(id){
    try {
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!raw || raw.id !== id) return null;
      if (Date.now() - raw.at > CACHE_HOURS * 3600e3) return null;
      return raw.items;
    } catch(e){ return null; }
  }
  function writeCache(id, items){
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ id, at: Date.now(), items })); } catch(e){}
  }

  /* ---- 手動リストと統合。DOIが同じなら手動側を残す ---- */
  function merge(manual, auto){
    const manualKeys = new Set(manual.map(p => cleanDoi(p.doi)).filter(Boolean));
    const extra = auto.filter(p => !manualKeys.has(cleanDoi(p.doi)));
    return [...manual, ...extra].sort((a,b) =>
      (b.year - a.year) || String(a.title).localeCompare(String(b.title))
    );
  }

  /* ---- 外から呼ぶ入口 ---- */
  async function load(){
    const cfg = CONTENT.orcid || {};
    const manual = CONTENT.publications || [];
    if (!cfg.enabled || !cfg.id) return { list: manual, synced: false };

    const cached = readCache(cfg.id);
    if (cached) return { list: merge(manual, cached), synced: true, cached: true };

    const auto = await fetchAll(cfg, CONTENT.lab && CONTENT.lab.email);
    writeCache(cfg.id, auto);
    return { list: merge(manual, auto), synced: true };
  }

  return { load, merge, cleanDoi, fetchAll, _fetchCrossref: fetchCrossref, _fetchOrcidWorks: fetchOrcidWorks };
})();

if (typeof module !== "undefined") module.exports = ORCID;

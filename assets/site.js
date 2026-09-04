/* ==========================================================================
   ページの組み立て。通常は編集不要です。
   メニューを増やしたいときだけ、下の PAGES と UI に1行ずつ足します。
   ========================================================================== */

const PAGES = [
  { id:"news",     file:"news.html" },
  { id:"research", file:"research.html" },
  { id:"pubs",     file:"publications.html" },
  { id:"members",  file:"members.html" },
  { id:"join",     file:"join.html" }
];

const UI = {
  news:     { ja:"お知らせ",   en:"News" },
  research: { ja:"研究内容",   en:"Research" },
  pubs:     { ja:"論文",       en:"Publications" },
  members:  { ja:"メンバー",   en:"Members" },
  join:     { ja:"募集",       en:"Join us" },

  moreNews:     { ja:"お知らせをすべて見る", en:"All news" },
  moreResearch: { ja:"研究内容をすべて見る", en:"All research" },
  moreJoin:     { ja:"募集の詳細を見る",     en:"Full details" },
  skip:         { ja:"本文へ移動",           en:"Skip to content" },
  currentMembers:{ ja:"現メンバー",          en:"Current members" },
  alumni:       { ja:"卒業生・修了生",       en:"Alumni" },
  contact:      { ja:"連絡先",               en:"Contact" },
  linkScholar:  { ja:"Scholar",              en:"Scholar" },
  linkOrcid:    { ja:"ORCID",                en:"ORCID" },
  linkKaken:    { ja:"KAKEN",                en:"KAKEN" },
  linkResearchmap:{ ja:"researchmap",        en:"researchmap" },
  preprint:     { ja:"プレプリント",         en:"Preprint" },
  readPaper:    { ja:"論文を読む",           en:"Read the paper" },
  pdf:          { ja:"PDF",                  en:"PDF" },
  eventUpcoming:{ ja:"開催予定",             en:"Upcoming" },
  eventEnded:   { ja:"終了しました",         en:"Completed" },
  newsUrl:      { ja:"参考URL",              en:"Reference" },
  emailNote:    { ja:"[at] を @ に置き換えてお送りください", en:"Please replace [at] with @" },

  researchLede: { ja:"現在進めている3つの方向です。どれも独立した課題ですが、根底にある関心は共通しています。",
                  en:"Three directions we are currently pursuing. They stand alone as problems, but the underlying interest is shared." },
  pubsLede:     { ja:"研究室メンバーの名前は太字で示しています。",
                  en:"Lab members are shown in bold." },
  joinLede:     { ja:"見学は随時受け付けています。まずはメールでご連絡ください。",
                  en:"Visits are welcome at any time. Email us to arrange one." }
};

/* -------------------------------------------------------------------------- */

let lang = "ja";

const t  = o => (o && (o[lang] || o[lang === "ja" ? "en" : "ja"])) || "";
const tp = o => { const v = o && (o[lang] && o[lang].length ? o[lang] : o[lang === "ja" ? "en" : "ja"]); return v || []; };
const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };

// スパム収集対策: 画面表示のときだけ @ を [at] に置き換える（content.js には本物のアドレスを保持）
const obfuscateEmail = addr => String(addr).replace("@", " [at] ");
const emailNote = () => { const s = el("span","email-note"); s.textContent = " (" + t(UI.emailNote) + ")"; return s; };
const page = document.body.dataset.page;

/* ---------- header / footer ---------- */

function buildChrome(){
  const head = el("header","site-head");
  const inner = el("div","wrap head-inner");

  const mark = el("a","wordmark");
  mark.href = "index.html";
  head.append(inner);

  const nav = el("nav","site-nav");
  PAGES.forEach(p => {
    const a = el("a");
    a.href = p.file;
    a.dataset.navId = p.id;
    if (p.id === page) a.setAttribute("aria-current","page");
    nav.append(a);
  });

  const btn = el("button","lang");
  btn.type = "button";
  btn.id = "langToggle";
  btn.addEventListener("click", () => {
    lang = lang === "ja" ? "en" : "ja";
    try { localStorage.setItem("labLang", lang); } catch(e){}
    render();
  });

  inner.append(mark, nav, btn);
  document.body.prepend(head);

  const foot = el("footer","site-foot");
  foot.innerHTML = '<div class="wrap">' +
    '<p id="footName"></p><p id="footRoom"></p><p id="footAddr"></p><p id="footPostal"></p>' +
    '<p><span id="footMail"></span></p>' +
    '<p style="margin-top:1rem"><a id="footPrivacy" href="privacy.html"></a></p></div>';
  document.body.append(foot);
}

/* ---------- page builders ---------- */

function pageHead(title, lede){
  const d = el("div","page-head");
  const w = el("div","wrap");
  const h = el("h1"); h.textContent = title;
  w.append(h);
  if (lede){ const p = el("p"); p.textContent = lede; w.append(p); }
  d.append(w);
  return d;
}

function buildHome(main){
  const hero = el("div","hero wrap");
  const h1 = el("h1");
  // 読点（、）を含む文（日本語）だけ、読点の直後にのみ改行してよいことにする。
  // それ以外の位置では折り返さないので、狭い画面でも不自然な位置で改行しない。
  // 読点を含まない文（英語など）はそのまま普通に折り返す。
  const tagline = t(CONTENT.lab.tagline);
  const taglineParts = tagline.split("、");
  if (taglineParts.length > 1){
    taglineParts.forEach((part, i) => {
      const isLast = i === taglineParts.length - 1;
      const span = el("span");
      span.style.whiteSpace = "nowrap";
      span.textContent = isLast ? part : part + "、";
      h1.append(span);
      if (!isLast) h1.append(document.createElement("wbr"));
    });
  } else {
    h1.textContent = tagline;
  }
  const ip = el("p");  ip.textContent = t(CONTENT.lab.intro);
  hero.append(h1, ip);
  main.append(hero);

  // news — 新しい順に、期間内のものだけ、指定件数まで
  const { topNewsCount, topNewsMaxAge } = CONTENT.settings;
  const cutoff = topNewsMaxAge > 0 ? Date.now() - topNewsMaxAge * 864e5 : -Infinity;
  const recent = sortedNews()
    .filter(n => new Date(n.date + "T00:00:00").getTime() >= cutoff)
    .slice(0, topNewsCount);

  if (recent.length){
    const b = el("div","block");
    const w = el("div","wrap");
    w.append(blockHead(t(UI.news), "news.html", t(UI.moreNews)));
    w.append(newsList(recent));
    b.append(w); main.append(b);
  }

  // 募集 — ニュースとは別の常設ブロック（ニュースの下・研究内容の上に固定表示）
  const cb = el("div","block");
  const cw = el("div","wrap");
  cw.append(blockHead(t(UI.join), "join.html", t(UI.moreJoin)));
  const cz = el("div","teasers");
  CONTENT.join.homeItems.forEach(item => {
    const a = el("a","teaser"); a.href = "join.html";
    const h = el("h3"); h.textContent = t(item.title);
    const s = el("p");  s.textContent = t(item.body);
    a.append(h,s); cz.append(a);
  });
  cw.append(cz); cb.append(cw); main.append(cb);

  const rb = el("div","block");
  const rw = el("div","wrap");
  rw.append(blockHead(t(UI.research), "research.html", t(UI.moreResearch)));
  const tz = el("div","teasers");
  CONTENT.projects.forEach(p => {
    const a = el("a","teaser"); a.href = "research.html";
    const h = el("h3"); h.textContent = t(p.title);
    const s = el("p");  s.textContent = t(p.lead);
    a.append(h,s); tz.append(a);
  });
  rw.append(tz); rb.append(rw); main.append(rb);
}

function buildNews(main){
  main.append(pageHead(t(UI.news)));
  const w = el("div","wrap");
  const items = sortedNews();
  let current = null;
  let ul = null;
  items.forEach(n => {
    const y = n.date.slice(0,4);
    if (y !== current){
      current = y;
      const h = el("div","year-head"); h.textContent = y; w.append(h);
      ul = el("ul","news-list"); w.append(ul);
    }
    ul.append(newsItem(n));
  });
  main.append(w);
}

function buildResearch(main){
  main.append(pageHead(t(UI.research), t(UI.researchLede)));
  const w = el("div","wrap");
  const list = el("div","projects");
  CONTENT.projects.forEach(p => {
    const d = el("div","project");
    const h = el("h2"); h.textContent = t(p.title);
    d.append(h);
    tp(p.body).forEach(par => { const x = el("p"); x.textContent = par; d.append(x); });
    if (p.image){
      const img = el("img");
      img.src = p.image; img.alt = t(p.title); img.loading = "lazy";
      d.append(img);
    }
    list.append(d);
  });
  w.append(list); main.append(w);
}

function buildPubs(main){
  main.append(pageHead(t(UI.pubs), t(UI.pubsLede)));
  const w = el("div","wrap");
  w.id = "pubWrap";
  main.append(w);

  // まず手動リストを描く。ここは必ず表示される。
  paintPubs(w, CONTENT.publications || []);

  // ORCID同期。取得できしだい差し替える。
  // publications.html?debug を開くと、同期の状況が画面に出ます。
  const debug = location.search.indexOf("debug") !== -1;
  const cfg = CONTENT.orcid || {};

  const say = msg => {
    if (!debug) return;
    const d = el("div","oops");
    d.style.marginTop = "2rem";
    d.textContent = msg;
    w.append(d);
  };

  if (typeof ORCID === "undefined"){
    say("assets/orcid.js が読み込まれていません。");
    return;
  }
  if (!cfg.enabled){
    say("ORCID同期はオフです（content.js の orcid.enabled が false）。");
    return;
  }
  if (!cfg.id){
    console.warn("[ORCID] content.js の orcid.id が空です。ORCID iD を入れると同期が始まります。");
    say("ORCID iD が未設定です。content.js の orcid: { id: \"...\" } に自分のIDを入れてください。");
    return;
  }

  const status = el("p");
  status.style.cssText = "font-size:.8125rem;color:var(--muted);margin:1.5rem 0 0";
  status.textContent = lang === "ja" ? "ORCIDから最新の論文を確認しています…" : "Checking ORCID for recent work…";
  w.append(status);

  ORCID.load()
    .then(r => {
      status.remove();
      paintPubs(w, r.list);
      const auto = r.list.filter(p => p._auto).length;
      say(`同期できました。ORCID由来 ${auto} 件 / 手動 ${r.list.length - auto} 件` +
          (r.cached ? "（保存済みのデータを使用。最大24時間で更新されます）" : ""));
    })
    .catch(err => {
      // 失敗しても手動リストはそのまま。訪問者には何も見せない。
      status.remove();
      console.warn("[ORCID] 同期できませんでした:", err);
      say("同期できませんでした: " + err +
          "\nORCID iD が正しいか確認してください。IDが正しいのに続く場合は、" +
          "ブラウザからORCIDへの直接アクセスが拒否されている可能性があります。");
    });
}

function paintPubs(w, list){
  w.querySelectorAll(".year-head, .pub, .pub-empty").forEach(n => n.remove());

  if (!list.length){
    const p = el("p","pub-empty");
    p.style.cssText = "color:var(--muted);max-width:var(--measure)";
    p.textContent = lang === "ja"
      ? "論文リストは準備中です。ORCID のページ（orcid.org/0000-0002-7151-1364）からもご覧いただけます。"
      : "The publication list is being prepared. It is also available on ORCID.";
    w.append(p);
    return;
  }

  const years = [...new Set(list.map(p => p.year))].sort((a,b) => b - a);
  years.forEach(y => {
    const h = el("div","year-head"); h.textContent = y; w.append(h);
    list.filter(p => p.year === y).forEach(p => w.append(pubItem(p)));
  });
}

function buildMembers(main){
  main.append(pageHead(t(UI.members)));
  const w = el("div","wrap");

  const grid = el("div","members");
  CONTENT.members.forEach(m => grid.append(memberCard(m)));
  w.append(grid);

  if (CONTENT.alumni && CONTENT.alumni.length){
    const b = el("div","block");
    const bw = el("div","wrap");
    bw.style.padding = "0";
    bw.append(blockHead(t(UI.alumni)));
    const ul = el("ul","alumni-list");
    [...CONTENT.alumni].sort((a,b2) => b2.year - a.year).forEach(a => {
      const li = el("li");
      const y = el("span","alumni-year"); y.textContent = a.year;
      const d = el("div");
      d.append(t(a.name) + " — " + t(a.role));
      if (t(a.next)){
        const s = el("span","next"); s.textContent = "  " + t(a.next);
        d.append(document.createElement("br"), s);
      }
      li.append(y,d); ul.append(li);
    });
    bw.append(ul); b.append(bw); w.append(b);
  }
  main.append(w);
}

function buildJoin(main){
  main.append(pageHead(t(UI.join), t(UI.joinLede)));
  const w = el("div","wrap");

  const list = el("div","positions");
  CONTENT.join.positions.forEach(pos => {
    const d = el("div","position");
    const h = el("h2"); h.textContent = t(pos.title);
    d.append(h);
    tp(pos.body).forEach(par => { const x = el("p"); x.textContent = par; d.append(x); });
    list.append(d);
  });
  w.append(list);

  const box = el("div","contact-box");
  const c1 = el("p");
  c1.append(t(UI.contact) + ": " + obfuscateEmail(CONTENT.lab.email));
  c1.append(emailNote());
  const c2 = el("p"); c2.textContent = [t(CONTENT.lab.room), t(CONTENT.lab.address)].filter(Boolean).join(" / ");
  const c3 = el("p"); c3.textContent = t(CONTENT.join.note);
  box.append(c1,c2,c3);
  w.append(box);
  main.append(w);
}

/* ---------- small pieces ---------- */

function buildPrivacy(main){
  const P = CONTENT.privacy || {};
  // IDが未設定なら解析は動いていないので、ポリシーも「使用していない」と書く
  const an = CONTENT.analytics || {};
  const provider = (an.provider && an.id && String(an.id).trim())
    ? String(an.provider).toLowerCase()
    : "none";
  const ja = lang === "ja";

  main.append(pageHead(ja ? "プライバシーポリシー" : "Privacy Policy"));
  const w = el("div","wrap");

  const sec = (heading, paras) => {
    const h = el("h2");
    h.style.cssText = "font-family:var(--serif);font-weight:600;font-size:1.125rem;margin:2.5rem 0 .75rem";
    h.textContent = heading;
    w.append(h);
    paras.forEach(txt => {
      const p = el("p");
      p.style.cssText = "margin:0 0 1rem;color:var(--muted);max-width:var(--measure)";
      p.textContent = txt;
      w.append(p);
    });
  };

  sec(ja ? "このサイトについて" : "About this site", [
    ja ? `${t(CONTENT.lab.name)}（${t(CONTENT.lab.affiliation)}）が運営しています。個人情報の取扱いは、国立大学法人金沢大学の定める規程に従います。`
       : `This site is run by ${t(CONTENT.lab.name)} at ${t(CONTENT.lab.affiliation)}. Personal information is handled in accordance with the policies of Kanazawa University.`
  ]);

  // アクセス解析の記述は、実際の設定に合わせて切り替わる
  const analyticsText = {
    none: [
      ja ? "当サイトでは、アクセス解析ツールを使用していません。訪問者を識別するためのCookieも使用していません。"
         : "This site does not use any analytics tools, nor cookies for identifying visitors.",
      ja ? "なお、当サイトはGitHub Pages上で公開されており、配信事業者側でアクセスログが記録される場合があります。"
         : "The site is hosted on GitHub Pages, and the hosting provider may record server access logs."
    ],
    ga4: [
      ja ? "当サイトでは、Google LLCが提供するアクセス解析ツール「Googleアナリティクス」を使用しています。同ツールはCookieを利用して訪問履歴を収集・分析し、当研究室はその結果を受け取ってサイトの利用状況を把握します。"
         : "This site uses Google Analytics, provided by Google LLC. It uses cookies to collect and analyse visit history, and we receive the results to understand how the site is used.",
      ja ? "収集される情報に、特定の個人を識別する情報は含まれません。IPアドレスは匿名化して送信しており、広告目的でのデータ利用は無効にしています。"
         : "The information collected does not identify individuals. IP addresses are anonymised, and use of the data for advertising purposes is disabled.",
      ja ? "収集を停止したい場合は、Googleが提供するオプトアウトアドオンをブラウザに導入するか、ブラウザのDo Not Track設定を有効にしてください。当サイトはDo Not Trackを尊重し、その場合は解析を行いません。"
         : "To opt out, install Google's opt-out browser add-on or enable Do Not Track in your browser. This site respects Do Not Track and will not run analytics in that case."
    ],
    cookieless: [
      ja ? "当サイトでは、Cookieを使用しないアクセス解析を利用しています。訪問者を個人として識別する情報や、サイトをまたいだ追跡は行いません。"
         : "This site uses cookieless analytics. We do not collect information identifying individual visitors, and we do not track visitors across sites.",
      ja ? "記録されるのは、閲覧されたページ、参照元、おおまかな地域、ブラウザの種類といった統計情報のみです。"
         : "Only aggregate information is recorded: which pages were viewed, referrer, approximate region, and browser type.",
      ja ? "ブラウザのDo Not Track設定が有効な場合、当サイトは解析を行いません。"
         : "If Do Not Track is enabled in your browser, this site will not run analytics."
    ]
  };
  const key = provider === "none" ? "none" : (provider === "ga4" ? "ga4" : "cookieless");
  sec(ja ? "アクセス解析について" : "Analytics", analyticsText[key]);

  // ORCID同期がオンなら、外部への通信が発生することを開示する
  if ((CONTENT.orcid || {}).enabled && (CONTENT.orcid || {}).id){
    sec(ja ? "外部サービスへの通信" : "Requests to external services", [
      ja ? "論文一覧のページでは、最新の業績を表示するために、閲覧時にORCIDおよびCrossrefのサーバーへ問い合わせを行います。この際、これらのサービスに閲覧者のIPアドレスが送信されます。取得した内容は、閲覧者のブラウザ内に最大24時間保存されます。"
         : "The publications page queries ORCID and Crossref when it loads, in order to show an up-to-date list. Your IP address is sent to those services as part of that request. The retrieved data is cached in your browser for up to 24 hours.",
      ja ? "当サイトは、ウェブフォントの表示のためにGoogle Fontsも利用しています。"
         : "This site also uses Google Fonts to render its typefaces."
    ]);
  }

  sec(ja ? "お問い合わせ" : "Contact", [
    ja ? `当サイトに関するお問い合わせは ${obfuscateEmail(CONTENT.lab.email)} までお願いします（${t(UI.emailNote)}）。`
       : `For questions about this site, please contact ${obfuscateEmail(CONTENT.lab.email)} (${t(UI.emailNote)}).`
  ]);

  // 大学の上位規程へのリンク
  if (P.universityPolicyUrl){
    const p = el("p");
    p.style.cssText = "margin:2.5rem 0 0;font-size:.875rem;color:var(--muted);max-width:var(--measure)";
    p.append(ja ? "個人情報の取扱いに関する大学全体の規程は " : "The university-wide policy on personal information is available at ");
    const a = el("a");
    a.href = P.universityPolicyUrl;
    a.rel = "noopener"; a.target = "_blank";
    a.style.color = "var(--accent)";
    a.textContent = ja ? "金沢大学 法人文書／個人情報保護" : "Kanazawa University — Personal Information Protection";
    p.append(a, ja ? " をご覧ください。" : ".");
    w.append(p);
  }

  if (P.updated){
    const u = el("p");
    u.style.cssText = "margin:1rem 0 0;font-size:.8125rem;color:var(--muted)";
    u.textContent = (ja ? "制定日: " : "Last updated: ") + P.updated.replace(/-/g,".");
    w.append(u);
  }

  main.append(w);
}

function blockHead(title, href, moreLabel){
  const d = el("div","block-head");
  const h = el("h2"); h.textContent = title;
  d.append(h);
  if (href){
    const a = el("a","more"); a.href = href; a.textContent = moreLabel;
    d.append(a);
  }
  return d;
}

function sortedNews(){
  return CONTENT.news
    .filter(n => t(n.text))
    .slice()
    .sort((a,b) => b.date.localeCompare(a.date));
}

// eventDate があるものだけ、開催前/開催後のラベルを返す（無ければ null）
function eventStatus(eventDate){
  if (!eventDate) return null;
  const end = new Date(eventDate + "T23:59:59");
  return end.getTime() >= Date.now() ? UI.eventUpcoming : UI.eventEnded;
}

function newsItem(n){
  const li = el("li");
  const d = el("span","news-date"); d.textContent = n.date.replace(/-/g,".");
  const p = el("p"); p.textContent = t(n.text);
  const status = eventStatus(n.eventDate);
  if (status){
    const tag = el("span","tag"); tag.textContent = t(status);
    p.append(tag);
  }
  li.append(d,p);
  if (n.url){
    const up = el("p","news-url");
    up.append(t(UI.newsUrl) + ": ");
    const a = el("a"); a.href = n.url; a.textContent = n.url;
    a.target = "_blank"; a.rel = "noopener";
    up.append(a);
    li.append(up);
  }
  return li;
}

function newsList(items){
  const ul = el("ul","news-list");
  items.forEach(n => ul.append(newsItem(n)));
  return ul;
}

function pubItem(p){
  const d = el("div","pub");
  const ti = el("p","pub-title"); ti.textContent = p.title;
  if (t(p.note)){
    const tag = el("span","tag"); tag.textContent = t(p.note);
    ti.append(tag);
  }
  const me = el("p","pub-meta");
  boldNames(p.authors).forEach(part => me.append(part));
  me.append(". ");
  const v = el("em"); v.textContent = p.venue;
  me.append(v);
  d.append(ti, me);

  const links = el("div","pub-links");
  const add = (href, label) => {
    if (!href) return;
    const a = el("a"); a.href = href; a.textContent = label;
    a.rel = "noopener"; a.target = "_blank";
    links.append(a);
  };
  add(p.doi, t(UI.readPaper));
  add(p.pdf, t(UI.pdf));
  if (links.children.length) d.append(links);
  return d;
}

// 著者名の中の研究室メンバーを太字にする
function boldNames(authors){
  const names = (CONTENT.highlight || []).filter(Boolean);
  if (!names.length) return [authors];
  const out = [];
  authors.split(/(,\s*)/).forEach(chunk => {
    if (names.some(n => chunk.trim() === n)){
      const b = el("b"); b.textContent = chunk;
      out.push(b);
    } else {
      out.push(chunk);
    }
  });
  return out;
}

function memberCard(m){
  const d = el("div","member");
  if (m.photo){
    const img = el("img","avatar");
    img.src = m.photo; img.alt = t(m.name); img.loading = "lazy";
    d.append(img);
  } else {
    const ph = el("div","avatar");
    ph.textContent = t(m.name).trim().charAt(0);
    ph.setAttribute("aria-hidden","true");
    d.append(ph);
  }
  const n = el("p","member-name"); n.textContent = t(m.name);
  const r = el("p","member-role"); r.textContent = t(m.role);
  d.append(n,r);
  if (t(m.bio)){ const b = el("p","member-bio"); b.textContent = t(m.bio); d.append(b); }

  const links = el("div","member-links");
  const add = (href,label) => {
    // href は言語で行き先が変わらないものは文字列、変わるものは { ja, en } の形
    const url = typeof href === "string" ? href : t(href);
    if (!url) return;
    const a = el("a");
    a.href = url; a.textContent = label;
    a.rel = "noopener"; a.target = "_blank";
    links.append(a);
  };
  add(m.links.scholar, t(UI.linkScholar));
  add(m.links.orcid, t(UI.linkOrcid));
  add(m.links.kaken, t(UI.linkKaken));
  add(m.links.researchmap, t(UI.linkResearchmap));
  if (links.children.length) d.append(links);

  // メールはスパム収集対策のため mailto にせず、難読化してプレーンテキストで表示
  if (m.links.email){
    const p = el("p","member-email");
    p.append(obfuscateEmail(m.links.email), emailNote());
    d.append(p);
  }
  return d;
}

/* ---------- render ---------- */

function render(){
  document.documentElement.lang = lang;
  document.title = t(CONTENT.lab.name) +
    (page === "home" ? "" : " — " + (page === "privacy" ? (lang === "ja" ? "プライバシーポリシー" : "Privacy Policy") : t(UI[page] || {}))) +
    (lang === "ja" ? " | 金沢大学" : " | Kanazawa University");

  // 左上のロゴは言語に関わらず常に英語表記
  document.querySelector(".wordmark").textContent = CONTENT.lab.name.en;
  document.getElementById("langToggle").textContent = lang === "ja" ? "English" : "日本語";
  document.querySelectorAll("[data-nav-id]").forEach(a => a.textContent = t(UI[a.dataset.navId]));

  const skip = document.querySelector(".skip");
  if (skip) skip.textContent = t(UI.skip);

  const main = document.getElementById("main");
  main.innerHTML = "";
  ({ home:buildHome, news:buildNews, research:buildResearch,
     pubs:buildPubs, members:buildMembers, join:buildJoin,
     privacy:buildPrivacy }[page] || buildHome)(main);

  document.getElementById("footName").textContent = t(CONTENT.lab.name);
  const footRoom = document.getElementById("footRoom");
  const roomText = t(CONTENT.lab.room);
  footRoom.textContent = roomText;
  footRoom.hidden = !roomText;
  document.getElementById("footAddr").textContent =
    t(CONTENT.lab.affiliation) + (lang === "ja" ? " " : ", ") + t(CONTENT.lab.address);
  document.getElementById("footPostal").textContent = t(CONTENT.lab.postalAddress);
  document.getElementById("footPrivacy").textContent = lang === "ja" ? "プライバシーポリシー" : "Privacy Policy";
  const fm = document.getElementById("footMail");
  fm.textContent = "";
  fm.append(obfuscateEmail(CONTENT.lab.email), emailNote());
}

function showError(err){
  const main = document.getElementById("main");
  main.innerHTML = '<div class="wrap"><div class="oops">' +
    '<p><strong>ページを表示できませんでした。</strong></p>' +
    '<p>assets/content.js の書き方に誤りがある可能性が高いです。' +
    '直前に編集した箇所で、行末のカンマ <code>,</code> や引用符 <code>"</code>、' +
    '囲みの <code>{ }</code> <code>[ ]</code> を消していないか確認してください。</p>' +
    '<p>GitHub では、コミット履歴から1つ前の状態に戻せます。</p>' +
    '<p><code>' + String(err) + '</code></p></div></div>';
  console.error(err);
}

if (typeof CONTENT === "undefined"){
  // content.js が読み込めていない、または文法エラーで止まっている
  showError(new Error("CONTENT が定義されていません。assets/content.js を確認してください。"));
} else {
  try {
    lang = (CONTENT.settings && CONTENT.settings.defaultLang) || "ja";
    try {
      const saved = localStorage.getItem("labLang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch(e){}
    buildChrome();
    render();
  } catch (err) {
    showError(err);
  }
}

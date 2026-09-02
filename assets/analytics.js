/* ==========================================================================
   アクセス解析の読み込み。編集不要です。
   設定は assets/content.js の analytics: {...} で行います。

   provider に指定できる値
     "none"        解析を入れない（初期値）
     "ga4"         Google Analytics 4        id: "G-XXXXXXXXXX"
     "cloudflare"  Cloudflare Web Analytics  id: トークン文字列
     "goatcounter" GoatCounter               id: "https://○○.goatcounter.com/count"

   ga4 以外はCookieを使わないため、同意バナーは不要です。
   ========================================================================== */

(function(){
  const cfg = (typeof CONTENT !== "undefined" && CONTENT.analytics) || {};
  const provider = (cfg.provider || "none").toLowerCase();
  const id = (cfg.id || "").trim();

  if (provider === "none" || !id) return;

  // Do Not Track を送っているブラウザを尊重する（初期値: 有効）
  if (cfg.respectDNT !== false){
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    if (dnt === "1" || dnt === "yes"){
      console.info("[analytics] Do Not Track が有効なため、解析を読み込みませんでした。");
      return;
    }
  }

  const addScript = (src, attrs) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    Object.entries(attrs || {}).forEach(([k,v]) => s.setAttribute(k, v));
    document.head.appendChild(s);
    return s;
  };

  if (provider === "ga4"){
    if (!/^G-[A-Z0-9]+$/i.test(id)){
      console.warn('[analytics] GA4の測定IDの形式が違うようです。"G-" で始まる文字列を入れてください:', id);
    }
    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id));
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id, {
      anonymize_ip: true,        // IPアドレスを匿名化
      allow_google_signals: false // 広告目的のデータ利用をオフ
    });

  } else if (provider === "cloudflare"){
    addScript("https://static.cloudflareinsights.com/beacon.min.js", {
      "data-cf-beacon": JSON.stringify({ token: id })
    });

  } else if (provider === "goatcounter"){
    addScript("https://gc.zgo.at/count.js", { "data-goatcounter": id });

  } else {
    console.warn("[analytics] provider の値が認識できません:", provider);
  }
})();

// Loads editable content (content/*.json), then starts the site scripts in order.
(async () => {
  const get = (url) => fetch(`${url}?v=${Date.now()}`).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
  const norm = (p) => String(p || "").replace(/^\/+/, "");
  try {
    const [texts, fixed] = await Promise.all([get("content/texts.json"), get("content/fixed-texts.json")]);
    window.NOB_TRANSLATIONS = {};
    Object.keys(fixed).forEach((l) => { window.NOB_TRANSLATIONS[l] = Object.assign({}, fixed[l], texts[l] || {}); });
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML("afterbegin", '<p style="position:fixed;z-index:2000;top:70px;left:10px;right:10px;padding:12px;background:#21170e;color:#f0dfb2;border:1px solid #9b7130">Content files could not be loaded. Run the site through a web server (not file://).</p>');
    return;
  }
  try {
    const img = await get("content/images.json");
    document.querySelectorAll("[data-img]").forEach((el) => {
      const p = norm(img[el.dataset.img]);
      if (p && p !== el.getAttribute("src")) el.src = p;
    });
    const v = document.querySelector("[data-video]");
    if (v) {
      if (img.heroVideo && norm(img.heroVideo) !== v.getAttribute("src")) v.src = norm(img.heroVideo);
      if (img.heroPoster) v.poster = norm(img.heroPoster);
    }
  } catch (e) { console.warn("images.json not loaded, using defaults", e); }
  for (const src of ["js/data.js", "js/main.js", "js/map.js"]) {
    await new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.body.appendChild(s);
    });
  }
})();

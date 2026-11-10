// Real Byggservice – liten, avhengighetsfri JS
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Topp: kantlinje når siden er scrollet */
  const topp = $("#topp");
  const settScroll = () => topp.classList.toggle("er-scrollet", window.scrollY > 8);
  settScroll();
  window.addEventListener("scroll", settScroll, { passive: true });

  /* Mobilmeny */
  const meny = $("#meny");
  const menyknapp = $(".topp__menyknapp");
  const lukkMeny = () => {
    meny.classList.remove("er-apen");
    menyknapp.setAttribute("aria-expanded", "false");
    menyknapp.textContent = "Meny";
  };
  menyknapp.addEventListener("click", () => {
    const apen = meny.classList.toggle("er-apen");
    menyknapp.setAttribute("aria-expanded", String(apen));
    menyknapp.textContent = apen ? "Lukk" : "Meny";
  });
  $$("a", meny).forEach((a) => a.addEventListener("click", lukkMeny));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lukkMeny(); });

  /* Marker aktiv seksjon i menyen */
  const lenker = new Map($$("a", meny).map((a) => [a.hash.slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      lenker.forEach((a) => a.removeAttribute("aria-current"));
      lenker.get(en.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  lenker.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });

  /* Galleri-filter */
  const galleri = $("#galleri");
  const elementer = $$("li", galleri);
  $$(".filter button").forEach((knapp, _, alle) => {
    knapp.addEventListener("click", () => {
      alle.forEach((k) => k.setAttribute("aria-pressed", String(k === knapp)));
      const f = knapp.dataset.filter;
      elementer.forEach((li) => { li.hidden = f !== "alle" && li.dataset.kat !== f; });
    });
  });

  /* Lysboks */
  const boks = $("#lysboks");
  const bilde = $("img", boks);
  const tekst = $(".lysboks__tekst", boks);
  let synlige = [];
  let i = 0;

  const vis = (n) => {
    i = (n + synlige.length) % synlige.length;
    const a = synlige[i];
    const alt = $("img", a).alt;
    bilde.src = a.href;
    bilde.alt = alt;
    tekst.textContent = `${alt} (${i + 1} av ${synlige.length})`;
  };

  galleri.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || typeof boks.showModal !== "function") return;
    e.preventDefault();
    synlige = elementer.filter((li) => !li.hidden).map((li) => $("a", li));
    vis(synlige.indexOf(a));
    boks.showModal();
  });
  boks.addEventListener("click", (e) => {
    const steg = e.target.dataset.steg;
    if (steg) vis(i + Number(steg));
    else if (e.target.hasAttribute("data-lukk") || e.target === boks) boks.close();
  });
  boks.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") vis(i + 1);
    if (e.key === "ArrowLeft") vis(i - 1);
  });
  // Sveip på mobil
  let startX = null;
  boks.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  boks.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) vis(i + (dx < 0 ? 1 : -1));
    startX = null;
  });

  /* Omtaler: vis 6 først */
  const omtaler = $$("#omtaleliste .omtale");
  const flere = $("#flereOmtaler");
  const FORST = 6;
  if (omtaler.length > FORST) {
    omtaler.slice(FORST).forEach((o) => { o.hidden = true; });
    flere.hidden = false;
    flere.addEventListener("click", () => {
      omtaler.forEach((o) => { o.hidden = false; });
      flere.remove();
      $("blockquote", omtaler[FORST]).setAttribute("tabindex", "-1");
      $("blockquote", omtaler[FORST]).focus({ preventScroll: true });
    });
  }
})();

/* 데모 공통 틀 주입: 크루 사이트와 같은 알약 머리줄 + 소개 장면 + 밤보라 푸터를 모든 데모에 같은 모양으로 넣는다.
   각 데모 HTML 은 body 맨 끝에 한 줄만 둔다:
     <script src="../assets/js/demo-frame.js" data-demo="ui-kit"></script>
   데모별 문구·일러스트·넣는 자리는 아래 PAGES 한 곳에서 관리한다. 데모 본문 코드는 건드리지 않는다. */
(() => {
  const script = document.currentScript;
  const key = script?.dataset.demo;
  if (!key) return;
  /* 크루 데모 사이트에서는 assets/js/ 에 있고, 컨벤션 샘플(samples/_demo-frame/)에서는 data-standalone 으로 쓴다.
     standalone 이면 크루 소개·작업·쇼케이스 같은 사이트 링크는 빼고 데모끼리만 잇는다. */
  const STANDALONE = script.dataset.standalone !== undefined;
  const ROOT = new URL(STANDALONE ? "../" : "../../", script.src).href; // 데모 사이트 루트
  const ART = STANDALONE ? new URL("art/", script.src).href : new URL("assets/media/art/", ROOT).href;

  /* 쇼케이스 데모 순서(번호는 쇼케이스 카드의 DEMO 번호와 같다) */
  const DEMOS = [
    { id: "ui-kit", no: "01", title: "UI 키트", href: "ui-kit/" },
    { id: "effects", no: "02", title: "인터랙션 효과", href: "effects/" },
    { id: "scroll", no: "03", title: "스크롤 인터랙션", href: "scroll/" },
    { id: "museum", no: "04", title: "디지털 역사관 구성", href: "museum/" },
    { id: "trends", no: "05", title: "요즘 UI", href: "trends/" },
    { id: "immersive", no: "06", title: "몰입형 3D 스크롤", href: "immersive/" },
  ];
  /* 하위 페이지가 있는 데모 */
  const SUBS = {
    museum: [
      { id: "museum/index", title: "역사관 메인", href: "museum/" },
      { id: "museum/timeline", title: "연대기", href: "museum/timeline.html" },
    ],
    trends: [
      { id: "trends/index", title: "내비게이션", href: "trends/" },
      { id: "trends/cta", title: "CTA", href: "trends/cta.html" },
      { id: "trends/bento", title: "벤토", href: "trends/bento.html" },
      { id: "trends/footer", title: "푸터", href: "trends/footer.html" },
      { id: "trends/motion", title: "마이크로", href: "trends/motion.html" },
      { id: "trends/hero", title: "히어로", href: "trends/hero.html" },
      { id: "trends/sections", title: "섹션", href: "trends/sections.html" },
      { id: "trends/forms", title: "폼", href: "trends/forms.html" },
    ],
  };

  /* 페이지별 설정
     demo: DEMOS id / title: ["첫 줄", "*주황 강조* 둘째 줄"] / art: assets/media/art 파일 / lead: 소개 문구(없으면 본문의 것을 가져옴)
     header: 지울 기존 머리줄 선택자 / intro: 소개 장면을 넣는 자리 / outro: 푸터를 넣는 자리 / drop: 같이 지울 것 */
  const PAGES = {
    "ui-kit": { demo: "ui-kit", art: "art-build", title: ["보람찬크루", "*UI 키트*"], label: "쇼케이스", header: ".l-kit__header", intro: { before: ".l-kit__intro", replace: true }, outro: "body", theme: true },
    effects: { demo: "effects", art: "art-motion", title: ["움직임으로", "*말하는* 화면"], lead: "숫자가 구르고, 문구가 열리고, 화면이 넘어가요. 아래로 스크롤하거나 키보드 ↑ ↓ 로 구간을 넘겨 보세요.", label: "쇼케이스", header: ".l-header", intro: { track: ".l-fullpage__track" }, outro: { track: ".l-fullpage__track" } },
    scroll: { demo: "scroll", art: "std-width", title: ["스크롤이", "*이야기*를 이끕니다"], lead: "스크롤 연동, 부드러운 이동, 패럴랙스, 가로 넘김과 스냅. 머리줄의 메뉴로 구간을 오가 보세요.", label: "쇼케이스", keepHeader: true, intro: { before: "main" }, outro: "body" },
    "museum/index": { demo: "museum", art: "art-handover", title: ["50년의 믿음,", "*다음 100년*의 약속"], lead: "OO 50 디지털 역사관 구성 데모. 구간이 한 장씩 덮이며 넘어가고, 효과 재생 방식을 골라 볼 수 있어요.", label: "OO 50 · 가상 고객", keepHeader: true, intro: { track: ".l-fp" }, outro: { fpPanel: true } },
    "museum/timeline": { demo: "museum", art: "step-5", title: ["50년의", "*발자취*"], lead: "연대기·사진·숫자·인터뷰로 이어지는 하위 페이지 구성이에요. 모두 예시 문구입니다.", label: "OO 50 · 가상 고객", header: ".l-mu-header", intro: { before: "main" }, outro: "body" },
    immersive: { demo: "immersive", art: "hero-right", title: ["스크롤로", "*움직이는* 카메라"], lead: "스크롤 하나로 카메라가 움직이고 장면이 영화처럼 이어져요. 마우스를 움직이면 깊이감이 살아나요.", label: "쇼케이스", intro: { before: "main" }, outro: "body" },
    "trends/index": { demo: "trends", art: "about-art", sub: "trends/index", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/cta": { demo: "trends", art: "contact-art", sub: "trends/cta", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/bento": { demo: "trends", art: "art-design", sub: "trends/bento", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/footer": { demo: "trends", art: "step-1", sub: "trends/footer", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/motion": { demo: "trends", art: "std-fps", sub: "trends/motion", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/hero": { demo: "trends", art: "hero-left", sub: "trends/hero", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/sections": { demo: "trends", art: "step-3", sub: "trends/sections", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
    "trends/forms": { demo: "trends", art: "step-2", sub: "trends/forms", header: ".c-site-nav", intro: { before: ".c-page-intro", replace: true }, outro: "body", drop: ".c-page-outro" },
  };

  const cfg = PAGES[key];
  if (!cfg) return;
  const demo = DEMOS.find((d) => d.id === cfg.demo);
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const u = (path) => ROOT + path;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const accent = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="d-accent">$1</span>');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const chevron = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /* 본문에 이미 있는 소개 문구·제목·칩을 가져온다(요즘 UI 8쪽, UI 키트) */
  const old = $(".c-page-intro") || $(".l-kit__intro");
  let title = cfg.title?.map((t) => `<span class="d-intro__line"><span>${accent(t)}</span></span>`).join("");
  let lead = cfg.lead;
  let label = cfg.label;
  let no = demo.no;
  let chips = "";
  if (old?.classList.contains("c-page-intro")) {
    const lines = [...old.querySelectorAll(".c-page-intro__line-inner")];
    title = lines.map((l) => `<span class="d-intro__line"><span>${l.innerHTML.replace(/c-page-intro__accent/g, "d-accent")}</span></span>`).join("");
    lead = $(".c-page-intro__lead", old)?.textContent.trim();
    label = $(".c-page-intro__eyebrow", old)?.textContent.replace(/^\s*\d+\s*/, "").trim();
    no = $(".c-page-intro__badge", old)?.textContent.trim() ?? no;
    chips = [...old.querySelectorAll(".c-page-intro__chip")]
      .map((a) => `<a class="d-intro__chip" href="${esc(a.getAttribute("href"))}">${esc(a.textContent.trim())}</a>`)
      .join("");
    // 요즘 UI 는 5번 데모의 하위 쪽이라 DEMO 번호는 데모 번호, 머리말은 "요즘 UI · 쪽 이름"
    no = demo.no;
  } else if (old?.classList.contains("l-kit__intro")) {
    lead = $(".l-kit__lead", old)?.textContent.trim();
    label = "쇼케이스";
  }
  const nextTarget = (() => {
    const subs = SUBS[cfg.demo];
    if (subs) {
      const i = subs.findIndex((s) => s.id === key);
      if (i >= 0 && i < subs.length - 1) return { title: subs[i + 1].title, href: subs[i + 1].href, kind: `${demo.title}의 다음 쪽` };
    }
    const j = DEMOS.findIndex((d) => d.id === cfg.demo);
    const nx = DEMOS[j + 1];
    return nx ? { title: nx.title, href: nx.href, kind: `다음 데모 · DEMO ${nx.no}` } : STANDALONE ? { title: "처음부터 다시", href: "ui-kit/", kind: "마지막 데모까지 보셨어요" } : { title: "쇼케이스로 돌아가기", href: "lab.html", kind: "마지막 데모까지 보셨어요" };
  })();

  /* ── 머리줄 ── */
  const subs = SUBS[cfg.demo];
  const nav = document.createElement("header");
  nav.className = "d-nav";
  nav.dataset.demoFrame = "nav";
  if (cfg.theme) nav.dataset.module = "theme-toggle";
  nav.innerHTML = `
    <div class="d-nav__bar">
      <a class="d-nav__logo" href="${u(STANDALONE ? "ui-kit/" : "index.html")}"><span class="d-nav__mark" aria-hidden="true"></span>보람찬크루</a>
      <nav class="d-nav__links" aria-label="주 메뉴"${STANDALONE ? " hidden" : ""}>
        <a class="d-nav__link" href="${u("index.html")}">크루 소개</a>
        <a class="d-nav__link" href="${u("prototypes.html")}">작업</a>
        <a class="d-nav__link" href="${u("lab.html")}" aria-current="page">쇼케이스</a>
        <a class="d-nav__link" href="${u("index.html#process")}">일하는 방식</a>
      </nav>
      <span class="d-nav__extra"></span>
      <button class="d-nav__menu" type="button" popovertarget="d-menu" aria-label="메뉴 열기">메뉴 ${chevron}</button>
    </div>
    <div class="d-nav__panel" id="d-menu" popover>
      <div class="d-nav__group"${STANDALONE ? " hidden" : ""}>
        <p class="d-nav__group-title">보람찬크루</p>
        <a class="d-nav__item" href="${u("index.html")}">크루 소개</a>
        <a class="d-nav__item" href="${u("prototypes.html")}">작업</a>
        <a class="d-nav__item" href="${u("lab.html")}">쇼케이스</a>
        <a class="d-nav__item" href="${u("index.html#process")}">일하는 방식</a>
      </div>
      <div class="d-nav__group"${STANDALONE ? " hidden" : ""}>
        <p class="d-nav__group-title">바로 가기</p>
        <a class="d-nav__item" href="${u("prototype-kogas.html")}">KOGAS 40 역사관 <span class="d-nav__item-desc">대표 작업</span></a>
        <a class="d-nav__item" href="${u("prototype-sgwon.html")}">승가원 30주년 역사관 <span class="d-nav__item-desc">대표 작업</span></a>
        <a class="d-nav__item" href="${u("prototype-kdic.html")}">예금보험공사 30주년 역사관 <span class="d-nav__item-desc">대표 작업</span></a>
      </div>
      <div class="d-nav__group">
        <p class="d-nav__group-title">쇼케이스 데모</p>
        ${DEMOS.map((d) => `<a class="d-nav__item" href="${u(d.href)}"${d.id === cfg.demo && !subs ? ' aria-current="page"' : ""}>${esc(d.title)} <span class="d-nav__item-desc">DEMO ${d.no}</span></a>`).join("")}
      </div>
      ${subs ? `<div class="d-nav__group"><p class="d-nav__group-title">${esc(demo.title)}</p>${subs.map((s) => `<a class="d-nav__item" href="${u(s.href)}"${s.id === key ? ' aria-current="page"' : ""}>${esc(s.title)}</a>`).join("")}</div>` : ""}
    </div>`;

  const oldHeader = cfg.header && document.querySelectorAll(cfg.header);
  const themeBtn = cfg.theme ? $(".js-theme-toggle") : null;
  if (!cfg.keepHeader) {
    oldHeader?.forEach((h) => h.remove());
    if (themeBtn) $(".d-nav__extra", nav).append(themeBtn);
    document.body.prepend(nav);
    document.body.prepend($("a.u-visually-hidden") ?? document.createComment(""));
  } else {
    // 머리줄 자체가 데모(GNB)인 쪽은 그대로 두고 틀의 소개·푸터만 맞춘다
    document.documentElement.classList.add("has-own-header");
    if (!STANDALONE) {
      const labLink = document.querySelector('.c-gnb__sub-inner a[href$="lab.html"]');
      if (labLink) {
        labLink.textContent = "쇼케이스 전체";
        const li = labLink.closest("li");
        [["작업", "prototypes.html"], ["크루 소개", "index.html"]].forEach(([t, h]) => {
          const n = li.cloneNode(true);
          const a = n.querySelector("a");
          a.textContent = t;
          a.setAttribute("href", u(h));
          li.before(n);
        });
      }
    }
  }
  document.documentElement.classList.add("has-demo-frame");

  /* ── 소개 장면 ── */
  const makeIntro = (tag = "section") => {
    const el = document.createElement(tag);
    el.className = "d-intro";
    el.dataset.demoFrame = "intro";
    el.setAttribute("aria-labelledby", "d-intro-title");
    el.innerHTML = `
      <img class="d-intro__art" src="${`${ART}${cfg.art}.webp`}" width="420" height="420" alt="" decoding="async">
      <div class="d-intro__inner">
        <p class="d-intro__eyebrow"><span class="d-intro__badge">DEMO ${no}</span>보람찬크루 · ${esc(label ?? "쇼케이스")}</p>
        <h1 class="d-intro__title" id="d-intro-title">${title}</h1>
        ${lead ? `<p class="d-intro__lead">${esc(lead)}</p>` : ""}
        ${STANDALONE ? "" : `<div class="d-intro__actions"><a class="d-btn" href="${u("prototypes.html")}">작업 보기 ${arrow}</a><a class="d-btn d-btn--line" href="${u("index.html")}">크루 소개</a></div>`}
        ${chips ? `<nav class="d-intro__chips" aria-label="이 페이지 예시">${chips}</nav>` : ""}
      </div>
      <span class="d-intro__hint" aria-hidden="true">아래로 스크롤</span>`;
    return el;
  };
  /* 기존 첫 화면에 h1 이 이미 있으면 소개 장면의 제목은 h2 로 낮춰 h1 을 하나만 둔다 */
  const intro = makeIntro();
  intro.dataset.theme = "light"; // 역사관 머리줄이 밝은 면 글자색으로 바뀌게
  const slot = cfg.intro;
  if (slot?.track) {
    const track = $(slot.track);
    intro.classList.add(track.classList.contains("l-fp") ? "l-fp__panel" : "l-fullpage__section");
    if (slot.track === ".l-fp") {
      const first = $(".l-fp__panel", track) ?? track.firstElementChild;
      first.before(intro);
    } else {
      track.prepend(intro);
    }
  } else if (slot?.before) {
    const ref = $(slot.before);
    ref.before(intro);
    if (slot.replace) ref.remove();
  }
  /* h1 은 소개 장면의 제목 하나만: 본문에 원래 있던 h1 은 클래스·내용은 그대로 두고 h2 로 바꾼다 */
  document.querySelectorAll("h1").forEach((h) => {
    if (!intro.contains(h)) {
      const h2 = document.createElement("h2");
      for (const a of h.attributes) h2.setAttribute(a.name, a.value);
      h2.innerHTML = h.innerHTML;
      h.replaceWith(h2);
    }
  });

  /* ── 푸터 ── */
  const outro = document.createElement("footer");
  outro.className = "d-outro";
  outro.dataset.demoFrame = "outro";
  outro.innerHTML = `
    <div class="d-outro__inner">
      
      <p class="d-outro__word" aria-hidden="true">보람찬크루</p>
      <div>
        <p class="d-outro__label">${esc(nextTarget.kind)}</p>
        <a class="d-outro__next" href="${u(nextTarget.href)}">${esc(nextTarget.title)} ${arrow}</a>
      </div>
      <nav class="d-outro__pills" aria-label="쇼케이스 바로가기">
        ${STANDALONE ? "" : `<a class="d-outro__pill d-outro__pill--main" href="${u("lab.html")}">← 쇼케이스로 돌아가기</a><a class="d-outro__pill" href="${u("index.html")}">크루 소개</a>`}
        ${DEMOS.map((d) => `<a class="d-outro__pill" href="${u(d.href)}"${d.id === cfg.demo ? ' aria-current="page"' : ""}>${esc(d.title)}</a>`).join("")}
      </nav>
    </div>
    <div class="d-outro__bottom"><span>© 2026 보람찬크루</span><span>HTML · CSS · 순수 JS 모듈 · 프레임워크 없음</span></div>`;
  if (cfg.drop) document.querySelectorAll(cfg.drop).forEach((e) => e.remove());
  const o = cfg.outro;
  if (o?.track) {
    outro.classList.add("l-fullpage__section");
    $(o.track).append(outro);
  } else if (o?.fpPanel) {
    outro.classList.add("l-fp__panel", "l-fp__panel--auto");
    outro.dataset.fpAuto = "";
    outro.dataset.theme = "dark";
    const oldFoot = $(".l-fp .l-footer");
    if (oldFoot) oldFoot.replaceWith(outro);
    else ($(".l-fp main") ?? $(".l-fp")).append(outro);
  } else {
    document.body.append(outro);
  }
})();

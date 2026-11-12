// 디자인시스템 문서 화면: 왼쪽 목차(검색) + 오른쪽 문서를 만들고, 주소의 #/쪽이름 으로 쪽을 바꾼다.
//   <div class="l-docs" data-module="docs"></div>   → 목차와 본문을 이 안에 그린다
// 쪽 내용은 docs/components.js(컴포넌트 12종)와 docs/foundations.js(소개·시작하기·Foundations 7쪽)에 있다.
// 미리보기에 data-module 이 들어 있으면(모달·메뉴·탭·토스트) 그린 뒤 main.js 의 mountAll 로 동작을 붙인다.
import { mountAll } from "../main.js";
import { COMPONENTS } from "../docs/components.js";
import { FOUNDATIONS } from "../docs/foundations.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const NAV = [
  { title: "소개", items: [["overview", "소개"], ["start", "시작하기"]] },
  { title: "Foundations", items: [["color", "색"], ["typography", "글자"], ["spacing", "간격"], ["radius", "반경"], ["shadow", "그림자"], ["motion", "모션"], ["layout", "레이아웃"]] },
  { title: "Components", items: COMPONENTS.map((c) => [c.id, c.name, c.en]) },
];
const ORDER = NAV.flatMap((g) => g.items.map(([id, name]) => ({ id, name })));
const KICKER = { overview: "보람찬크루 디자인시스템", start: "시작하기" };

// 들여쓰기를 맞춰 코드 보기에 보여 줄 문자열로 만든다
function dedent(html) {
  const lines = html.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

function pageHead(c) {
  return `
  <header class="doc-head">
    <p class="doc-kicker">Components</p>
    <h1 class="doc-title" tabindex="-1">${c.name} <span style="color:var(--ui-muted-foreground);font-weight:var(--font-weight-normal)">${c.en}</span></h1>
    <p class="doc-lead">${c.lead}</p>
    <div class="doc-meta">${c.meta.map((m) => `<span class="c-badge c-badge--secondary">${m}</span>`).join("")}</div>
  </header>`;
}

const section = (title, body, desc = "") => `
  <section class="doc-sec">
    <h2 class="doc-sec__title">${title}</h2>
    ${desc ? `<p class="doc-sec__desc">${desc}</p>` : ""}
    ${body}
  </section>`;

function example(ex) {
  const layout = ex.layout === "stack" ? " doc-stage--stack" : ex.layout === "grid" ? " doc-stage--grid" : "";
  return `
  <figure class="doc-example">
    <div class="doc-example__label">${ex.title}${ex.desc ? `<small>${ex.desc}</small>` : ""}</div>
    <div class="doc-stage${layout}">${ex.html}</div>
    <details class="doc-code">
      <summary>코드 보기</summary>
      <pre class="doc-pre"><button class="doc-copy" type="button" data-copy-code>복사</button><code>${esc(dedent(ex.html))}</code></pre>
    </details>
  </figure>`;
}

function table(headers, rows) {
  return `<div class="doc-table-wrap"><table class="doc-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((cell, i) => `<td>${i === 0 ? `<code>${cell}</code>` : cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function componentPage(c) {
  const parts = [pageHead(c)];
  parts.push(section("미리보기", c.examples.map(example).join("")));
  parts.push(section("클래스", table(["클래스", "설명"], c.classes), "마크업에 붙이는 이름입니다. <code>js-</code>로 시작하는 것은 JS가 찾는 훅이라 스타일이 없습니다."));
  if (c.states?.length) parts.push(section("상태", table(["상태", "모양", "선택자"], c.states.map(([a, b, s]) => [a, b, s ? `<code>${esc(s)}</code>` : "—"])), ""));
  parts.push(section("쓰는 법", `<div class="doc-dd"><div class="doc-do"><h3>이렇게</h3><ul>${c.dos.map((d) => `<li>${d}</li>`).join("")}</ul></div><div class="doc-dont"><h3>이렇게 하지 않는다</h3><ul>${c.donts.map((d) => `<li>${d}</li>`).join("")}</ul></div></div>`));
  parts.push(section("접근성", `<ul class="doc-list">${c.a11y.map((a) => `<li>${a}</li>`).join("")}</ul>`));
  parts.push(section("쓰는 토큰", `<div class="doc-chips">${c.tokens.map((t) => `<button class="doc-chip" type="button" data-copy="var(${t})" title="var(${t}) 복사">${t}</button>`).join("")}</div>`, "컴포넌트는 아래 토큰만 가리킵니다. 사이트의 컨셉에 맞게 이 값을 바꾸면 모양이 바뀝니다."));
  parts.push(section("파일", `<div class="doc-chips">${c.files.map((f) => `<span class="doc-chip">${f}</span>`).join("")}</div>`, "사이트에 복사할 때 필요한 파일입니다(<code>tokens.css</code>와 <code>reset.css</code>는 공통)."));
  return parts.join("");
}

export function init(host) {
  const ctx = { counts: { components: COMPONENTS.length, foundations: 7 } };
  host.innerHTML = `
    <button class="c-button c-button--outline doc-nav-toggle js-doc-toggle" type="button" aria-expanded="false" aria-controls="doc-nav"><span class="js-doc-current">쪽 고르기</span><svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m7 10 5 5 5-5z"/></svg></button>
    <nav class="doc-nav" id="doc-nav" aria-label="디자인시스템 목차">
      <label class="doc-nav__search"><span class="u-visually-hidden">쪽 검색</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4"/></svg>
        <input class="c-input js-doc-search" type="search" placeholder="쪽 검색 (예: 버튼, 간격)" autocomplete="off">
      </label>
      <div class="js-doc-groups">${NAV.map((g) => `
        <div class="doc-nav__group" data-group>
          <p class="doc-nav__title">${g.title}</p>
          ${g.items.map(([id, name, en]) => `<a class="doc-nav__link" href="#/${id}" data-id="${id}" data-text="${esc(`${name} ${en ?? ""} ${id}`.toLowerCase())}">${name}${en ? `<small>${en}</small>` : ""}</a>`).join("")}
        </div>`).join("")}
      </div>
      <p class="doc-nav__empty js-doc-empty" hidden>찾는 쪽이 없어요.</p>
    </nav>
    <article class="doc-page" aria-live="polite"></article>`;

  const nav = host.querySelector(".doc-nav");
  const toggle = host.querySelector(".js-doc-toggle");
  const current = host.querySelector(".js-doc-current");
  const page = host.querySelector(".doc-page");
  const links = [...host.querySelectorAll(".doc-nav__link")];
  const search = host.querySelector(".js-doc-search");
  const empty = host.querySelector(".js-doc-empty");
  let dispose = null;
  let currentId = null;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  function pagerHtml(id) {
    const i = ORDER.findIndex((p) => p.id === id);
    const prev = ORDER[i - 1], next = ORDER[i + 1];
    return `<nav class="doc-pager" aria-label="이전·다음 쪽">${prev ? `<a href="#/${prev.id}" rel="prev"><small>이전</small>${prev.name}</a>` : "<span></span>"}${next ? `<a href="#/${next.id}" rel="next"><small>다음</small>${next.name}</a>` : ""}</nav>`;
  }

  function render({ focus = false, keepScroll = false } = {}) {
    const id = location.hash.replace(/^#\/?/, "") || "overview";
    const comp = COMPONENTS.find((c) => c.id === id);
    const found = comp || FOUNDATIONS[id] ? id : "overview";
    const y = scrollY;
    dispose?.();
    dispose = null;

    let result;
    if (comp) result = { html: componentPage(comp) };
    else result = FOUNDATIONS[found].render(ctx);
    page.innerHTML = result.html + pagerHtml(found);
    const after = result.after?.(page);
    if (typeof after === "function") dispose = after;

    links.forEach((a) => (a.getAttribute("data-id") === found ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    const label = ORDER.find((p) => p.id === found)?.name ?? "";
    current.textContent = label;
    document.title = `${label} | UI 키트 · 보람찬크루 디자인시스템`;
    currentId = found;
    mountAll(page);
    setOpen(false);

    if (keepScroll) scrollTo(0, y);
    else if (focus) {
      scrollTo(0, 0);
      page.querySelector(".doc-title")?.focus({ preventScroll: true });
    }
  }

  // 검색
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let any = false;
    host.querySelectorAll("[data-group]").forEach((g) => {
      let shown = 0;
      g.querySelectorAll(".doc-nav__link").forEach((a) => {
        const hit = !q || a.dataset.text.includes(q);
        a.hidden = !hit;
        if (hit) shown += 1;
      });
      g.hidden = shown === 0;
      if (shown) any = true;
    });
    empty.hidden = any;
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") host.querySelector(".doc-nav__link:not([hidden])")?.click();
  });

  // 복사(색 칸·토큰 칩·코드)
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      t.style.cssText = "position:fixed;opacity:0";
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
  }
  const flash = (btn, done = "복사됨") => {
    const old = btn.dataset.label ?? btn.textContent;
    btn.dataset.label = old;
    if (btn.classList.contains("doc-copy")) {
      btn.textContent = done;
      btn.dataset.done = "true";
      setTimeout(() => { btn.textContent = old; delete btn.dataset.done; }, 1400);
    } else {
      const title = btn.getAttribute("aria-label");
      btn.setAttribute("aria-label", `${done}`);
      setTimeout(() => (title ? btn.setAttribute("aria-label", title) : btn.removeAttribute("aria-label")), 1400);
    }
  };
  page.addEventListener("click", async (e) => {
    const code = e.target.closest("[data-copy-code]");
    if (code) {
      await copy(code.parentElement.querySelector("code").textContent);
      flash(code);
      return;
    }
    const item = e.target.closest("[data-copy]");
    if (item) {
      await copy(item.dataset.copy);
      item.animate([{ transform: "scale(.94)" }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(.34,1.56,.64,1)" });
      flash(item);
    }
  });

  // 목차 서랍(좁은 화면)
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); } });
  document.addEventListener("click", (e) => { if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });

  // 주소가 바뀌면 쪽을 바꾼다. 테마(라이트/다크)가 바뀌면 토큰 값을 다시 읽어 그린다.
  const onHash = () => render({ focus: true });
  addEventListener("hashchange", onHash);
  const mo = new MutationObserver(() => render({ keepScroll: true }));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => render({ keepScroll: true });
  mq.addEventListener("change", onScheme);

  render();

  return {
    destroy() {
      removeEventListener("hashchange", onHash);
      mo.disconnect();
      mq.removeEventListener("change", onScheme);
      dispose?.();
      host.innerHTML = "";
    },
  };
}

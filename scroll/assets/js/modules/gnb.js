// GNB(전체 메뉴)
// - 모바일: 햄버거 버튼으로 전체 화면 메뉴 열기/닫기, 열려 있는 동안 스크롤 잠금·포커스 가두기, Esc로 닫기,
//           하위 메뉴는 아코디언(하나만 열림), 메뉴 링크를 누르면 닫힘
// - PC: 마우스를 올리거나(살짝 지연) 클릭·Enter·↓로 하위 메뉴 열기, Esc·바깥 클릭으로 닫기,
//       현재·마우스 올린 메뉴 아래로 밑줄이 미끄러짐(--gnb-x, --gnb-w, --gnb-o)
// 이벤트: gnb:toggle (detail.open)
import { isDesktop } from "../utils/motion.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";

const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 220;

export function init(root) {
  const toggle = root.querySelector(".c-gnb__toggle");
  const panel = root.querySelector(".c-gnb__panel");
  const list = root.querySelector(".c-gnb__list");
  const items = [...root.querySelectorAll(".c-gnb__item")];
  if (!toggle || !panel || !list) return { destroy() {} };

  let open = false;
  let locked = false;
  const timers = new Map();
  items.forEach((item, i) => item.style.setProperty("--gnb-i", String(i)));

  // ── 하위 메뉴 ──────────────────────────────
  const expand = (item, on) => {
    const button = item.querySelector("button.c-gnb__link");
    if (!button) return;
    item.classList.toggle("is-expanded", on);
    button.setAttribute("aria-expanded", String(on));
  };
  const collapseAll = (except) => items.forEach((item) => item !== except && expand(item, false));

  // ── 밑줄(PC) ───────────────────────────────
  const underline = (link) => {
    if (!link) return list.style.setProperty("--gnb-o", "0");
    list.style.setProperty("--gnb-x", `${link.offsetLeft + link.parentElement.offsetLeft}px`);
    list.style.setProperty("--gnb-w", `${link.offsetWidth}px`);
    list.style.setProperty("--gnb-o", "1");
  };
  const currentLink = () => list.querySelector('[aria-current="page"]');

  // ── 모바일 열기/닫기 ───────────────────────
  const setOpen = (next) => {
    if (open === next) return;
    open = next;
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    if (open && !locked) { lockScroll(); locked = true; }
    if (!open && locked) { unlockScroll(); locked = false; }
    if (open) setTimeout(() => panel.querySelector("a, button")?.focus(), 200);
    else { collapseAll(); toggle.focus(); }
    root.dispatchEvent(new CustomEvent("gnb:toggle", { bubbles: true, detail: { open } }));
  };

  const onToggle = () => setOpen(!open);

  const onClick = (event) => {
    const button = event.target.closest("button.c-gnb__link");
    if (button) {
      const item = button.closest(".c-gnb__item");
      const on = !item.classList.contains("is-expanded");
      collapseAll(item);
      expand(item, on);
      return;
    }
    if (event.target.closest("a") && !isDesktop()) setOpen(false);
  };

  const onKey = (event) => {
    if (event.key === "Escape") {
      if (open) setOpen(false);
      const expanded = items.find((i) => i.classList.contains("is-expanded"));
      if (expanded) { expand(expanded, false); expanded.querySelector("button.c-gnb__link")?.focus(); }
      return;
    }
    // 모바일 메뉴가 열려 있으면 Tab을 메뉴 안에 가둔다
    if (event.key === "Tab" && open && !isDesktop()) {
      const focusables = [toggle, ...panel.querySelectorAll("a, button")].filter((el) => el.offsetParent !== null);
      const first = focusables[0];
      const last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === "ArrowDown" && isDesktop()) {
      const button = event.target.closest("button.c-gnb__link");
      if (!button) return;
      event.preventDefault();
      const item = button.closest(".c-gnb__item");
      collapseAll(item);
      expand(item, true);
      item.querySelector(".c-gnb__sub-link")?.focus();
    }
  };

  // ── PC 마우스 ──────────────────────────────
  const onEnter = (event) => {
    if (!isDesktop()) return;
    const item = event.target.closest(".c-gnb__item");
    if (!item) return;
    underline(item.querySelector(".c-gnb__link"));
    clearTimeout(timers.get(item));
    timers.set(item, setTimeout(() => { collapseAll(item); expand(item, true); }, HOVER_OPEN_MS));
  };
  const onLeave = (event) => {
    if (!isDesktop()) return;
    const item = event.target.closest(".c-gnb__item");
    if (!item) return;
    clearTimeout(timers.get(item));
    timers.set(item, setTimeout(() => expand(item, false), HOVER_CLOSE_MS));
  };
  const onListLeave = () => isDesktop() && underline(currentLink());
  const onFocusIn = (event) => isDesktop() && underline(event.target.closest(".c-gnb__item")?.querySelector(".c-gnb__link"));
  const onOutside = (event) => { if (!root.contains(event.target)) collapseAll(); };

  const onResize = () => {
    if (isDesktop() && open) setOpen(false);
    underline(isDesktop() ? currentLink() : null);
  };

  toggle.addEventListener("click", onToggle);
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  list.addEventListener("pointerover", onEnter);
  list.addEventListener("pointerout", onLeave);
  list.addEventListener("pointerleave", onListLeave);
  list.addEventListener("focusin", onFocusIn);
  document.addEventListener("click", onOutside);
  addEventListener("resize", onResize);
  onResize();

  return {
    destroy() {
      toggle.removeEventListener("click", onToggle);
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      list.removeEventListener("pointerover", onEnter);
      list.removeEventListener("pointerout", onLeave);
      list.removeEventListener("pointerleave", onListLeave);
      list.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("click", onOutside);
      removeEventListener("resize", onResize);
      timers.forEach(clearTimeout);
      if (locked) unlockScroll();
    },
  };
}

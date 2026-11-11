// 드롭다운 메뉴: 열고 닫기·바깥 클릭·Esc는 브라우저 기본 Popover API(popovertarget)가 처리한다.
// 이 모듈은 위치 잡기(버튼 아래, 화면 밖으로 안 나가게)와 키보드 이동(↑↓ Home End)만 맡는다.
// 이벤트: menu:select (detail.value)

const GAP = 4;
const EDGE = 8;

export function init(root) {
  const trigger = root.querySelector(".js-menu-trigger");
  const menu = root.querySelector(".js-menu");
  if (!trigger || !menu) return { destroy() {} };

  const items = () => [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];

  const place = () => {
    const t = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    let x = t.left;
    let y = t.bottom + GAP;
    if (x + m.width > innerWidth - EDGE) x = Math.max(EDGE, t.right - m.width);
    if (y + m.height > innerHeight - EDGE) y = Math.max(EDGE, t.top - GAP - m.height);
    menu.style.setProperty("--menu-x", `${Math.round(x)}px`);
    menu.style.setProperty("--menu-y", `${Math.round(y)}px`);
  };

  const onToggle = (event) => {
    const isOpen = event.newState === "open";
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      place();
      items()[0]?.focus();
    }
  };

  const onKeydown = (event) => {
    const list = items();
    const index = list.indexOf(document.activeElement);
    const go = (i) => list[(i + list.length) % list.length]?.focus();
    if (event.key === "ArrowDown") go(index + 1);
    else if (event.key === "ArrowUp") go(index - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(list.length - 1);
    else if (event.key === "Tab") menu.hidePopover();
    else return;
    event.preventDefault();
  };

  const onSelect = (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item) return;
    menu.hidePopover();
    trigger.focus();
    root.dispatchEvent(new CustomEvent("menu:select", { bubbles: true, detail: { value: item.dataset.value ?? item.textContent.trim() } }));
  };

  const onResize = () => {
    if (menu.matches(":popover-open")) place();
  };

  menu.addEventListener("toggle", onToggle);
  menu.addEventListener("keydown", onKeydown);
  menu.addEventListener("click", onSelect);
  addEventListener("resize", onResize);
  addEventListener("scroll", onResize, { passive: true });

  return {
    destroy() {
      menu.removeEventListener("toggle", onToggle);
      menu.removeEventListener("keydown", onKeydown);
      menu.removeEventListener("click", onSelect);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onResize);
    },
  };
}

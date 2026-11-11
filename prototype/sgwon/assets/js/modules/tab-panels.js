// 탭 + 패널: root 안의 [role=tab] 버튼을 누르면 aria-controls 패널만 보이고 나머지는 hidden.
// 탭 줄(.c-tabs)에 --i(고른 번호)를 써서 밑줄이 미끄러지게 한다. ← → Home End 키, 주소 #패널id 로 바로 열기.
export function init(root) {
  const list = root.querySelector('[role="tablist"]');
  const tabs = list ? [...list.querySelectorAll('[role="tab"]')] : [];
  if (!tabs.length) return { destroy() {} };

  const panelOf = (tab) => root.querySelector(`#${CSS.escape(tab.getAttribute("aria-controls"))}`);
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = panelOf(tab);
      if (panel) panel.hidden = !on;
    });
    list.style.setProperty("--n", String(tabs.length));
    list.style.setProperty("--i", String(index));
    const cur = tabs[index];
    list.style.setProperty("--x", `${cur.offsetLeft}px`);
    list.style.setProperty("--w", `${cur.offsetWidth}px`);
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: cur.offsetLeft - (list.clientWidth - cur.offsetWidth) / 2, behavior: "smooth" });
    if (focus) cur.focus();
  };

  const onClick = (event) => {
    const i = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (i >= 0) select(i);
  };
  const onKey = (event) => {
    const now = tabs.indexOf(document.activeElement);
    if (now < 0) return;
    const move = { ArrowRight: now + 1, ArrowLeft: now - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (move === undefined) return;
    event.preventDefault();
    select((move + tabs.length) % tabs.length, true);
  };

  const hashIndex = tabs.findIndex((t) => `#${t.getAttribute("aria-controls")}` === location.hash || `#${t.id}` === location.hash);
  const selected = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  select(hashIndex >= 0 ? hashIndex : Math.max(0, selected));

  const onResize = () => select(tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  addEventListener("resize", onResize);
  document.fonts?.ready.then(onResize);
  list.addEventListener("click", onClick);
  list.addEventListener("keydown", onKey);
  return {
    destroy() {
      removeEventListener("resize", onResize);
      list.removeEventListener("click", onClick);
      list.removeEventListener("keydown", onKey);
    },
  };
}

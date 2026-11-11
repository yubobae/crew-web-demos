// 모션 탭: ARIA 탭 동작(클릭·← → Home End, roving tabindex) + 미끄러지는 표시자 위치(--ind-x, --ind-w)
// + 패널이 들어오는 방향(data-dir="next|prev"). 이벤트: tabs:change (detail.index)

export function init(root) {
  const list = root.querySelector('[role="tablist"]');
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  if (!list || !tabs.length) return { destroy() {} };
  const panelOf = (tab) => root.querySelector(`#${tab.getAttribute("aria-controls")}`);
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));

  const place = () => {
    const tab = tabs[current];
    list.style.setProperty("--ind-x", `${tab.offsetLeft}px`);
    list.style.setProperty("--ind-w", `${tab.offsetWidth}px`);
  };

  const select = (index, { focus = false } = {}) => {
    const dir = index >= current ? "next" : "prev";
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = panelOf(tab);
      if (!panel) return;
      panel.hidden = !on;
      if (on) {
        panel.dataset.dir = dir;
        // 같은 패널을 다시 보여 줄 때도 애니메이션이 다시 돌도록
        panel.style.animation = "none";
        void panel.offsetWidth;
        panel.style.animation = "";
      }
    });
    place();
    if (focus) tabs[index].focus();
    root.dispatchEvent(new CustomEvent("tabs:change", { bubbles: true, detail: { index } }));
  };

  const onClick = (event) => {
    const i = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (i >= 0 && i !== current) select(i);
  };
  const onKey = (event) => {
    const i = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (i < 0) return;
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select((keys[event.key] + tabs.length) % tabs.length, { focus: true });
  };
  const ro = new ResizeObserver(place);

  tabs.forEach((tab, i) => {
    tab.tabIndex = i === current ? 0 : -1;
    const panel = panelOf(tab);
    if (panel) panel.hidden = i !== current;
  });
  place();
  ro.observe(list);
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);

  return {
    destroy() {
      ro.disconnect();
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
    },
  };
}

// 탭: 클릭·키보드(← → Home End)로 선택, 선택된 탭만 Tab 키로 들어갈 수 있게(roving tabindex).
// HTML: role="tablist" 안의 role="tab"(aria-controls) + role="tabpanel". 이벤트: tabs:change (detail.index)

export function init(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return { destroy() {} };
  const panelOf = (tab) => root.querySelector(`#${tab.getAttribute("aria-controls")}`);

  const select = (index, { focus = false } = {}) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = panelOf(tab);
      if (panel) panel.hidden = !selected;
    });
    if (focus) tabs[index].focus();
    root.dispatchEvent(new CustomEvent("tabs:change", { bubbles: true, detail: { index } }));
  };

  const onClick = (event) => {
    const index = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (index >= 0) select(index);
  };

  const onKeydown = (event) => {
    const index = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (index < 0) return;
    const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select((keys[event.key] + tabs.length) % tabs.length, { focus: true });
  };

  const initial = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
  select(initial);
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeydown);

  return {
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKeydown);
    },
  };
}

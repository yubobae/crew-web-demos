// 탭 + 칩 거르기: [role=tab] 을 누르면 aria-controls 패널만 보이고, .js-chip[data-decade] 를 누르면 그 연대의 .js-cell[data-decade]만 남는다.
// 탭 밑줄(.js-tab-bar)에 --x, --w 를 넣어 미끄러지게 한다. ← → Home End 키, 주소 #패널id 로 바로 열기.
export function init(root) {
  const list = root.querySelector('[role="tablist"]');
  const tabs = list ? [...list.querySelectorAll('[role="tab"]')] : [];
  const bar = root.querySelector(".js-tab-bar");
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
    const cur = tabs[index];
    bar?.style.setProperty("--x", `${cur.offsetLeft}px`);
    bar?.style.setProperty("--w", `${cur.offsetWidth}px`);
    if (focus) cur.focus();
  };

  const onClick = (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) return select(tabs.indexOf(tab));
    const chip = event.target.closest(".js-chip");
    if (!chip) return;
    const panel = chip.closest('[role="tabpanel"]');
    panel.querySelectorAll(".js-chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const decade = chip.dataset.decade;
    panel.querySelectorAll(".js-cell").forEach((cell) => (cell.hidden = decade !== "all" && cell.dataset.decade !== decade));
  };
  const onKey = (event) => {
    const i = tabs.indexOf(event.target.closest('[role="tab"]'));
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    select((to + tabs.length) % tabs.length, true);
  };
  const onResize = () => select(tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));

  const fromHash = tabs.findIndex((t) => t.getAttribute("aria-controls") === location.hash.slice(1));
  select(fromHash >= 0 ? fromHash : 0);
  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  addEventListener("resize", onResize);
  return {
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      removeEventListener("resize", onResize);
    },
  };
}

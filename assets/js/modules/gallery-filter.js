// 분류 칩 + 검색창 + 인기 태그로 카드 격자를 거른다.
//   칩: button[data-filter]   카드: [data-cat="a b"] [data-tags="..."]   검색: input[data-search]   태그: button[data-tag]
// 자바스크립트가 꺼져 있으면 칩·검색이 동작하지 않을 뿐 카드 전체가 그대로 보인다.
export function init(root) {
  const chips = [...root.querySelectorAll("[data-filter]")];
  const grid = root.querySelector("[data-grid]");
  const search = root.querySelector("[data-search]");
  const live = root.querySelector("[data-live]");
  const empty = root.querySelector("[data-empty]");
  if (!grid) return;

  const cards = [...grid.children];
  let key = "all";

  function apply() {
    const q = (search?.value ?? "").trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const catOk = key === "all" || (card.dataset.cat ?? "").split(/\s+/).includes(key);
      const text = `${card.textContent} ${card.dataset.tags ?? ""}`.toLowerCase();
      const match = catOk && (!q || text.includes(q));
      const wasHidden = card.hidden;
      card.hidden = !match;
      card.classList.remove("is-in");
      if (match) {
        if (wasHidden) {
          // 다시 보일 때만 등장 애니메이션을 처음부터 재생한다
          void card.offsetWidth;
          card.style.animationDelay = `${shown * 60}ms`;
          card.classList.add("is-in");
        }
        shown += 1;
      }
    }
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === key)));
    if (empty) empty.hidden = shown > 0;
    if (live) live.textContent = `${shown}개 표시`;
  }

  const onClick = (e) => {
    const chip = e.target.closest("[data-filter]");
    const tag = e.target.closest("[data-tag]");
    if (chip) {
      key = chip.dataset.filter;
      apply();
    } else if (tag && search) {
      search.value = search.value === tag.dataset.tag ? "" : tag.dataset.tag;
      apply();
    }
  };
  const onInput = () => apply();

  root.addEventListener("click", onClick);
  search?.addEventListener("input", onInput);
  return {
    destroy() {
      root.removeEventListener("click", onClick);
      search?.removeEventListener("input", onInput);
    },
  };
}

// 진행 인포그래픽: 스크롤 위치로 진행률(--p)을 넣고, 지나간 단계에 is-on 을 붙인다.
// 화면 아래 85% 지점에 목록 시작이 닿으면 0, 화면 45% 지점에 목록 끝이 닿으면 1.
export function init(root) {
  const items = [...root.children];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    root.style.setProperty("--p", 1);
    items.forEach((el) => el.classList.add("is-on"));
    return;
  }

  let raf = 0;
  function update() {
    raf = 0;
    const r = root.getBoundingClientRect();
    const vh = innerHeight;
    const start = vh * 0.85, end = vh * 0.45;
    const vertical = getComputedStyle(root).gridTemplateColumns.split(" ").length === 1;
    // 가로형은 목록이 화면에 들어오는 동안, 세로형은 목록 길이만큼 스크롤하는 동안 채운다
    const span = vertical ? r.height + (start - end) : start - end + r.height * 0.4;
    const p = Math.min(Math.max((start - r.top) / span, 0), 1);
    root.style.setProperty("--p", p.toFixed(4));
    const n = items.length;
    items.forEach((el, i) => el.classList.toggle("is-on", p >= (i / (n - 1)) * 0.98 - 0.001 && p > 0.001));
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  update();
  return {
    destroy() {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    },
  };
}

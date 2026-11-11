// 연대기 위치 추적: 화면 가운데를 지나는 시대·항목을 찾아 표시한다.
// - 시대 목록(.c-era__link)의 aria-current, 왼쪽 큰 제목(.js-era-now-years / -desc) 바꾸기
// - 화면 가운데를 지난 연표 항목(.c-era__item)에 is-current
// - 연표 진행선(--era-progress)
// 모바일 가로 칩 목록은 지금 시대가 보이도록 옆으로 스크롤한다.

export function init(root) {
  const sections = [...root.querySelectorAll(".c-era__section")];
  const links = [...root.querySelectorAll(".c-era__link")];
  const items = [...root.querySelectorAll(".c-era__item")];
  const lists = [...root.querySelectorAll(".c-era__list")];
  const nowYears = root.querySelector(".js-era-now-years");
  const nowDesc = root.querySelector(".js-era-now-desc");
  const nav = root.querySelector(".c-era__nav");
  if (!sections.length) return { destroy() {} };

  let current = -1;
  let frame = 0;

  const setEra = (i) => {
    if (i === current) return;
    current = i;
    const section = sections[i];
    links.forEach((l) => l.setAttribute("aria-current", String(l.getAttribute("href") === `#${section.id}`)));
    if (nowYears) nowYears.textContent = section.dataset.years ?? "";
    if (nowDesc) nowDesc.textContent = section.dataset.desc ?? "";
    const active = links.find((l) => l.getAttribute("aria-current") === "true");
    if (active && nav && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2, behavior: "smooth" });
    }
  };

  // 모두 읽고 모두 쓰기
  const update = () => {
    frame = 0;
    const mid = innerHeight * 0.5;
    const secRects = sections.map((s) => s.getBoundingClientRect());
    const itemTops = items.map((it) => it.getBoundingClientRect().top);
    const listRects = lists.map((l) => l.getBoundingClientRect());

    let era = 0;
    secRects.forEach((r, i) => {
      if (r.top <= mid) era = i;
    });
    setEra(era);
    items.forEach((it, i) => it.classList.toggle("is-current", itemTops[i] <= mid));
    lists.forEach((l, i) => {
      const r = listRects[i];
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      l.style.setProperty("--era-progress", p.toFixed(3));
    });
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    },
  };
}

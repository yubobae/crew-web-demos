// 스크롤 진행률(--progress, 0~1)을 요소에 넣는다. CSS가 이 값으로 크기·위치·투명도를 정한다(스크롤에 딱 맞춰 움직임).
// data-scrub 종류
//   page    : 페이지 전체 진행률(읽기 진행 막대, 맨 위로 버튼)
//   view    : 요소가 화면 아래에서 들어와 위로 나갈 때까지(패럴랙스)
//   pin     : 길게 둔 바깥 상자가 고정되어 있는 동안(고정 + 확대)
//   hscroll : pin과 같고, 가로 이동 거리(--hs-distance)와 필요한 높이(--hs-height)도 계산(가로 스크롤)
// 화면 밖 요소는 계산하지 않고, 한 프레임에 한 번만 계산한다.

const clamp = (v) => Math.min(1, Math.max(0, v));

export function init(root) {
  const items = [...root.querySelectorAll("[data-scrub]")];
  if (!items.length) return { destroy() {} };
  let frame = 0;

  const measureH = () => {
    items
      .filter((el) => el.dataset.scrub === "hscroll")
      .forEach((el) => {
        const track = el.querySelector(".c-hscroll__track");
        const narrow = window.matchMedia("(max-width: 819px), (prefers-reduced-motion: reduce)").matches;
        if (!track || narrow) {
          el.style.removeProperty("--hs-height");
          el.style.setProperty("--hs-distance", "0px");
          return;
        }
        const distance = Math.max(0, track.scrollWidth - innerWidth);
        el.style.setProperty("--hs-distance", `${distance}px`);
        el.style.setProperty("--hs-height", `${distance + innerHeight}px`);
      });
  };

  let pageMax = 0;
  const last = new Map();

  // 한 프레임에 "모두 읽고 → 모두 쓴다". 읽기와 쓰기를 섞으면 매번 레이아웃을 다시 계산해 버벅인다.
  const update = () => {
    frame = 0;
    const vh = innerHeight;
    const y = scrollY;
    const values = [];
    for (const el of items) {
      const type = el.dataset.scrub;
      if (type === "page") {
        values.push([el, pageMax > 0 ? y / pageMax : 0]);
        continue;
      }
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      if (type === "view") values.push([el, (vh - r.top) / (vh + r.height)]);
      else values.push([el, r.height > vh ? -r.top / (r.height - vh) : 0]); // pin, hscroll
    }
    for (const [el, p] of values) {
      const v = clamp(p).toFixed(4);
      if (last.get(el) === v) continue; // 같은 값이면 다시 쓰지 않는다
      last.set(el, v);
      el.style.setProperty("--progress", v);
    }
  };

  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onResize = () => {
    measureH();
    pageMax = document.documentElement.scrollHeight - innerHeight;
    request();
  };

  measureH();
  pageMax = document.documentElement.scrollHeight - innerHeight;
  update();
  // 이미지·글꼴이 늦게 들어와 페이지 높이가 바뀌는 경우
  const ro = new ResizeObserver(onResize);
  ro.observe(document.body);
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", onResize);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
    },
  };
}

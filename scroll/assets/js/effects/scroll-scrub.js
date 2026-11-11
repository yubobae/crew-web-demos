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

  const update = () => {
    frame = 0;
    const vh = innerHeight;
    for (const el of items) {
      const type = el.dataset.scrub;
      let p;
      if (type === "page") {
        const max = document.documentElement.scrollHeight - vh;
        p = max > 0 ? scrollY / max : 0;
      } else {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        if (type === "view") p = (vh - r.top) / (vh + r.height);
        else p = r.height > vh ? -r.top / (r.height - vh) : 0; // pin, hscroll
      }
      el.style.setProperty("--progress", clamp(p).toFixed(4));
    }
  };

  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onResize = () => {
    measureH();
    request();
  };

  measureH();
  update();
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", onResize);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
    },
  };
}

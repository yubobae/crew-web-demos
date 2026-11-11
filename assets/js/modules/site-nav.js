// 떠 있는 알약 헤더: 조금이라도 스크롤하면 is-condensed(좁은 유리 알약), 맨 위로 오면 다시 넓게.
// 스크롤마다 한 번만 읽고(rAF로 묶음) 상태가 바뀔 때만 클래스를 바꾼다.
const THRESHOLD = 16;

export function init(root) {
  let frame = 0;
  let condensed = null;

  const update = () => {
    frame = 0;
    const next = scrollY > THRESHOLD;
    if (next === condensed) return;
    condensed = next;
    root.classList.toggle("is-condensed", next);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  addEventListener("scroll", onScroll, { passive: true });
  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    },
  };
}

// 대문 단계 넘김(풀페이지 느낌): 대문 구간에서는 휠을 살짝 돌리거나 위아래로 쓸거나 방향키·스페이스를 눌러도
// 중간에 걸리지 않고 "첫 화면 → 전시실 이름 → 다음 섹션"으로 한 단계씩 부드럽게 넘어간다.
// 넘어가는 동안 스크롤 위치가 변하므로 pin-progress가 만드는 글·영상 연출이 함께 움직인다.
// 동작 줄이기면 아무것도 하지 않는다(평소 스크롤). 대문 구간 밖에서는 평소 스크롤.
import { prefersReducedMotion } from "../utils/motion.js";

const DURATION = 1100;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };
  let busy = false;
  let touchY = 0;
  let raf = 0;

  const stages = () => {
    const span = root.offsetHeight - innerHeight;
    return [0, Math.round(span * 0.85), root.offsetHeight];
  };

  const goTo = (target) => {
    busy = true;
    const from = scrollY;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DURATION);
      scrollTo(0, from + (target - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => (busy = false), 120);
    };
    raf = requestAnimationFrame(step);
  };

  // 방향(+1 아래, -1 위)으로 다음 단계 위치. 대문 구간 밖이면 null.
  const next = (dir) => {
    const s = stages();
    const y = scrollY;
    if (dir > 0) return y < s[2] - 2 ? s.find((v) => v > y + 2) : null;
    return y <= s[2] + 2 && y > 2 ? [...s].reverse().find((v) => v < y - 2) : null;
  };

  const move = (dir, e) => {
    if (busy) {
      e?.preventDefault();
      return;
    }
    const target = next(dir);
    if (target == null) return;
    e?.preventDefault();
    goTo(target);
  };

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 4) return;
    move(e.deltaY > 0 ? 1 : -1, e);
  };
  const onTouchStart = (e) => (touchY = e.touches[0].clientY);
  const onTouchEnd = (e) => {
    const d = touchY - e.changedTouches[0].clientY;
    if (Math.abs(d) > 40) move(d > 0 ? 1 : -1);
  };
  const onKey = (e) => {
    if (e.target.closest?.("input,textarea,select,[contenteditable]")) return;
    if (["ArrowDown", "PageDown", " "].includes(e.key) && !(e.key === " " && e.shiftKey)) move(1, e);
    else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) move(-1, e);
  };

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("touchstart", onTouchStart, { passive: true });
  addEventListener("touchend", onTouchEnd, { passive: true });
  addEventListener("keydown", onKey);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("keydown", onKey);
    },
  };
}

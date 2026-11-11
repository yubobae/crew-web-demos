// 첫 화면 장면 넘김: 장면 구간에서는 마우스 휠을 살짝만 돌리거나 방향키·스페이스를 눌러도
// "첫 화면 → 시대 카드가 쌓인 화면 → 다음 섹션"으로 한 단계씩 부드럽게 넘어간다.
// 넘어가는 동안 스크롤 위치가 변하므로 pin-progress가 만드는 --pp(막·카드·진행 표시)가 함께 움직인다.
// 휴대폰·태블릿(손가락)은 막지 않고 평소 스크롤 그대로 두어도 같은 연출이 스크롤을 따라간다.
// 동작 줄이기·낮은 화면이면 아무것도 하지 않는다(CSS도 고정을 풀어 평소 스크롤).
import { prefersReducedMotion } from "../utils/motion.js";

const DURATION = 1000;
const ease = (t) => 1 - (1 - t) ** 4;

export function init(root) {
  if (prefersReducedMotion() || !matchMedia("(min-height: 40rem)").matches) return { destroy() {} };
  let busy = false;
  let raf = 0;

  const stages = () => [0, root.offsetHeight - innerHeight, root.offsetHeight];

  const goTo = (target) => {
    busy = true;
    const from = scrollY;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DURATION);
      scrollTo({ top: from + (target - from) * ease(t), behavior: "instant" });
      if (t < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => (busy = false), 140);
    };
    raf = requestAnimationFrame(step);
  };

  // 방향(+1 아래, -1 위)으로 다음 단계 위치. 장면 구간 밖이면 null.
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
    if (e.ctrlKey || Math.abs(e.deltaY) < 4) return;
    move(e.deltaY > 0 ? 1 : -1, e);
  };
  const onKey = (e) => {
    if (e.target.closest?.("input,textarea,select,[contenteditable],dialog")) return;
    if (["ArrowDown", "PageDown", " "].includes(e.key) && !(e.key === " " && e.shiftKey)) move(1, e);
    else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) move(-1, e);
  };

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("keydown", onKey);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
    },
  };
}

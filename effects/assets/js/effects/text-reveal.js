// 텍스트 마스크 리빌: root 안의 .c-reveal이 화면에 들어오면 is-in을 붙이고, 나가면 뗀다(되감기 가능).
// 모바일·PC 동일 동작(가벼움). reduced-motion이면 바로 최종 상태.
import { prefersReducedMotion } from "../utils/motion.js";

const THRESHOLD = 0.3;

export function init(root) {
  const targets = [...root.querySelectorAll(".c-reveal")];

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add("is-in"));
    return { destroy() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-in", entry.isIntersecting)),
    { threshold: THRESHOLD },
  );
  targets.forEach((el) => observer.observe(el));

  return {
    destroy() {
      observer.disconnect();
    },
  };
}

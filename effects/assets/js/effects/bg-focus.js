// 배경 초점: root 안의 .c-bg-focus가 화면에 들어오면 is-in을 붙여 흐림→선명(5초)을 시작한다. 되감기 가능.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const layers = [...root.querySelectorAll(".c-bg-focus")];
  if (prefersReducedMotion()) {
    layers.forEach((el) => el.classList.add("is-in"));
    return { destroy() {} };
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-in", entry.isIntersecting)),
    { threshold: 0.35 },
  );
  layers.forEach((el) => observer.observe(el));
  return {
    destroy() {
      observer.disconnect();
    },
  };
}

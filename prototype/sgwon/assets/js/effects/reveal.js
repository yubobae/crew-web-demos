// 화면에 들어오면 나타나기: root에 is-ready를 붙여 숨긴 뒤, 안의 .js-reveal(없으면 root 자신)이
// 화면에 들어오면 is-in을 붙인다(한 번만). JS가 없거나 동작 줄이기면 처음부터 보인다.
// data-reveal-repeat 가 있으면 화면에서 나가면 is-in을 떼어 다시 볼 때마다 재생한다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const targets = root.querySelectorAll(".js-reveal").length ? [...root.querySelectorAll(".js-reveal")] : [root];
  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add("is-in"));
    return { destroy() {} };
  }
  const repeat = "revealRepeat" in root.dataset;
  root.classList.add("is-ready");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          if (!repeat) io.unobserve(e.target);
        } else if (repeat && e.boundingClientRect.top > 0) {
          e.target.classList.remove("is-in"); // 아래로 빠질 때만 되감는다(위로 지나간 건 그대로)
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
  );
  targets.forEach((el) => io.observe(el));
  return {
    destroy() {
      io.disconnect();
      root.classList.remove("is-ready");
    },
  };
}

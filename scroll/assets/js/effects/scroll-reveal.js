// 스크롤 리빌: root 안의 .c-sr가 화면에 들어오면 is-in. 같은 묶음(data-sr-group) 안에서는 순서대로 시차(--sr-i).
// 위로 다시 올라가 화면 아래로 나가면 되감긴다. reduced-motion이면 CSS가 처음부터 보이게 한다.
import { prefersReducedMotion } from "../utils/motion.js";

export function init(root) {
  const targets = [...root.querySelectorAll(".c-sr")];
  if (!targets.length || prefersReducedMotion()) return { destroy() {} };

  const groups = new Map();
  targets.forEach((el) => {
    const key = el.closest("[data-sr-group]") ?? el;
    const list = groups.get(key) ?? [];
    el.style.setProperty("--sr-i", String(list.length));
    list.push(el);
    groups.set(key, list);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
        else if (entry.boundingClientRect.top > 0) entry.target.classList.remove("is-in"); // 아래로 나갈 때만 되감기
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  targets.forEach((el) => observer.observe(el));

  return {
    destroy() {
      observer.disconnect();
    },
  };
}

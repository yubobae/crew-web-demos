// 숫자 회전 카운터: root 안의 .js-odometer(data-to="50")를 자릿수 띠로 바꾸고,
// 화면에 들어오면(또는 data-delay ms 뒤) 띠를 굴려 목표 숫자에서 멈춘다.
// 숫자 원문은 aria-label로 남겨 화면 읽기·검색에 그대로 보인다. reduced-motion이면 바로 최종 숫자.
import { prefersReducedMotion } from "../utils/motion.js";

const STEP_DELAY_S = 0.12; // 자릿수마다 조금씩 늦게 출발

export function init(root) {
  const targets = [...root.querySelectorAll(".js-odometer")];
  const timers = [];

  const build = (el) => {
    const value = String(el.dataset.to ?? el.textContent.trim());
    el.setAttribute("aria-label", value);
    el.textContent = "";
    [...value].forEach((char, i) => {
      const digit = document.createElement("span");
      digit.className = "c-odometer__digit";
      digit.setAttribute("aria-hidden", "true");
      if (!/\d/.test(char)) {
        digit.textContent = char;
        el.append(digit);
        return;
      }
      const ribbon = document.createElement("span");
      ribbon.className = "c-odometer__ribbon";
      // 한 바퀴(0~9)를 더 돌고 목표 숫자에서 멈추도록 0~9를 두 번 둔다
      for (let n = 0; n < 20; n++) {
        const num = document.createElement("span");
        num.className = "c-odometer__num";
        num.textContent = String(n % 10);
        ribbon.append(num);
      }
      ribbon.style.setProperty("--odo-delay", `${i * STEP_DELAY_S}s`);
      ribbon.dataset.final = String(10 + Number(char));
      digit.append(ribbon);
      el.append(digit);
    });
  };

  const run = (el) => {
    el.querySelectorAll(".c-odometer__ribbon").forEach((ribbon) => ribbon.style.setProperty("--digit", ribbon.dataset.final));
  };

  targets.forEach(build);

  if (prefersReducedMotion()) {
    targets.forEach(run);
    return { destroy() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const delay = Number(entry.target.dataset.delay ?? 0);
        timers.push(setTimeout(() => run(entry.target), delay));
      }
    },
    { threshold: 0.4 },
  );
  // 띠가 그려진 다음 프레임에 관찰을 시작해야 전환이 보인다
  requestAnimationFrame(() => targets.forEach((el) => observer.observe(el)));

  return {
    destroy() {
      observer.disconnect();
      timers.forEach(clearTimeout);
    },
  };
}

// 연도 다이얼(메인 첫 화면): 고정된 무대에서 장면(.c-dial__layer)을 한 장씩 넘긴다.
// - 처음 열면 연도가 1996에서 2026까지 주행계처럼 굴러 올라간다(원본 메인과 같은 연출).
// - PC: 휠을 살짝만 굴려도(방향키·스페이스도) 다음 장면으로 1초 동안 부드럽게 이동하고, 마지막 장면에서 한 번 더 굴리면 다음 섹션으로 간다.
// - 휴대폰·태블릿: 막지 않고 평소 스크롤. 스크롤 위치(한 화면 = 한 장면)에 따라 같은 장면 전환이 재생된다.
// - 동작 줄이기: 아무것도 하지 않는다(CSS가 장면을 쌓아 보여 준다).
import { prefersReducedMotion, isDesktop, tween } from "../utils/motion.js";

const SNAP = 1000;
const easeSnap = (t) => 1 - (1 - t) ** 4;
const START = 1996;

export function init(root) {
  if (prefersReducedMotion()) return { destroy() {} };

  const layers = [...root.querySelectorAll(".c-dial__layer")];
  const steps = [...root.querySelectorAll(".js-dial-step")];
  const stage = root.querySelector(".c-dial__pin");
  const years = layers.map((layer) => Number(layer.dataset.year));
  const last = layers.length - 1;
  const first = Number(years[0]);
  let current = 0;
  let year = START;
  let cancelYear = () => {};
  let cancelSnap = 0;
  let busy = false;
  let frame = 0;
  let timer = 0;

  const paint = (y) => {
    year = y;
    // 주행계: 윗자리는 바로 아랫자리가 9에서 0으로 넘어가는 동안에만 한 칸 굴러간다(아랫자리의 실제 위치 p를 받아 이어 간다)
    let below = 0;
    for (let k = 0; k < 4; k++) {
      const p = k === 0 ? y % 10 : Math.floor(y / 10 ** k) % 10 + Math.max(0, below - 9);
      below = p;
      stage.style.setProperty(`--p${k}`, p.toFixed(3));
    }
    stage.style.setProperty("--r", String(Math.min(1, Math.max(0, (y - START) / (first - START)))));
  };

  const rollTo = (to, ms) => {
    cancelYear();
    const from = year;
    cancelYear = tween(ms, (p) => paint(from + (to - from) * p));
  };

  const setStep = (i, { immediate = false } = {}) => {
    if (i === current && !immediate) return;
    const prev = layers[current];
    current = i;
    const layer = layers[i];
    prev.style.zIndex = "1";
    layers.forEach((l) => l !== prev && (l.style.zIndex = "0"));
    layer.style.zIndex = "2";
    layer.classList.add("is-active");
    layers[0].classList.remove("is-first");
    steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
    if (!immediate) {
      root.classList.remove("is-sweep");
      void root.offsetWidth;
      root.classList.add("is-sweep");
    }
    clearTimeout(timer);
    timer = setTimeout(() => layers.forEach((l, k) => k !== current && l.classList.remove("is-active")), 1300);
    if (prev !== layer) rollTo(years[i], 1100);
  };

  const stageY = (i) => root.offsetTop + i * innerHeight;
  const goToY = (target, then) => {
    busy = true;
    const from = scrollY;
    const t0 = performance.now();
    const run = (now) => {
      const t = Math.min(1, (now - t0) / SNAP);
      scrollTo({ top: from + (target - from) * easeSnap(t), behavior: "instant" });
      if (t < 1) cancelSnap = requestAnimationFrame(run);
      else {
        setTimeout(() => (busy = false), 120);
        then?.();
      }
    };
    cancelSnap = requestAnimationFrame(run);
  };

  const goStep = (i) => {
    setStep(i);
    goToY(stageY(i));
  };

  // 방향(+1 아래, -1 위)으로 한 단계. 장면 구간 밖이면 하지 않는다.
  const move = (dir, event) => {
    if (!isDesktop() || !matchMedia("(min-height: 36rem)").matches) return;
    const top = root.offsetTop;
    const y = scrollY - top;
    const end = last * innerHeight;
    const beyond = root.offsetHeight;
    if (busy) {
      if (y >= -2 && y <= beyond + 2) event?.preventDefault();
      return;
    }
    if (dir > 0) {
      if (y < -2 || y >= beyond - 2) return;
      event?.preventDefault();
      if (y < end - 2) goStep(Math.min(last, Math.round(y / innerHeight) + 1));
      else goToY(top + beyond);
    } else {
      if (y > beyond + 2 || y <= 2) return;
      event?.preventDefault();
      if (y > end + 2) goToY(top + end);
      else goStep(Math.max(0, Math.round(y / innerHeight) - 1));
    }
  };

  const onWheel = (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 4) return;
    move(event.deltaY > 0 ? 1 : -1, event);
  };
  const onKey = (event) => {
    if (event.target.closest?.("input,textarea,select,[contenteditable],dialog")) return;
    if (["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)) move(1, event);
    else if (["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)) move(-1, event);
  };

  // 스크롤 위치로 현재 장면 고르기(손가락 스크롤·직접 끌기)
  const onScroll = () => {
    if (frame || busy) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const y = scrollY - root.offsetTop;
      const i = Math.min(last, Math.max(0, Math.round(y / innerHeight)));
      if (y > -innerHeight && y < root.offsetHeight) setStep(i);
    });
  };

  const onClick = (event) => {
    const b = event.target.closest(".js-dial-step");
    if (!b) return;
    const i = steps.indexOf(b);
    if (isDesktop()) goStep(i);
    else scrollTo({ top: stageY(i), behavior: "smooth" });
  };

  // 첫 진입: 1996 → 2026 굴러 올라가기
  paint(START);
  cancelYear = tween(3200, (p) => paint(START + (first - START) * p), (t) => 1 - (1 - t) ** 3);
  steps[0]?.classList.add("is-on");
  setStep(Math.min(last, Math.max(0, Math.round((scrollY - root.offsetTop) / innerHeight))), { immediate: true });

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("keydown", onKey);
  addEventListener("scroll", onScroll, { passive: true });
  root.addEventListener("click", onClick);
  return {
    destroy() {
      cancelYear();
      cancelAnimationFrame(cancelSnap);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
      root.removeEventListener("click", onClick);
    },
  };
}

// 모션 공통 유틸. 모든 effects/ 모듈은 init에서 prefersReducedMotion()을 먼저 확인한다.

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_QUERY).matches;
}

export function isDesktop() {
  return window.matchMedia("(min-width: 1025px)").matches;
}

/** 0→1 진행률을 duration(ms) 동안 onFrame에 넘긴다. 취소 함수를 돌려준다. */
export function tween(duration, onFrame, ease = easeOutCubic) {
  let rafId = 0;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    onFrame(ease(progress));
    if (progress < 1) rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

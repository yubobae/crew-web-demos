// 스크롤 설정 패널: 스위치로 부드러운 스크롤·섹션 자석 스냅을 켜고 끈다(비교해 보기용).
// 터치 기기·동작 줄이기에서는 부드러운 스크롤 스위치를 끄고 잠근다(브라우저 기본이 더 자연스럽다).
import { prefersReducedMotion } from "../utils/motion.js";
import { isSmooth, isSnap, setSmooth, setSnap } from "../utils/scroll-mode.js";

export function init(root) {
  const smooth = root.querySelector(".js-smooth-toggle");
  const snap = root.querySelector(".js-snap-toggle");
  const hint = root.querySelector(".js-smooth-hint");
  const unsupported = prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches;

  if (smooth) {
    if (unsupported) {
      smooth.checked = false;
      smooth.disabled = true;
      if (hint) hint.hidden = false;
    } else {
      setSmooth(smooth.checked);
    }
  }
  if (snap) setSnap(snap.checked);

  const onSmooth = () => setSmooth(smooth.checked);
  const onSnap = () => setSnap(snap.checked);
  const sync = () => {
    if (smooth && !smooth.disabled) smooth.checked = isSmooth();
    if (snap) snap.checked = isSnap();
  };

  smooth?.addEventListener("change", onSmooth);
  snap?.addEventListener("change", onSnap);
  addEventListener("scroll-mode:change", sync);

  return {
    destroy() {
      smooth?.removeEventListener("change", onSmooth);
      snap?.removeEventListener("change", onSnap);
      removeEventListener("scroll-mode:change", sync);
    },
  };
}

// 스크롤 설정 패널: 스위치로 부드러운 스크롤·섹션 자석 스냅을 켜고 끈다(비교해 보기용).
// 터치 기기·동작 줄이기에서는 부드러운 스크롤 스위치를 끄고 잠근다(브라우저 기본이 더 자연스럽다).
import { prefersReducedMotion } from "../utils/motion.js";
import { isPaged, isSmooth, isSnap, setPaged, setSmooth, setSnap } from "../utils/scroll-mode.js";

export function init(root) {
  const smooth = root.querySelector(".js-smooth-toggle");
  const snap = root.querySelector(".js-snap-toggle");
  const paged = root.querySelector(".js-paged-toggle");
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
  if (paged) {
    if (unsupported) {
      paged.checked = false;
      paged.disabled = true;
    }
    setPaged(paged.checked);
  }

  const onSmooth = () => setSmooth(smooth.checked);
  const onSnap = () => {
    setSnap(snap.checked);
    if (snap.checked && paged?.checked) setPaged(false); // 자석 스냅과 섹션 넘김은 함께 쓰지 않는다
  };
  const onPaged = () => {
    setPaged(paged.checked);
    if (paged.checked) {
      setSnap(false);
      setSmooth(true); // 섹션 넘김은 부드러운 이동 위에서 동작
    }
  };
  const sync = () => {
    if (smooth && !smooth.disabled) smooth.checked = isSmooth();
    if (snap) snap.checked = isSnap();
    if (paged && !paged.disabled) paged.checked = isPaged();
  };

  smooth?.addEventListener("change", onSmooth);
  snap?.addEventListener("change", onSnap);
  paged?.addEventListener("change", onPaged);
  addEventListener("scroll-mode:change", sync);

  return {
    destroy() {
      smooth?.removeEventListener("change", onSmooth);
      snap?.removeEventListener("change", onSnap);
      paged?.removeEventListener("change", onPaged);
      removeEventListener("scroll-mode:change", sync);
    },
  };
}

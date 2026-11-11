// 재생 방식 선택 패널: 한 번만 / 매번 / 되감기 / 스크롤에 맞춰 중 하나를 고르면
// html[data-play-mode]를 바꾸고 play-mode:change를 알린다(effects/play.js가 받아 다시 맞춤).
// 고른 값은 이 브라우저에 기억한다(실패해도 동작에는 지장 없음).

const KEY = "play-mode";

export function init(root) {
  const radios = [...root.querySelectorAll('input[name="play-mode"]')];
  if (!radios.length) return { destroy() {} };

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* 저장소를 못 쓰면 기본값 */
  }
  const initial = radios.find((r) => r.value === saved) ?? radios.find((r) => r.checked) ?? radios[0];
  initial.checked = true;
  document.documentElement.dataset.playMode = initial.value;

  const onChange = (event) => {
    const value = event.target.value;
    document.documentElement.dataset.playMode = value;
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* 무시 */
    }
    window.dispatchEvent(new CustomEvent("play-mode:change", { detail: { mode: value } }));
  };

  radios.forEach((r) => r.addEventListener("change", onChange));
  window.dispatchEvent(new CustomEvent("play-mode:change", { detail: { mode: initial.value } }));

  return {
    destroy() {
      radios.forEach((r) => r.removeEventListener("change", onChange));
    },
  };
}

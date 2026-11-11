// 막대그래프: root 안 .js-bar[data-value]의 가장 큰 값을 1로 보고 각 막대에 --h(0~1)를 쓴다.
// 막대가 자라는 움직임은 CSS(카드가 is-in일 때)가 맡는다.
export function init(root) {
  const bars = [...root.querySelectorAll(".js-bar")];
  if (!bars.length) return { destroy() {} };
  const max = Math.max(...bars.map((b) => Number(b.dataset.value) || 0)) || 1;
  bars.forEach((b) => b.style.setProperty("--h", String((Number(b.dataset.value) || 0) / max)));
  return { destroy() {} };
}

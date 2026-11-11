// 비밀번호 강도: 입력할 때마다 조건 4가지(.js-pw-rule[data-rule])를 검사해 is-met을 주고,
// 만족한 개수를 root의 data-score로, 막대(.js-pw-bar)는 그 개수만큼 is-on, 상태 글자(.js-pw-status)를 바꾼다.
// 눈 버튼(.js-pw-eye)은 보이기/숨기기(aria-pressed). 빈칸이면 0점.
const RULES = {
  length: (v) => v.length >= 8,
  number: (v) => /\d/.test(v),
  upper: (v) => /[A-Z]/.test(v),
  symbol: (v) => /[^A-Za-z0-9\s]/.test(v),
};
const LABELS = ["", "약해요", "보통이에요", "좋아요", "아주 튼튼해요"];

export function init(root) {
  const input = root.querySelector(".js-pw-input");
  const eye = root.querySelector(".js-pw-eye");
  const rules = [...root.querySelectorAll(".js-pw-rule")];
  const bars = [...root.querySelectorAll(".js-pw-bar")];
  const status = root.querySelector(".js-pw-status");
  if (!input) return { destroy() {} };

  const render = () => {
    const v = input.value;
    let score = 0;
    rules.forEach((r) => {
      const ok = v !== "" && RULES[r.dataset.rule]?.(v);
      r.classList.toggle("is-met", Boolean(ok));
      if (ok) score++;
    });
    root.dataset.score = String(score);
    bars.forEach((b, i) => b.classList.toggle("is-on", i < score));
    if (status) status.textContent = v ? LABELS[score] || "약해요" : "비밀번호를 입력해 보세요";
  };
  const onEye = () => {
    const show = eye.getAttribute("aria-pressed") !== "true";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "비밀번호 숨기기" : "비밀번호 보기");
    input.type = show ? "text" : "password";
    input.focus();
  };

  input.addEventListener("input", render);
  eye?.addEventListener("click", onEye);
  render();
  return {
    destroy() {
      input.removeEventListener("input", render);
      eye?.removeEventListener("click", onEye);
    },
  };
}

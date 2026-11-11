// 인증번호 칸: .js-otp-box 여러 칸에 숫자 하나씩. 입력하면 다음 칸, 빈 칸에서 지우기는 앞 칸, ← →로 이동,
// 붙여 넣으면 한 번에 채운다. 다 채우면 data-code와 비교해 맞으면 is-ok, 틀리면 is-wrong(잠시 뒤 비우고 첫 칸으로).
// 결과 문구는 .js-otp-msg(role=status).
const WRONG_MS = 700;

export function init(root) {
  const boxes = [...root.querySelectorAll(".js-otp-box")];
  const msg = root.querySelector(".js-otp-msg");
  if (!boxes.length) return { destroy() {} };
  const code = root.dataset.code ?? "";
  const idle = msg?.textContent ?? "";
  let timer = 0;

  const say = (t) => msg && (msg.textContent = t);
  const value = () => boxes.map((b) => b.value).join("");
  const check = () => {
    if (value().length < boxes.length) return;
    if (value() === code) {
      root.classList.add("is-ok");
      say("확인됐어요!");
      boxes.forEach((b) => (b.readOnly = true));
      return;
    }
    root.classList.add("is-wrong");
    say("번호가 맞지 않아요. 다시 입력해 주세요.");
    timer = setTimeout(() => {
      root.classList.remove("is-wrong");
      boxes.forEach((b) => (b.value = ""));
      boxes[0].focus();
    }, WRONG_MS);
  };
  const fill = (from, digits) => {
    [...digits].forEach((d, k) => boxes[from + k] && (boxes[from + k].value = d));
    boxes[Math.min(boxes.length - 1, from + digits.length)].focus();
    check();
  };

  const onInput = (event) => {
    const i = boxes.indexOf(event.target);
    const digits = event.target.value.replace(/\D/g, "");
    event.target.value = "";
    if (!digits) return;
    if (root.classList.contains("is-wrong")) return;
    if (msg && msg.textContent !== idle) say(idle);
    fill(i, digits.slice(0, boxes.length - i)); // 자동 완성으로 여러 글자가 한 칸에 들어와도 나눠 담는다
  };
  const onKey = (event) => {
    const i = boxes.indexOf(event.target);
    if (event.key === "Backspace" && !event.target.value && i > 0) {
      event.preventDefault();
      boxes[i - 1].value = "";
      boxes[i - 1].focus();
    } else if (event.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
    else if (event.key === "ArrowRight" && i < boxes.length - 1) boxes[i + 1].focus();
  };
  const onPaste = (event) => {
    const digits = (event.clipboardData?.getData("text") ?? "").replace(/\D/g, "");
    if (!digits) return;
    event.preventDefault();
    fill(boxes.indexOf(event.target), digits.slice(0, boxes.length));
  };
  const onFocus = (event) => event.target.select();
  const reset = () => {
    root.classList.remove("is-ok", "is-wrong");
    boxes.forEach((b) => ((b.value = ""), (b.readOnly = false)));
    say(idle);
    boxes[0].focus();
  };
  const resetBtn = root.querySelector(".js-otp-reset");

  boxes.forEach((b) => {
    b.addEventListener("input", onInput);
    b.addEventListener("keydown", onKey);
    b.addEventListener("paste", onPaste);
    b.addEventListener("focus", onFocus);
  });
  resetBtn?.addEventListener("click", reset);
  return {
    destroy() {
      clearTimeout(timer);
      boxes.forEach((b) => {
        b.removeEventListener("input", onInput);
        b.removeEventListener("keydown", onKey);
        b.removeEventListener("paste", onPaste);
        b.removeEventListener("focus", onFocus);
      });
      resetBtn?.removeEventListener("click", reset);
    },
  };
}

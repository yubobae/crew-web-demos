// 알약 이메일 입력: 보내면 is-loading(도는 원) → is-done(체크), 주소가 틀리면 is-error(흔들림).
// 데모라서 실제로 보내지 않고 잠깐 기다린 척만 한다. 상태 문구는 .js-email-status(role=status)로 읽어 준다.
const FAKE_WAIT = 900;
const RESET_AFTER = 3200;

export function init(root) {
  const form = root.querySelector(".js-email-form");
  const input = root.querySelector(".js-email-input");
  const status = root.querySelector(".js-email-status");
  if (!form || !input) return { destroy() {} };
  const idle = status?.textContent ?? "";
  let timers = [];

  const set = (state, message) => {
    root.classList.remove("is-loading", "is-done", "is-error");
    if (state) root.classList.add(state);
    if (status && message !== undefined) status.textContent = message;
  };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const onSubmit = (event) => {
    event.preventDefault();
    if (root.classList.contains("is-loading")) return;
    timers.forEach(clearTimeout);
    timers = [];
    if (!input.checkValidity() || !input.value) {
      set(null);
      root.getBoundingClientRect(); // 흔들림을 다시 시작하려고 한 번 뗐다 붙인다
      set("is-error", "이메일 주소를 다시 확인해 주세요.");
      input.focus();
      return;
    }
    set("is-loading", "보내는 중…");
    later(() => {
      set("is-done", "구독했어요! 첫 소식은 다음 달 1일에 갈게요.");
      input.value = "";
      later(() => set(null, idle), RESET_AFTER);
    }, FAKE_WAIT);
  };
  const onInput = () => root.classList.contains("is-error") && set(null, idle);

  form.addEventListener("submit", onSubmit);
  input.addEventListener("input", onInput);
  return {
    destroy() {
      timers.forEach(clearTimeout);
      form.removeEventListener("submit", onSubmit);
      input.removeEventListener("input", onInput);
    },
  };
}

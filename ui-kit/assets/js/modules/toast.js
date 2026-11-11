// 토스트: .js-toast-trigger를 누르면 <template class="js-toast-template">을 복제해 .js-toaster에 띄운다.
// 문구는 버튼의 data-toast-title / data-toast-description. 4초 뒤 사라지고, 마우스를 올리거나 포커스하면 멈춘다.
// 내용(문구·마크업)은 HTML에 두고 JS는 복제·표시만 한다.

const DURATION_MS = 4000;
const LEAVE_MS = 200;

export function init(root) {
  const toaster = root.querySelector(".js-toaster");
  const template = root.querySelector(".js-toast-template");
  if (!toaster || !template) return { destroy() {} };
  const triggers = [...root.querySelectorAll(".js-toast-trigger")];
  const timers = new Set();

  const dismiss = (toast) => {
    if (!toast.isConnected || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    const t = setTimeout(() => toast.remove(), LEAVE_MS);
    timers.add(t);
  };

  const show = (event) => {
    const { toastTitle = "", toastDescription = "" } = event.currentTarget.dataset;
    const toast = template.content.firstElementChild.cloneNode(true);
    toast.querySelector(".js-toast-title").textContent = toastTitle;
    toast.querySelector(".js-toast-description").textContent = toastDescription;
    toast.querySelector(".js-toast-close").addEventListener("click", () => dismiss(toast));

    let remaining = DURATION_MS;
    let startedAt = 0;
    let timer = 0;
    const start = () => {
      startedAt = performance.now();
      timer = setTimeout(() => dismiss(toast), remaining);
      timers.add(timer);
    };
    const pause = () => {
      clearTimeout(timer);
      remaining -= performance.now() - startedAt;
    };
    toast.addEventListener("pointerenter", pause);
    toast.addEventListener("pointerleave", start);
    toast.addEventListener("focusin", pause);
    toast.addEventListener("focusout", start);

    toaster.append(toast);
    start();
  };

  triggers.forEach((button) => button.addEventListener("click", show));

  return {
    destroy() {
      triggers.forEach((button) => button.removeEventListener("click", show));
      timers.forEach(clearTimeout);
      toaster.replaceChildren();
    },
  };
}

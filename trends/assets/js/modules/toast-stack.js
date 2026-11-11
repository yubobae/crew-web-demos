// 토스트 묶음: .js-toast-send 를 누르면 <template class="js-toast-tpl">로 토스트를 만들어 .js-toast-list 맨 앞에 쌓는다.
// 앞에서 몇 번째인지(--n)를 써서 카드 더미처럼 겹치고, 3개가 넘으면 가장 오래된 것이 밀려난다. 4초 뒤 스스로 사라진다.
// 목록 위에 마우스를 올리거나 초점이 들어오면 root에 is-expanded(펼침), 그동안은 사라지는 시계를 멈춘다.
const MESSAGES = [
  ["새 댓글", "지우: 이 시안 좋아요!"],
  ["업로드 완료", "봄빛_최종.png"],
  ["일정 알림", "10분 뒤 디자인 리뷰"],
  ["멘션", "@보람 확인 부탁해요"],
  ["저장됨", "모든 변경 사항을 저장했어요"],
];
const LIFE_MS = 4000;
const VISIBLE = 3;
const EXIT_MS = 450;

export function init(root) {
  const send = root.querySelector(".js-toast-send");
  const list = root.querySelector(".js-toast-list");
  const tpl = root.querySelector(".js-toast-tpl");
  if (!send || !list || !tpl) return { destroy() {} };
  const toasts = []; // 앞(최신)부터
  let k = 0;
  let paused = false;

  const layout = () =>
    toasts.forEach((t, n) => {
      t.el.style.setProperty("--n", String(n));
    });

  const remove = (t) => {
    const i = toasts.indexOf(t);
    if (i < 0) return;
    toasts.splice(i, 1);
    clearTimeout(t.timer);
    t.el.classList.add("is-leaving");
    setTimeout(() => t.el.remove(), EXIT_MS);
    layout();
  };
  const arm = (t) => {
    clearTimeout(t.timer);
    t.timer = setTimeout(() => (paused ? arm(t) : remove(t)), LIFE_MS);
  };

  const onSend = () => {
    const [title, body] = MESSAGES[k++ % MESSAGES.length];
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.querySelector(".js-toast-title").textContent = title;
    el.querySelector(".js-toast-body").textContent = body;
    el.classList.add("is-entering");
    list.prepend(el);
    const t = { el, timer: 0 };
    toasts.unshift(t);
    if (toasts.length > VISIBLE) remove(toasts.at(-1)); // 가장 오래된 것은 밀려난다
    layout();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-entering")));
    arm(t);
  };

  const expand = (on) => {
    paused = on;
    root.classList.toggle("is-expanded", on);
    layout();
  };
  const onEnter = () => expand(true);
  const onLeave = () => expand(false);
  const onFocusOut = (event) => !list.contains(event.relatedTarget) && expand(false);

  send.addEventListener("click", onSend);
  list.addEventListener("pointerenter", onEnter);
  list.addEventListener("pointerleave", onLeave);
  list.addEventListener("focusin", onEnter);
  list.addEventListener("focusout", onFocusOut);
  return {
    destroy() {
      toasts.forEach((t) => clearTimeout(t.timer));
      send.removeEventListener("click", onSend);
      list.removeEventListener("pointerenter", onEnter);
      list.removeEventListener("pointerleave", onLeave);
      list.removeEventListener("focusin", onEnter);
      list.removeEventListener("focusout", onFocusOut);
    },
  };
}

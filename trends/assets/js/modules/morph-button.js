// 변신 버튼: 누르면 is-loading(동그라미로 줄며 돎) → is-done(초록 "저장됨") → 잠시 뒤 처음으로.
// 상태 문구는 버튼 안 .js-morph-live(화면 밖 role=status)로 읽어 준다. 데모라 실제 저장은 없다.
const LOADING_MS = 1200;
const DONE_MS = 1600;

export function init(root) {
  const live = root.querySelector(".js-morph-live");
  let timers = [];

  const say = (text) => live && (live.textContent = text);
  const onClick = () => {
    if (root.classList.contains("is-loading") || root.classList.contains("is-done")) return;
    root.classList.add("is-loading");
    root.setAttribute("aria-busy", "true");
    say("저장하는 중");
    timers.push(
      setTimeout(() => {
        root.classList.replace("is-loading", "is-done");
        root.removeAttribute("aria-busy");
        say("저장했어요");
        timers.push(setTimeout(() => root.classList.remove("is-done"), DONE_MS));
      }, LOADING_MS),
    );
  };

  root.addEventListener("click", onClick);
  return {
    destroy() {
      timers.forEach(clearTimeout);
      root.removeEventListener("click", onClick);
    },
  };
}

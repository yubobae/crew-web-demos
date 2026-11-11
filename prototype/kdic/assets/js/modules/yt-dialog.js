// 유튜브 레이어: root 안의 .js-yt-open[data-id](링크·버튼)를 누르면 <dialog class="js-yt">를 열고 영상을 넣어 바로 재생한다.
// 링크는 원래 유튜브 주소(href)를 가지고 있어서 자바스크립트가 없어도 새 창으로 열린다. 닫으면 영상을 비워 소리가 멈춘다.
// 페이지를 열 때는 유튜브를 하나도 불러오지 않는다.
export function init(root) {
  const dialog = root.querySelector(".js-yt");
  const stage = dialog?.querySelector(".js-yt-stage");
  const title = dialog?.querySelector(".js-yt-title");
  if (!dialog || !stage) return { destroy() {} };

  const onRoot = (event) => {
    const trigger = event.target.closest(".js-yt-open");
    if (!trigger || !root.contains(trigger) || !trigger.dataset.id) return;
    event.preventDefault();
    const frame = document.createElement("iframe");
    frame.className = "c-yt__frame";
    frame.src = `https://www.youtube-nocookie.com/embed/${trigger.dataset.id}?autoplay=1&rel=0`;
    frame.title = trigger.dataset.title ?? "영상";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    stage.replaceChildren(frame);
    if (title) title.textContent = trigger.dataset.title ?? "";
    dialog.showModal();
  };
  const onDialog = (event) => {
    if (event.target === dialog || event.target.closest("[data-yt-close]")) dialog.close();
  };
  const onClose = () => stage.replaceChildren();

  root.addEventListener("click", onRoot);
  dialog.addEventListener("click", onDialog);
  dialog.addEventListener("close", onClose);
  return {
    destroy() {
      root.removeEventListener("click", onRoot);
      dialog.removeEventListener("click", onDialog);
      dialog.removeEventListener("close", onClose);
      stage.replaceChildren();
    },
  };
}

// 가벼운 유튜브: 미리보기 버튼(.js-yt-btn[data-id])을 누르면 그 자리에 유튜브(쿠키 줄인 주소) 영상을 넣고 바로 재생한다.
// 페이지를 열 때는 유튜브를 하나도 불러오지 않아 빠르다.
export function init(root) {
  const btn = root.querySelector(".js-yt-btn");
  if (!btn) return { destroy() {} };

  const onClick = () => {
    const frame = document.createElement("iframe");
    frame.className = "c-yt__frame";
    frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
    frame.title = btn.dataset.title ?? "영상";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    btn.replaceWith(frame);
    frame.focus();
  };

  btn.addEventListener("click", onClick, { once: true });
  return {
    destroy() {
      btn.removeEventListener("click", onClick);
    },
  };
}

// 대문 배경 영상: 원본 사이트처럼 유튜브 영상을 소리 없이 반복해 화면 가득 깐다.
// 페이지가 다 뜬 뒤에 넣어 첫 화면을 막지 않고, 움직임 줄이기·데이터 절약 설정이면 넣지 않는다(사진만 보인다).
export function init(root) {
  const id = root.dataset.ytId;
  const saveData = navigator.connection?.saveData === true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!id || saveData || reduce) return { destroy() {} };

  let frame = null;
  let timer = 0;

  const mount = () => {
    frame = document.createElement("iframe");
    frame.className = "c-gate__yt";
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3`;
    frame.title = "배경 영상(장식)";
    frame.allow = "autoplay; encrypted-media";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    frame.addEventListener("load", () => {
      timer = setTimeout(() => frame.classList.add("is-on"), 1800);
    });
    root.prepend(frame);
  };

  const start = () => ("requestIdleCallback" in window ? requestIdleCallback(mount, { timeout: 2500 }) : setTimeout(mount, 800));
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });

  return {
    destroy() {
      clearTimeout(timer);
      frame?.remove();
    },
  };
}

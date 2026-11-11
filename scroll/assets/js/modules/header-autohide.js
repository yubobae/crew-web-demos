// 헤더 자동 숨김: 아래로 내리면 숨고, 위로 조금만(6px) 올려도 다시 나타난다. 맨 위 근처에서는 항상 보인다.
// 조금 내려오면 배경이 생긴다(is-scrolled). GNB 메뉴가 열려 있거나 헤더 안에 포커스가 있으면 숨기지 않는다.

const SHOW_AT_TOP = 80;
const UP_THRESHOLD = 6;

export function init(root) {
  let last = scrollY;
  let frame = 0;
  let menuOpen = false;

  const update = () => {
    frame = 0;
    const y = scrollY;
    const delta = y - last;
    root.classList.toggle("is-scrolled", y > 10);
    if (y < SHOW_AT_TOP || menuOpen || root.contains(document.activeElement)) root.classList.remove("is-hidden");
    else if (delta > 0) root.classList.add("is-hidden");
    else if (delta < -UP_THRESHOLD) root.classList.remove("is-hidden");
    if (Math.abs(delta) > UP_THRESHOLD || y < SHOW_AT_TOP) last = y;
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onMenu = (event) => {
    menuOpen = event.detail.open;
    if (menuOpen) root.classList.remove("is-hidden");
  };
  const onFocus = () => root.classList.remove("is-hidden");

  update();
  addEventListener("scroll", onScroll, { passive: true });
  root.addEventListener("gnb:toggle", onMenu);
  root.addEventListener("focusin", onFocus);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      root.removeEventListener("gnb:toggle", onMenu);
      root.removeEventListener("focusin", onFocus);
    },
  };
}

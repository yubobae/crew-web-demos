// 맨 위로 버튼: 20% 넘게 내려오면 나타난다(진행률 원은 scroll-scrub의 data-scrub="page"가 채움).
// 누르면 맨 위로 이동하고, 포커스를 페이지 처음(본문 바로가기)으로 옮긴다.

const SHOW_AFTER = 0.2;

export function init(root) {
  const button = root.querySelector(".js-to-top");
  if (!button) return { destroy() {} };
  let frame = 0;
  let max = 0;
  let shown = null;
  const measure = () => (max = document.documentElement.scrollHeight - innerHeight);
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);

  const update = () => {
    frame = 0;
    const show = max > 0 && scrollY / max > SHOW_AFTER;
    if (show === shown) return;
    shown = show;
    button.classList.toggle("is-visible", show);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("a, button")?.focus({ preventScroll: true });
  };

  measure();
  update();
  addEventListener("scroll", onScroll, { passive: true });
  button.addEventListener("click", onClick);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      button.removeEventListener("click", onClick);
    },
  };
}

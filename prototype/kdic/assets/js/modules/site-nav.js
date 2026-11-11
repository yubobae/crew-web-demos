// 윗줄: 조금이라도 스크롤하면 is-condensed(먹빛 유리 막), 휴대폰 햄버거 버튼은 메뉴를 열고 닫는다(is-open).
// 스크롤마다 한 번만 읽고(rAF로 묶음) 상태가 바뀔 때만 클래스를 바꾼다. 메뉴가 열리면 본문 스크롤을 잠근다.
const THRESHOLD = 16;

export function init(root) {
  const toggle = root.querySelector(".js-bar-toggle");
  let frame = 0;
  let condensed = null;

  const update = () => {
    frame = 0;
    const next = scrollY > THRESHOLD;
    if (next === condensed) return;
    condensed = next;
    root.classList.toggle("is-condensed", next);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
  };
  const onToggle = () => setOpen(!root.classList.contains("is-open"));
  const onLink = (event) => {
    if (event.target.closest(".c-bar__link")) setOpen(false);
  };
  const onKey = (event) => {
    if (event.key === "Escape") setOpen(false);
  };
  const onResize = () => {
    if (matchMedia("(min-width: 1024px)").matches) setOpen(false);
  };

  update();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  toggle?.addEventListener("click", onToggle);
  root.addEventListener("click", onLink);
  root.addEventListener("keydown", onKey);
  return {
    destroy() {
      cancelAnimationFrame(frame);
      setOpen(false);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      toggle?.removeEventListener("click", onToggle);
      root.removeEventListener("click", onLink);
      root.removeEventListener("keydown", onKey);
    },
  };
}

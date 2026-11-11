// 스크롤 스토리텔링: 화면 가운데 띠에 들어온 단계(.js-story-step)를 고르고,
// 같은 번호의 화면(.js-story-view)과 점(.js-story-dot)에 is-active를 준다. 이벤트: story:change (detail.index)
export function init(root) {
  const steps = [...root.querySelectorAll(".js-story-step")];
  const views = [...root.querySelectorAll(".js-story-view")];
  const dots = [...root.querySelectorAll(".js-story-dot")];
  if (!steps.length) return { destroy() {} };
  let current = -1;

  const show = (i) => {
    if (i === current) return;
    current = i;
    [steps, views, dots].forEach((list) => list.forEach((el, n) => el.classList.toggle("is-active", n === i)));
    root.dispatchEvent(new CustomEvent("story:change", { bubbles: true, detail: { index: i } }));
  };

  // PC: 화면 가운데 10% 띠에 걸친 단계가 지금 단계.
  // 휴대폰: 위쪽엔 화면(스테이지)이 붙어 있으니 그 아래(60~70% 높이) 띠로 본다.
  const narrow = matchMedia("(max-width: 819px)").matches;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && show(steps.indexOf(e.target))),
    { rootMargin: narrow ? "-60% 0px -30% 0px" : "-45% 0px -45% 0px" },
  );
  steps.forEach((s) => io.observe(s));
  show(0);
  return {
    destroy() {
      io.disconnect();
    },
  };
}

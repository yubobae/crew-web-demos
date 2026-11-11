// 스크롤 따라 목차 켜기: root 안의 링크(.js-spy-link, href="#id")가 가리키는 구역 중 화면 위쪽 1/3 선을 지난 마지막 구역을 aria-current="true"로 표시한다.
// 구역 위치는 스크롤마다 읽지 않고 IntersectionObserver 로 알아낸다.
export function init(root) {
  const links = [...root.querySelectorAll(".js-spy-link")];
  const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  if (!targets.length) return { destroy() {} };
  const visible = new Set();

  const paint = () => {
    const pick = targets.filter((t) => visible.has(t)).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    links.forEach((a) => a.setAttribute("aria-current", String(pick && a.getAttribute("href") === `#${pick.id}`)));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      paint();
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );
  targets.forEach((t) => io.observe(t));
  return {
    destroy() {
      io.disconnect();
    },
  };
}

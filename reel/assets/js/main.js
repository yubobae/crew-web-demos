/* 모션그래픽 섹션: 플레이어가 아니라 페이지의 일부로 들어간 움직이는 그래픽.
   - [data-play] 영역이 화면에 보이면(40% 이상) .is-play 를 붙여 CSS 애니메이션을 처음부터 한 번 재생한다(시간으로 흐름, 스크롤 위치와 무관).
   - 영역이 완전히 벗어나면 .is-play 를 떼어 두었다가, 다시 보이면 처음부터 다시 재생한다.
   - 스크롤은 막지 않고, 재생 버튼·진행 막대 같은 조작 틀도 없다. 동작 줄이기에서는 아무것도 하지 않는다(CSS 가 완성된 모습을 보여 준다). */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function init() {
  const targets = [...document.querySelectorAll("[data-play]")];
  if (!targets.length || reduce) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const el = e.target;
        if (e.intersectionRatio >= 0.4 && !el.classList.contains("is-play")) {
          void el.offsetWidth; // 애니메이션을 처음부터
          el.classList.add("is-play");
        } else if (e.intersectionRatio === 0) {
          el.classList.remove("is-play");
        }
      });
    },
    { threshold: [0, 0.4] },
  );
  targets.forEach((t) => io.observe(t));
}

init();

// 미끄러지는 배경 알약(glider) 공통 계산.
// container(위치 기준, position: relative) 안의 item 자리로 옮기도록 --gx(왼쪽)·--gw(너비)를 container에 쓴다.
// container에 is-gliding을 붙이면 CSS에서 알약이 보인다.

/** item 자리로 옮긴다. instant면 미끄러지지 않고 바로 놓는다(처음 나타날 때). */
export function glideTo(container, item, { instant = false } = {}) {
  const pill = container.querySelector(".js-glider");
  if (!item) {
    container.classList.remove("is-gliding");
    return;
  }
  const appear = instant || !container.classList.contains("is-gliding");
  if (pill && appear) pill.style.transition = "none";
  container.style.setProperty("--gx", `${item.offsetLeft}px`);
  container.style.setProperty("--gw", `${item.offsetWidth}px`);
  if (pill && appear) {
    pill.getBoundingClientRect(); // 위치를 먼저 확정한 뒤 전환을 되살린다
    pill.style.transition = "";
  }
  container.classList.add("is-gliding");
}

/** 지금 "선택된" 항목: 현재 페이지·눌림·펼침 상태 */
export function findActive(items) {
  return items.find(
    (el) =>
      el.getAttribute("aria-current") === "page" ||
      el.getAttribute("aria-pressed") === "true" ||
      el.getAttribute("aria-expanded") === "true",
  );
}

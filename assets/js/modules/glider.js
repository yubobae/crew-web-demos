// 항목 묶음 + 미끄러지는 배경 알약.
//   data-glide="hover"  : 올린 항목을 따라가고, 벗어나면 선택된 항목(없으면 숨김)으로 돌아간다(메뉴)
//   data-glide="select" : 누른 항목이 선택(aria-pressed)되고 알약이 그리로 간다(세그먼트·탭 막대)
// root 안: .js-glide-item(항목), .js-glider(알약, 없어도 됨)
// 이벤트: glider:change (detail: { index, value }) — select 모드에서 선택이 바뀔 때
import { glideTo, findActive } from "../utils/glider.js";

export function init(root) {
  const mode = root.dataset.glide ?? "hover";
  const items = [...root.querySelectorAll(".js-glide-item")];
  if (!items.length) return { destroy() {} };
  let current = null;

  const move = (item, opts) => {
    current = item;
    items.forEach((el) => el.classList.toggle("is-hovered", mode === "hover" && el === item));
    glideTo(root, item, opts);
  };

  const onEnter = (event) => move(event.currentTarget);
  const onLeave = () => move(findActive(items) ?? null);

  const select = (item) => {
    items.forEach((el) => el.setAttribute("aria-pressed", String(el === item)));
    move(item);
    root.dispatchEvent(
      new CustomEvent("glider:change", {
        bubbles: true,
        detail: { index: items.indexOf(item), value: item.dataset.value },
      }),
    );
  };
  const onClick = (event) => select(event.currentTarget);

  if (mode === "hover") {
    items.forEach((el) => {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("focus", onEnter);
    });
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusout", onLeave);
  } else {
    items.forEach((el) => el.addEventListener("click", onClick));
  }
  move(findActive(items) ?? null, { instant: true });

  // 글꼴이 늦게 들어오거나 크기가 바뀌면 다시 잰다
  const ro = new ResizeObserver(() => current && glideTo(root, current, { instant: true }));
  ro.observe(root);

  return {
    destroy() {
      ro.disconnect();
      items.forEach((el) => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("click", onClick);
      });
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusout", onLeave);
    },
  };
}

// 메가 메뉴: 메뉴(.js-mega-trigger)에 올리거나 누르면 판(.js-mega-drop)이 열린다.
// 다른 메뉴로 옮기면 판은 닫히지 않고 높이만 바뀌며, 안의 내용은 옮긴 방향에서 밀려 들어온다.
// 마우스가 메뉴 영역을 벗어나면 잠깐 뒤 닫는다(대각선으로 판에 들어가는 길 허용). Esc·바깥 초점도 닫음.
const OPEN_DELAY = 60;
const CLOSE_DELAY = 180;

export function init(root) {
  const triggers = [...root.querySelectorAll(".js-mega-trigger")];
  const drop = root.querySelector(".js-mega-drop");
  const panels = triggers.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  if (!drop || panels.some((p) => !p)) return { destroy() {} };
  const canHover = matchMedia("(hover: hover)").matches;
  let current = -1;
  let timer = 0;

  const open = (i) => {
    clearTimeout(timer);
    if (i === current) return;
    const wasClosed = current < 0;
    panels.forEach((p, n) => {
      p.classList.toggle("is-active", n === i);
      p.classList.toggle("is-before", n < i);
      p.classList.toggle("is-after", n > i);
      p.inert = n !== i;
    });
    triggers.forEach((t, n) => t.setAttribute("aria-expanded", String(n === i)));
    const h = `${panels[i].offsetHeight}px`;
    if (wasClosed) {
      drop.style.transition = "none"; // 처음 열 때는 높이를 바로 맞추고 나타나기만
      drop.style.setProperty("--drop-h", h);
      drop.getBoundingClientRect();
      drop.style.transition = "";
    } else {
      drop.style.setProperty("--drop-h", h);
    }
    current = i;
    root.classList.add("is-open");
  };

  const close = () => {
    clearTimeout(timer);
    if (current < 0) return;
    current = -1;
    root.classList.remove("is-open");
    triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
    panels.forEach((p) => (p.inert = true));
  };

  const later = (fn, ms) => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };

  const onTriggerEnter = (event) => {
    const i = triggers.indexOf(event.currentTarget);
    later(() => open(i), current < 0 ? OPEN_DELAY : 0);
  };
  const onTriggerClick = (event) => {
    const i = triggers.indexOf(event.currentTarget);
    if (current === i) close();
    else open(i);
  };
  const onPlainEnter = () => later(close, OPEN_DELAY); // 판이 없는 메뉴(요금 등)에 올리면 닫기
  const onRootLeave = () => later(close, CLOSE_DELAY);
  const onDropEnter = () => clearTimeout(timer);
  const onKey = (event) => {
    if (event.key !== "Escape" || current < 0) return;
    const t = triggers[current];
    close();
    t.focus();
  };
  const onFocusOut = (event) => {
    if (!root.contains(event.relatedTarget)) close();
  };

  const plain = [...root.querySelectorAll(".js-glide-item:not(.js-mega-trigger)")];
  triggers.forEach((t) => {
    t.addEventListener("click", onTriggerClick);
    if (canHover) t.addEventListener("pointerenter", onTriggerEnter);
  });
  if (canHover) {
    plain.forEach((el) => el.addEventListener("pointerenter", onPlainEnter));
    root.addEventListener("pointerleave", onRootLeave);
    drop.addEventListener("pointerenter", onDropEnter);
  }
  root.addEventListener("keydown", onKey);
  root.addEventListener("focusout", onFocusOut);
  panels.forEach((p) => (p.inert = true));

  return {
    destroy() {
      clearTimeout(timer);
      triggers.forEach((t) => {
        t.removeEventListener("click", onTriggerClick);
        t.removeEventListener("pointerenter", onTriggerEnter);
      });
      plain.forEach((el) => el.removeEventListener("pointerenter", onPlainEnter));
      root.removeEventListener("pointerleave", onRootLeave);
      drop.removeEventListener("pointerenter", onDropEnter);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("focusout", onFocusOut);
    },
  };
}

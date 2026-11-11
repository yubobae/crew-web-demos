// 태그 입력: .js-tags-input에서 Enter·쉼표로 이름표 추가, 빈 칸에서 지우기는 마지막 이름표 삭제.
// 이름표는 <template class="js-tags-tpl">로 만든다(안의 .js-tags-text, .js-tags-remove). 추천(.js-tags-option[data-value])을 누르면 추가.
// 같은 이름·data-max 개 초과는 받지 않는다. 개수는 .js-tags-count.
export function init(root) {
  const box = root.querySelector(".js-tags-box");
  const input = root.querySelector(".js-tags-input");
  const tpl = root.querySelector(".js-tags-tpl");
  const options = [...root.querySelectorAll(".js-tags-option")];
  const count = root.querySelector(".js-tags-count");
  if (!box || !input || !tpl) return { destroy() {} };
  const max = Number(root.dataset.max ?? 6);
  const tags = [];

  const sync = () => {
    options.forEach((o) => (o.disabled = tags.includes(o.dataset.value) || tags.length >= max));
    if (count) count.textContent = `${tags.length} / ${max}`;
  };
  const add = (raw) => {
    const text = raw.trim().replace(/,$/, "");
    if (!text || tags.includes(text) || tags.length >= max) return false;
    const chip = tpl.content.firstElementChild.cloneNode(true);
    chip.querySelector(".js-tags-text").textContent = text;
    chip.querySelector(".js-tags-remove").setAttribute("aria-label", `${text} 빼기`);
    chip.dataset.value = text;
    box.insertBefore(chip, input);
    tags.push(text);
    sync();
    return true;
  };
  const remove = (chip) => {
    const i = tags.indexOf(chip.dataset.value);
    if (i < 0) return;
    tags.splice(i, 1);
    chip.classList.add("is-leaving");
    chip.addEventListener("animationend", () => chip.remove(), { once: true });
    setTimeout(() => chip.remove(), 300); // 애니메이션이 없을 때(동작 줄이기)도 지운다
    sync();
  };

  const onKey = (event) => {
    if ((event.key === "Enter" || event.key === ",") && !event.isComposing) {
      event.preventDefault();
      if (add(input.value)) input.value = "";
    } else if (event.key === "Backspace" && !input.value) {
      const last = [...box.querySelectorAll(".c-tags__chip:not(.is-leaving)")].at(-1);
      if (last) remove(last);
    }
  };
  const onBoxClick = (event) => {
    const btn = event.target.closest(".js-tags-remove");
    if (btn) remove(btn.closest(".c-tags__chip"));
    else input.focus();
  };
  const onOption = (event) => {
    add(event.currentTarget.dataset.value);
    input.focus();
  };

  input.addEventListener("keydown", onKey);
  box.addEventListener("click", onBoxClick);
  options.forEach((o) => o.addEventListener("click", onOption));
  (root.dataset.initial ?? "").split(",").forEach(add);
  sync();
  return {
    destroy() {
      input.removeEventListener("keydown", onKey);
      box.removeEventListener("click", onBoxClick);
      options.forEach((o) => o.removeEventListener("click", onOption));
    },
  };
}

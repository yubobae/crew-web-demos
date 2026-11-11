// 복사 버튼: .js-copy-btn 을 누르면 .js-copy-text 글자를 클립보드에 넣고 root에 is-copied를 잠깐 붙인다.
// 클립보드를 못 쓰는 환경(권한 없음 등)이면 말풍선 글자를 "직접 복사해 주세요"로 바꾼다.
const SHOW_MS = 1600;

export function init(root) {
  const btn = root.querySelector(".js-copy-btn");
  const text = root.querySelector(".js-copy-text");
  const tip = root.querySelector(".js-copy-tip");
  if (!btn || !text) return { destroy() {} };
  const okText = tip?.textContent ?? "";
  let timer = 0;

  const onClick = async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text.textContent.trim());
    } catch {
      ok = false;
    }
    if (tip) tip.textContent = ok ? okText : "직접 복사해 주세요";
    root.classList.add("is-copied");
    clearTimeout(timer);
    timer = setTimeout(() => root.classList.remove("is-copied"), SHOW_MS);
  };

  btn.addEventListener("click", onClick);
  return {
    destroy() {
      clearTimeout(timer);
      btn.removeEventListener("click", onClick);
    },
  };
}

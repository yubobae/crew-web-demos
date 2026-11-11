// 테마 전환 버튼: 누를 때마다 라이트 ↔ 다크. aria-pressed로 다크 여부를 알린다.
import { currentTheme, restoreTheme, setTheme } from "../utils/theme.js";

export function init(root) {
  const button = root.querySelector(".js-theme-toggle");
  if (!button) return { destroy() {} };

  restoreTheme();
  const sync = () => button.setAttribute("aria-pressed", String(currentTheme() === "dark"));
  const toggle = () => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
    sync();
  };

  sync();
  button.addEventListener("click", toggle);

  return {
    destroy() {
      button.removeEventListener("click", toggle);
    },
  };
}

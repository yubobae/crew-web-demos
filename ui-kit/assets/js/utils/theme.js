// 라이트/다크 테마: html[data-theme]로 정하고, 고른 값은 이 브라우저에만 기억한다.
// 아무것도 고르지 않으면 시스템 설정(prefers-color-scheme)을 따른다.

const KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function currentTheme() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* 저장이 막혀 있어도 이번 화면에는 적용된다 */
  }
}

export function restoreTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
  } catch {
    /* 저장소를 못 읽으면 시스템 설정을 따른다 */
  }
}

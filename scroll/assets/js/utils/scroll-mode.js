// 스크롤 방식 설정(문서 전체): 부드러운(관성) 스크롤, 섹션 자석 스냅.
// html 클래스로 표시하고, 바뀌면 scroll-mode:change 이벤트를 window에 보낸다.

export function isSmooth() {
  return document.documentElement.classList.contains("is-smooth");
}

export function isSnap() {
  return document.documentElement.classList.contains("is-snap");
}

export function setSmooth(on) {
  document.documentElement.classList.toggle("is-smooth", on);
  window.dispatchEvent(new CustomEvent("scroll-mode:change"));
}

export function setSnap(on) {
  document.documentElement.classList.toggle("is-snap", on);
  window.dispatchEvent(new CustomEvent("scroll-mode:change"));
}

export function isPaged() {
  return document.documentElement.classList.contains("is-paged");
}

export function setPaged(on) {
  document.documentElement.classList.toggle("is-paged", on);
  window.dispatchEvent(new CustomEvent("scroll-mode:change"));
}

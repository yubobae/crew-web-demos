// 문서 스크롤 잠금. 모듈이 자기 root 밖(html)을 직접 건드리지 않도록 여기서만 처리한다.

const LOCK_CLASS = "is-locked";
let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  document.documentElement.classList.add(LOCK_CLASS);
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.documentElement.classList.remove(LOCK_CLASS);
}

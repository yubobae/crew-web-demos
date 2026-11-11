// 단계별 폼: 판(.js-step-panel) 여러 장 중 하나씩. "다음"은 지금 판의 입력을 확인(reportValidity)한 뒤 넘기고,
// 마지막 입력 판에서 "다음"을 누르면 완료 판(마지막 판)으로 가며 root에 is-complete.
// root에 --step, --progress를 쓰고, 단계 점(.js-step-dot)에 is-current / is-done. 보이지 않는 판은 inert.
// 다시 하기(.js-step-restart)는 처음으로.
export function init(root) {
  const panels = [...root.querySelectorAll(".js-step-panel")];
  const dots = [...root.querySelectorAll(".js-step-dot")];
  const prev = root.querySelector(".js-step-prev");
  const next = root.querySelector(".js-step-next");
  const restart = root.querySelector(".js-step-restart");
  const live = root.querySelector(".js-step-live");
  if (panels.length < 2 || !next) return { destroy() {} };
  const last = panels.length - 1; // 완료 판
  let step = 0;

  const render = () => {
    root.style.setProperty("--step", String(step));
    root.style.setProperty("--progress", String(Math.min(step, dots.length - 1) / (dots.length - 1)));
    root.classList.toggle("is-complete", step === last);
    panels.forEach((p, i) => (p.inert = i !== step));
    dots.forEach((d, i) => {
      d.classList.toggle("is-current", i === step);
      d.classList.toggle("is-done", i < step);
    });
    if (prev) prev.disabled = step === 0 || step === last;
    next.textContent = step === last - 1 ? "보내기" : "다음";
    if (live) live.textContent = step === last ? "신청을 마쳤어요" : `${dots.length}단계 중 ${step + 1}단계`;
  };
  const go = (to) => {
    step = Math.max(0, Math.min(last, to));
    render();
    // 판이 다 밀려 온 뒤 첫 입력칸으로 초점(키보드 사용자가 이어서 쓸 수 있게)
    setTimeout(() => panels[step].querySelector("input, button, textarea, select")?.focus({ preventScroll: true }), 450);
  };

  const onNext = () => {
    const fields = [...panels[step].querySelectorAll("input, textarea, select")];
    if (fields.some((f) => !f.reportValidity())) return;
    go(step + 1);
  };
  const onPrev = () => go(step - 1);
  const onRestart = () => {
    root.querySelector("form")?.reset();
    go(0);
  };
  const onSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  next.addEventListener("click", onNext);
  prev?.addEventListener("click", onPrev);
  restart?.addEventListener("click", onRestart);
  root.addEventListener("submit", onSubmit);
  render();
  return {
    destroy() {
      next.removeEventListener("click", onNext);
      prev?.removeEventListener("click", onPrev);
      restart?.removeEventListener("click", onRestart);
      root.removeEventListener("submit", onSubmit);
    },
  };
}

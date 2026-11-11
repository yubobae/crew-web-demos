// 지금 시각: .js-clock 글자를 data-zone(기본 Asia/Seoul) 시각 "오후 3:05"로 맞추고 20초마다 다시 쓴다.
export function init(root) {
  const clocks = root.querySelectorAll(".js-clock").length ? [...root.querySelectorAll(".js-clock")] : [root];
  const render = () =>
    clocks.forEach((el) => {
      const zone = el.dataset.zone ?? "Asia/Seoul";
      const now = new Date();
      el.textContent = new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit", timeZone: zone }).format(now);
      if (el.tagName === "TIME") el.dateTime = now.toISOString();
    });
  render();
  const timer = setInterval(render, 20000);
  return {
    destroy() {
      clearInterval(timer);
    },
  };
}

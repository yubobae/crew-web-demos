/* 떠다니는 오브젝트: 스티커마다 (마우스 깊이감 + 끌기 변위 + 스크롤 흩어짐)을 더해 한 번에 transform 으로 쓴다.
   - 마우스(또는 터치)를 움직이면 깊이 값(--d)이 큰 스티커가 더 많이 따라온다.
   - 끌었다 놓으면 놓은 속도를 이어받아 스프링으로 출렁이며 제자리로 돌아온다(감쇠 진동).
   - 화면 밖이거나 탭이 숨겨지면 계산을 멈춘다. 동작 줄이기에서는 깊이감·스크롤 흩어짐 없이 끌기만 한다. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function init() {
  const hero = document.querySelector('[data-module="float"]');
  if (!hero) return;
  const items = [...hero.querySelectorAll(".f-st")].map((el) => ({
    el,
    d: Number(getComputedStyle(el).getPropertyValue("--d")) || 1,
    r: Number(getComputedStyle(el).getPropertyValue("--r")) || 0,
    x: 0, y: 0, vx: 0, vy: 0, // 끌기 변위와 속도
    drag: false, ox: 0, oy: 0, lx: 0, ly: 0, lt: 0,
  }));

  let mx = 0; // 마우스 -1~1 (목표)
  let my = 0;
  let cx = 0; // 현재(부드럽게 따라감)
  let cy = 0;
  let scroll = 0; // 0~1: 히어로가 올라가며 흩어지는 정도
  let on = true;
  let raf = 0;

  const loop = () => {
    raf = 0;
    if (!on || document.hidden) return;
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    let busy = Math.abs(mx - cx) > 0.001 || Math.abs(my - cy) > 0.001;
    items.forEach((it, i) => {
      if (!it.drag) {
        // 스프링: 가속 = -k·x - c·v
        it.vx += -0.12 * it.x - 0.14 * it.vx;
        it.vy += -0.12 * it.y - 0.14 * it.vy;
        it.x += it.vx;
        it.y += it.vy;
        if (Math.abs(it.x) + Math.abs(it.y) + Math.abs(it.vx) + Math.abs(it.vy) > 0.05) busy = true;
        else it.x = it.y = it.vx = it.vy = 0;
      }
      const par = reduce ? 0 : 1;
      const px = cx * 26 * it.d * par;
      const py = cy * 20 * it.d * par;
      const dir = i % 2 ? 1 : -1;
      const sx = reduce ? 0 : scroll * dir * (60 + i * 18);
      const sy = reduce ? 0 : scroll * (80 + i * 22);
      const rot = it.r + it.vx * 0.6 + (reduce ? 0 : scroll * dir * 25);
      it.el.style.transform = `translate3d(${(px + it.x + sx).toFixed(1)}px,${(py + it.y + sy).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
    });
    if (busy || items.some((it) => it.drag)) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf && on) raf = requestAnimationFrame(loop);
  };

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    kick();
  });
  hero.addEventListener("pointerleave", () => {
    mx = my = 0;
    kick();
  });

  items.forEach((it) => {
    const el = it.el;
    el.addEventListener("pointerdown", (e) => {
      it.drag = true;
      el.classList.add("is-drag");
      el.setPointerCapture(e.pointerId);
      it.ox = e.clientX - it.x;
      it.oy = e.clientY - it.y;
      it.lx = e.clientX;
      it.ly = e.clientY;
      it.lt = performance.now();
      it.vx = it.vy = 0;
      kick();
    });
    el.addEventListener("pointermove", (e) => {
      if (!it.drag) return;
      it.x = e.clientX - it.ox;
      it.y = e.clientY - it.oy;
      const t = performance.now();
      const dt = Math.max(1, t - it.lt);
      // 놓을 때 이어받을 속도(프레임당 px 로 환산)
      it.vx = ((e.clientX - it.lx) / dt) * 16;
      it.vy = ((e.clientY - it.ly) / dt) * 16;
      it.lx = e.clientX;
      it.ly = e.clientY;
      it.lt = t;
      e.stopPropagation();
    });
    const end = () => {
      if (!it.drag) return;
      it.drag = false;
      el.classList.remove("is-drag");
      kick();
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  });

  // 스크롤: 히어로가 위로 사라질수록 스티커가 흩어진다
  const onScroll = () => {
    const r = hero.getBoundingClientRect();
    scroll = Math.min(1, Math.max(0, -r.top / (r.height * 0.8)));
    kick();
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on) kick();
  }).observe(hero);
  document.addEventListener("visibilitychange", () => !document.hidden && kick());
  kick();
}

init();

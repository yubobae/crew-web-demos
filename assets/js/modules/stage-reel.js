// 무대 히어로의 장면 연출.
//  1) 마우스를 따라 오브젝트가 깊이(data-d)만큼 움직이고, 브라우저 창이 살짝 기운다.
//  2) 가짜 커서가 "색 고르기 → 다크 모드 → 속도 올리기 → 배포"를 눌러 보는 장면을 반복한다.
// 움직임 줄이기 설정이면 장면을 다 켠 정지 화면만 보여 준다. 창이 가려지거나 화면 밖이면 장면을 멈춘다.
export function init(root) {
  const scene = root.querySelector(".scene");
  if (!scene) return;
  const $ = (sel) => scene.querySelector(sel);
  const cur = $(".cur"), tilt = $(".tilt");
  const sw = $("[data-sw]"), tg = $("[data-tg]"), kn = $("[data-kn]"), trk = $("[data-trk]");
  const slc = $("[data-slc]"), btn = $("[data-btn]"), toast = $("[data-toast]");
  const fps = $("[data-fps]"), fpsw = $("[data-fpsw]"), mt = $("[data-mt]");
  const gf = $("[data-gf]"), gv = $("[data-gv]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const EASE = "cubic-bezier(.65,0,.35,1)";
  const cleanups = [];
  const on = (el, type, fn, opt) => { el.addEventListener(type, fn, opt); cleanups.push(() => el.removeEventListener(type, fn, opt)); };

  // ── 마우스 시차 + 창 기울기
  const layers = [...scene.querySelectorAll(".px")].map((el) => ({ el, d: +el.dataset.d || 0, x: 0, y: 0 }));
  let mx = 0, my = 0, raf = 0;
  function tick() {
    let moving = false;
    for (const l of layers) {
      const tx = -mx * l.d, ty = -my * l.d;
      l.x += (tx - l.x) * 0.08; l.y += (ty - l.y) * 0.08;
      if (Math.abs(tx - l.x) > 0.05 || Math.abs(ty - l.y) > 0.05) moving = true;
      l.el.style.transform = `translate3d(${l.x.toFixed(2)}px,${l.y.toFixed(2)}px,0)`;
    }
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  on(root, "pointermove", (e) => {
    const r = root.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.setProperty("--ry", (-8 + mx * 10).toFixed(2) + "deg");
    tilt.style.setProperty("--rx", (4 - my * 8).toFixed(2) + "deg");
    kick();
  });
  on(root, "pointerleave", () => {
    mx = my = 0; tilt.style.setProperty("--ry", "-8deg"); tilt.style.setProperty("--rx", "4deg"); kick();
  });

  const destroyBase = () => { cleanups.forEach((f) => f()); cancelAnimationFrame(raf); };
  if (reduce) {
    scene.dataset.accent = "on"; scene.dataset.theme = "dark"; sw.classList.add("sel"); tg.classList.add("on");
    slc.style.setProperty("--p", 1); fps.textContent = fpsw.textContent = 60; mt.style.width = "100%";
    gv.textContent = 100; gf.style.strokeDashoffset = 0;
    return { destroy: destroyBase };
  }

  // ── 반복 장면
  let pos = null, alive = true, inView = true;
  const center = (el) => {
    const r = el.getBoundingClientRect(), s = scene.getBoundingClientRect();
    return [r.left - s.left + r.width / 2, r.top - s.top + r.height / 2];
  };
  async function moveTo(target, ms) {
    const [x, y] = Array.isArray(target) ? target : center(target);
    const [fx, fy] = pos ?? [x + 260, y + 300];
    await cur.animate([{ transform: `translate(${fx}px,${fy}px)` }, { transform: `translate(${x}px,${y}px)` }], { duration: ms, easing: EASE, fill: "forwards" }).finished;
    pos = [x, y];
  }
  function ring([x, y]) {
    const r = document.createElement("i");
    r.className = "rip"; r.style.left = x + "px"; r.style.top = y + "px"; scene.append(r);
    r.animate([{ transform: "scale(.5)", opacity: 1 }, { transform: "scale(3.6)", opacity: 0 }], { duration: 600, easing: "ease-out" }).onfinish = () => r.remove();
  }
  async function press(after) {
    cur.classList.add("press"); ring(pos); await sleep(100); after?.(); await sleep(140); cur.classList.remove("press");
  }
  function count(from, to, ms) {
    const t0 = performance.now();
    return new Promise((res) => {
      (function f(t) {
        const k = Math.min((t - t0) / ms, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const v = Math.round(from + (to - from) * e);
        fps.textContent = fpsw.textContent = v; mt.style.width = (v / 60) * 100 + "%";
        gv.textContent = Math.round(e * 100); gf.style.strokeDashoffset = 113.1 * (1 - e);
        k < 1 ? requestAnimationFrame(f) : res();
      })(t0);
    });
  }
  function reset() {
    scene.dataset.accent = "off"; scene.dataset.theme = "dark"; sw.classList.remove("sel"); tg.classList.remove("on");
    slc.style.setProperty("--p", 0.25); fps.textContent = fpsw.textContent = 15; mt.style.width = "25%";
    gv.textContent = 0; gf.style.strokeDashoffset = 113.1; toast.classList.remove("on"); btn.classList.remove("press");
  }
  async function loop() {
    reset(); await sleep(1500);
    while (alive) {
      if (document.hidden || !inView) { await sleep(400); continue; }
      cur.style.opacity = 1;
      await moveTo(sw, 1000); await press(() => { scene.dataset.accent = "on"; sw.classList.add("sel"); }); await sleep(650);
      // 다크 모드 토글 → 창이 밝은 화면으로 바뀐다(처음엔 어두운 창, 토글을 켜면 라이트 → 다시 끄면 다크)
      await moveTo(tg, 900); await press(() => { tg.classList.add("on"); scene.dataset.theme = "light"; }); await sleep(800);
      await moveTo(kn, 900);
      cur.classList.add("press");
      const tr = trk.getBoundingClientRect(), sc = scene.getBoundingClientRect();
      slc.style.setProperty("--p", 1);
      await Promise.all([moveTo([tr.right - sc.left, tr.top - sc.top + tr.height / 2], 800), count(15, 60, 800)]);
      cur.classList.remove("press"); await sleep(500);
      await moveTo(btn, 950); await press(() => { btn.classList.add("press"); toast.classList.add("on"); });
      await sleep(250); btn.classList.remove("press"); await sleep(1800);
      toast.classList.remove("on"); await sleep(500);
      scene.dataset.theme = "dark"; await sleep(700);
      reset(); await sleep(600);
    }
  }
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
  io.observe(root);
  on(window, "resize", () => { pos = null; });
  loop();

  return { destroy() { alive = false; io.disconnect(); destroyBase(); } };
}

/* 입자 밭 + 분해도.
   - dots: 캔버스에 점을 격자로 깔고, 천천히 숨 쉬는 물결 + 커서 주위의 파문으로 점 크기·밝기를 바꾼다.
           점 수는 상한(약 5,000)을 두고, 화면 밖·탭 숨김일 때는 그리지 않으며, 동작 줄이기에서는 한 번만 그린다.
   - explode: 섹션의 스크롤 진행률을 --p 로 적어 주면 CSS 가 층을 벌리고 설명선을 차례로 보여 준다. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function dots(root) {
  const cv = root.querySelector("canvas");
  const ctx = cv.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let gap = 20;
  let cols = 0;
  let rows = 0;
  const mouse = { x: -9999, y: -9999, on: false, ease: 0 };
  let ripples = []; // 커서가 지나간 자리에 남는 파문
  let last = 0;
  let on = true;
  let raf = 0;
  let t = 0;

  const size = () => {
    const r = root.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width;
    h = r.height;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    gap = Math.max(16, Math.sqrt((w * h) / 5000)); // 점 수 상한
    cols = Math.ceil(w / gap) + 1;
    rows = Math.ceil(h / gap) + 1;
  };

  const draw = (now) => {
    raf = 0;
    if (!on || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    mouse.ease += ((mouse.on ? 1 : 0) - mouse.ease) * 0.08;
    ripples = ripples.filter((r) => t - r.t0 < 1.8);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * gap + (j % 2 ? gap / 2 : 0);
        const y = j * gap;
        // 가운데에서 퍼지는 느린 호흡
        const dc = Math.hypot(x - cx, y - cy);
        let k = 0.5 + 0.5 * Math.sin(dc * 0.018 - t * 1.1);
        let s = 0.8 + k * 1.1;
        let a = 0.22 + k * 0.28;
        // 커서 주위: 가까울수록 커지고 밝아진다
        if (mouse.ease > 0.01) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          const f = Math.max(0, 1 - d / 170) * mouse.ease;
          s += f * f * 3.2;
          a += f * 0.5;
        }
        // 지나간 자리의 파문(고리가 번져 나감)
        for (const r of ripples) {
          const age = t - r.t0;
          const d = Math.hypot(x - r.x, y - r.y);
          const ring = Math.max(0, 1 - Math.abs(d - age * 260) / 26) * (1 - age / 1.8);
          s += ring * 2.4;
          a += ring * 0.4;
        }
        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = "oklch(0.82 0.1 215)";
        ctx.beginPath();
        ctx.arc(x, y, s * 0.6, 0, 6.2832);
        ctx.fill();
      }
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  };
  const kick = () => {
    if (!raf && on) raf = requestAnimationFrame(draw);
  };

  size();
  new ResizeObserver(() => {
    size();
    kick();
  }).observe(root);
  root.addEventListener("pointermove", (e) => {
    const r = root.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (!mouse.on || Math.hypot(x - mouse.x, y - mouse.y) > 60) ripples.push({ x, y, t0: t });
    if (ripples.length > 6) ripples.shift();
    mouse.x = x;
    mouse.y = y;
    mouse.on = true;
  });
  root.addEventListener("pointerleave", () => (mouse.on = false));
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on) {
      last = performance.now();
      kick();
    }
  }).observe(root);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      last = performance.now();
      kick();
    }
  });
  kick();
}

function explode(root) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const r = root.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
    root.style.setProperty("--p", p.toFixed(4));
  };
  addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  addEventListener("resize", update);
  update();
}

const dotsRoot = document.querySelector('[data-module="dots"]');
if (dotsRoot) dots(dotsRoot);
const exRoot = document.querySelector('[data-module="explode"]');
if (exRoot && !reduce) explode(exRoot);

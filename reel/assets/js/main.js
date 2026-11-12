/* 한 번에 재생되는 장면: 스크롤로 무대가 화면에 들어오면 "재생 시작"만 하고, 이후는 시간으로 흘러간다(위치를 따라가지 않는다).
   - 스크롤은 절대 막지 않는다. 재생 중에도 자유롭게 내려가거나 올라갈 수 있다.
   - 무대가 화면 밖으로 나가면 영상처럼 일시정지, 다시 보이면 이어서 재생한다.
   - 건너뛰기는 마지막 장면으로, 다시 재생은 처음부터. 동작 줄이기에서는 재생 없이 CSS 가 장면을 정지 화면으로 펼친다. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function init() {
  const root = $('[data-module="reel"]');
  if (!root || reduce) return;
  const scenes = $$(".v-sc", root);
  const DUR = [3800, 4600, 4800, 5200]; // 장면별 길이(ms)
  const TOTAL = DUR.reduce((a, b) => a + b, 0);
  const idle = $(".js-idle", root);
  const noEl = $(".js-no", root);
  const nameEl = $(".js-name", root);
  const skip = $(".js-skip", root);
  const replay = $(".js-replay", root);

  let state = "idle"; // idle | playing | done
  let elapsed = 0; // 지금까지 재생한 시간(일시정지 동안은 늘지 않는다)
  let t0 = 0;
  let raf = 0;
  let cur = -1;
  let visible = false;

  const show = (i) => {
    scenes.forEach((s, k) => {
      if (k === i) {
        s.classList.remove("is-out");
        s.classList.add("is-on");
        void s.offsetWidth; // 애니메이션을 처음부터
        s.classList.add("is-play");
      } else if (s.classList.contains("is-on")) {
        s.classList.add("is-out");
        s.classList.remove("is-on", "is-play");
        setTimeout(() => s.classList.remove("is-out"), 480);
      }
    });
    cur = i;
    noEl.textContent = String(i + 1).padStart(2, "0");
    nameEl.textContent = scenes[i].dataset.name;
  };

  const tick = (now) => {
    raf = 0;
    if (state !== "playing" || !visible) return;
    elapsed = now - t0;
    root.style.setProperty("--prog", Math.min(1, elapsed / TOTAL).toFixed(4));
    let acc = 0;
    let idx = DUR.length - 1;
    for (let i = 0; i < DUR.length; i++) {
      if (elapsed < acc + DUR[i]) {
        idx = i;
        break;
      }
      acc += DUR[i];
    }
    if (idx !== cur) show(idx);
    if (elapsed >= TOTAL) return finish();
    raf = requestAnimationFrame(tick);
  };

  function resume() {
    root.classList.remove("is-paused");
    t0 = performance.now() - elapsed;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function play(from = 0) {
    cancelAnimationFrame(raf);
    raf = 0;
    state = "playing";
    cur = -1;
    elapsed = from;
    idle.classList.add("is-gone");
    skip.hidden = false;
    replay.hidden = true;
    if (visible) resume();
    else root.classList.add("is-paused");
  }

  function finish() {
    state = "done";
    skip.hidden = true;
    replay.hidden = false;
    root.style.setProperty("--prog", "1");
  }

  $(".js-start", root).addEventListener("click", () => play());
  replay.addEventListener("click", () => play());
  skip.addEventListener("click", () => play(TOTAL - DUR[DUR.length - 1])); // 마지막 장면은 끝까지 본다

  // 무대가 절반 이상 보이면 시작(처음 한 번), 많이 벗어나면 일시정지, 돌아오면 이어서 재생
  new IntersectionObserver(
    ([e]) => {
      visible = e.intersectionRatio >= 0.45;
      if (visible && state === "idle") play();
      else if (state === "playing") {
        if (visible) resume();
        else {
          root.classList.add("is-paused");
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }
    },
    { threshold: [0, 0.2, 0.45, 0.7, 1] },
  ).observe(root);
}

init();

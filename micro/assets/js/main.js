/* 마이크로 모션 갤러리: 카드 12개를 한 곳에서 연결한다.
   - 각 카드는 직접 눌러 볼 수 있고(play 와 같은 함수를 쓴다), 화면에 들어오면 혼자서도 한 번씩 재생된다.
   - 사용자가 만지면 잠시(6초) 자동 재생을 멈춘다. 동작 줄이기에서는 자동 재생을 하지 않는다.
   - 분류 칩은 카드를 걸러 보여 주고 위쪽 숫자를 갱신한다. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);

/* 각 카드의 동작. 반환값 { play } 는 자동 재생·다시 보기 버튼이 부른다. */
const shots = {
  toggle(root) {
    const t = $(".js-toggle", root);
    t.addEventListener("click", () => t.setAttribute("aria-checked", String(t.getAttribute("aria-checked") !== "true")));
    return { play: () => t.click() };
  },

  heart(root) {
    const b = $(".js-heart", root);
    const n = $(".js-heart-count", root);
    let count = 128;
    const burst = () => {
      if (reduce) return;
      for (let i = 0; i < 10; i++) {
        const p = document.createElement("i");
        p.style.background = `oklch(0.7 0.2 ${rand(10, 50)})`;
        b.append(p);
        const a = (i / 10) * Math.PI * 2 + rand(-0.2, 0.2);
        const d = rand(38, 62);
        p.animate(
          [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity: 0 }],
          { duration: 650, easing: "cubic-bezier(.2,.8,.3,1)" },
        ).onfinish = () => p.remove();
      }
    };
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      count += on ? 1 : -1;
      n.textContent = count;
      if (on) burst();
    });
    return { play: () => b.click() };
  },

  counter(root) {
    const el = $(".js-odo", root);
    let value = 3860;
    const render = () => {
      const s = value.toLocaleString("en-US");
      if (el.dataset.len !== String(s.length)) {
        el.dataset.len = s.length;
        el.textContent = "";
        [...s].forEach((c) => {
          if (c === ",") {
            const sep = document.createElement("span");
            sep.className = "m-odo__sep";
            sep.textContent = ",";
            el.append(sep);
          } else {
            const col = document.createElement("span");
            col.className = "m-odo__col";
            col.innerHTML = `<span style="--d:0">${[...Array(10).keys()].map((d) => `<b>${d}</b>`).join("")}</span>`;
            el.append(col);
          }
        });
      }
      const digits = [...s].filter((c) => c !== ",");
      $$(".m-odo__col > span", el).forEach((col, i) => col.style.setProperty("--d", digits[i]));
      el.setAttribute("aria-label", String(value));
    };
    render();
    const add = $(".js-odo-add", root);
    add.addEventListener("click", () => {
      value += 1240;
      render();
    });
    return { play: () => add.click() };
  },

  sheet(root) {
    const screen = $(".m-screen", root);
    const sheet = $(".js-sheet", root);
    const grip = $(".js-grip", root);
    const open = $(".js-sheet-open", root);
    const set = (on) => {
      sheet.classList.toggle("is-open", on);
      screen.classList.toggle("is-sheet", on);
      sheet.style.transform = "";
    };
    open.addEventListener("click", () => set(true));
    $(".js-dim", root).addEventListener("click", () => set(false));
    let y0 = null;
    grip.addEventListener("pointerdown", (e) => {
      y0 = e.clientY;
      grip.setPointerCapture(e.pointerId);
      sheet.classList.add("is-drag");
    });
    grip.addEventListener("pointermove", (e) => {
      if (y0 === null) return;
      const dy = Math.max(0, e.clientY - y0);
      sheet.style.transform = `translateY(${dy}px)`;
    });
    const end = (e) => {
      if (y0 === null) return;
      const dy = e.clientY - y0;
      y0 = null;
      sheet.classList.remove("is-drag");
      set(dy < 70);
    };
    grip.addEventListener("pointerup", end);
    grip.addEventListener("pointercancel", end);
    return {
      async play() {
        set(true);
        await wait(1700);
        if (sheet.classList.contains("is-open")) set(false);
      },
    };
  },

  tabs(root) {
    const wrap = $(".js-tabs", root);
    const pill = $(".js-pill", root);
    const panel = $(".js-tabpanel", root);
    const btns = $$("button", wrap);
    const text = ["홈 피드를 보고 있어요", "새로운 걸 탐색해 보세요", "내 정보를 확인하세요"];
    let cur = 0;
    const place = () => {
      const b = btns[cur];
      pill.style.setProperty("--x", `${b.offsetLeft - 4}px`);
      pill.style.setProperty("--w", `${b.offsetWidth}px`);
    };
    const go = (i) => {
      cur = i;
      btns.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
      place();
      panel.classList.add("is-swap");
      setTimeout(() => {
        panel.textContent = text[i];
        panel.classList.remove("is-swap");
      }, 180);
    };
    btns.forEach((b, i) => b.addEventListener("click", () => go(i)));
    place();
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return { play: () => go((cur + 1) % btns.length) };
  },

  stack(root) {
    const wrap = $(".js-stack", root);
    const cards = () => $$(".m-card", wrap);
    const fling = (card, dir) => {
      card.classList.remove("is-drag");
      card.style.transition = "transform 420ms cubic-bezier(.3,.7,.4,1), opacity 420ms";
      card.style.transform = `translateX(${dir * 260}px) rotate(${dir * 26}deg)`;
      card.style.opacity = "0";
      setTimeout(() => {
        card.style.cssText = "";
        wrap.append(card); // 맨 뒤로 보내 끝없이 돈다
      }, 430);
    };
    let x0 = null;
    let dx = 0;
    wrap.addEventListener("pointerdown", (e) => {
      const top = cards()[0];
      if (!top.contains(e.target)) return;
      x0 = e.clientX;
      dx = 0;
      top.classList.add("is-drag");
      top.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", (e) => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      cards()[0].style.transform = `translateX(${dx}px) rotate(${dx / 12}deg)`;
    });
    const end = () => {
      if (x0 === null) return;
      x0 = null;
      const top = cards()[0];
      if (Math.abs(dx) > 70) fling(top, Math.sign(dx));
      else {
        top.classList.remove("is-drag");
        top.style.transform = "";
      }
    };
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);
    return { play: () => fling(cards()[0], Math.random() > 0.5 ? 1 : -1) };
  },

  hold(root) {
    const b = $(".js-hold", root);
    const label = $(".js-hold-label", root);
    let raf = 0;
    let t0 = 0;
    let p = 0;
    let done = false;
    const set = (v) => {
      p = v;
      b.style.setProperty("--hp", v.toFixed(3));
    };
    const reset = () => {
      done = false;
      b.classList.remove("is-done", "is-hold");
      label.textContent = "꾹";
      set(0);
    };
    const tick = (t) => {
      set(Math.min(1, (t - t0) / 900));
      if (p >= 1) {
        done = true;
        b.classList.add("is-done");
        label.textContent = "✓";
        setTimeout(reset, 1400);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const down = () => {
      if (done) return;
      b.classList.add("is-hold");
      t0 = performance.now() - p * 900;
      raf = requestAnimationFrame(tick);
    };
    const up = () => {
      if (done) return;
      cancelAnimationFrame(raf);
      b.classList.remove("is-hold");
      // 놓으면 스르륵 되돌아간다
      const from = p;
      const s = performance.now();
      const back = (t) => {
        const k = Math.min(1, (t - s) / 350);
        set(from * (1 - k * k));
        if (k < 1 && !done) requestAnimationFrame(back);
      };
      requestAnimationFrame(back);
    };
    b.addEventListener("pointerdown", down);
    ["pointerup", "pointerleave", "pointercancel"].forEach((n) => b.addEventListener(n, up));
    b.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) down();
    });
    b.addEventListener("keyup", up);
    return {
      play() {
        if (done) return;
        down();
        setTimeout(() => {
          if (!done) up();
        }, 1200);
      },
    };
  },

  toast(root) {
    const t = $(".js-toast", root);
    let timer = 0;
    const show = () => {
      t.classList.remove("is-on");
      void t.offsetWidth; // 진행 막대를 처음부터 다시
      t.classList.add("is-on");
      clearTimeout(timer);
      timer = setTimeout(() => t.classList.remove("is-on"), 2200);
    };
    const b = $(".js-toast-open", root);
    b.addEventListener("click", show);
    return { play: () => b.click() };
  },

  pull(root) {
    const feed = $(".js-feed", root);
    const spin = $(".js-spin", root);
    const LIMIT = 70;
    let busy = false;
    const pull = (px) => {
      feed.style.setProperty("--py", px.toFixed(1));
      spin.style.setProperty("--po", Math.min(1, px / LIMIT).toFixed(2));
      spin.style.setProperty("--pr", (px * 5).toFixed(0));
    };
    const settle = (px) => {
      feed.classList.add("is-settle");
      pull(px);
      setTimeout(() => feed.classList.remove("is-settle"), 540);
    };
    const refresh = async () => {
      busy = true;
      spin.classList.add("is-spin");
      settle(LIMIT * 0.8);
      await wait(1100);
      const li = document.createElement("li");
      li.className = "is-new";
      li.textContent = "방금 새로 불러온 소식";
      feed.prepend(li);
      if (feed.children.length > 5) feed.lastElementChild.remove();
      spin.classList.remove("is-spin");
      settle(0);
      busy = false;
    };
    let y0 = null;
    let dy = 0;
    feed.addEventListener("pointerdown", (e) => {
      if (busy) return;
      y0 = e.clientY;
      dy = 0;
      feed.setPointerCapture(e.pointerId);
    });
    feed.addEventListener("pointermove", (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      pull(Math.min(110, dy * 0.55)); // 당길수록 무거워지는 저항
    });
    const end = () => {
      if (y0 === null) return;
      y0 = null;
      if (dy * 0.55 >= LIMIT * 0.85) refresh();
      else settle(0);
    };
    feed.addEventListener("pointerup", end);
    feed.addEventListener("pointercancel", end);
    return {
      async play() {
        if (busy) return;
        feed.classList.remove("is-settle");
        for (let i = 0; i <= 20; i++) {
          pull(i * 3.6);
          await wait(16);
        }
        refresh();
      },
    };
  },

  skeleton(root) {
    const list = $(".js-load", root);
    const again = $(".js-load-again", root);
    const load = async () => {
      list.classList.add("is-loading");
      await wait(1500);
      list.classList.remove("is-loading");
    };
    again.addEventListener("click", load);
    load();
    return { play: load };
  },

  slider(root) {
    const wrap = $(".js-slider", root);
    const input = $("input", wrap);
    const bubble = $(".js-bubble", wrap);
    const sync = () => {
      wrap.style.setProperty("--v", input.value);
      bubble.textContent = input.value;
    };
    input.addEventListener("input", sync);
    input.addEventListener("pointerdown", () => wrap.classList.add("is-down"));
    ["pointerup", "pointercancel", "blur"].forEach((n) => input.addEventListener(n, () => wrap.classList.remove("is-down")));
    return {
      async play() {
        wrap.classList.add("is-down");
        const to = [78, 22, 55];
        for (const target of to) {
          const from = Number(input.value);
          const s = performance.now();
          await new Promise((res) => {
            const step = (t) => {
              const k = Math.min(1, (t - s) / 650);
              input.value = Math.round(from + (target - from) * (1 - (1 - k) ** 3));
              sync();
              k < 1 ? requestAnimationFrame(step) : res();
            };
            requestAnimationFrame(step);
          });
          await wait(250);
        }
        wrap.classList.remove("is-down");
      },
    };
  },

  confetti(root) {
    const screen = $(".m-screen", root);
    const b = $(".js-party", root);
    b.addEventListener("click", () => {
      if (reduce) return;
      for (let i = 0; i < 28; i++) {
        const bit = document.createElement("i");
        bit.className = "m-bit";
        bit.style.background = `oklch(0.75 0.18 ${Math.round(rand(0, 360))})`;
        screen.append(bit);
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const d = rand(70, 150);
        bit.animate(
          [
            { transform: "translate(0,0) rotate(0)", opacity: 1 },
            { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${rand(120, 480)}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${Math.cos(a) * d * 1.25}px,${Math.sin(a) * d + rand(110, 190)}px) rotate(${rand(480, 900)}deg)`, opacity: 0 },
          ],
          { duration: rand(1100, 1600), easing: "cubic-bezier(.2,.7,.4,1)" },
        ).onfinish = () => bit.remove();
      }
    });
    return { play: () => b.click() };
  },
};

function init() {
  const root = $('[data-module="shots"]');
  if (!root) return;
  const items = $$(".m-shot", root);
  const players = new Map();
  const touched = new Map();

  items.forEach((el) => {
    const api = shots[el.dataset.shot]?.(el);
    if (!api) return;
    players.set(el, api);
    el.addEventListener("pointerdown", () => touched.set(el, performance.now()), true);
    $(".m-replay", el).addEventListener("click", () => api.play());
  });

  // 화면에 보이는 카드만 돌아가며 한 번씩 보여 준다(보이지 않는 카드는 쉰다)
  const visible = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { threshold: 0.55 });
  items.forEach((el) => io.observe(el));

  if (!reduce) {
    let i = 0;
    setInterval(() => {
      const list = [...visible].filter((el) => !el.hidden && performance.now() - (touched.get(el) ?? -1e9) > 6000);
      if (!list.length) return;
      const el = list[i++ % list.length];
      players.get(el)?.play();
    }, 1700);
  }

  // 분류 칩
  const count = $(".js-count");
  const chips = $$(".s-chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      let n = 0;
      items.forEach((el) => {
        const show = f === "all" || el.dataset.cat === f;
        if (show) n++;
        if (show && !el.hidden) {
          el.classList.remove("is-out");
        } else if (show && el.hidden) {
          el.hidden = false;
          el.classList.add("is-out");
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-out")));
        } else if (!show && !el.hidden) {
          el.classList.add("is-out");
          setTimeout(() => {
            if (el.classList.contains("is-out")) el.hidden = true;
          }, 260);
        }
      });
      count.textContent = n;
    }),
  );
}

init();

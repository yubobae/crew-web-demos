/* 큐레이션 갤러리: 데이터 18개로 카드·태그·분류·통계를 만들고, 검색/태그/분류/정렬/큰 창을 연결한다.
   - 카드 속 사이트 그림은 CSS 로 그린 가짜 웹사이트(틀 6가지 × 색상 각)라서 이미지 파일이 없다.
   - 정렬(Daily=최신순, Weekly=인기순)이 바뀌면 카드가 제자리로 미끄러져 간다(FLIP). 동작 줄이기에서는 그냥 바뀐다.
   - 카드를 누르면 <dialog> 로 크게 열고, ← → 키·이전/다음으로 보이는 목록 안에서 넘긴다. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* id 가 클수록 최근. likes 는 Weekly 정렬 기준. layout a~f, h 색상 각, tone light/dark */
const DATA = [
  { id: 18, title: "온결 문서 — 팀을 위한 지식 도구", by: "한서윤", cat: "테크", tags: ["미니멀", "벤토"], layout: "c", h: 265, tone: "dark", likes: 142, word: "ON" },
  { id: 17, title: "모아 스튜디오 · 브랜드 디자인", by: "이도현", cat: "에이전시", tags: ["큰 글자", "모션"], layout: "d", h: 35, tone: "light", likes: 98, word: "MOA" },
  { id: 16, title: "라이트온 — 스마트 조명 앱", by: "박지우", cat: "테크", tags: ["다크", "3D"], layout: "e", h: 85, tone: "dark", likes: 174, word: "LO" },
  { id: 15, title: "새벽 서점 — 독립 출판 마켓", by: "정하린", cat: "이커머스", tags: ["에디토리얼", "미니멀"], layout: "f", h: 20, tone: "light", likes: 66, word: "SB" },
  { id: 14, title: "플로우 AI — 업무 자동화", by: "김민재", cat: "AI", tags: ["다크", "벤토", "3D"], layout: "c", h: 300, tone: "dark", likes: 211, word: "FL" },
  { id: 13, title: "여름 학교 — 코딩 캠프", by: "오세아", cat: "교육", tags: ["큰 글자", "밝은"], layout: "a", h: 70, tone: "light", likes: 54, word: "SC" },
  { id: 12, title: "오브제 — 가구 쇼룸", by: "최유나", cat: "이커머스", tags: ["에디토리얼", "모션"], layout: "f", h: 55, tone: "light", likes: 87, word: "OB" },
  { id: 11, title: "비트랩 — 음악 협업 툴", by: "윤태성", cat: "테크", tags: ["다크", "모션"], layout: "b", h: 330, tone: "dark", likes: 133, word: "BT" },
  { id: 10, title: "결 디자인 랩 · 포트폴리오", by: "강나리", cat: "디자인", tags: ["미니멀", "큰 글자"], layout: "d", h: 190, tone: "dark", likes: 79, word: "GYEOL" },
  { id: 9, title: "마이페이스 — 피부 분석 AI", by: "송예린", cat: "AI", tags: ["밝은", "3D"], layout: "e", h: 10, tone: "light", likes: 158, word: "MF" },
  { id: 8, title: "푸른들 — 친환경 농산물", by: "문재원", cat: "이커머스", tags: ["밝은", "미니멀"], layout: "a", h: 150, tone: "light", likes: 41, word: "PD" },
  { id: 7, title: "토픽 — 외국어 말하기 앱", by: "임수빈", cat: "교육", tags: ["벤토", "밝은"], layout: "c", h: 235, tone: "light", likes: 102, word: "TP" },
  { id: 6, title: "네온랩 에이전시", by: "배준호", cat: "에이전시", tags: ["다크", "모션", "3D"], layout: "b", h: 310, tone: "dark", likes: 187, word: "NEON" },
  { id: 5, title: "소소한 — 일기 앱", by: "조아라", cat: "디자인", tags: ["미니멀", "밝은"], layout: "e", h: 45, tone: "light", likes: 61, word: "SS" },
  { id: 4, title: "쿼리 — 데이터 대시보드", by: "신동욱", cat: "테크", tags: ["다크", "벤토"], layout: "c", h: 215, tone: "dark", likes: 120, word: "Q" },
  { id: 3, title: "아틀리에 하루 — 사진 스튜디오", by: "황지민", cat: "디자인", tags: ["에디토리얼", "큰 글자"], layout: "f", h: 5, tone: "dark", likes: 93, word: "HARU" },
  { id: 2, title: "코드숲 — 개발자 부트캠프", by: "류성민", cat: "교육", tags: ["다크", "큰 글자"], layout: "a", h: 160, tone: "dark", likes: 72, word: "CODE" },
  { id: 1, title: "프롬프트북 — AI 프롬프트 모음", by: "남가은", cat: "AI", tags: ["미니멀", "벤토"], layout: "b", h: 120, tone: "light", likes: 165, word: "PB" },
];

const T = {
  a: '<i class="t-nav"></i><i class="t-h h1"></i><i class="t-h h2"></i><i class="t-p p1"></i><i class="t-p p2"></i><i class="t-btn"></i><i class="t-img m1"></i>',
  b: '<i class="t-nav"></i><i class="t-h h1"></i><i class="t-h h2"></i><i class="t-btn"></i><i class="t-card c1"></i><i class="t-card c2"></i><i class="t-card c3"></i>',
  c: '<i class="t-nav"></i><i class="t-card c1"></i><i class="t-card c2"></i><i class="t-card c3"></i><i class="t-card c4"></i><i class="t-card c5"></i><i class="t-card c6"></i>',
  d: (w) => `<i class="t-nav"></i><i class="t-big">${w}</i><i class="t-p p1"></i><i class="t-p p2"></i><i class="t-btn"></i>`,
  e: '<i class="t-nav"></i><i class="t-h h1"></i><i class="t-h h2"></i><i class="t-p p1"></i><i class="t-btn"></i><i class="t-phone"></i><i class="t-card c1"></i><i class="t-card c2"></i>',
  f: '<i class="t-nav"></i><i class="t-h h1"></i><i class="t-h h2"></i><i class="t-p p1"></i><i class="t-p p2"></i><i class="t-img m1"></i><i class="t-img m2"></i><i class="t-img m3"></i>',
};
const art = (d) => (typeof T[d.layout] === "function" ? T[d.layout](d.word) : T[d.layout]);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.9 5 6.3 5c2 0 3.7 1.1 4.7 2.7h2C14 6.1 15.7 5 17.7 5c3.4 0 5.3 3.6 3.9 6.8C19.5 16.4 12 21 12 21z"/></svg>';

function init() {
  const root = $('[data-module="curate"]');
  if (!root) return;
  const grid = $(".js-grid", root);
  const state = { q: "", cat: "전체", tag: "", sort: "daily" };
  const liked = new Set();
  const cats = ["전체", ...new Set(DATA.map((d) => d.cat))];
  const tagCount = {};
  DATA.forEach((d) => d.tags.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
  const trending = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);

  // 통계
  $(".js-stat-all", root).textContent = DATA.length;
  $(".js-stat-authors", root).textContent = new Set(DATA.map((d) => d.by)).size;
  $(".js-stat-cats", root).textContent = cats.length - 1;

  // 카드(한 번만 만들고, 이후엔 순서와 hidden 만 바꾼다)
  const cards = new Map();
  DATA.forEach((d) => {
    const li = document.createElement("li");
    li.className = "g-card";
    li.dataset.id = d.id;
    li.innerHTML = `
      <button class="g-card__open" type="button" aria-label="${esc(d.title)} 크게 보기">
        <div class="g-thumb" style="--h:${d.h}" data-tone="${d.tone}" data-layout="${d.layout}" aria-hidden="true">${art(d)}</div>
      </button>
      <div class="g-card__meta">
        <span class="g-av" style="--h:${d.h}" aria-hidden="true">${esc(d.by[0])}</span>
        <span class="g-card__txt"><b>${esc(d.title)}</b><small>${esc(d.by)} · ${esc(d.cat)}</small></span>
        <button class="g-like" type="button" aria-pressed="false" aria-label="좋아요">${heart}<span>${d.likes}</span></button>
      </div>`;
    $(".g-like", li).addEventListener("click", () => toggleLike(d.id));
    $(".g-card__open", li).addEventListener("click", () => openModal(d.id));
    cards.set(d.id, { d, li });
  });

  function toggleLike(id) {
    const { d, li } = cards.get(id);
    const on = !liked.has(id);
    on ? liked.add(id) : liked.delete(id);
    d.likes += on ? 1 : -1;
    const like = $(".g-like", li);
    like.setAttribute("aria-pressed", String(on));
    $("span", like).textContent = d.likes;
    if (modal.open && cur === id) syncVote(d);
  }

  const match = (d) => {
    const q = state.q.trim().toLowerCase();
    if (state.cat !== "전체" && d.cat !== state.cat) return false;
    if (state.tag && !d.tags.includes(state.tag)) return false;
    return !q || [d.title, d.by, d.cat, ...d.tags].some((s) => s.toLowerCase().includes(q));
  };
  const sorted = () => [...DATA].sort((a, b) => (state.sort === "daily" ? b.id - a.id : b.likes - a.likes));
  const visible = () => sorted().filter(match);

  // 정렬이 바뀔 때 카드가 제자리로 미끄러지는 FLIP
  function render(animate) {
    const before = new Map();
    if (animate && !reduce) cards.forEach(({ li }, id) => !li.hidden && before.set(id, li.getBoundingClientRect()));
    const order = sorted();
    order.forEach((d) => {
      const { li } = cards.get(d.id);
      li.hidden = !match(d);
      grid.append(li);
    });
    const n = order.filter(match).length;
    $(".js-count", root).textContent = n;
    $(".js-empty", root).hidden = n > 0;
    if (before.size) {
      cards.forEach(({ li }, id) => {
        const b = before.get(id);
        if (!b || li.hidden) return;
        const a = li.getBoundingClientRect();
        const dx = b.left - a.left;
        const dy = b.top - a.top;
        if (dx || dy) li.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" });
      });
    }
  }

  // 인기 태그 / 분류 칩
  const tagsEl = $(".js-tags", root);
  trending.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "g-tag";
    b.textContent = t;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      state.tag = state.tag === t ? "" : t;
      $$(".g-tag", tagsEl).forEach((x) => {
        x.classList.toggle("is-on", x.textContent === state.tag);
        x.setAttribute("aria-pressed", String(x.textContent === state.tag));
      });
      render();
    });
    tagsEl.append(b);
  });
  const catsEl = $(".js-cats", root);
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "g-cat" + (c === "전체" ? " is-on" : "");
    b.textContent = c;
    b.setAttribute("aria-pressed", String(c === "전체"));
    b.addEventListener("click", () => {
      state.cat = c;
      $$(".g-cat", catsEl).forEach((x) => {
        x.classList.toggle("is-on", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      render();
    });
    catsEl.append(b);
  });

  // 검색(/ 키로 바로 이동)
  const search = $(".js-search", root);
  search.addEventListener("input", () => {
    state.q = search.value;
    render();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName) && !modal.open) {
      e.preventDefault();
      search.focus();
    }
  });

  // Daily / Weekly
  const seg = $(".js-seg", root);
  const pill = $(".js-seg-pill", root);
  const segBtns = $$("button", seg);
  const placePill = () => {
    const b = segBtns.find((x) => x.getAttribute("aria-pressed") === "true");
    pill.style.setProperty("--x", `${b.offsetLeft}px`);
    pill.style.setProperty("--w", `${b.offsetWidth}px`);
  };
  segBtns.forEach((b) =>
    b.addEventListener("click", () => {
      if (state.sort === b.dataset.sort) return;
      state.sort = b.dataset.sort;
      segBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      placePill();
      render(true);
    }),
  );
  placePill();
  addEventListener("resize", placePill);
  document.fonts?.ready.then(placePill);

  // 큰 미리보기 창
  const modal = $(".js-modal");
  let cur = null;
  const fill = (id) => {
    const d = cards.get(id).d;
    cur = id;
    const th = $(".js-m-thumb", modal);
    th.style.setProperty("--h", d.h);
    th.dataset.tone = d.tone;
    th.dataset.layout = d.layout;
    th.innerHTML = art(d);
    $(".js-m-cat", modal).textContent = d.cat.toUpperCase();
    $(".js-m-title", modal).textContent = d.title;
    $(".js-m-by", modal).textContent = `${d.by} 님이 올림`;
    $(".js-m-cat2", modal).textContent = d.cat;
    $(".js-m-views", modal).textContent = (d.likes * 9 + d.id * 7).toLocaleString("en-US");
    syncVote(d);
    $(".js-m-tags", modal).innerHTML = d.tags.map((t) => `<span class="g-tag">${esc(t)}</span>`).join("");
    // 팔레트: 그림에 쓴 세 색(바탕·포인트·보조)
    const pal = [
      ["BASE", d.tone === "dark" ? `oklch(0.2 0.045 ${d.h})` : `oklch(0.97 0.018 ${d.h})`],
      ["ACCENT", `oklch(0.62 0.2 ${d.h})`],
      ["SUB", `oklch(0.8 0.14 ${d.h + 50})`],
    ];
    $(".js-m-pal", modal).innerHTML = pal.map(([n, c]) => `<span style="display:grid;justify-items:center;gap:.3rem;font-size:.65rem;color:var(--soft)"><i style="width:2.4rem;aspect-ratio:1;border-radius:50%;background:${c};box-shadow:0 0 0 1px oklch(1 0 0/.15)"></i>${n}</span>`).join("");
    // 비슷한 디자인: 같은 분류 우선, 모자라면 인기순으로 채운다
    const sim = [...DATA.filter((x) => x.id !== id && x.cat === d.cat), ...DATA.filter((x) => x.id !== id && x.cat !== d.cat).sort((a, b) => b.likes - a.likes)].slice(0, 3);
    const simEl = $(".js-m-sim", modal);
    simEl.innerHTML = sim.map((x) => `<button type="button" data-id="${x.id}" aria-label="${esc(x.title)}"><div class="g-thumb" style="--h:${x.h}" data-tone="${x.tone}" data-layout="${x.layout}" aria-hidden="true">${art(x)}</div></button>`).join("");
    const list = visible();
    $(".js-m-pos", modal).textContent = `${list.findIndex((x) => x.id === id) + 1} / ${list.length}`;
  };
  function syncVote(d) {
    const v = $(".js-vote", modal);
    v.setAttribute("aria-pressed", String(liked.has(d.id)));
    $(".js-m-likes", modal).textContent = d.likes;
    $(".js-m-votes", modal).textContent = d.likes;
  }
  $(".js-vote", modal).addEventListener("click", () => cur != null && toggleLike(cur));
  $(".js-m-sim", modal).addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) fill(Number(b.dataset.id));
  });
  function openModal(id) {
    fill(id);
    if (!modal.open) modal.showModal();
  }
  const step = (dir) => {
    const list = visible();
    if (!list.length) return;
    const i = list.findIndex((x) => x.id === cur);
    fill(list[(i + dir + list.length) % list.length].id);
  };
  $(".js-prev", modal).addEventListener("click", () => step(-1));
  $(".js-next", modal).addEventListener("click", () => step(1));
  modal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close(); // 바깥(배경)을 누르면 닫힘
  });

  render();
}

init();

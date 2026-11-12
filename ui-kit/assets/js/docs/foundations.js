// Foundations(색·글자·간격·반경·그림자·모션·레이아웃) 문서. 값은 CSS 토큰에서 읽어 와서 tokens.css 와 어긋날 수 없다.
// 각 render() 는 { html, after?(root) } 를 돌려준다. after 는 그린 뒤에 값을 채우거나 동작을 붙인다.

const root = document.documentElement;
const val = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const sec = (title, body, { desc = "", small = "" } = {}) => `
  <section class="doc-sec">
    <h2 class="doc-sec__title">${title}${small ? `<small>${small}</small>` : ""}</h2>
    ${desc ? `<p class="doc-sec__desc">${desc}</p>` : ""}
    ${body}
  </section>`;
const head = (kicker, title, lead) => `
  <header class="doc-head">
    <p class="doc-kicker">${kicker}</p>
    <h1 class="doc-title" tabindex="-1">${title}</h1>
    <p class="doc-lead">${lead}</p>
  </header>`;
const px = (rem) => Math.round(parseFloat(rem) * 16 * 100) / 100;

// 모든 스타일시트의 :root 에 선언된 커스텀 속성 개수(@import·@layer 안까지)
function countTokens() {
  const names = new Set();
  const walk = (rules) => {
    for (const rule of rules ?? []) {
      if (rule.styleSheet) walk(rule.styleSheet.cssRules);
      else if (rule.cssRules && !rule.style) walk(rule.cssRules);
      else if (rule.selectorText === ":root" && rule.style) for (const n of rule.style) if (n.startsWith("--")) names.add(n);
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* 다른 출처 스타일시트는 건너뜀 */ }
  }
  return names.size;
}

/* ── 색 ───────────────────────────────── */
const COLOR_GROUPS = [
  ["바탕과 글자", "페이지 전체에 쓰는 기본 색. 사이트마다 여기를 바꿔 컨셉을 입힌다.", ["--color-bg", "--color-bg-subtle", "--color-fg", "--color-fg-muted", "--color-border"]],
  ["포인트와 상태", "브랜드 포인트와 성공·경고·위험 색.", ["--color-accent", "--color-accent-hover", "--color-accent-2", "--color-focus", "--color-success", "--color-warning", "--color-danger"]],
  ["UI 컴포넌트", "shadcn/ui 방식의 의미 이름. 컴포넌트는 이 값만 쓰며 다크 모드에서 값이 바뀐다.", ["--ui-background", "--ui-foreground", "--ui-card", "--ui-popover", "--ui-primary", "--ui-primary-foreground", "--ui-secondary", "--ui-muted", "--ui-muted-foreground", "--ui-accent", "--ui-destructive", "--ui-border", "--ui-input", "--ui-ring"]],
];
const RAMPS = ["gray", "slate", "zinc", "neutral", "blue", "red", "amber", "green"];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const color = {
  render() {
    const groups = COLOR_GROUPS.map(
      ([t, d, names]) => sec(t, `<div class="doc-swatches">${names.map((n) => `
        <button class="doc-swatch" type="button" data-copy="var(${n})" aria-label="${n} 값 복사">
          <span class="doc-swatch__chip" style="background:var(${n})"></span>
          <span class="doc-swatch__name">${n}</span>
          <span class="doc-swatch__val">${esc(val(n))}</span>
        </button>`).join("")}</div>`, { desc: d }),
    ).join("");
    const ramps = `<div class="doc-ramp">
      <div class="doc-ramp__row"><span></span>${STEPS.map((s) => `<span class="doc-ramp__steps">${s}</span>`).join("")}</div>
      ${RAMPS.map((r) => `<div class="doc-ramp__row"><span>${r}</span>${STEPS.map((s) => `<button type="button" style="background:var(--palette-${r}-${s})" data-copy="var(--palette-${r}-${s})" title="--palette-${r}-${s}: ${esc(val(`--palette-${r}-${s}`))}" aria-label="--palette-${r}-${s} 값 복사"></button>`).join("")}</div>`).join("")}
    </div>`;
    return {
      html: head("Foundations", "색", "색은 두 층으로 나눕니다. <b>팔레트</b>(원시 값)는 고치지 않고, <b>의미 토큰</b>(<code>--color-*</code>, <code>--ui-*</code>)만 사이트에서 바꿉니다. 컴포넌트에는 팔레트 값을 직접 쓰지 않습니다. 칸을 누르면 <code>var(--이름)</code>이 복사됩니다.")
        + groups
        + sec("팔레트", ramps, { desc: "Tailwind 기본 테마의 색(oklch). 의미 토큰이 이 값을 가리킵니다. 칸에 마우스를 올리면 이름과 값이 보입니다." })
        + sec("쓰는 법", `<div class="doc-dd"><div class="doc-do"><h3>이렇게</h3><ul><li><code>color: var(--ui-muted-foreground)</code>처럼 의미 토큰을 쓴다.</li><li>글자와 바탕은 대비 4.5:1 이상을 지킨다.</li></ul></div><div class="doc-dont"><h3>이렇게 하지 않는다</h3><ul><li><code>#3b82f6</code> 같은 값을 직접 쓰지 않는다.</li><li>컴포넌트에서 <code>--palette-*</code>를 바로 가리키지 않는다.</li></ul></div></div>`),
    };
  },
};

/* ── 글자 ─────────────────────────────── */
const TEXT = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"];
const FS = [["--fs-small", "작은 글자"], ["--fs-body", "본문"], ["--fs-h3", "소제목 h3"], ["--fs-h2", "제목 h2"], ["--fs-h1", "큰 제목 h1"], ["--fs-display", "디스플레이"]];
const typography = {
  render() {
    const sample = "다람쥐 헌 쳇바퀴에 타고파 Aa 123";
    const scale = `<div class="doc-type">${TEXT.map((t) => `
      <div class="doc-type__row">
        <div class="doc-type__meta"><b>--text-${t}</b><span>${px(val(`--text-${t}`))}px</span></div>
        <div class="doc-type__sample" style="font-size:var(--text-${t});line-height:1.2">${sample}</div>
      </div>`).join("")}</div>`;
    const fluid = `<div class="doc-type">${FS.map(([n, label]) => `
      <div class="doc-type__row">
        <div class="doc-type__meta"><b>${n}</b><span data-px="${n}">…</span></div>
        <div class="doc-type__sample" style="font-size:var(${n});line-height:1.2" data-probe="${n}">${label} · ${sample}</div>
      </div>`).join("")}</div>`;
    const weights = `<div class="doc-type">${[["light", 300], ["normal", 400], ["medium", 500], ["semibold", 600], ["bold", 700], ["extrabold", 800], ["black", 900]].map(([n, w]) => `
      <div class="doc-type__row">
        <div class="doc-type__meta"><b>--font-weight-${n}</b><span>${w}</span></div>
        <div class="doc-type__sample" style="font-size:var(--text-2xl);font-weight:var(--font-weight-${n})">${sample}</div>
      </div>`).join("")}</div>`;
    const lead = `<div class="doc-type">${[["tight", 1.25], ["snug", 1.375], ["normal", 1.5], ["relaxed", 1.625], ["loose", 2]].map(([n, v]) => `
      <div class="doc-type__row">
        <div class="doc-type__meta"><b>--leading-${n}</b><span>${v}</span></div>
        <div class="doc-type__sample" style="white-space:normal;line-height:var(--leading-${n});max-width:36rem">작은 웹사이트를 가장 매끄럽게 빚습니다. 줄 사이 간격이 읽는 호흡을 정합니다. 본문은 relaxed, 제목은 tight를 씁니다.</div>
      </div>`).join("")}</div>`;
    const track = `<div class="doc-type">${["tighter", "tight", "normal", "wide", "wider", "widest"].map((n) => `
      <div class="doc-type__row">
        <div class="doc-type__meta"><b>--tracking-${n}</b><span>${val(`--tracking-${n}`)}</span></div>
        <div class="doc-type__sample" style="font-size:var(--text-xl);letter-spacing:var(--tracking-${n})">보람찬크루 BORAM CREW</div>
      </div>`).join("")}</div>`;
    return {
      html: head("Foundations", "글자", "글자는 <b>크기 단계</b>, <b>반응형 크기</b>, <b>굵기·행간·자간</b>으로 나눕니다. 제목은 화면 폭에 따라 부드럽게 커지는 <code>clamp()</code> 값을 씁니다.")
        + sec("크기 단계", scale, { desc: "Tailwind 값 체계(rem). 고정 크기가 필요할 때 씁니다." })
        + sec("반응형 크기", fluid, { desc: "화면 폭에 따라 단계 사이를 부드럽게 오갑니다. 창 폭을 바꾸면 오른쪽 숫자가 바뀝니다.", small: "본문·제목은 이 값을 쓴다" })
        + sec("굵기", weights)
        + sec("행간", lead, { desc: "제목은 좁게(tight), 긴 본문은 넓게(relaxed)." })
        + sec("자간", track, { desc: "큰 제목은 좁게(−), 작은 대문자 라벨은 넓게(+)." })
        + sec("글꼴", `<div class="doc-note"><code>--font-sans</code> = <code>${esc(val("--font-sans")).slice(0, 120)}…</code><br>폰트 프리셋(Pretendard 등)을 쓰면 <code>--font-sans</code>만 프리셋 값으로 바꿉니다. 한글 단어가 중간에 끊기지 않도록 <code>word-break: keep-all</code>을 기본으로 둡니다.</div>`),
      after(el) {
        const fill = () => el.querySelectorAll("[data-probe]").forEach((p) => {
          const out = el.querySelector(`[data-px="${p.dataset.probe}"]`);
          if (out) out.textContent = `${Math.round(parseFloat(getComputedStyle(p).fontSize) * 10) / 10}px`;
        });
        fill();
        const onResize = () => fill();
        addEventListener("resize", onResize);
        return () => removeEventListener("resize", onResize);
      },
    };
  },
};

/* ── 간격 ─────────────────────────────── */
const SPACES = ["px", "0-5", "1", "1-5", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32", "40"];
const spacing = {
  render() {
    const bars = `<div class="doc-bars">${SPACES.map((s) => {
      const v = val(`--space-${s}`);
      const p = v.endsWith("px") ? parseFloat(v) : px(v);
      return `<div class="doc-bar"><span>--space-${s}</span><span>${v} · ${p}px</span><span class="doc-bar__fill" style="width:var(--space-${s})"></span></div>`;
    }).join("")}</div>`;
    return {
      html: head("Foundations", "간격", "간격은 <b>4px(0.25rem)</b> 단위입니다. <code>--space-N</code>은 N × 0.25rem이라 Tailwind의 <code>p-4</code>가 <code>--space-4</code>(1rem)와 같습니다. 여백·패딩·gap은 모두 이 단계에서 고릅니다.")
        + sec("단계", bars)
        + sec("쓰는 법", `<div class="doc-dd"><div class="doc-do"><h3>이렇게</h3><ul><li>같은 종류의 간격은 같은 단계로 통일한다(카드 안쪽 여백은 <code>--space-6</code> 등).</li><li>컴포넌트 안은 작게(2~6), 구역 사이는 크게(12~24).</li></ul></div><div class="doc-dont"><h3>이렇게 하지 않는다</h3><ul><li><code>13px</code>, <code>27px</code>처럼 단계에 없는 값을 쓰지 않는다.</li><li>간격을 <code>margin-top</code> 여기저기에 흩뿌리지 않는다 — 부모의 <code>gap</code>으로 둔다.</li></ul></div></div>`),
    };
  },
};

/* ── 반경 ─────────────────────────────── */
const radius = {
  render() {
    const base = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"];
    const boxes = (items, prefix) => `<div class="doc-boxes">${items.map((n) => `
      <div class="doc-box"><span class="doc-box__shape" style="border-radius:var(${prefix}${n})"></span><span>${prefix}${n}</span><span>${esc(val(`${prefix}${n}`))}</span></div>`).join("")}</div>`;
    return {
      html: head("Foundations", "반경", "모서리 둥글기입니다. 컴포넌트는 <code>--ui-radius-*</code>(기준 0.625rem의 비율)를 쓰고, 알약·원은 <code>--radius-full</code>을 씁니다.")
        + sec("기본 단계", boxes(base, "--radius-"))
        + sec("UI 컴포넌트", boxes(["sm", "md", "lg", "xl"], "--ui-radius-"), { desc: "<code>--ui-radius</code> 한 값을 바꾸면 모든 컴포넌트의 둥글기가 비율대로 바뀝니다." }),
    };
  },
};

/* ── 그림자 ───────────────────────────── */
const shadow = {
  render() {
    const names = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];
    return {
      html: head("Foundations", "그림자", "그림자는 높이를 표현합니다. 높을수록 크고 부드럽습니다. 카드는 <code>sm</code>, 떠 있는 메뉴는 <code>md</code>, 모달·토스트는 <code>lg</code>를 씁니다.")
        + sec("단계", `<div class="doc-boxes">${names.map((n) => `
          <div class="doc-box"><span class="doc-box__shape" style="border-radius:var(--ui-radius-lg);box-shadow:var(--shadow-${n})"></span><span>--shadow-${n}</span></div>`).join("")}</div>`),
    };
  },
};

/* ── 모션 ─────────────────────────────── */
const EASES = [["--ease-in", "가속 — 사라질 때"], ["--ease-out", "감속 — 나타날 때"], ["--ease-in-out", "가속+감속 — 토글"], ["--ease-out-expo", "크루: 리빌·등장"], ["--ease-sine-in-out", "크루: 반복 미세 모션"], ["--fx-ease-spring", "스프링 — 튀는 반응"]];
const DURS = [["--ui-duration", "버튼·hover 반응"], ["--ui-duration-dialog", "모달·토스트 열림"], ["--ui-duration-accordion", "아코디언"], ["--ui-duration-toggle", "스위치·체크박스"], ["--dur-micro", "마이크로 인터랙션"], ["--dur-reveal", "스크롤 리빌"], ["--dur-section", "구간 전환"]];
const motion = {
  render() {
    const rows = EASES.map(([n, d]) => `
      <div class="doc-motion__row" data-ease="${n}">
        <span><b>${n}</b></span>
        <span class="doc-motion__track"><span class="doc-motion__dot"></span></span>
        <button class="c-button c-button--outline c-button--sm" type="button">재생</button>
      </div>`).join("");
    const durs = `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>토큰</th><th>값</th><th>쓰는 곳</th></tr></thead><tbody>${DURS.map(([n, u]) => `<tr><td><code>${n}</code></td><td>${esc(val(n))}</td><td>${u}</td></tr>`).join("")}</tbody></table></div>`;
    return {
      html: head("Foundations", "모션", "움직임은 <b>짧고(150~250ms) 의도가 있게</b> 씁니다. 반응은 빠르게, 화면 전환은 천천히. 움직임 줄이기 설정(<code>prefers-reduced-motion</code>)에서는 모든 전환이 꺼집니다.")
        + sec("이징", `<div class="doc-motion">${rows}</div>`, { desc: "<b>재생</b>을 누르면 같은 시간(0.9초)으로 이징만 비교해 볼 수 있습니다." })
        + sec("시간", durs),
      after(el) {
        const dispose = [];
        el.querySelectorAll(".doc-motion__row").forEach((row) => {
          const btn = row.querySelector("button");
          const run = () => {
            const track = row.querySelector(".doc-motion__track");
            row.style.setProperty("--run", `${track.clientWidth - 30}px`);
            row.style.setProperty("--run-ease", `var(${row.dataset.ease})`);
            row.style.setProperty("--run-dur", matchMedia("(prefers-reduced-motion: reduce)").matches ? "0ms" : "900ms");
            row.classList.remove("is-run");
            void row.offsetWidth;
            row.classList.add("is-run");
          };
          btn.addEventListener("click", run);
          dispose.push(() => btn.removeEventListener("click", run));
        });
        return () => dispose.forEach((f) => f());
      },
    };
  },
};

/* ── 레이아웃 ─────────────────────────── */
const BP = [[500, "큰 휴대폰 · 가로 넘침 검사 기준"], [820, "태블릿 세로 · 목차·메뉴가 접히는 경계"], [1024, "태블릿 가로 · 작은 노트북"], [1280, "노트북"], [1440, "데스크톱 · 콘텐츠 최대 폭"], [1600, "큰 모니터"]];
const layout = {
  render() {
    const bar = `<div class="doc-bp"><div class="doc-bp__bar">${BP.map(([w]) => `<span class="doc-bp__mark" style="left:${(w / 1600) * 100}%">${w}</span>`).join("")}</div></div>`;
    const bps = `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>분기점</th><th>의미</th></tr></thead><tbody>${BP.map(([w, d]) => `<tr><td><code>${w}px</code></td><td>${d}</td></tr>`).join("")}</tbody></table></div>`;
    const toks = [["--gutter", "좌우 바깥 여백(화면 폭에 따라 변함)"], ["--content-max", "콘텐츠 최대 폭"], ["--section-pad", "구역 위아래 여백"], ["--tap-min", "터치 최소 영역"], ["--focus-ring", "포커스 링"], ["--z-header", "고정 머리줄 층"], ["--z-overlay", "모달·툴팁·토스트 층"]];
    return {
      html: head("Foundations", "레이아웃", "화면 폭은 <b>360 · 500 · 820 · 1024 · 1280</b> 다섯 폭에서 가로 넘침 없이 보이는 것을 기준으로 합니다. 분기점은 Tailwind 값이 아닌 크루 기준을 씁니다.")
        + sec("분기점", bar + bps, { desc: "모바일 우선(<code>min-width</code>)으로 쓰고, 콘텐츠 최대 폭은 1440px로 제한합니다." })
        + sec("레이아웃 토큰", `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>토큰</th><th>값</th><th>의미</th></tr></thead><tbody>${toks.map(([n, d]) => `<tr><td><code>${n}</code></td><td>${esc(val(n))}</td><td>${d}</td></tr>`).join("")}</tbody></table></div>`),
    };
  },
};

/* ── 소개 / 시작하기 ──────────────────── */
const overview = {
  render(ctx) {
    const principles = [
      ["프레임워크 없이", "HTML · CSS · 순수 JS 모듈만 씁니다. 어떤 서버에 올려도 그대로 가볍게 돕니다."],
      ["토큰이 먼저", "색·간격·글자·반경·그림자·모션을 토큰으로 정하고, 컴포넌트는 토큰만 가리킵니다."],
      ["브라우저 기본 요소", "<code>&lt;dialog&gt;</code> · Popover API · <code>&lt;details&gt;</code>로 접근성과 동작을 브라우저에 맡깁니다."],
      ["키보드로 모두", "모든 컴포넌트를 키보드로 조작할 수 있고, 포커스는 항상 보입니다."],
      ["라이트 · 다크", "시스템 설정을 따르고, <code>data-theme</code>로 직접 고를 수 있습니다."],
      ["shadcn/ui 기준", "디자인과 인터랙션은 shadcn/ui(MIT)를, 값 체계는 Tailwind(MIT)를 옮겨 왔습니다."],
    ];
    return {
      html: head("보람찬크루 디자인시스템", "UI 키트", "보람찬크루가 만드는 모든 사이트가 같은 품질로 시작하도록 정리한 <b>토큰 · 컴포넌트 · 사용 규칙</b>입니다. 왼쪽 목차에서 쪽을 골라 미리보기와 코드, 접근성 기준을 확인하세요.")
        + sec("한눈에", `<div class="doc-swatches" style="grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))">
            <div class="c-card"><div class="c-card__header"><p class="c-card__description">컴포넌트</p><h3 class="c-card__title" style="font-size:var(--text-3xl)">${ctx.counts.components}</h3></div></div>
            <div class="c-card"><div class="c-card__header"><p class="c-card__description">Foundations</p><h3 class="c-card__title" style="font-size:var(--text-3xl)">${ctx.counts.foundations}</h3></div></div>
            <div class="c-card"><div class="c-card__header"><p class="c-card__description">토큰(:root)</p><h3 class="c-card__title" style="font-size:var(--text-3xl)">${countTokens()}</h3></div></div>
            <div class="c-card"><div class="c-card__header"><p class="c-card__description">프레임워크</p><h3 class="c-card__title" style="font-size:var(--text-3xl)">0</h3></div></div>
          </div>`)
        + sec("원칙", `<div class="l-kit__grid">${principles.map(([t, d]) => `<article class="c-card"><div class="c-card__header"><h3 class="c-card__title">${t}</h3><p class="c-card__description">${d}</p></div></article>`).join("")}</div>`)
        + sec("구성", `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>층</th><th>무엇</th><th>어디서 고치나</th></tr></thead><tbody>
            <tr><td>1. 원시 값</td><td>팔레트·간격·글자·반경·그림자·이징 (Tailwind 값)</td><td>고치지 않는다</td></tr>
            <tr><td>2. 의미 토큰</td><td><code>--color-*</code> · <code>--fs-*</code> · <code>--radius-control</code> 등</td><td>사이트마다 여기만 바꾼다</td></tr>
            <tr><td>3. UI 토큰</td><td><code>--ui-*</code> (shadcn neutral 값, 다크 모드 포함)</td><td>컴포넌트 색을 바꿀 때</td></tr>
            <tr><td>4. 컴포넌트</td><td><code>c-button</code> 등 12종의 CSS(+JS 모듈)</td><td>필요한 것만 복사해서 쓴다</td></tr>
          </tbody></table></div>`),
    };
  },
};

const start = {
  render() {
    const code = (s) => `<div class="doc-code" style="border:1px solid var(--ui-border);border-radius:var(--ui-radius-lg);overflow:clip"><pre class="doc-pre"><button class="doc-copy" type="button" data-copy-code>복사</button><code>${esc(s.trim())}</code></pre></div>`;
    return {
      html: head("시작하기", "사이트에 쓰는 법", "필요한 컴포넌트의 <b>CSS · JS 파일만 복사</b>해서 씁니다. 모두 같은 규칙으로 이름을 붙였기 때문에 서로 충돌하지 않습니다.")
        + sec("1. 파일 복사", code(`samples/
├─ tokens/tokens.css        ← 토큰(필수)
├─ base/reset.css           ← 공통 reset(필수)
└─ ui-kit/assets/
   ├─ css/components/c-button.css   ← 필요한 컴포넌트만
   └─ js/modules/dialog.js          ← 동작이 필요한 컴포넌트만`), { desc: "컴포넌트별로 필요한 파일은 각 쪽 맨 아래 <b>파일</b>에 적혀 있습니다." })
        + sec("2. CSS 연결", code(`/* assets/css/main.css — 레이어 순서를 먼저 선언하고 불러오기만 둔다 */
@layer reset, tokens, base, layout, components, sections, utilities;

@import "tokens.css";
@import "base/reset.css";
@import "components/c-button.css";
@import "components/c-dialog.css";`), { desc: "<code>@layer</code> 순서 덕분에 컴포넌트가 reset을 덮고, 유틸리티가 컴포넌트를 덮습니다. 선택자 싸움이 없습니다." })
        + sec("3. 동작 연결", code(`<script type="module" src="assets/js/main.js"></script>

<!-- data-module 이 붙은 요소를 찾아 modules/<이름>.js 를 연결한다 -->
<div data-module="dialog"> … </div>`), { desc: "<code>main.js</code>는 <code>data-module</code>·<code>data-effect</code>가 붙은 요소만 찾아 해당 모듈을 불러옵니다. 기능 코드는 모듈 파일에만 둡니다." })
        + sec("4. 이름 규칙", `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>접두사</th><th>의미</th><th>예</th></tr></thead><tbody>
            <tr><td><code>c-</code></td><td>컴포넌트(BEM: <code>블록__요소--변형</code>)</td><td><code>c-button--outline</code></td></tr>
            <tr><td><code>l-</code></td><td>레이아웃</td><td><code>l-kit</code></td></tr>
            <tr><td><code>u-</code></td><td>유틸리티(한 가지 일만)</td><td><code>u-visually-hidden</code></td></tr>
            <tr><td><code>js-</code></td><td>JS가 찾는 훅(스타일은 입히지 않는다)</td><td><code>js-dialog-open</code></td></tr>
            <tr><td><code>--ui-*</code></td><td>컴포넌트 토큰</td><td><code>--ui-primary</code></td></tr>
          </tbody></table></div>`)
        + sec("5. 다크 모드", code(`/* 시스템 설정을 자동으로 따른다. 직접 고를 때는 html 에 한 줄 */
document.documentElement.dataset.theme = "dark";   // 또는 "light"`), { desc: "오른쪽 위의 <b>다크 모드</b> 버튼이 이 방식으로 동작합니다. 선택은 브라우저에 저장됩니다." }),
    };
  },
};

export const FOUNDATIONS = { overview, start, color, typography, spacing, radius, shadow, motion, layout };

// 컴포넌트 문서 데이터. 미리보기와 코드는 같은 html 문자열에서 만들어 서로 어긋나지 않는다.
// 모양 값은 assets/css/components/*.css 를, 동작은 assets/js/modules/*.js 를 기준으로 적었다.
// example: { title, desc, html, layout: "row"(기본) | "stack" | "grid" }

const CHEVRON = `<svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m7 10 5 5 5-5z"/></svg>`;
const ARROW = `<svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.3 5.3 10.7 4l8 8-8 8-1.4-1.3 6.6-6.7z"/></svg>`;
const CLOSE = `<svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>`;

export const COMPONENTS = [
  {
    id: "button",
    name: "버튼",
    en: "Button",
    lead: "사용자가 누르는 모든 행동의 기본 모양입니다. 종류 6가지와 크기 3가지가 있고, 이동은 <code>&lt;a&gt;</code>, 실행은 <code>&lt;button&gt;</code>에 같은 클래스를 씁니다.",
    meta: ["&lt;button&gt; · &lt;a&gt;", "JS 필요 없음", "키보드 Enter · Space"],
    examples: [
      {
        title: "종류",
        desc: "화면의 주된 행동은 기본(primary) 하나만 둡니다.",
        html: `
<button class="c-button" type="button">기본</button>
<button class="c-button c-button--secondary" type="button">보조</button>
<button class="c-button c-button--outline" type="button">외곽선</button>
<button class="c-button c-button--ghost" type="button">고스트</button>
<button class="c-button c-button--destructive" type="button">삭제</button>
<button class="c-button c-button--link" type="button">링크</button>`,
      },
      {
        title: "크기와 아이콘",
        desc: "높이는 작게 32px · 보통 36px · 크게 40px. 터치 기기(<code>pointer: coarse</code>)에서는 작은 버튼도 최소 44px로 넓어집니다.",
        html: `
<button class="c-button c-button--sm" type="button">작게</button>
<button class="c-button" type="button">보통</button>
<button class="c-button c-button--lg" type="button">크게</button>
<button class="c-button c-button--outline c-button--icon" type="button" aria-label="다음">${ARROW}</button>
<button class="c-button" type="button">다음 단계 ${ARROW}</button>`,
      },
      {
        title: "상태",
        desc: "비활성은 <code>disabled</code> 속성으로, 링크 모양 버튼은 <code>aria-disabled=\"true\"</code>로 만듭니다.",
        html: `
<button class="c-button" type="button" disabled>비활성</button>
<button class="c-button c-button--outline" type="button" disabled>비활성</button>
<a class="c-button c-button--secondary" href="#/button" aria-disabled="true">링크 비활성</a>`,
      },
    ],
    classes: [
      ["c-button", "기본 버튼. 단독으로 쓰면 primary(진한 바탕 + 밝은 글자)"],
      ["c-button--secondary", "보조 행동. 옅은 회색 바탕"],
      ["c-button--outline", "테두리만 있는 버튼. 취소·보기 같은 부가 행동"],
      ["c-button--ghost", "바탕 없이 hover 때만 배경이 생김. 도구 모음·닫기"],
      ["c-button--destructive", "삭제·해지처럼 되돌리기 어려운 행동"],
      ["c-button--link", "밑줄 링크처럼 보이는 버튼"],
      ["c-button--sm / --lg", "크기 변형(기본은 보통)"],
      ["c-button--icon", "아이콘만 있는 정사각형 버튼. aria-label 필수"],
      ["c-button__icon", "버튼 안 SVG 아이콘(글자 크기를 따라감)"],
    ],
    states: [
      ["hover", "배경이 한 단계 진해짐 (마우스가 있는 기기에서만)", ":hover (@media (hover: hover))"],
      ["focus", "3px 포커스 링", ":focus-visible"],
      ["disabled", "흐려지고 눌리지 않음", ":disabled · [aria-disabled=\"true\"]"],
    ],
    dos: ["한 영역의 주된 행동은 기본 버튼 하나만 둔다.", "아이콘 버튼에는 <code>aria-label</code>로 이름을 단다.", "이동은 <code>&lt;a class=\"c-button\"&gt;</code>로 쓴다."],
    donts: ["삭제·결제 취소에 기본 버튼을 쓰지 않는다 — <code>--destructive</code>를 쓴다.", "버튼 글자를 \"확인\"·\"클릭\"처럼 모호하게 쓰지 않는다.", "페이지 이동에 <code>&lt;button&gt;</code>과 JS를 쓰지 않는다."],
    a11y: ["키보드: Tab으로 이동, Enter·Space로 실행.", "포커스 링은 항상 보이며 3px(<code>--ui-ring-width</code>).", "터치 기기에서는 작은 버튼(<code>--sm</code>)도 최소 44px(<code>--tap-min</code>)로 넓어진다.", "비활성 버튼은 키보드 포커스에서 빠진다."],
    tokens: ["--ui-primary", "--ui-primary-foreground", "--ui-secondary", "--ui-accent", "--ui-destructive", "--ui-border", "--ui-ring", "--ui-control-h", "--ui-radius-md", "--shadow-xs", "--tap-min"],
    files: ["css/components/c-button.css"],
  },

  {
    id: "input",
    name: "입력",
    en: "Input · Field",
    lead: "브라우저 기본 <code>&lt;input&gt;</code>에 모양만 입힌 입력칸과, 라벨·도움말·오류 문구를 묶는 <code>c-field</code>입니다.",
    meta: ["&lt;input&gt; · &lt;label&gt;", "JS 필요 없음", "모바일 글자 16px"],
    examples: [
      {
        title: "기본 · 도움말 · 오류",
        desc: "오류는 <code>aria-invalid=\"true\"</code>와 <code>aria-describedby</code>로 입력칸과 연결합니다.",
        layout: "stack",
        html: `
<div class="c-field">
  <label class="c-field__label" for="ex-email">이메일</label>
  <input class="c-input" id="ex-email" type="email" placeholder="name@example.com" autocomplete="email">
  <p class="c-field__hint">소식지를 받을 주소를 입력하세요.</p>
</div>
<div class="c-field">
  <label class="c-field__label" for="ex-name">이름</label>
  <input class="c-input" id="ex-name" type="text" aria-invalid="true" aria-describedby="ex-name-error">
  <p class="c-field__error" id="ex-name-error">이름을 입력하세요.</p>
</div>
<div class="c-field">
  <label class="c-field__label" for="ex-off">회사명</label>
  <input class="c-input" id="ex-off" type="text" value="보람찬크루" disabled>
</div>`,
      },
    ],
    classes: [
      ["c-field", "라벨 + 입력 + 문구를 세로로 묶는 래퍼"],
      ["c-field--inline", "체크박스·스위치처럼 입력과 라벨을 가로로 놓을 때"],
      ["c-field__label", "라벨. 반드시 <code>for</code>로 입력과 연결"],
      ["c-field__hint", "도움말(옅은 글자)"],
      ["c-field__error", "오류 문구(빨강). 입력의 <code>aria-describedby</code>로 연결"],
      ["c-input", "한 줄 입력칸. <code>type</code>은 email·tel·url·search 등 그대로 사용"],
    ],
    states: [
      ["focus", "테두리 + 3px 링", ":focus-visible"],
      ["invalid", "빨간 테두리와 링", "[aria-invalid=\"true\"]"],
      ["disabled", "흐려지고 입력 불가", ":disabled"],
    ],
    dos: ["모든 입력에 보이는 라벨을 둔다.", "알맞은 <code>type</code>과 <code>autocomplete</code>를 쓴다(모바일 키보드가 맞춰 바뀐다).", "오류는 어떻게 고치면 되는지까지 적는다."],
    donts: ["<code>placeholder</code>를 라벨 대신 쓰지 않는다.", "글자 크기를 16px 아래로 줄이지 않는다 — 아이폰에서 화면이 확대된다.", "오류를 색만으로 알리지 않는다."],
    a11y: ["라벨은 <code>for</code>/<code>id</code>로 연결해 누르면 입력에 포커스가 간다.", "오류 문구는 <code>aria-describedby</code>로 읽히게 한다.", "모바일에서는 입력 글자가 16px로 유지된다."],
    tokens: ["--ui-input", "--ui-foreground", "--ui-muted-foreground", "--ui-destructive", "--ui-ring", "--ui-control-h", "--ui-radius-md", "--shadow-xs"],
    files: ["css/components/c-field.css", "css/components/c-input.css"],
  },

  {
    id: "checkbox",
    name: "체크박스",
    en: "Checkbox",
    lead: "여러 개 중 해당하는 것을 고르는 입력입니다. 브라우저 기본 <code>&lt;input type=\"checkbox\"&gt;</code>에 <code>appearance: none</code>으로 모양만 바꿨습니다.",
    meta: ["&lt;input type=checkbox&gt;", "JS 필요 없음", "키보드 Space"],
    examples: [
      {
        title: "기본",
        layout: "stack",
        html: `
<div class="c-field c-field--inline">
  <input class="c-checkbox" id="ex-cb1" type="checkbox" checked>
  <label class="c-field__label" for="ex-cb1">개인정보 수집에 동의합니다</label>
</div>
<div class="c-field c-field--inline">
  <input class="c-checkbox" id="ex-cb2" type="checkbox">
  <label class="c-field__label" for="ex-cb2">소식지를 받습니다</label>
</div>
<div class="c-field c-field--inline">
  <input class="c-checkbox" id="ex-cb3" type="checkbox" disabled>
  <label class="c-field__label" for="ex-cb3">비활성</label>
</div>`,
      },
    ],
    classes: [["c-checkbox", "체크박스 본체. 선택하면 체크 표시가 그려지며 나타남"], ["c-field--inline", "체크박스와 라벨을 가로로 놓는 래퍼"]],
    states: [["checked", "바탕이 채워지고 체크 표시가 나타남", ":checked"], ["focus", "3px 링", ":focus-visible"], ["disabled", "흐려짐", ":disabled"]],
    dos: ["라벨을 눌러도 토글되게 <code>for</code>로 연결한다.", "서로 독립적인 선택에 쓴다."],
    donts: ["여러 개 중 하나만 고르는 곳에 쓰지 않는다 — 라디오를 쓴다.", "즉시 켜지고 꺼지는 설정에는 쓰지 않는다 — 스위치를 쓴다."],
    a11y: ["Space로 토글한다.", "라벨 연결이 없으면 스크린리더가 이름을 읽지 못한다."],
    tokens: ["--ui-input", "--ui-primary", "--ui-primary-foreground", "--ui-ring", "--ui-duration-toggle", "--radius-sm"],
    files: ["css/components/c-checkbox.css"],
  },

  {
    id: "switch",
    name: "스위치",
    en: "Switch",
    lead: "눌러서 즉시 켜고 끄는 설정입니다. 체크박스에 <code>role=\"switch\"</code>를 달아 스크린리더가 \"스위치\"로 읽게 합니다.",
    meta: ["&lt;input role=switch&gt;", "JS 필요 없음", "키보드 Space"],
    examples: [
      {
        title: "기본",
        layout: "stack",
        html: `
<div class="c-field c-field--inline">
  <input class="c-switch" id="ex-sw1" type="checkbox" role="switch">
  <label class="c-field__label" for="ex-sw1">알림 받기</label>
</div>
<div class="c-field c-field--inline">
  <input class="c-switch" id="ex-sw2" type="checkbox" role="switch" checked>
  <label class="c-field__label" for="ex-sw2">자동 저장</label>
</div>
<div class="c-field c-field--inline">
  <input class="c-switch" id="ex-sw3" type="checkbox" role="switch" disabled>
  <label class="c-field__label" for="ex-sw3">비활성</label>
</div>`,
      },
    ],
    classes: [["c-switch", "스위치 본체(트랙 + 움직이는 손잡이)"], ["c-field--inline", "스위치와 라벨을 가로로 놓는 래퍼"]],
    states: [["checked(켜짐)", "트랙이 채워지고 손잡이가 오른쪽으로 이동", ":checked"], ["focus", "3px 링", ":focus-visible"], ["disabled", "흐려짐", ":disabled"]],
    dos: ["눌렀을 때 바로 적용되는 설정에 쓴다(저장 버튼이 없는 경우).", "라벨은 켜진 상태를 설명하는 이름으로 쓴다(\"알림 받기\")."],
    donts: ["\"제출\" 단계가 있는 폼에는 쓰지 않는다 — 체크박스를 쓴다.", "라벨을 \"켜기/끄기\"처럼 상태 그 자체로 쓰지 않는다."],
    a11y: ["<code>role=\"switch\"</code>로 켜짐/꺼짐이 읽힌다.", "Space로 토글한다.", "움직임 줄이기 설정에서는 이동 효과가 꺼진다."],
    tokens: ["--ui-input", "--ui-primary", "--ui-switch-thumb", "--ui-switch-thumb-on", "--ui-duration-toggle", "--ui-ease-toggle", "--ui-ring"],
    files: ["css/components/c-switch.css"],
  },

  {
    id: "badge",
    name: "배지",
    en: "Badge",
    lead: "상태·분류를 짧게 표시하는 작은 알약입니다. 누르는 요소가 아니라 정보를 보여 주는 용도입니다.",
    meta: ["&lt;span&gt;", "JS 필요 없음", "상호작용 없음"],
    examples: [
      {
        title: "종류",
        html: `
<span class="c-badge">기본</span>
<span class="c-badge c-badge--secondary">보조</span>
<span class="c-badge c-badge--outline">외곽선</span>
<span class="c-badge c-badge--destructive">마감</span>`,
      },
    ],
    classes: [["c-badge", "기본(진한 바탕)"], ["c-badge--secondary", "옅은 회색 바탕 — 분류·개수"], ["c-badge--outline", "테두리만 — 중립 정보"], ["c-badge--destructive", "빨간 바탕 — 마감·오류 같은 경고 상태"]],
    states: [],
    dos: ["두세 글자의 짧은 말로 쓴다(\"신규\", \"마감\", \"12편\").", "색만 다른 같은 뜻을 여러 종류로 만들지 않는다."],
    donts: ["눌러서 동작하는 요소로 쓰지 않는다 — 버튼을 쓴다.", "긴 문장을 넣지 않는다."],
    a11y: ["색만으로 뜻을 전하지 않는다. 글자 자체가 상태를 말해야 한다.", "스크린리더는 글자를 그대로 읽는다."],
    tokens: ["--ui-primary", "--ui-secondary", "--ui-destructive", "--ui-border", "--radius-full", "--text-xs"],
    files: ["css/components/c-badge.css"],
  },

  {
    id: "card",
    name: "카드",
    en: "Card",
    lead: "관련된 정보를 한 덩어리로 묶는 상자입니다. 머리·본문·바닥 세 칸으로 나뉘고, 필요한 칸만 씁니다.",
    meta: ["&lt;article&gt;", "JS 필요 없음", "제목은 h3"],
    examples: [
      {
        title: "기본",
        layout: "grid",
        html: `
<article class="c-card">
  <div class="c-card__header">
    <h3 class="c-card__title">2025 지속가능경영 보고서</h3>
    <p class="c-card__description">환경·사회·지배구조 활동을 정리했습니다.</p>
  </div>
  <div class="c-card__content">
    <p>올해 처음으로 협력사 탄소 배출량까지 포함해 공개합니다.</p>
  </div>
  <div class="c-card__footer">
    <a class="c-button c-button--outline c-button--sm" href="#/card">요약 보기</a>
    <a class="c-button c-button--sm" href="#/card">내려받기</a>
  </div>
</article>
<article class="c-card">
  <div class="c-card__header">
    <h3 class="c-card__title">임직원 인터뷰</h3>
    <p class="c-card__description">50년을 함께한 사람들의 이야기</p>
  </div>
  <div class="c-card__footer">
    <span class="c-badge c-badge--secondary">영상 12편</span>
  </div>
</article>`,
      },
    ],
    classes: [["c-card", "카드 바깥 상자(테두리·둥근 모서리·옅은 그림자)"], ["c-card__header", "제목과 설명 영역"], ["c-card__title", "카드 제목"], ["c-card__description", "제목 아래 보조 설명"], ["c-card__content", "본문"], ["c-card__footer", "버튼·배지 같은 마무리 영역"]],
    states: [],
    dos: ["카드 하나에 주제 하나만 담는다.", "행동은 바닥(footer)에 모은다."],
    donts: ["카드 안에 카드를 겹치지 않는다.", "모든 영역을 카드로 감싸지 않는다 — 묶을 이유가 있는 것만."],
    a11y: ["제목은 페이지 구조에 맞는 단계(보통 h3)로 쓴다.", "카드 전체를 링크로 만들 때는 제목 안의 <code>&lt;a&gt;</code> 하나로 만든다."],
    tokens: ["--ui-card", "--ui-card-foreground", "--ui-border", "--ui-radius-xl", "--shadow-sm", "--ui-muted-foreground"],
    files: ["css/components/c-card.css"],
  },

  {
    id: "dialog",
    name: "모달",
    en: "Dialog",
    lead: "화면 위에 떠서 하나의 작업에 집중시키는 창입니다. 브라우저 기본 <code>&lt;dialog&gt;</code>를 써서 포커스 가두기와 Esc 닫기를 브라우저가 처리합니다.",
    meta: ["&lt;dialog&gt;", "modules/dialog.js", "키보드 Esc"],
    examples: [
      {
        title: "기본",
        desc: "열릴 때 살짝 커지며 나타나고(200ms), 어두운 배경이나 Esc로 닫힙니다. 닫으면 포커스가 처음 누른 버튼으로 돌아옵니다.",
        html: `
<div data-module="dialog">
  <button class="c-button c-button--outline js-dialog-open" type="button">프로필 수정</button>
  <dialog class="c-dialog js-dialog" aria-labelledby="ex-dialog-title" aria-describedby="ex-dialog-desc">
    <div class="c-dialog__header">
      <h3 class="c-dialog__title" id="ex-dialog-title">프로필 수정</h3>
      <p class="c-dialog__description" id="ex-dialog-desc">바꾼 내용은 저장을 눌러야 반영됩니다.</p>
    </div>
    <div class="c-field">
      <label class="c-field__label" for="ex-dialog-name">이름</label>
      <input class="c-input" id="ex-dialog-name" type="text" value="홍길동">
    </div>
    <div class="c-dialog__footer">
      <button class="c-button c-button--outline js-dialog-close" type="button" value="cancel">취소</button>
      <button class="c-button js-dialog-close" type="button" value="save">저장</button>
    </div>
    <button class="c-button c-button--ghost c-button--icon c-dialog__close js-dialog-close" type="button" value="close" aria-label="닫기">${CLOSE}</button>
  </dialog>
</div>`,
      },
    ],
    classes: [["c-dialog", "<code>&lt;dialog&gt;</code>에 붙이는 창 본체"], ["c-dialog__header / __title / __description", "제목과 설명(aria-labelledby·describedby로 연결)"], ["c-dialog__footer", "취소·확인 버튼 줄"], ["c-dialog__close", "오른쪽 위 닫기 버튼"], ["js-dialog-open / js-dialog-close", "JS 훅. 닫기 버튼의 <code>value</code>가 닫힌 뒤의 결과값(returnValue)"]],
    states: [["open", "배경이 어두워지고 창이 나타남", "[open]"]],
    dos: ["열기 버튼을 둔 <code>data-module=\"dialog\"</code> 래퍼 안에 <code>&lt;dialog&gt;</code>를 넣는다.", "제목과 설명을 <code>aria-labelledby</code>·<code>aria-describedby</code>로 연결한다.", "닫기 버튼을 반드시 둔다."],
    donts: ["모달 안에 모달을 또 열지 않는다.", "긴 문서·여러 단계 폼을 모달에 넣지 않는다 — 페이지로 만든다.", "닫을 수 없는 모달을 만들지 않는다."],
    a11y: ["열려 있는 동안 포커스가 창 안에 머문다(브라우저 기본).", "Esc로 닫히고, 닫은 뒤 포커스가 열었던 버튼으로 돌아온다.", "배경을 누르면 닫힌다(returnValue = backdrop).", "이벤트: <code>dialog:close</code>(detail.returnValue)."],
    tokens: ["--ui-background", "--ui-foreground", "--ui-overlay", "--ui-border", "--ui-radius-lg", "--shadow-lg", "--ui-dialog-w", "--ui-duration-dialog", "--ui-enter-scale"],
    files: ["css/components/c-dialog.css", "js/modules/dialog.js"],
  },

  {
    id: "menu",
    name: "드롭다운 메뉴",
    en: "Menu",
    lead: "버튼을 누르면 아래에 펼쳐지는 행동 목록입니다. 브라우저 기본 Popover API를 쓰고, 위치 잡기와 키보드 이동만 JS가 맡습니다.",
    meta: ["Popover API", "modules/menu.js", "키보드 ↑ ↓ Home End Esc"],
    examples: [
      {
        title: "기본",
        desc: "바깥을 누르거나 Esc로 닫히고, 화면 끝에서는 반대쪽으로 열립니다.",
        html: `
<div data-module="menu">
  <button class="c-button c-button--outline js-menu-trigger" type="button" popovertarget="ex-menu" aria-haspopup="menu" aria-expanded="false">
    내 계정 ${CHEVRON}
  </button>
  <div class="c-menu js-menu" id="ex-menu" popover role="menu" aria-label="내 계정">
    <div class="c-menu__label">홍길동</div>
    <hr class="c-menu__separator">
    <button class="c-menu__item" type="button" role="menuitem" data-value="profile">프로필 <span class="c-menu__shortcut">⇧⌘P</span></button>
    <button class="c-menu__item" type="button" role="menuitem" data-value="settings">설정 <span class="c-menu__shortcut">⌘,</span></button>
    <hr class="c-menu__separator">
    <button class="c-menu__item c-menu__item--destructive" type="button" role="menuitem" data-value="logout">로그아웃</button>
  </div>
</div>`,
      },
    ],
    classes: [["c-menu", "펼쳐지는 목록 상자(<code>popover</code> 속성과 함께)"], ["c-menu__item", "행동 항목(<code>role=\"menuitem\"</code>)"], ["c-menu__item--destructive", "삭제·로그아웃 같은 위험한 항목(빨강)"], ["c-menu__label", "목록 위쪽 이름표"], ["c-menu__separator", "구분선"], ["c-menu__shortcut", "오른쪽 정렬 단축키 표시"], ["js-menu-trigger / js-menu", "JS 훅(버튼과 목록)"]],
    states: [["hover · focus", "항목 배경이 강조됨", ":hover · :focus-visible"], ["open", "목록이 나타남", ":popover-open"]],
    dos: ["메뉴 항목은 <code>role=\"menuitem\"</code>로 쓴다.", "위험한 항목은 구분선 아래에 따로 둔다."],
    donts: ["페이지 이동 메뉴(내비게이션)에 쓰지 않는다 — 링크 목록을 쓴다.", "항목이 많아 스크롤되는 목록에 쓰지 않는다."],
    a11y: ["<kbd>↓</kbd> <kbd>↑</kbd>로 항목 이동(양 끝에서 순환), <kbd>Home</kbd> <kbd>End</kbd>로 처음·끝.", "<kbd>Esc</kbd>로 닫고 포커스가 버튼으로 돌아온다. <kbd>Tab</kbd>을 누르면 닫힌다.", "버튼의 <code>aria-expanded</code>가 열림 상태를 알린다."],
    tokens: ["--ui-popover", "--ui-popover-foreground", "--ui-accent", "--ui-border", "--ui-destructive", "--ui-radius-md", "--shadow-md", "--ui-enter-offset"],
    files: ["css/components/c-menu.css", "js/modules/menu.js"],
  },

  {
    id: "tooltip",
    name: "툴팁",
    en: "Tooltip",
    lead: "마우스를 올리거나 키보드로 포커스하면 나타나는 짧은 설명입니다. CSS만으로 동작합니다.",
    meta: ["CSS만", "JS 필요 없음", "키보드 포커스"],
    examples: [
      {
        title: "기본",
        desc: "<code>aria-describedby</code>로 설명을 버튼에 연결해 스크린리더도 읽습니다.",
        html: `
<span class="c-tooltip">
  <button class="c-button c-button--outline" type="button" aria-describedby="ex-tip">마우스를 올려 보세요</button>
  <span class="c-tooltip__content" id="ex-tip" role="tooltip">장바구니에 담기</span>
</span>`,
      },
    ],
    classes: [["c-tooltip", "트리거와 설명을 묶는 래퍼"], ["c-tooltip__content", "말풍선 본체(<code>role=\"tooltip\"</code>)"]],
    states: [["hover · focus", "나타남(95%에서 커지며 페이드)", ":hover · :focus-within"]],
    dos: ["한 줄의 짧은 보조 설명만 넣는다.", "아이콘 버튼의 이름을 보충할 때 쓴다."],
    donts: ["꼭 알아야 하는 정보를 툴팁에만 넣지 않는다 — 터치 기기에서는 보이지 않는다.", "버튼·링크가 들어 있는 풍부한 내용을 넣지 않는다."],
    a11y: ["키보드 포커스에서도 나타난다.", "<code>aria-describedby</code>로 연결해 읽힌다.", "중요한 정보는 화면에 직접 쓴다."],
    tokens: ["--ui-foreground", "--ui-background", "--ui-radius-md", "--ui-duration", "--ui-enter-scale", "--text-xs", "--z-overlay"],
    files: ["css/components/c-tooltip.css"],
  },

  {
    id: "accordion",
    name: "아코디언",
    en: "Accordion",
    lead: "제목을 눌러 내용을 펼치고 접는 목록입니다. 브라우저 기본 <code>&lt;details&gt;</code>를 쓰므로 JS가 필요 없습니다.",
    meta: ["&lt;details&gt;", "JS 필요 없음", "키보드 Enter · Space"],
    examples: [
      {
        title: "한 번에 하나만 열기",
        desc: "같은 <code>name</code>을 가진 항목끼리는 하나가 열리면 나머지가 닫힙니다. 지원 브라우저에서는 높이가 부드럽게 늘어납니다.",
        layout: "stack",
        html: `
<div class="c-accordion">
  <details class="c-accordion__item" name="ex-faq" open>
    <summary class="c-accordion__trigger">접근성을 지원하나요?
      <svg class="c-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m7 10 5 5 5-5z"/></svg>
    </summary>
    <div class="c-accordion__content">네. 브라우저 기본 요소를 써서 키보드와 스크린리더가 그대로 동작합니다.</div>
  </details>
  <details class="c-accordion__item" name="ex-faq">
    <summary class="c-accordion__trigger">프레임워크가 필요한가요?
      <svg class="c-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m7 10 5 5 5-5z"/></svg>
    </summary>
    <div class="c-accordion__content">아니요. HTML, CSS, 순수 JS 모듈만 씁니다.</div>
  </details>
</div>`,
      },
    ],
    classes: [["c-accordion", "항목들을 묶는 래퍼"], ["c-accordion__item", "<code>&lt;details&gt;</code> 항목. <code>name</code>이 같으면 하나만 열림"], ["c-accordion__trigger", "<code>&lt;summary&gt;</code> 제목줄"], ["c-accordion__icon", "펼침 방향 화살표(열리면 회전)"], ["c-accordion__content", "펼쳐지는 내용"]],
    states: [["open", "내용이 보이고 화살표가 뒤집힘", "[open]"], ["hover", "제목에 밑줄", ":hover"], ["focus", "3px 링", ":focus-visible"]],
    dos: ["자주 묻는 질문처럼 훑어 보는 목록에 쓴다.", "제목만 읽어도 내용을 짐작할 수 있게 쓴다."],
    donts: ["한눈에 모두 봐야 하는 중요한 내용을 숨기지 않는다.", "항목 안에 또 아코디언을 넣지 않는다."],
    a11y: ["Enter·Space로 열고 닫는다(브라우저 기본).", "스크린리더가 펼침 상태를 읽는다.", "움직임 줄이기 설정에서는 펼침 애니메이션이 꺼진다."],
    tokens: ["--ui-border", "--ui-muted-foreground", "--ui-radius-md", "--ui-duration-accordion", "--ui-ring"],
    files: ["css/components/c-accordion.css"],
  },

  {
    id: "tabs",
    name: "탭",
    en: "Tabs",
    lead: "같은 자리에서 관련된 내용을 바꿔 보여 주는 구성입니다. 한 번에 하나의 패널만 보입니다.",
    meta: ["role=tablist", "modules/tabs.js", "키보드 ← → Home End"],
    examples: [
      {
        title: "기본",
        desc: "선택된 탭만 Tab 키로 들어갈 수 있고(roving tabindex), 화살표로 다른 탭으로 옮깁니다.",
        layout: "stack",
        html: `
<div class="c-tabs" data-module="tabs">
  <div class="c-tabs__list" role="tablist" aria-label="연도별 보기">
    <button class="c-tabs__trigger" type="button" role="tab" id="ex-tab-1" aria-controls="ex-panel-1" aria-selected="true">1975–1999</button>
    <button class="c-tabs__trigger" type="button" role="tab" id="ex-tab-2" aria-controls="ex-panel-2" aria-selected="false" tabindex="-1">2000–2019</button>
    <button class="c-tabs__trigger" type="button" role="tab" id="ex-tab-3" aria-controls="ex-panel-3" aria-selected="false" tabindex="-1">2020–</button>
  </div>
  <div class="c-tabs__panel" role="tabpanel" id="ex-panel-1" aria-labelledby="ex-tab-1" tabindex="0">창립과 첫 공장, 수출 1억 달러 달성까지의 시기입니다.</div>
  <div class="c-tabs__panel" role="tabpanel" id="ex-panel-2" aria-labelledby="ex-tab-2" tabindex="0" hidden>해외 법인 설립과 사업 다각화의 시기입니다.</div>
  <div class="c-tabs__panel" role="tabpanel" id="ex-panel-3" aria-labelledby="ex-tab-3" tabindex="0" hidden>디지털 전환과 지속가능경영의 시기입니다.</div>
</div>`,
      },
    ],
    classes: [["c-tabs", "탭 전체 래퍼(<code>data-module=\"tabs\"</code>)"], ["c-tabs__list", "탭 버튼 줄(<code>role=\"tablist\"</code>)"], ["c-tabs__trigger", "탭 버튼(<code>role=\"tab\"</code> + <code>aria-controls</code>)"], ["c-tabs__panel", "내용 패널(<code>role=\"tabpanel\"</code>)"]],
    states: [["selected", "흰 바탕과 그림자로 도드라짐", "[aria-selected=\"true\"]"], ["hover", "글자가 진해짐", ":hover"], ["focus", "3px 링", ":focus-visible"]],
    dos: ["탭 이름은 짧게, 서로 같은 종류의 내용으로 맞춘다.", "첫 탭에 가장 많이 보는 내용을 둔다."],
    donts: ["탭 안에서 페이지가 이동하게 만들지 않는다 — 링크를 쓴다.", "탭이 너무 많아 가로로 넘치게 하지 않는다."],
    a11y: ["<kbd>←</kbd> <kbd>→</kbd>로 이동(양 끝에서 순환), <kbd>Home</kbd> <kbd>End</kbd>로 처음·끝.", "선택된 탭만 <kbd>Tab</kbd>으로 들어가고, 이어서 패널로 이동한다.", "이벤트: <code>tabs:change</code>(detail.index)."],
    tokens: ["--ui-muted", "--ui-background", "--ui-foreground", "--ui-muted-foreground", "--ui-radius-lg", "--ui-tabs-pad", "--ui-control-h", "--shadow-sm"],
    files: ["css/components/c-tabs.css", "js/modules/tabs.js"],
  },

  {
    id: "toast",
    name: "토스트",
    en: "Toast",
    lead: "작업 결과를 잠깐 알리는 작은 알림입니다. 아래에서 올라오며 나타나고 4초 뒤 사라집니다.",
    meta: ["aria-live 영역", "modules/toast.js", "마우스·포커스 시 멈춤"],
    examples: [
      {
        title: "기본",
        desc: "문구는 버튼의 <code>data-toast-title</code>·<code>data-toast-description</code>에서 가져옵니다. 마우스를 올리거나 포커스하면 사라지는 시간이 멈춥니다.",
        html: `
<div data-module="toast">
  <button class="c-button c-button--outline js-toast-trigger" type="button" data-toast-title="저장했습니다" data-toast-description="2026년 11월 11일 오후 3:40">토스트 띄우기</button>
  <div class="c-toaster js-toaster" role="region" aria-label="알림" aria-live="polite"></div>
  <template class="js-toast-template">
    <div class="c-toast" role="status">
      <div class="c-toast__body">
        <p class="c-toast__title js-toast-title"></p>
        <p class="c-toast__description js-toast-description"></p>
      </div>
      <button class="c-button c-button--sm js-toast-close" type="button">닫기</button>
    </div>
  </template>
</div>`,
      },
    ],
    classes: [["c-toaster", "토스트가 쌓이는 고정 영역(<code>aria-live=\"polite\"</code>)"], ["c-toast", "알림 하나"], ["c-toast__title / __description", "제목과 보조 설명"], ["js-toast-trigger / js-toaster / js-toast-template", "JS 훅. <code>&lt;template&gt;</code>를 복제해 띄움"]],
    states: [["등장", "아래에서 올라오며 나타남(200ms)", ""], ["멈춤", "마우스를 올리거나 포커스하면 4초 타이머 정지", "pointerenter · focusin"]],
    dos: ["결과를 짧게 알린다(\"저장했습니다\").", "되돌릴 수 있는 동작이면 실행 취소 버튼을 둔다."],
    donts: ["꼭 읽어야 하는 오류를 토스트로만 알리지 않는다 — 화면에 남는 문구로 쓴다.", "한 번에 여러 개를 쌓지 않는다."],
    a11y: ["알림 영역이 <code>aria-live=\"polite\"</code>라 스크린리더가 읽는다.", "마우스·포커스 중에는 사라지지 않는다.", "닫기 버튼으로 직접 닫을 수 있다."],
    tokens: ["--ui-popover", "--ui-popover-foreground", "--ui-border", "--ui-radius-lg", "--shadow-lg", "--ui-toast-w", "--ui-duration-dialog", "--z-overlay"],
    files: ["css/components/c-toaster.css", "css/components/c-toast.css", "js/modules/toast.js"],
  },
];

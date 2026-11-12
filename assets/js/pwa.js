/* PWA 연결: 서비스 워커 등록 + 설치 안내.
   쪽에 <script src="assets/js/pwa.js" defer></script> 한 줄만 두면 된다(데모 쪽은 demo-frame.js 가 불러온다).
   - manifest 링크와 모바일 앱 메타가 없으면 넣어 준다(데모 쪽 포함 어디서든 설치할 수 있게).
   - 서비스 워커는 사이트 맨 위(sw.js)에 두고, 이 파일 위치로 사이트 주소를 계산한다.
   - [data-pwa-install] 버튼은 설치할 수 있을 때만 보이고, [data-pwa-ios] 안내는 아이폰 사파리에서만 보인다.
   - 새 서비스 워커가 준비되면 다음 이동 때 자연스럽게 바뀐다(강제로 새로고침하지 않는다). */
(() => {
  const me = document.currentScript;
  const root = new URL("../../", me ? me.src : location.href); // assets/js/pwa.js 기준 사이트 맨 위
  const head = document.head;

  const addMeta = (name, content) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const m = document.createElement("meta");
      m.name = name;
      m.content = content;
      head.append(m);
    }
  };
  if (!document.querySelector('link[rel="manifest"]')) {
    const l = document.createElement("link");
    l.rel = "manifest";
    l.href = new URL("manifest.webmanifest", root).href;
    head.append(l);
  }
  addMeta("mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-title", "보람찬크루");
  addMeta("apple-mobile-web-app-status-bar-style", "black");

  // 서비스 워커 등록(https 또는 localhost 에서만 동작)
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("sw.js", root).href, { scope: root.href }).catch((error) => console.warn("[pwa] 서비스 워커 등록 실패", error));
    });
  }

  // 설치 안내
  const standalone = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some((m) => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
  const installButtons = () => [...document.querySelectorAll("[data-pwa-install]")];
  const iosHints = () => [...document.querySelectorAll("[data-pwa-ios]")];
  let deferred = null;

  addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // 브라우저 기본 배너 대신 사이트의 버튼으로 안내한다
    deferred = event;
    installButtons().forEach((b) => (b.hidden = false));
  });

  addEventListener("appinstalled", () => {
    deferred = null;
    installButtons().forEach((b) => (b.hidden = true));
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-pwa-install]");
    if (!button || !deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    installButtons().forEach((b) => (b.hidden = true));
  });

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const showIos = () => {
    if (ios && !standalone) iosHints().forEach((h) => (h.hidden = false));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showIos);
  else showIos();

  /* 설치 안내 토스트: 설치할 수 있을 때 아래쪽에 한 번 띄운다. 닫기를 누르면 7일 동안 다시 안 띄운다.
     (데모 쪽처럼 main.css 가 없는 쪽에서도 보이도록 스타일을 여기서 함께 넣는다) */
  const KEY = "crew-pwa-toast-until";
  const snoozed = () => {
    try {
      return Number(localStorage.getItem(KEY)) > Date.now();
    } catch {
      return false;
    }
  };
  const snooze = () => {
    try {
      localStorage.setItem(KEY, String(Date.now() + 7 * 24 * 3600 * 1000));
    } catch {
      /* 저장이 막혀 있으면 이번 방문에서만 닫힌다 */
    }
  };
  /* 공지 띠(UI 키트의 c-announce 와 같은 모양): 페이지 맨 위 흐름 안에 들어가 아래 내용을 밀어 내리고,
     닫으면 높이가 접히며 사라진다. 떠 있는 머리줄은 띠 높이만큼 내려가 가려지지 않는다(--pwa-off). */
  let toast = null;
  let offTick = null;
  const setOff = () => {
    const h = toast ? Math.max(0, toast.getBoundingClientRect().bottom) : 0; // 화면 위에서 띠가 차지하는 높이
    document.documentElement.style.setProperty("--pwa-off", `${h}px`);
  };
  const closeToast = (remember = true) => {
    if (remember) snooze();
    if (!toast) return;
    const t = toast;
    t.classList.remove("is-in");
    const done = () => {
      if (toast === t) toast = null;
      t.remove();
      cancelAnimationFrame(offTick);
      document.documentElement.style.removeProperty("--pwa-off");
    };
    setTimeout(done, 450);
    const follow = () => {
      setOff();
      if (toast === t) offTick = requestAnimationFrame(follow);
    };
    follow();
  };
  const openToast = () => {
    if (toast || standalone || snoozed()) return;
    if (!document.getElementById("pwa-toast-css")) {
      const s = document.createElement("style");
      s.id = "pwa-toast-css";
      s.textContent = `
        .pwa-toast{display:grid;grid-template-rows:0fr;transition:grid-template-rows 400ms cubic-bezier(.22,1,.36,1);font:500 14px/1.45 Pretendard,system-ui,sans-serif}
        .pwa-toast.is-in{grid-template-rows:1fr}
        .pwa-toast__in{display:flex;align-items:center;justify-content:center;gap:12px;min-height:0;overflow:hidden;color:#fff;background:linear-gradient(90deg,oklch(.58 .23 288),oklch(.6 .22 266));background-color:#6a4dff}
        .pwa-toast__msg{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px 8px;padding:10px 0 10px max(16px,env(safe-area-inset-left))}
        .pwa-toast__tag{padding:2px 8px;font-size:12px;font-weight:700;color:#5b3bd6;background:#fff;border-radius:999px}
        .pwa-toast button{font:inherit;cursor:pointer;border:0;-webkit-tap-highlight-color:transparent}
        .pwa-toast__go{padding:4px 12px;font-size:13px;font-weight:700;color:#5b3bd6;background:#fff;border-radius:999px}
        .pwa-toast__x{flex:none;display:grid;place-items:center;width:28px;height:28px;margin-right:max(8px,env(safe-area-inset-right));color:#fff;background:transparent;border-radius:999px;opacity:.85}
        .pwa-toast__x:hover{opacity:1}
        .pwa-toast button:focus-visible{outline:3px solid #fff;outline-offset:2px}
        .c-site-nav{top:calc(var(--space-3, .75rem) + var(--pwa-off,0px))}
        .d-nav{top:calc(.75rem + var(--pwa-off,0px))}
        .c-site-nav__panel{top:calc(var(--tr-nav-h) + var(--space-5) + var(--pwa-off,0px))}
        .d-nav__panel{top:calc(.75rem + var(--d-nav-h) + .5rem + var(--pwa-off,0px));max-height:calc(100svh - var(--d-nav-h) - 2.5rem - var(--pwa-off,0px))}
        @media (max-width:480px){.pwa-toast__tag{display:none}}
        @media (prefers-reduced-motion:reduce){.pwa-toast{transition:none}}`;
      document.head.append(s);
    }
    toast = document.createElement("div");
    toast.className = "pwa-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML =
      '<div class="pwa-toast__in"><div class="pwa-toast__msg"><span class="pwa-toast__tag">앱 설치</span><span class="pwa-toast__text"></span>' +
      (deferred ? '<button type="button" class="pwa-toast__go">설치</button>' : "") +
      '</div><button type="button" class="pwa-toast__x" aria-label="안내 닫기"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>';
    toast.querySelector(".pwa-toast__text").textContent = deferred ? "홈 화면에 두고 앱처럼 바로 열어 보세요." : '공유 버튼 → "홈 화면에 추가"로 앱처럼 설치할 수 있어요.';
    toast.querySelector(".pwa-toast__x").addEventListener("click", () => closeToast());
    const go = toast.querySelector(".pwa-toast__go");
    if (go)
      go.addEventListener("click", async () => {
        if (!deferred) return;
        deferred.prompt();
        await deferred.userChoice;
        deferred = null;
        installButtons().forEach((b) => (b.hidden = true));
        closeToast(false);
      });
    document.body.prepend(toast);
    const t0 = performance.now();
    const track = () => {
      setOff();
      if (toast && performance.now() - t0 < 600) offTick = requestAnimationFrame(track); // 펼쳐지는 동안만 따라가고, 이후엔 스크롤 때만 갱신
    };
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!toast) return;
        toast.classList.add("is-in");
        track();
      }),
    );
  };
  addEventListener("scroll", () => toast && setOff(), { passive: true });
  const later = (fn) => setTimeout(fn, 2500); // 화면이 자리 잡은 뒤에 띄운다
  addEventListener("beforeinstallprompt", () => later(openToast));
  addEventListener("appinstalled", () => closeToast(false));
  if (ios && !standalone) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => later(openToast));
    else later(openToast);
  }
})();

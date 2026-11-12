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
  let toast = null;
  const closeToast = (remember = true) => {
    if (remember) snooze();
    if (!toast) return;
    const t = toast;
    toast = null;
    t.classList.remove("is-in");
    setTimeout(() => t.remove(), 400);
  };
  const openToast = () => {
    if (toast || standalone || snoozed()) return;
    if (!document.getElementById("pwa-toast-css")) {
      const s = document.createElement("style");
      s.id = "pwa-toast-css";
      s.textContent = `
        .pwa-toast{position:fixed;z-index:2147483000;left:50%;bottom:max(16px,env(safe-area-inset-bottom));width:min(420px,calc(100vw - 32px));box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 16px;color:#eef1fa;background:#161a2b;border:1px solid #2b3250;border-radius:16px;box-shadow:0 12px 40px rgb(0 0 0/45%);font:500 14px/1.45 Pretendard,system-ui,sans-serif;transform:translate(-50%,24px);opacity:0;transition:transform 400ms cubic-bezier(.2,.9,.3,1.2),opacity 300ms}
        .pwa-toast.is-in{transform:translate(-50%,0);opacity:1}
        .pwa-toast__text{flex:1;min-width:0}
        .pwa-toast__text b{display:block;font-weight:700}
        .pwa-toast__text span{display:block;font-size:13px;color:#a9b1cf}
        .pwa-toast button{font:inherit;cursor:pointer;border:0;border-radius:999px;-webkit-tap-highlight-color:transparent}
        .pwa-toast__go{padding:8px 14px;font-weight:700;color:#fff;background:#3b6cff}
        .pwa-toast__x{flex:none;width:32px;height:32px;font-size:20px;line-height:1;color:#a9b1cf;background:transparent}
        .pwa-toast button:focus-visible{outline:3px solid #7fa0ff;outline-offset:2px}
        @media (prefers-reduced-motion:reduce){.pwa-toast{transition:opacity 200ms;transform:translate(-50%,0)}}`;
      document.head.append(s);
    }
    toast = document.createElement("div");
    toast.className = "pwa-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML =
      '<div class="pwa-toast__text"><b>앱으로 설치할 수 있어요</b><span></span></div>' +
      (deferred ? '<button type="button" class="pwa-toast__go">설치</button>' : "") +
      '<button type="button" class="pwa-toast__x" aria-label="닫기">×</button>';
    toast.querySelector("span").textContent = deferred ? "홈 화면에 두고 앱처럼 바로 열어 보세요." : '공유 버튼 → "홈 화면에 추가"를 눌러 주세요.';
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
    document.body.append(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast && toast.classList.add("is-in")));
  };
  const later = (fn) => setTimeout(fn, 2500); // 화면이 자리 잡은 뒤에 띄운다
  addEventListener("beforeinstallprompt", () => later(openToast));
  addEventListener("appinstalled", () => closeToast(false));
  if (ios && !standalone) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => later(openToast));
    else later(openToast);
  }
})();

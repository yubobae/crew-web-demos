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
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
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
})();

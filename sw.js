/* 보람찬크루 서비스 워커: 설치할 수 있게 하고, 인터넷이 없어도 이미 본 쪽을 보여 준다.
   예전 CSS가 붙잡히는 일(컨벤션 10-1)이 다시 생기지 않도록 이렇게 움직인다.
   - 쪽(HTML): 항상 서버에 최신을 물어보고(no-cache), 안 될 때만 저장본·오프라인 쪽을 보여 준다.
   - ?v= 도장이 붙은 CSS·JS: 주소에 버전이 들어 있으므로 저장본을 바로 쓴다(바뀌면 주소가 바뀐다).
   - 이미지·글꼴·도장 없는 파일: 저장본을 먼저 보여 주고 뒤에서 새로 받아 둔다.
   - 동영상(Range 요청)·다른 사이트 요청(CDN 글꼴 제외)은 건드리지 않는다.
   VERSION 은 배포 때 tools/stamp-version.mjs 가 바꾼다. 바뀌면 옛 저장소를 지운다. */
const VERSION = "202611121943";
const CACHE = `crew-${VERSION}`;
const SCOPE = self.registration.scope;
const PRECACHE = ["offline.html", "manifest.webmanifest", "assets/media/icons/icon-192.png", "assets/media/icons/icon-512.png"];
const MAX_ENTRIES = 160;
const NAV_TIMEOUT_MS = 5000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((p) => new URL(p, SCOPE).href))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("crew-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_ENTRIES) await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k)));
}

async function put(request, response) {
  if (!response || !response.ok || response.type === "opaque") return;
  const copy = response.clone(); // 페이지가 본문을 읽기 전에 먼저 복제한다(기다린 뒤에 복제하면 "이미 읽음" 오류가 난다)
  const cache = await caches.open(CACHE);
  await cache.put(request, copy);
  trim(cache);
}

// 쪽: 서버에 최신을 먼저 물어본다. 시간이 넘거나 실패하면 저장본, 그것도 없으면 오프라인 쪽.
async function networkFirst(request) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), NAV_TIMEOUT_MS);
  try {
    const response = await fetch(request, { cache: "no-cache", signal: ctrl.signal });
    clearTimeout(timer);
    put(request, response);
    return response;
  } catch {
    clearTimeout(timer);
    const cache = await caches.open(CACHE);
    return (await cache.match(request, { ignoreSearch: true })) || (await cache.match(new URL("offline.html", SCOPE).href)) || Response.error();
  }
}

// 주소에 ?v= 가 있는 파일: 저장본이 있으면 그대로(주소가 곧 버전)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  put(request, response);
  return response;
}

// 그 밖의 파일: 저장본을 먼저 보여 주고 뒤에서 새로 받아 둔다
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      put(request, response);
      return response;
    })
    .catch(() => hit);
  return hit || fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // 글꼴 CSS·파일(Pretendard)만 저장해 둔다
    if (url.hostname === "cdn.jsdelivr.net") event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (!url.href.startsWith(SCOPE)) return;
  if (/\.(?:mp4|webm|mov|m4v)$/i.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.searchParams.has("v")) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// 페이지가 "지금 바로 새 버전으로" 요청할 때
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

// 배포 전 버전 도장(데모 사이트용): 브라우저가 예전 CSS·JS를 붙잡고 있지 않게 파일 주소 뒤에 ?v=버전을 붙인다.
//   node tools/stamp-version.mjs [버전]        (이 저장소 루트에서 실행)
// 하네스의 tools/stamp-version.mjs 와 같은 규칙(컨벤션 10-1)이되, 하위 폴더(데모 쪽)와 공통 틀 파일까지 처리한다.
// - 모든 *.html(하위 폴더 포함)에서 main.css, main.js, demo-frame.css/js, demo-skin.css 주소에 ?v=버전
// - 모든 assets/css/main.css(하위 폴더 포함)의 @import 주소마다 ?v=버전
// - pwa.js 주소에 ?v=버전, sw.js 의 VERSION 갱신
// 버전을 주지 않으면 지금 시각(예: 202611121530).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const v = process.argv[2] ?? `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;

const SKIP = new Set(["node_modules", ".git", ".claude", "tools"]);
const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (SKIP.has(e.name)) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

// 정규식은 문자열로 이어 붙이지 않고 RegExp 리터럴로 쓴다(역슬래시가 사라지는 일을 막는다)
const urlRe = /((?:\.\.\/)*assets\/(?:css\/main\.css|js\/main\.js|css\/demo-frame\.css|js\/demo-frame\.js|css\/demo-skin\.css|js\/pwa\.js))(\?v=[^"'\s>]*)?(?=["'\s>])/g;
const importRe = /@import\s+"([^"?]+)(\?v=[^"]*)?"/g;

let css = 0;
let pages = 0;
for (const f of walk(dir)) {
  const rel = path.relative(dir, f).split(path.sep).join("/");
  if (rel.endsWith("assets/css/main.css")) {
    writeFileSync(f, readFileSync(f, "utf8").replace(importRe, `@import "$1?v=${v}"`));
    css++;
  } else if (rel.endsWith(".html")) {
    const before = readFileSync(f, "utf8");
    const after = before.replace(urlRe, `$1?v=${v}`);
    if (after !== before) writeFileSync(f, after);
    pages++;
  }
}
// 서비스 워커의 VERSION(저장소 이름에 들어간다): 바뀌면 옛 저장소가 지워진다
const sw = path.join(dir, "sw.js");
try {
  writeFileSync(sw, readFileSync(sw, "utf8").replace(/const VERSION = "[^"]*";/, `const VERSION = "${v}";`));
} catch {
  /* sw.js 가 없으면 건너뜀 */
}
console.log(`버전 ${v}: 쪽 ${pages}개, main.css ${css}개`);

// 진입점: data-module / data-effect 가 붙은 요소를 찾아 해당 모듈을 불러와 연결한다.
// 기능 코드는 여기에 쓰지 않는다. 새 기능은 modules/ 또는 effects/ 에 파일로 추가한다.
//   <section data-module="gallery-filter">  → modules/gallery-filter.js
//   <section data-effect="text-reveal">     → effects/text-reveal.js
//   공백으로 여러 개 연결 가능: data-module="a b"

// 배포 버전(?v=)이 main.js 주소에 붙어 있으면 모듈에도 그대로 붙여, 브라우저가 예전 파일을 쓰지 않게 한다.
const VERSION = new URL(import.meta.url).search;

const LOADERS = {
  module: (name) => import(`./modules/${name}.js${VERSION}`),
  effect: (name) => import(`./effects/${name}.js${VERSION}`),
};

const mounted = [];

export async function mountAll(scope = document) {
  const tasks = [];
  for (const [kind, load] of Object.entries(LOADERS)) {
    for (const root of scope.querySelectorAll(`[data-${kind}]`)) {
      for (const name of root.dataset[kind].split(/\s+/).filter(Boolean)) {
        tasks.push(
          load(name)
            .then((mod) => mounted.push({ kind, name, instance: mod.init(root, { ...root.dataset }) }))
            .catch((error) => console.error(`[${kind}:${name}] 연결 실패`, error)),
        );
      }
    }
  }
  await Promise.all(tasks);
}

export function destroyAll() {
  while (mounted.length) mounted.pop().instance?.destroy?.();
}

mountAll();

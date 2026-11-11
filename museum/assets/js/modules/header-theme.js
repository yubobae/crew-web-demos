// 헤더 색 바꾸기: 풀페이지가 화면을 넘길 때(fullpage:change) 그 화면의 밝기(light|dark)에 맞춰
// 헤더에 is-on-light를 붙인다. 풀페이지가 꺼진 화면(모바일·하위 페이지)에서는 헤더 아래 섹션으로 판단하고,
// 조금 내려오면 바탕(is-scrolled)을 깐다.

export function init(root) {
  let frame = 0;
  const panels = [...document.querySelectorAll("[data-theme]")].filter((el) => el !== document.documentElement);

  const setTheme = (theme) => root.classList.toggle("is-on-light", theme === "light");
  const onFullpage = (event) => setTheme(event.detail.theme);

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const fullpage = !!document.querySelector(".l-fp.is-enabled");
      root.classList.toggle("is-scrolled", !fullpage && scrollY > 10);
      if (fullpage) return;
      const y = root.offsetHeight / 2;
      const hit = panels.find((p) => {
        const r = p.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      if (hit) setTheme(hit.dataset.theme);
    });
  };

  document.addEventListener("fullpage:change", onFullpage);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      document.removeEventListener("fullpage:change", onFullpage);
      removeEventListener("scroll", onScroll);
    },
  };
}

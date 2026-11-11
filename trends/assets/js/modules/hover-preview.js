// 링크에 올리면(또는 초점) 짝이 되는 그림이 바뀐다.
// root 안: .js-preview-link[data-preview="n"], .js-preview-shot(순서대로 n번)
export function init(root) {
  const links = [...root.querySelectorAll(".js-preview-link")];
  const shots = [...root.querySelectorAll(".js-preview-shot")];
  if (!links.length || !shots.length) return { destroy() {} };

  const show = (n) => {
    links.forEach((l) => l.classList.toggle("is-active", Number(l.dataset.preview) === n));
    shots.forEach((s, i) => s.classList.toggle("is-active", i === n));
  };
  const onEnter = (event) => show(Number(event.currentTarget.dataset.preview));

  links.forEach((l) => {
    l.addEventListener("pointerenter", onEnter);
    l.addEventListener("focus", onEnter);
  });
  show(0);

  return {
    destroy() {
      links.forEach((l) => {
        l.removeEventListener("pointerenter", onEnter);
        l.removeEventListener("focus", onEnter);
      });
    },
  };
}

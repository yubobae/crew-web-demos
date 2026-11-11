// 파일 끌어 놓기: 파일을 끌고 오면 root에 is-over. 놓거나(.js-drop-input으로) 고르면
// <template class="js-drop-tpl">로 목록 줄을 만들고 잠시 뒤 is-done(막대 참). 데모라 파일은 어디에도 보내지 않는다.
// 끌기 이벤트는 안쪽 요소를 지날 때도 생기므로 들어온 횟수를 세어 0일 때만 is-over를 뗀다.
const fmt = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`);

export function init(root) {
  const zone = root.querySelector(".js-drop-zone");
  const input = root.querySelector(".js-drop-input");
  const list = root.querySelector(".js-drop-files");
  const tpl = root.querySelector(".js-drop-tpl");
  if (!zone || !list || !tpl) return { destroy() {} };
  let depth = 0;
  const timers = [];

  const addFiles = (files) => {
    [...files].slice(0, 5).forEach((file, k) => {
      const row = tpl.content.firstElementChild.cloneNode(true);
      row.querySelector(".js-drop-name").textContent = file.name;
      row.querySelector(".js-drop-size").textContent = fmt(file.size);
      list.prepend(row);
      timers.push(setTimeout(() => row.classList.add("is-done"), 60 + k * 200));
    });
    while (list.children.length > 5) list.lastElementChild.remove();
  };

  const onEnter = (event) => {
    event.preventDefault();
    depth++;
    root.classList.add("is-over");
  };
  const onOver = (event) => event.preventDefault(); // 놓기를 허락하려면 꼭 막아야 한다
  const onLeave = () => {
    depth = Math.max(0, depth - 1);
    if (!depth) root.classList.remove("is-over");
  };
  const onDrop = (event) => {
    event.preventDefault();
    depth = 0;
    root.classList.remove("is-over");
    if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
  };
  const onPick = () => {
    if (input.files?.length) addFiles(input.files);
    input.value = "";
  };

  zone.addEventListener("dragenter", onEnter);
  zone.addEventListener("dragover", onOver);
  zone.addEventListener("dragleave", onLeave);
  zone.addEventListener("drop", onDrop);
  input?.addEventListener("change", onPick);
  return {
    destroy() {
      timers.forEach(clearTimeout);
      zone.removeEventListener("dragenter", onEnter);
      zone.removeEventListener("dragover", onOver);
      zone.removeEventListener("dragleave", onLeave);
      zone.removeEventListener("drop", onDrop);
      input?.removeEventListener("change", onPick);
    },
  };
}

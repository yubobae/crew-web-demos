// 휠 의도 판별: "새로 굴린 것"과 "트랙패드 관성으로 계속 들어오는 것"을 구분한다.
// - 잠시(200ms) 조용했다가 들어온 휠 → 새 동작
// - 최근 휠 세기가 그 앞보다 확실히 세졌다 → 새 동작(쓸다가 다시 쓸기)
// - 세기가 같고 마우스 휠 한 칸만큼 크다(40px 이상) → 새 동작(마우스 휠을 계속 돌리는 경우)
// - 세기가 줄거나, 작은 값이 이어진다 → 트랙패드 관성(무시)
// 마우스 휠 한 칸, 계속 돌리기, 트랙패드 한 번 쓸기 모두 "한 번 = 한 화면"이 되게 한다.

const QUIET_MS = 200;
const HISTORY = 12;
const WHEEL_STEP = 40;   // 마우스 휠 한 칸으로 볼 최소 세기
const ACCEL = 1.25;      // 이만큼 세지면 "다시 쓸었다"로 본다

export function createWheelIntent() {
  const deltas = [];
  let lastAt = 0;

  /** @returns {0|1|-1} 새 동작이면 방향(1 아래, -1 위), 아니면 0 */
  return function read(event) {
    const now = performance.now();
    const d = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
    if (d === 0) return 0;
    const quiet = now - lastAt > QUIET_MS;
    lastAt = now;
    if (quiet) deltas.length = 0;
    deltas.push(Math.abs(d));
    if (deltas.length > HISTORY) deltas.shift();

    if (quiet) return Math.sign(d);
    const avg = (list) => list.reduce((a, b) => a + b, 0) / list.length;
    const recent = avg(deltas.slice(-3));
    const before = avg(deltas.slice(0, -3).length ? deltas.slice(0, -3) : deltas.slice(0, 1));
    if (recent > before * ACCEL) return Math.sign(d);
    if (recent >= before && recent >= WHEEL_STEP) return Math.sign(d);
    return 0;
  };
}

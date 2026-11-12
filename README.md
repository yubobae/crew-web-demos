# crew-web-demos

보람찬크루 웹 컨벤션으로 만든 UI 컴포넌트와 인터랙션 효과 데모입니다. 프레임워크 없이 HTML, CSS, 순수 JS 모듈로 만들었습니다.

- 데모 목록: https://yubobae.github.io/crew-web-demos/
- UI 키트: [ui-kit/](ui-kit/) — 버튼, 입력, 체크박스, 스위치, 배지, 카드, 모달, 드롭다운, 툴팁, 아코디언, 탭, 토스트
- 스크롤 인터랙션: [scroll/](scroll/) — GNB, 헤더 자동 숨김, 부드러운 스크롤, 섹션 스냅, 스크롤 리빌, 패럴랙스, 고정 확대, 가로 스크롤, 스냅 갤러리, 푸터
- 디지털 역사관: [museum/](museum/) — 풀페이지 메인(덮으며 넘기기, 진행 표시, 사진 띠, 차오르는 글자, 기록집, 소개 영상, 푸터 단계) + 연대기 하위 페이지(위치 표시·칩, 열리는 사진, 시대 추적, 콜라주, 흐르는 글자, 숫자, 인사말, 영상 목록), 재생 방식 4종
- 인터랙션 효과: [effects/](effects/) — 숫자 회전 카운터, 풀페이지 전환, 무한 슬라이더, 모션 탭 3종, 스포트라이트 카드, 빛나는 버튼, 배경 초점

## 올리기 전에 (꼭)

GitHub Pages는 CSS·JS를 브라우저에 10분 남겨 두게 한다. 그대로 올리면 새 HTML에 예전 CSS가 입혀져 폰에서 화면이 깨진다. 푸시 직전에 버전 도장을 찍는다.

```bash
node tools/stamp-version.mjs
```

모든 쪽(하위 데모 폴더 포함)의 `main.css`·`main.js`·`demo-frame.*` 주소와 각 `main.css`의 `@import`에 `?v=시각`을 붙인다(컨벤션 10-1).

## 업데이트

각 데모 폴더는 보람찬크루 컨벤션 저장소의 `samples/ui-kit`, `samples/effects`, `samples/scroll`을 그대로 복사한 것입니다. 원본을 고친 뒤 이 저장소로 다시 복사해 올립니다. 새 데모는 폴더 하나(`<이름>/index.html` + `assets/`)로 추가하고 첫 화면 목록에 카드를 하나 더합니다.

## 출처·라이선스

- 디자인·인터랙션 참고: shadcn/ui (MIT License, © 2023 shadcn)
- 값 체계: Tailwind CSS 기본 테마 값 (MIT License, © Tailwind Labs, Inc.)
- 글꼴: Pretendard (SIL Open Font License)

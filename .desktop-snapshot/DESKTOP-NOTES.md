# DESKTOP VERSION LOCK — не трогать при правках мобильной версии

Дата фиксации: 2026-09-17. Снапшот файлов в этой папке (.desktop-snapshot/).

## Контекст
- Брейкпоинты уже существуют в style.css: `max-width: 900px`, `720px`, `520px`, `375px`.
- ЛЕВАЯ ВЫРАВНИВАНИЕ текста: добавлено принудительно в `.doll-card` и `.manifesto` (перекрывает глобальный `text-align: center` на строках ~242-245).
- Глобально на все тексты действует `text-align: center` + `text-wrap: balance` — НЕ удалять (mobile полагается на это).

## Десктопные значения (> 900px) — НЕ РЕДАКТИРОВАТЬ
- Шрифты: --disp Unbounded, --body Inter Tight, --scrawl Permanent Marker.
- Hero-logo: width min(817px, 74vw) при >=681px; float анимация hero-logo-float.
- Hero-orbit: 140vmin, spin 60s, три span-кольца.
- Thread canvas (#threads): threadCount = min(130, max(80, width/10)), фоновые bgThreads до 220, Verlet физика, MOUSE_RADIUS 96.
- Dolls: grid 1.15fr/1fr, doll-sway img height min(94vh, 1104px), даже-блоки (nth-of-type even) — картинка справа transform translateX(-70px).
- Manifesto: grid 1.15fr/1fr (title/text/sign).
- Showreel: горизонтальный reel, высота img clamp(220px, 40vh, 400px).
- Tracks: track-list max-width 1180px, grid-колонки 56px 1fr auto auto. **Текст песен** `.track-title` font-size `clamp(13.5px, 1.8vw, 16.4px)` (фикс от 2026-09-17), вертикальный шаг строк `.track-row` padding `19.8px 14px` (было 22px — уменьшен на 10%).
- Footer: grid 1fr auto 1fr.
- doll-fx canvas 680x940, эмбер-частицы.
- **hover-свечение персонажей**: `.doll.hovering .doll-sway img { filter: drop-shadow(0 40px 90px var(--glow)); }` — ДЕСКТОП, оставить как есть.
- **ЛЕВАЯ ЛИНИЯ (мобильные/планшетные сужения)**: на ≤900px все контент-блоки (hero, manifesto, dolls, showreel, tracks, footer) начинаются с одной левой линии:
  - >900px: десктоп, отступы по своим правилам контейнеров (.dolls 24px и т.д.).
  - 721–900px: единый отступ 24px.
  - 376–720px: единый отступ 20px (было 16px, фикс 2026-09-17). Контент на ≤720px центрирован: manifesto, doll-card, doll-more, track-num/track-title.
  - ≤375px: единый отступ 20px (было 14px).
- **Блок песен на мобиле = одна строка (2026-09-17)**: grid 4 колонки (номер · название · время · кнопка): ≤720px `28px 1fr auto auto`, ≤375px `24px 1fr auto auto`. Шрифты −1pt: title `clamp(10.7px, 3vw, 13.7px)` / `10.7px`, num `8.7px` / `7.7px`, time `10.7px`.
- **Кукольные круглые бейджи `.doll-roundel` УДАЛЕНЫ полностью (2026-09-17)** — CSS, HTML (все 4 куклы), JS (счётчики/контр-вращение/снижение motion). На десктопе и мобильной кругов нет.

## Мобильные сужения уже авторские (не трогать, только править если надо)
900px: DPR cap 1.5, nav-links gap 16px
720px: filter:none, box-shadow:none, doll-sway img height min(72vh,580px), НЕТ логотипа в шапке (nav-logo display:none — логотип только на десктопе), НЕТ hover-свечения персонажей (`.doll.hovering .doll-sway img { filter:none }`), НЕТ партиклов (`.doll-fx { display:none }` + в script.js dollFxInit() выходит раньше через matchMedia max-width:720px — не запускает rAF-цикл на мобильной), НЕТ dolls-thread (см. 820px). Максимально облегчённая версия.
820px: НЕТ вертикальной полоски с красным флажком (dolls-thread display:none — только на десктопе >820px, на 820px и уже скрыта)
520px: hero-scroll/orbit/eq/roundel hidden
375px: SE-подстройки

## Рабочий процесс
1. СНАЧАЛА смотрим `.desktop-snapshot/style.css` как эталон десктопа.
2. Правки мобильной версии — ТОЛЬКО внутри @media (max-width: ...) блоков.
3. Никогда не менять значения в общих (не-медиа) секциях.
4. После правок — открывать index.html и проверять оба брейкпоинта.
5. СНАПШОТ: любые осознанные правки десктопа (>900px) — синхронизировать с `.desktop-snapshot/` (cp style.css index.html script.js) и обновлять этот файл.

## Зафиксированные десктопные значения трек-листа (2026-09-17)
- `.track-title` font-size: `clamp(13.5px, 1.8vw, 16.4px)` (2 раза уменьшали по 1pt: было 19px)
- `.track-row` padding: `19.8px 14px` (вертикальный шаг строк -10%, было 22px)

## Осознанные изменения десктопа (2026-09-17)
- **Модальные окна «MORE INFORMATION» теперь работают и на десктопе** (по просьбе заказчика).
  CSS `.doll-modal*` вынесен из `@media (max-width:900px)` в глобальные стили — на десктопе
  он скрыт по умолчанию (`display:none`) и показывается по `.open`. В остальном десктопный вид не менялся.
- Ширина колонки модалки: `.doll-modal-box > * { max-width: 1100px }` (фото 374 + gap 34 + текст 692 при 1440),
  текст — `text-align: left`. Абзац био: `.doll-bio-text > p:not(.doll-role) { text-align: justify; text-wrap: wrap; hyphens: auto }`
  (глобальное `:where(...p...)` на стр.484 даёт `center`+`balance`).
- Скролл окна: у `.doll-modal` атрибут `data-lenis-prevent` + `window.lenis.stop()/start()` — скроллится
  только текст внутри окна, фон зафиксирован.
- Модалки всех 4 персонажей (melvin / rusty / voice / pulse) лежат в конце `<body>` (z-index 400 > nav 300).
- The Voice: полный текст = текущий био карточки (отдельного длинного текста пока нет).
- Тексты модалок: Melvin / Stacy / Voice — один сплошной абзац. Voice = история Kyle / Loki (заменён старый короткий текст).
  **Rusty — 4 абзаца** (новый текст 2026-09-17: финал — «…He became Rusty.», убраны абзац про ночь/радио/AC-DC,
  складской бас и DollarS). Абзацы: `margin-top:24px` между всеми (`.doll-modal-body p + p {14px}` перебит по специфичности).
- Кнопки `.doll-more` без `href` — десктоп-скролл к `#dolls` у них убран (см. MOBILE-NOTES).

## Фото персонажей в модалках (2026-09-17)
- Файлы: `bio/bio-guitar.jpg` (Melvin), `bio/bio-bass.jpg` (Rusty), `bio/bio-dram.jpg` (Stacy/pulse),
  `bio/bio-vocal.jpg` (Kyle&Loki). 760×1361, jpg q82 (исходники на Desktop были png/webp ~6 МБ → сжаты sips).
- Разметка: `<div class="doll-modal-body">` → `<figure class="doll-bio-photo"><img …></figure>` +
  `<div class="doll-bio-text">` → `.doll-role` + `h3` + `.doll-title` + `<p>…</p>` + `<span class="doll-scrawl">…</span></div>`.
  Имя/ник/приписка-роль + текст + скролл — всё внутри `.doll-bio-text` (правый столбец).
- Раскладка (>900): `.doll-modal-body` — flex row, `align-items: flex-start`, `gap: 34px`.
  Фото `.doll-bio-photo { flex: 0 0 min(34%,380px); max-width: 380px }`, `img { width:100%; height:auto }`
  → все фото 374×670 (пропорция 0.558 = исходная, без кропа/апскейла), слева в одиночестве.
- Текст: `.doll-bio-text { flex: 1 1 auto; min-width: 0; font-size:15px; line-height:1.85; color: var(--muted) }`,
  `.doll-bio-text > p:not(.doll-role) { margin-top:24px; text-align: justify; text-wrap: wrap; hyphens: auto }` — колонка 692px при 1440 (x=578).
- Имя/ник/приписка — в правом столбце (x=578, w=692) НАД текстом, left. Зазоры: роль→имя 16 (role mb),
  имя→ник 10 (title mt), ник→текст 24 (p mt). Картинка слева — одна, вровень с ролью по вертикали.
- h3/role/title внутри `.doll-bio-text` → им нужен явный `line-height` (иначе наследуют 1.85):
  `h3 { line-height:1.25 }`, `.doll-role { line-height:1.3 }`, `.doll-title { line-height:1.5 }`.
- У шапки модалки НЕ должно быть `line-height` от `.doll-bio-text`; `h3` даёт h=50, role h=14, title h=27 при 1440.
- Колонка модалки центрируется: `.doll-modal-box { align-items: center; justify-content: center }` +
  `.doll-modal-box > * { width: 100%; max-width: 1100px }` → левый край на x=170 при 1440.
- ≤900: `.doll-bio-text { display: contents }` → всё становится flex-элементами `.doll-modal-body` (column,
  `align-items:center`, `gap:0`), порядок через `order`: role −3, h3 −2, title −1, 0 = фото → текст → скролл.
  Фото по центру (`max-width:300px`, `margin:22px 0`), текст `justify`, остальное center.

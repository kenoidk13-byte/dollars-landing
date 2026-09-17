# MOBILE VERSION LOCK — зафиксированное мобильное состояние

Дата фиксации: 2026-09-17. Снапшот файлов в этой папке (`.mobile-snapshot/`).
Снимок соответствует рабочему дереву на момент бейстеров `style.css?v=474`, `script.js?v=438`.

## Назначение
- Зафиксировать всё, что сделано по мобильной версии (<900px), чтобы не потерять и не сломать.
- Это **эталон мобильной логики и значений**. Если правка мобильной версии осознанная —
  синхронизировать `.mobile-snapshot/` (`cp index.html style.css script.js .mobile-snapshot/`) и обновить этот файл.
- Десктоп-эталон остаётся в `.desktop-snapshot/` + `DESKTOP-NOTES.md`. Правило «desktop >900px FROZEN» действует.

## Брейкпоинты (только внутри @media)
900 / 820 / 720 / 520 / 430. На ≤430 попадает iPhone 16.

## Куклы — размеры картинок (одинаковая ВИДИМАЯ высота ~162–163)
Подрезанные кропы дают разный aspect, поэтому ширина у каждого своя. Значения заданы в блоках
**900, 820 и 720** (≤430 наследует от 720):

| Персонаж | data-doll | Файл | width |
|---|---|---|---|
| Melvin | `melvin` | `mobile/guitar2_pad.webp` | 84% |
| Rusty (басист) | `rusty` | `mobile/bass.webp` | 98.4% |
| The Voice (вокалист) | `voice` | `mobile/vocal.webp` | 74.4% |
| Stacy (ударница) | `pulse` | `mobile/dram2.webp` | 70.8% |

- `.doll-sway img { display:block; width:84%; height:auto; max-width:100%; margin:0 auto; }`
- Басист сдвинут вправо на 20px: `.doll[data-doll="rusty"] .doll-sway { transform: translateX(-5px); }`
  (было `-25px`) — задано в блоках **720 и 430**.

## Куклы — вертикальные отступы/шаг
- `.doll { gap: 50px; }` (расстояние картинка↔текст), задано в блоках 820 / 720 / 430.
- `.doll + .doll { margin-top: 10px; }` — блоки кукол раздвинуты на 10px (блоки 820 / 720 / 430).
- Контент под «THE BAND» опущен на +40px через `.doll:first-of-type { padding-top }`:
  - ≤820: `93px`
  - ≤720: `80px`
  - ≤430: `56px`
- Горизонтальные паддинги кукол: ≤820 `47px 0 14px`, ≤720 `40px 20px 10px`, ≤430 `32px 20px 12px`.

## Имена и никнеймы
| Блок | `.doll-card h3` (имя) | `.doll-title` (никнейм) |
|---|---|---|
| ≤900 | `clamp(31px, 4.16vw, 55px)` | `18px` |
| ≤720 | `clamp(26px, 5.5vw, 40px)` | `18px` |
| ≤430 | `24px; letter-spacing:1px` | `17px; margin-top:6px` |

- **Все никнеймы строго по горизонтали.** Убран поворот из базового `.doll-title` (было `transform: rotate(-1.5deg)` → теперь `transform: none`). Отдельное правило для вокалиста удалено как лишнее.

## Био персонажей
- У всех 4 персонажей описание — **один сплошной `<p class="doll-bio">`** (переносы строк внутри абзаца, без разделения на два `<p>`). Образец — Melvin.
- Внизу каждой карточки приписка `.doll-scrawl` с пунктиром сверху.

## Модальные окна «MORE INFORMATION» (все 4 персонажа)
- Кнопка `.doll-more` под персонажем открывает полноэкранное окошко в стиле мобильного меню.
- Работают у всех: **melvin / rusty / voice / pulse** (The Voice использует текст текущего био карточки — отдельного длинного текста пока нет).
- **CSS `.doll-modal*` теперь ГЛОБАЛЬНЫЙ (не только ≤900px) — модалки работают и на десктопе.**
  Скрыты по умолчанию (`display:none`), показываются по `.open`.
- **Модалки лежат в самом конце `<body>`** (вне `.doll`/секций!), иначе `z-index:400` не перекрывает
  `nav` (`z-index:300`) — `.doll` создаёт свой stacking context, и крестик не кликается.
- HTML: `#dollModal-melvin`, `#dollModal-rusty`, `#dollModal-voice`, `#dollModal-pulse`.
- Структура: `.doll-modal > .doll-modal-close (X) + .doll-modal-box > .doll-modal-body > figure.doll-bio-photo + .doll-bio-text`
  (внутри `.doll-bio-text`: `.doll-role` + `h3` + `.doll-title` + `<p>` + `.doll-scrawl`).
  CSS `.doll-modal*` — ГЛОБАЛЬНЫЙ (не в медиазапросе), на десктопе скрыт `display:none` до `.open`.
- CSS: `.doll-modal { display:none; fixed; rgba(11,10,8,.97); blur(12px); z-index:400; overflow-y:auto }`,
  `.doll-modal.open { display:block }`, `.doll-modal-close { position:fixed; top:22px; right:22px; rust X }`,
  `.doll-modal-box { flex column center; min-height:100vh; padding:90px 24px 60px }`,
  `h3 clamp(26px,5.5vw,40px)`, `.doll-title 18px`,
  `.doll-bio-text > p:not(.doll-role) { margin-top:24px; text-align:justify; text-wrap:wrap; hyphens:auto }`
  (обязательно — глобальное `:where(...p...)` на стр.484 ставит `center`+`balance`, перебивает наследование),
  `.doll-modal-box .doll-scrawl { margin-top:28px; padding-top:14px; font-size:15px }`.
- ≤900: `.doll-modal-box { text-align:center; align-items:center }`, `.doll-modal-body { flex-direction:column; align-items:center; gap:0 }`,
  `.doll-bio-text { display:contents }` → role/h3/title/фото/текст/скролл = flex-элементы body, порядок через `order`
  (role −3, h3 −2, title −1): имя → ник → приписка → фото → текст → скролл. Фото `max-width:300px; margin:22px 0`, по центру;
  роль/h3/титул/скролл `center`, абзац био остаётся `justify`. h3/role/title внутри `.doll-bio-text` → нужен явный
  `line-height` (иначе наследуют 1.85 от bio-text): `h3 1.25`, `.doll-role 1.3`, `.doll-title 1.5`.
- JS (`script.js`, секция "doll info modal"): `openDollModal(name)` / `closeDollModal()`, блокировка
  `body`/`html` `overflow:hidden`, закрытие по X, Escape, клику по фону, Enter/Space на кнопке.
- **Скролл только внутри окна**: у каждого `.doll-modal` есть атрибут `data-lenis-prevent` — иначе Lenis
  перехватывает wheel и текст в окне не скроллится. Плюс `window.lenis.stop()` при открытии и `.start()`
  при закрытии — фон не двигается.
- Полные тексты в модалках: Melvin/Stacy/Voice — по одному сплошному абзацу; Voice = полная история Kyle / Loki (2080 симв.).
  **Rusty — 4 абзаца** (новый текст 2026-09-17; финал — «…He became Rusty.», абзац про ночь/радио/AC-DC удалён,
  как и складской бас/DollarS). Абзацы: 24px между на десктопе, на мобиле 0 у первого (зазор даёт `margin:22px 0`
  фото) и 18px между последующими — `.doll-bio-text > p:not(.doll-role) + p { margin-top:18px }` в `@media ≤900`
  (без него правило `margin-top:0` перебивает `p + p` по специфичности и абзацы слипаются).
- **The Voice (вокалист)** — кнопка пока без модалки (`data-doll-modal` не задан), но уже
  `role="button" tabindex="0"` и без `href` (клик ничего не открывает; ждём текст).

## Кнопки `.doll-more` — без якоря (важно!)
- У всех кнопок «MORE INFORMATION» **убран `href="#dolls"`** (оставлены `role="button" tabindex="0"`, `cursor:pointer`).
- Причина: в `script.js` есть глобальный Lenis-обработчик `a[href^="#"]` (`lenis.scrollTo`), который
  скроллил к `#dolls` (верх секции = Melvin) при любом клике, даже несмотря на `preventDefault` в модалке.
  Именно поэтому «все кнопки вели на Мелвина» после закрытия крестика. Якорь убран — прыжок исчез.
- НЕ возвращать `href="#dolls"` на эти кнопки.

## Навигация (мобильная)
- Шапка — always-on тёмный бар: бургер (слева) → полноэкранное меню (`nav-open`) с центрированными
  ссылками и крестиком справа сверху.
- **Почта в меню**: `<span class="nav-mail">E-mail: <a href="mailto:Kenoidk13@gmail.com">Kenoidk13@gmail.com</a></span>`,
  спозиционирована внизу меню (`position:absolute; bottom:36px; text-align:center`).
  Стиль 1:1 как в футере: `9.6px / letter-spacing 2px / uppercase / var(--muted)`,
  ссылка подчёркнута (1px, offset 3px), hover `var(--rust)`; на **≤430 — `8px / 1.5px`** (как `.footer-line` там).
- `.nav-mail` базово `display:none` (десктоп не тронут), виден только в `@media (max-width:900px) .nav.nav-open`.

## Трек-лист (Tracks)
- На ≤720: `.track-num, .track-title { text-align: left; }` (было `center`). ≤430 наследует.

## Подрезанные мобильные картинки
- `mobile/bass.webp` 664×1100, `mobile/dram2.webp` 468×1081, `mobile/guitar2_pad.webp` 562×1081,
  `mobile/vocal.webp` 486×1063 (оригиналы 896×1200 в корне).
- Подключены через `<picture><source media="(max-width:900px)" srcset="mobile/X.webp">`; десктоп берёт оригиналы.

## Бейстеры кеша
- Актуальные: `style.css?v=488`, `script.js?v=440` (в `index.html`).
- Перед каждым пушем поднимать на +1.

## Фото персонажей в модалках (2026-09-17)
- В каждую модалку добавлено фото: `bio/bio-guitar.jpg` / `bio-bass.jpg` / `bio-dram.jpg` /
  `bio-vocal.jpg` (760×1361, jpg q82).
- ≤900px раскладка столбиком: `.doll-modal-body { flex-direction: column; align-items:center; gap: 0 }`,
  `.doll-bio-text { display: contents }` + `order` (role −3, h3 −2, title −1) → имя → ник → приписка → фото → текст → скролл.
  `.doll-bio-photo { align-self:center; width:100%; max-width:300px; margin:22px 0 }`, `img { width:100%; height:auto }`
  → фото 300px по центру (390px: фото 300×537), текст ниже на всю ширину (342px).
- По центру (как на странице/карточках): `.doll-modal-box h3`, `.doll-role`, `.doll-title`, `.doll-scrawl`
  → `text-align: center` (сам `.doll-modal-box` тоже `text-align:center`, `align-items:center`).
  Абзац основного текста (`.doll-bio-text > p:not(.doll-role)`) остаётся `justify`.
- >900px — фото слева (одно, x=170, 374×670, вровень с ролью), имя/ник/приписка в правом столбце НАД текстом
  (x=578), скролл под текстом (см. DESKTOP-NOTES).

## Галерея (lightbox) — крестик (2026-09-17)
- В `.lightbox-close` добавлены `<span class="lb-glyph">✕</span>` + 2 палочки `.lb-bar` (lb-a/lb-b) — для десктопного
  вида «как у модалки персонажа» (см. DESKTOP-NOTES). Палочки стилизованы ТОЛЬКО в `@media (min-width: 901px)`.
- Мобильный крестик НЕ менялся: глиф ✕, рамка `1px var(--line)`, 36×36, `position:absolute` в углу `.lightbox-stage`
  (−16/−16), `font-size:14px`; палочки на мобиле скрыты (height 0).
- Если трогать `.lightbox-close` — помнить про эти два span'а (`.lb-glyph`, `.lb-bar`), не выводить глиф заново.

## Baseline мобильной версии — проверено (2026-09-17)
Прогон `/tmp/moblock.js` на 390 / 430 / 720 / 820 / 900 (мобила) и 901 (граница → десктоп):
- **Меню**: бургер раскрывает `.nav-links` fullscreen (`position:fixed`, 100vw×100vh; 390→390×900, 900→900×900),
  `.nav-mail` видим (`display:block`, `bottom:36px`), `.nav-close` видим; тексты ссылок left, почта center.
- **Модалки**: роль / имя / ник / фото центрированы (центр = ширина/2: 195 / 215 / 360 / 410 / 450),
  фото 300px, абзац био `justify`; крестик и Escape закрывают.
- **Галерея** (≤900): крестик прежний — `absolute` 36×36, рамка 1px, глиф `✕` виден, `.lb-bar` height 0
  (десктопные палочки не активны). На 901 — наоборот: `fixed` 34×34, border 0, глиф скрыт, палочки 2px.
  Клик по крестику закрывает на всех ширинах.
- **Треки**: `.track-num` / `.track-title` = `left` при ≤720, иначе `start` (дефолт).
- **Кнопки `.doll-more`**: `href` = null у всех 4 (прыжка к Melvin нет).
- Ошибок в консоли нет ни на одном брейкпоинте.

## Тестирование (headless)
- `puppeteer-core` установлен в `/tmp` (`npm install --no-save` в `/tmp`), Chrome:
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Скрипты: `/tmp/navtest*.js` (меню), `/tmp/modaltest.js` (Melvin), `/tmp/rustytest.js`, `/tmp/pulsetest.js`,
  `/tmp/notest.js` (проверка «нет прыжка к Melvin»), `/tmp/mailtest2.js` (почта vs футер),
  `/tmp/lay3.js` (замеры 4 модалок на 1440), `/tmp/mob3.js` (порядок/выравнивания на 390/430/720),
  `/tmp/mob4.js` (центры элементов на 390), `/tmp/moblock.js` (baseline: меню/модалки/галерея/треки на 390–900 + 901).
- Прелоадер перекрывает клики в headless — ждать его скрытия перед кликом.
- Модель без vision: скриншоты не читаются, проверяем через `getComputedStyle`/`getBoundingClientRect`.

## Рабочий процесс
1. Правки мобильной версии — ТОЛЬКО внутри `@media (max-width: ...)`.
2. После правок — `open index.html`, проверить брейкпоинты (390 / 430 / 720 / 820 / 900).
3. Перед пушем — поднять бейстеры в `index.html`.
4. Осознанные изменения мобильной версии — синхронизировать `.mobile-snapshot/` и обновить этот файл.
5. Десктоп (>900px) не трогать; при риске — сверяться с `.desktop-snapshot/`.

## Общий файл script.js (2026-09-17)
- Плотность фоновых ниток (`bgCount`) правилась только в desktop-ветке; мобильная ветка (`mobileInit`, ≤720) не тронута —
  на 390/430/720 по-прежнему 80 ниток. Мобильное поведение идентично baseline.
  (diff root↔snapshot по script.js = desktop-только: `bgCount` + Lenis. Мобильное поведение идентично baseline.)

## Галерея (lightbox): свайпы + крестик в стиле меню (2026-09-17, МОБИЛА)
- Крестик теперь как у открытого меню (`.nav-close`): `@media (max-width:900px)` →
  `.lightbox-close { position:fixed; top:22px; right:22px; width/height:34px; border:0; background:transparent; font-size:0 }`,
  `.lb-glyph { display:none }`, палочки `.lb-bar` (2px, `var(--rust)`, ±45°). Было: 36×36, рамка 1px, глиф `✕`, absolute −16/−16.
  Стили лежат в отдельном блоке `@media (max-width:900px)` (десктопный `min-width:901px` НЕ тронут — desktop frozen).
- Свайп пальцем по галерее листает фото: `script.js` сразу после keydown-обработчика, блок `lbTouch`
  (`matchMedia('(pointer: coarse)') || 'ontouchstart' in window`) — на десктопе не подключается.
  Порог: `|dx| ≥ 50px`, `|dy| ≤ |dx|*1.3` (только горизонталь), `dt ≤ 600ms`; свайп влево → следующее, вправо → предыдущее.
  Старт на крестике/стрелках игнорируется (`.lightbox-close, .lightbox-nav`), маленький тап (<50px) ничего не листает.
- Проверено (390/430/720): крестик `fixed` 22/22 34×34, border 0, glyph none, 2 палочки 2px rust; свайп влево/вправо меняет
  `#lightboxImg` (`074122` ⇄ `082355`), тап не листает, крестик закрывает; ошибок нет. Desktop 1440: крестик прежний, свайп не активен.
- Бейстеры: `style.css?v=490`, `script.js?v=445`. Скрипт: `/tmp/mobilb.js`. Бэкапы: `/tmp/script.pre-mobilb.js`, `/tmp/style.pre-mobilb.css`.

## Сессия 2026-09-17 (2): правки десктоп-скоупа — мобила сохранена (МОБИЛА)
- Манифест: в разметке `<br>` заменён на `<span class="manifesto-now">`; на ≤900px перенос восстанавливается
  CSS-правилом `.manifesto-sign .manifesto-now { display:block }` внутри `@media (max-width:900px)` — на мобиле тот же перенос строки.
- Модалка: ники `.doll-title` и ширина колонки менялись ТОЛЬКО в `@media (min-width:901px)` —
  на ≤900px ник остаётся 18px, тело модалки глобальное `max-width:1100px`, поведение = baseline.
- Тизеры карточек Voice и Pulse сокращены (общий контент десктоп+мобила): высота био 182px на 390–900 как у Rusty.
- Бейстер: `style.css?v=490` → **`491`** (script.js не менялся — `?v=445`).

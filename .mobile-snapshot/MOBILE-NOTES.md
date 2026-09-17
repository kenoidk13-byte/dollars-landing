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

## Модальные окна «MORE INFORMATION» (мелвин / rusty / pulse)
- Кнопка `.doll-more` под персонажем открывает полноэкранное окошко в стиле мобильного меню.
- **Модалки лежат в самом конце `<body>`** (вне `.doll`/секций!), иначе `z-index:400` не перекрывает
  `nav` (`z-index:300`) — `.doll` создаёт свой stacking context, и крестик не кликается.
- HTML: `#dollModal-melvin`, `#dollModal-rusty`, `#dollModal-pulse`.
- Структура: `.doll-modal > .doll-modal-close (X) + .doll-modal-box > .doll-role + h3 + .doll-title + .doll-modal-body + .doll-scrawl`.
- CSS (только ≤900px): `.doll-modal { display:none; fixed; rgba(11,10,8,.97); blur(12px); z-index:400; overflow-y:auto }`,
  `.doll-modal.open { display:block }`, `.doll-modal-close { position:fixed; top:22px; right:22px; rust X }`,
  `.doll-modal-box { flex column center; min-height:100vh; padding:90px 24px 60px; text-align:center }`,
  `h3 clamp(26px,5.5vw,40px)`, `.doll-title 18px`, `.doll-modal-body { 15px/1.85; muted; max-width:480px; text-align:left }`,
  `.doll-modal-box .doll-scrawl { margin-top:28px; padding-top:14px; font-size:15px }`.
- JS (`script.js`, секция "doll info modal"): `openDollModal(name)` / `closeDollModal()`, блокировка
  `body`/`html` `overflow:hidden`, закрытие по X, Escape, клику по фону, Enter/Space на кнопке.
- Полные тексты в модалках: Melvin — 3 абзаца; Rusty — 6 абзацев; Stacy — 10 абзацев.
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
- Актуальные: `style.css?v=474`, `script.js?v=438` (в `index.html`).
- Перед каждым пушем поднимать на +1.

## Тестирование (headless)
- `puppeteer-core` установлен в `/tmp` (`npm install --no-save` в `/tmp`), Chrome:
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Скрипты: `/tmp/navtest*.js` (меню), `/tmp/modaltest.js` (Melvin), `/tmp/rustytest.js`, `/tmp/pulsetest.js`,
  `/tmp/notest.js` (проверка «нет прыжка к Melvin»), `/tmp/mailtest2.js` (почта vs футер).
- Прелоадер перекрывает клики в headless — ждать его скрытия перед кликом.
- Модель без vision: скриншоты не читаются, проверяем через `getComputedStyle`/`getBoundingClientRect`.

## Рабочий процесс
1. Правки мобильной версии — ТОЛЬКО внутри `@media (max-width: ...)`.
2. После правок — `open index.html`, проверить брейкпоинты (390 / 430 / 720 / 820 / 900).
3. Перед пушем — поднять бейстеры в `index.html`.
4. Осознанные изменения мобильной версии — синхронизировать `.mobile-snapshot/` и обновить этот файл.
5. Десктоп (>900px) не трогать; при риске — сверяться с `.desktop-snapshot/`.

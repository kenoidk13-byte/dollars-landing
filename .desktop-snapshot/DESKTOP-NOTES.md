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
- Tracks: track-list max-width 1180px, grid-колонки 56px 1fr auto auto.
- Footer: grid 1fr auto 1fr.
- doll-fx canvas 680x940, эмбер-частицы.
- **hover-свечение персонажей**: `.doll.hovering .doll-sway img { filter: drop-shadow(0 40px 90px var(--glow)); }` — ДЕСКТОП, оставить как есть.
- **ЛЕВАЯ ЛИНИЯ (мобильные/планшетные сужения)**: на ≤900px все контент-блоки (hero, manifesto, dolls, showreel, tracks, footer) начинаются с одной левой линии:
  - >900px: десктоп, отступы по своим правилам контейнеров (.dolls 24px и т.д.).
  - 721–900px: единый отступ 24px.
  - 376–720px: единый отступ 16px.
  - ≤375px: единый отступ 14px.

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
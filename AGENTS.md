# DOLLARS landing

## CRITICAL RULE — Desktop is FROZEN
- **Never modify, touch, or refactor the desktop version (>900px).** It is locked as the reference implementation.
- All work happens ONLY on mobile (<900px), strictly inside `@media` blocks.
- Reference for desktop: `.desktop-snapshot/` + `DESKTOP-NOTES.md`.
- Reference for mobile: `.mobile-snapshot/` + `MOBILE-NOTES.md` (locked state of everything mobile).
- If a change could affect desktop, keep it scoped to mobile media queries; if desktop behavior would change, check the snapshot first.

## Mobile is LOCKED too
- `.mobile-snapshot/` holds the frozen reference of all mobile work (doll sizes, modals, nav mail, tracks, etc.).
- After any intentional mobile change: sync the snapshot (`cp index.html style.css script.js .mobile-snapshot/`) and update `MOBILE-NOTES.md`.
- Do not reintroduce `href="#dolls"` on `.doll-more` buttons — the global Lenis anchor handler scrolls to Melvin.

## Workflow
- After every change: open `index.html` locally via `open`.
- Before pushing: bump cache-busters (`style.css?v=N`, `script.js?v=N`) in `index.html`.
- Breakpoints: 900 / 820 / 720 / 520 / 430 (≤430px includes iPhone 16).
- Mobile nav = always-on dark bar: burger (left, yellow/gold lines) opens a FULLSCREEN dark menu with centered links and a close X at top-right; footer-styled `nav-mail` pinned at the bottom.
- Reduce motion / Android: use `100vh` + `100svh` fallbacks, avoid heavy per-frame canvas work on mobile, keep tilt off on touch.
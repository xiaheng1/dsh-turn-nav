# Changelog

## 0.3.1

- **Fixed variant switching pinning the wrong dimensions**: the settings scope resolved every field to a concrete value (base layer + schema defaults), so `updateConfig({ variant: 'codex' })` carried the previous variant's sizes over — codex rendered with mixed's 12×8 resting bars and 24×2 hover instead of its own 6×2 / 26×2. The client store now keeps only a sparse set of explicit overrides and re-baselines on the active variant's `VARIANT_DEFAULTS`; the settings schema no longer pins visual-field defaults; `dsh-turn-nav.config.json` is now sparse (`{ "variant": "mixed" }`). Switching variants now applies the correct per-variant look out of the box.
- **Codex recalibrated from the real client (dual-theme, cross-validated)**: the rail now matches the actual Codex navigation rail. Dimensions were cross-validated between light (150% scale) and dark (200% scale) screenshots of the same client — the earlier values (5×1.5px rest, 7px pitch, 19px hover) assumed both were 200% and are superseded. Unified spec: resting tick is a 6×2px grey dash (light `rgb(210,211,211)` / dark `rgb(70,70,70)`) at 10px pitch, tick's left edge ~15px inside the conversation column, edge fade is **top-only** (no bottom fade). Hover/focus turns the hovered tick into the theme's strongest foreground — light near-black `rgb(26,28,31)`, dark near-white `rgb(223,223,223)` — 26×2px, and lengthens the three ticks on each side to 20/14/10px while they stay grey — a 7-tick length wave where only the hovered tick changes colour; the transition stays at 150ms. `itemWidth` is 30px (wider than the 26px focused tick so the preview card clears it).
- **Codex preview card recalibrated from the same screenshots**: the card is now `321px` wide (was 280), stays `10px` from the rail, and vertically centres on the hovered tick. Measured padding `13/10`, `13px` text at `20px` line height; line 1 is the user's message in the focused colour (near-black light / near-white dark, single-line ellipsized), line 2+ is the assistant's reply in the resting grey. Light mode is white + soft shadow, dark mode is a flat `rgb(44,44,44)` surface with no border or shadow. Codex `previewMaxHeight` is `106px` (title + up to 3 body lines).
- **Codex ticks are not buttons**: hovering keeps the default arrow cursor (`cursor: default`) instead of a pointer, matching the real rail.
- **Codex current-turn marker**: the scroll-tracked current turn — including the tick you click/jump to — stays in the hover/current colour (light `rgb(26,28,31)` / dark `rgb(223,223,223)`) while resting ticks stay grey.
- **Fixed first-click navigation being swallowed by the conversation's bottom-follow**: while the chat is still pinned to the bottom, a resize right after the click (streaming, image load) snapped the smooth scroll back to the floor, so the first click looked like a no-op until the user scrolled once. `scrollToTurn` now re-issues the scroll for a short window whenever it detects that snap-back.
- **Fixed the Codex preview card being clipped by the top fade**: the edge-fade mask lived on the whole rail, and the card is absolutely positioned outside the rail box, so the mask made it invisible. The mask now sits on the tick column only; the preview card is a sibling of the masked column and renders normally.
- **Fixed the preview card flickering on close**: clearing the active row snapped the card's `top` back to the collapsed first-row anchor (teleporting it to the top tick, codex) and blanked its content before the fade finished (a visible blank-card flash, mixed). The card now keeps the last hovered row's position **and** content, and fades out as a whole.
- **DeepSeek dark theme**: the rail now follows the DSH **application** theme (not the OS `prefers-color-scheme`). The component detects the active theme by reading the resolved `--dsw-alias-label-primary` token and applies the measured dark palette — frosted `rgba(21,21,23,.6)` pill, `rgba(255,255,255,.2)` dashes, `#ADB2B8` resting text, `#F9FAFB` active text/dash, `#232324` panel with a deeper shadow. Light-mode rules are untouched; user `colors` overrides still win.
- **DeepSeek current marker snaps like the real quick-nav**: the blue current-turn dash switches rows instantly as the conversation scrolls (no sliding marker). The panel smooth-scrolls instead: when the scroll moves the current row outside the visible area, the card scrolls to bring the dash back to the middle.
- **DeepSeek rail no longer covers the conversation scrollbar**: its right offset is measured at runtime (`innerWidth − scroller.right + scrollbarWidth + 8`), so the rail sits to the left of the column's own scrollbar and follows sidebar drags/resizes — falls back to the configured `railOffsetRight`.
- **Scrollbar polish**: the DeepSeek card scrollbar has no up/down arrow buttons (`::-webkit-scrollbar-button { display:none }`) and is fully hidden while the rail is collapsed (34px dash column).
- **Card surface**: the expanded card now has a `1px var(--dsw-alias-border-l2)` border plus the `--dsw-shadow-lv2` shadow, matching the real quick-nav's bordered, shadowed panel.

- **DeepSeek rendered as a single list in two states** (like the real quick-nav): the 34px collapsed dash column and the 240px expanded card are the *same* list — preview text is hidden while collapsed and shown on hover, so every dash lines up 1:1 with its card row and shares the same scroll position. The rail is interactive, not decoration:
  - Scroll-tracks the conversation to mark the current turn's dash (`panelRowCurrent`), so the rail always shows where in the history you are.
  - Clicking the collapsed column jumps to the current turn; clicking a row in the card jumps to that turn.
  - Collapsed rows are inert (`pointer-events: none`) and the column itself is the click target, exactly matching the real behaviour.
- **Configuration, forward-compatible**:
  - New `position` (`default` | `left` | `right`): `default` keeps the variant's natural side, `left`/`right` force it; rail, preview card, and DeepSeek panel all flip accordingly.
  - New `colors` bag: `bar`, `barActive`, `text`, `textActive`, `backdrop`, `panelBackground`. Each accepts a CSS colour or DSH token; unset fields keep the theme-aware defaults, so the rail follows the active DSH theme out of the box.
  - New `panelMaxHeight` (default 300) — the DeepSeek list panel's scrollable height.
- `deepseek` variant corrected to match the measured real quick-nav geometry: the panel's right edge is now **flush with the rail** (`right: 0`, gap 0) instead of floating 10px away; dashes sit 11px from the right edge at a 30px pitch; rail sits 16px from the right edge. Resting dash / text / active colours now read from the new colour variables.
- `deepseek` variant calibrated to the real DSH session quick-nav (measured on the live page): 8×2px dashes (`border-radius: 4px`), frosted `rgba(255,255,255,.8)` + `blur(5px)` backdrop, 13px grey (`#81858C`) right-aligned previews, active row darkens to near-black (`#0F1115`, colour/opacity only — no wave). Card scrolls with a top/bottom fade and a 6px scrollbar. Defaults: `barWidth`/`focusedBarWidth` 8, `itemWidth` 34, `itemHeight` 30, `railOffsetRight` 16, `waveTransitionMs` 200.
- `codex` variant rail now aligns with the conversation column's left edge at runtime: it measures the `[data-conversation-scroll]` box and follows via `ResizeObserver`, so it tracks the draggable/collapsible sidebar (264–420px, 56px rail, <1024px auto-collapse) instead of a hardcoded offset. It no longer overlaps the sidebar or floats when it collapses.
- Fixed the preview staying open after click-to-navigate: the clicked bar blurs itself, so moving the pointer out of the rail closes the card again; the card no longer flashes "第 0 轮" while fading out.

## 0.3.0

- Added `variant` configuration: `mixed` (current default), `deepseek`, and `codex`.
- `mixed` keeps the current visual behavior exactly; `deepseek` is a softer dash variant; `codex` uses semantic dots without the wave.
- Added `dotSize` for Codex-style dot diameter.

## 0.2.0

- Configuration support: the plugin now exposes a `dsh-turn-nav` DSH settings namespace.
- Added configurable parameters: bar widths, wave transition duration, preview card size/toggle, minimum turn count, narrow-screen behavior, rail offsets, and scroll offset.
- Added a client settings handle (`ctx.turnNav` / `window.dshTurnNav`) with `getConfig`, `updateConfig`, and `resetConfig`.
- Added a repository-root `dsh-turn-nav.config.json` as the obvious place to edit defaults; the node half reads it as the settings base layer.
- CSS now reads visual values from custom properties, so settings changes apply without hardcoded dimensions.
- Refined the focused wave: width animation instead of `scaleX` keeps the bar end caps perfectly rounded, and the default focused width / transition duration are softer (`24px`, `100ms`).
- Documented all configuration parameters in README / README.zh, including the visual “hard vs soft” meaning of `waveTransitionMs`.

## 0.1.0

- Initial release.
- Turn histogram navigation rail for DeepSeek Harness Web.
- Hover wave interaction, message preview, click-to-scroll.
- Preview is a single shared card that smoothly slides between turn bars instead of flickering.
- Wave animation uses transform scaleX with a short compositor-friendly transition for more responsive hover tracking.

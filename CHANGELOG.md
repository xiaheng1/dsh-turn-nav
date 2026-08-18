# Changelog

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

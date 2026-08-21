# dsh-turn-nav

English | [中文](README.zh.md)

> ⚠️ **AI-generated notice**: This plugin was AI-assisted. Test it in a safe environment before production use.

Turn histogram navigation rail for DeepSeek Harness Web with mixed, DeepSeek, and Codex visual variants.

Unfocused turns render as short bars on the right edge of the conversation. Hovering or keyboard-focusing a bar grows it into a wave (the focused bar is longest) and shows a preview card with the message you sent in that turn. While sweeping along the rail, the preview card stays visible and smoothly slides to the active bar, showing that turn's message text. Clicking a bar smooth-scrolls the conversation to that turn.

## Install

```powershell
dsh plugin --profile web add git+https://github.com/xiaheng1/dsh-turn-nav.git
dsh plugin --profile web install
```

Then restart `dsh web` and hard-refresh the browser (`Ctrl+F5`).

For a local folder:

```powershell
dsh plugin --profile web add <absolute-path-to-this-folder>
dsh plugin --profile web install
```

## Usage

1. Open a workspace and a conversation.
2. Move the pointer over the right-edge rail: the bar under the pointer grows, adjacent bars form a wave, and a shared preview card smoothly slides to the active bar showing that turn's message.
3. Click a bar to smooth-scroll to that turn.

The rail hides on narrow screens (`max-width: 767px`) by default; set `hideOnNarrow: false` to keep it visible.

## Configuration

The quickest way to change defaults is to edit **`dsh-turn-nav.config.json`** in the repository/package root. The plugin reads it at startup as the base layer; if the file is missing, built-in defaults are used. Only include the fields you actually want to pin — visual dimensions left out fall back to the active variant's own defaults, so switching `variant` re-baselines on that variant's look instead of inheriting the previous one's (e.g. switching to `codex` without pinning `barWidth` yields the codex 6px resting tick, not the mixed 12px bar).

For per-deployment overrides, the plugin also registers a `dsh-turn-nav` settings namespace. Edit `$DSH_HOME/settings.yaml` (or `settings.json`) to override defaults:

```yaml
dsh-turn-nav:
  waveTransitionMs: 120
  barWidth: 14
  focusedBarWidth: 30
  previewEnabled: true
```

You can also read and update the effective config from the browser console:

```js
// Read the currently effective config.
dshTurnNav.getConfig()

// Update one or more fields (takes effect immediately in this session; it is
// not written back to the settings document — edit dsh-turn-nav.config.json
// or settings.yaml to persist).
dshTurnNav.updateConfig({ waveTransitionMs: 120 })

// Clear all user overrides and return to defaults.
dshTurnNav.resetConfig()
```

If a field is not configured, the variant-specific recommended default is used (`mixed`, `deepseek`, and `codex` each have their own baseline). The defaults keep the original short-bar feel while making the focused wave softer and rounder.

### Variants

Set `variant` to choose the visual style:

| Variant | Description |
| --- | --- |
| `mixed` | Current default: right-hand short bars with a width-based wave and a shared preview card on the left. |
| `deepseek` | A single list rendered in two states (matches the real quick-nav): collapsed it is a 34px frosted dash column (8×2px dashes, 30px pitch, preview text hidden); hovering expands it into the 240px turn-list card, with each dash aligned 1:1 to its row. The current conversation turn's dash is marked blue, snapping between rows as the conversation scrolls — exactly like the real quick-nav; when the scroll moves that row outside the panel's visible area, the panel smooth-scrolls to bring the dash back to the middle. Clicking the collapsed column jumps to it. The active row's text and dash darken to near-black; the card folds away on leave, scrolls with a top/bottom fade. No wave at all. |
| `codex` | Left-hand dense tick rail aligned with the conversation column's left edge (right of the sidebar), the tick's left edge sitting ~15px inside it; tracks sidebar drag/resize and never floats when the sidebar collapses; top-only edge fade (no bottom fade). Resting tick is a 6×2px grey dash at 10px pitch (light `rgb(210,211,211)` / dark `rgb(70,70,70)`). Hover/focus turns the hovered tick into the theme's strongest foreground — light near-black `rgb(26,28,31)`, dark near-white `rgb(223,223,223)` — 26×2px, and lengthens the three ticks on each side (20/14/10px) while they stay grey — a 7-tick length wave; the clicked/current tick stays in the hover colour and hovering never switches the cursor to a pointer. The preview card pops out on the right: 321px wide, 10px from the rail, vertically centred on the hovered tick; dark mode is a flat `#2C2C2C` surface with no border/shadow, light mode is white + shadow; padding 13/10, 13px/20px text — line 1 is the user's message in the focused colour (near-black light / near-white dark), single-line ellipsized; line 2+ is the assistant's reply in the resting grey. Widths/pitch and the card are cross-validated between light (150% scale) and dark (200% scale) screenshots of the same client. |

### Configuration parameters

| Parameter | Default | Description |
| --- | ---: | --- |
| `variant` | `mixed` | Visual style: `mixed`, `deepseek`, or `codex`. |
| `position` | `default` | Rail side: `default` (variant's natural side — mixed/deepseek right, codex left), `left`, or `right` (forced). |
| `barWidth` | `12` (codex: `6`) | Resting bar width in px. |
| `focusedBarWidth` | `24` (codex: `26`) | Hovered / focused bar width in px. The `deepseek` variant is wave-free: its default equals `barWidth` (`8`), so the focused bar does not stretch. |
| `adjacentBarWidth` | `16` (codex: `20`) | First adjacent bar width in px. |
| `neighborBarWidth` | `13` (codex: `14`) | Second adjacent bar width in px. |
| `waveTransitionMs` | `100` | Wave transition duration in ms. **Shorter values feel harder/snappier; longer values feel softer/smoother.** |
| `previewEnabled` | `true` | Whether the message preview card is shown. |
| `previewWidth` | `240` (codex: `321`) | Preview card width in px. |
| `previewMaxHeight` | `132` (codex: `106`) | Preview card maximum height in px before overflow is hidden. |
| `panelMaxHeight` | `300` | DeepSeek list panel scrollable max height in px. |
| `minTurns` | `1` | Minimum number of user turns before the rail appears. |
| `hideOnNarrow` | `true` | Hide the rail on narrow screens (`max-width: 767px`). |
| `railOffsetRight` | `8` | Rail distance from the right edge in px. |
| `previewGap` | `10` | Gap between the rail and the preview card in px. |
| `itemWidth` | `28` (codex: `30`) | Click target / item width in px. |
| `itemHeight` | `14` (codex: `10`) | Item height in px (codex: row pitch). |
| `dotSize` | `8` (mixed / deepseek) / `2` (codex) | Codex variant tick height in px. |
| `scrollOffset` | `16` | Extra scroll offset when jumping to a turn in px. |
| `colors` | `{}` | Colour overrides; unset fields follow the DSH theme. Sub-fields: `bar`, `barActive` (current-turn marker, blue by default in DeepSeek), `barHover` (hovered/current bar, near-black by default in DeepSeek), `text`, `textActive`, `backdrop` (DeepSeek frosted pill), `panelBackground`. Values may be any CSS colour or a DSH token (e.g. `var(--dsw-alias-label-primary)`). Both the DeepSeek and Codex variants follow the DSH **application** theme (not the OS `prefers-color-scheme`): the component detects the active theme via the resolved `--dsw-alias-label-primary` token. Measured dark palettes — DeepSeek: frosted `rgba(21,21,23,.6)` pill, `rgba(255,255,255,.2)` dashes, `#ADB2B8` resting text, `#F9FAFB` active text/dash, `#232324` panel with a deeper shadow. Codex: grey ticks `rgb(70,70,70)`, hovered/current tick `rgb(223,223,223)`, card `#2C2C2C`, card body text `#949494`. |

Example — force left + custom active colour:
```yaml
dsh-turn-nav:
  variant: deepseek
  position: left
  colors:
    barActive: "#2563eb"
```

## Package layout

- `lib/client.js` — prebuilt browser plugin bundle (committed for direct use).
- `lib/index.js` — node half; registers the `dsh-turn-nav` settings namespace and reads the root config file.
- `dsh-turn-nav.config.json` — root-level defaults you can edit directly.
- `src/` — source code for reference.

## AI-generated notice

This plugin was AI-assisted. The source and prebuilt artifacts are provided for learning and testing. Review the source, test the behavior, and confirm it meets your expectations before using it in a production environment.

## License

MIT

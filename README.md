# dsh-turn-nav

English | [中文](README.zh.md)

> ⚠️ **AI-generated notice**: This plugin was AI-assisted. Test it in a safe environment before production use.

Codex-style turn histogram navigation rail for DeepSeek Harness Web.

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

The plugin registers a `dsh-turn-nav` settings namespace. Edit `$DSH_HOME/settings.yaml` (or `settings.json`) to override defaults:

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

// Update one or more fields (persisted through DSH settings).
dshTurnNav.updateConfig({ waveTransitionMs: 120 })

// Clear all user overrides and return to defaults.
dshTurnNav.resetConfig()
```

If a field is not configured, the default is used. The defaults keep the original short-bar feel while making the focused wave softer and rounder.

### Configuration parameters

| Parameter | Default | Description |
| --- | ---: | --- |
| `barWidth` | `12` | Resting bar width in px. |
| `focusedBarWidth` | `24` | Hovered / focused bar width in px. |
| `adjacentBarWidth` | `16` | First adjacent bar width in px. |
| `neighborBarWidth` | `13` | Second adjacent bar width in px. |
| `waveTransitionMs` | `100` | Wave transition duration in ms. **Shorter values feel harder/snappier; longer values feel softer/smoother.** |
| `previewEnabled` | `true` | Whether the message preview card is shown. |
| `previewWidth` | `240` | Preview card width in px. |
| `previewMaxHeight` | `132` | Preview card maximum height in px before overflow is hidden. |
| `minTurns` | `1` | Minimum number of user turns before the rail appears. |
| `hideOnNarrow` | `true` | Hide the rail on narrow screens (`max-width: 767px`). |
| `railOffsetRight` | `8` | Rail distance from the right edge in px. |
| `previewGap` | `10` | Gap between the rail and the preview card in px. |
| `itemWidth` | `28` | Click target / item width in px. |
| `itemHeight` | `14` | Item height in px. |
| `scrollOffset` | `16` | Extra scroll offset when jumping to a turn in px. |

## Package layout

- `lib/client.js` — prebuilt browser plugin bundle (committed for direct use).
- `lib/index.js` — node half; registers the `dsh-turn-nav` settings namespace.
- `src/` — source code for reference.

## AI-generated notice

This plugin was AI-assisted. The source and prebuilt artifacts are provided for learning and testing. Review the source, test the behavior, and confirm it meets your expectations before using it in a production environment.

## License

MIT

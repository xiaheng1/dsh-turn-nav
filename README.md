# dsh-turn-nav

English | [中文](README.zh.md)

> ⚠️ **AI-generated notice**: This plugin was AI-assisted. Test it in a safe environment before production use.

Codex-style turn histogram navigation rail for DeepSeek Harness Web.

Unfocused turns render as short bars on the right edge of the conversation. Hovering or keyboard-focusing a bar grows it into a wave (the focused bar is longest) and shows a preview card with the message you sent in that turn. To avoid flicker while sweeping along the rail, the pointer must stay on a bar for a short moment (300ms) before its preview appears. Clicking a bar smooth-scrolls the conversation to that turn.

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
2. Move the pointer over the right-edge rail: the bar under the pointer grows, adjacent bars form a wave, and a preview card shows the message you sent in that turn.
3. Click a bar to smooth-scroll to that turn.

The rail hides on narrow screens (`max-width: 767px`).

## Package layout

- `lib/client.js` — prebuilt browser plugin bundle (committed for direct use).
- `lib/index.js` — node half (empty `apply` stub).
- `src/` — source code for reference.

## AI-generated notice

This plugin was AI-assisted. The source and prebuilt artifacts are provided for learning and testing. Review the source, test the behavior, and confirm it meets your expectations before using it in a production environment.

## License

MIT

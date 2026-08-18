# dsh-turn-nav

> ⚠️ **AI 制作提示**：本插件由 AI 辅助生成。安装使用前请先在测试环境验证，确认交互与样式符合预期后再正式使用。

Codex-style turn histogram navigation rail for DeepSeek Harness Web.

Unfocused turns render as short bars on the right edge of the conversation.
Hovering or keyboard-focusing a bar grows it into a wave (the focused bar is
longest) and shows a preview card with the message you sent in that turn.
Clicking a bar smooth-scrolls the conversation to that turn.

## Install

```powershell
dsh plugin --profile web add git+https://github.com/<your-account>/dsh-turn-nav.git
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
2. Move the pointer over the right-edge rail: the bar under the pointer grows,
   adjacent bars form a wave, and a preview card shows the message you sent in
   that turn.
3. Click a bar to smooth-scroll to that turn.

The rail hides on narrow screens (`max-width: 767px`).

## Package layout

- `lib/client.js` — prebuilt browser plugin bundle (committed for direct use).
- `lib/index.js` — node half (empty `apply` stub).
- `src/` — source code for reference.

## License

MIT

## AI 制作提示

本插件由 AI 辅助生成。源码与预构建产物仅供学习与测试；在正式环境中使用前，请自行审查源码、测试功能，并确认其行为符合你的预期。

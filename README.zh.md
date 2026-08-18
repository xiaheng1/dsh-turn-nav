# dsh-turn-nav

[English](README.md) | 中文

> ⚠️ **AI 制作提示**：本插件由 AI 辅助生成。安装使用前请先在测试环境验证，确认交互与样式符合预期后再正式使用。

Codex 风格的 DeepSeek Harness Web 对话轮次直方图导航轨。

不聚焦时，每条用户消息在对话区右侧显示为一条短横条。鼠标悬停或键盘聚焦时，当前条变为最长，相邻条依次变短，形成波浪效果；同时会在左侧显示你发送的消息内容预览。为避免沿导航轨快速划过时预览反复闪烁，鼠标需要停留在某一条上约 300ms 后才会显示预览。点击任意条可平滑滚动到对应轮次。

## 安装

```powershell
dsh plugin --profile web add git+https://github.com/xiaheng1/dsh-turn-nav.git
dsh plugin --profile web install
```

然后重启 `dsh web`，并在浏览器中强制刷新（`Ctrl+F5`）。

本地文件夹安装：

```powershell
dsh plugin --profile web add <本机绝对路径>
dsh plugin --profile web install
```

## 使用

1. 打开一个工作区并进入会话。
2. 将鼠标移到右侧导航轨上：指针所在条变长，相邻条形成波浪，左侧出现该轮你发送的消息预览。
3. 点击任意条，平滑滚动到对应轮次。

窄屏（`max-width: 767px`）下自动隐藏。

## 目录结构

- `lib/client.js` — 预构建的浏览器插件包（已提交，可直接使用）。
- `lib/index.js` — node half（空的 `apply` 占位）。
- `src/` — 源代码，供参考。

## AI 制作提示

本插件由 AI 辅助生成。源码与预构建产物仅供学习与测试；在正式环境中使用前，请自行审查源码、测试功能，并确认其行为符合你的预期。

## License

MIT

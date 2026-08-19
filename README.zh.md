# dsh-turn-nav

[English](README.md) | 中文

> ⚠️ **AI 制作提示**：本插件由 AI 辅助生成。安装使用前请先在测试环境验证，确认交互与样式符合预期后再正式使用。

DeepSeek Harness Web 对话轮次直方图导航轨，支持 mixed / DeepSeek / Codex 三种视觉风格。

不聚焦时，每条用户消息在对话区右侧显示为一条短横条。鼠标悬停或键盘聚焦时，当前条变为最长，相邻条依次变短，形成波浪效果；同时会在左侧显示你发送的消息内容预览。沿导航轨快速划过时，预览卡片不会消失，而是平滑滑动到当前条位置并切换显示该轮消息文本。点击任意条可平滑滚动到对应轮次。

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
2. 将鼠标移到右侧导航轨上：指针所在条变长，相邻条形成波浪，左侧预览卡片平滑滑动到当前条并显示该轮你发送的消息。
3. 点击任意条，平滑滚动到对应轮次。

窄屏（`max-width: 767px`）下默认自动隐藏；如需保留导航轨，可设置 `hideOnNarrow: false`。

## 配置

最直接的修改方式是编辑仓库/插件包根目录下的 **`dsh-turn-nav.config.json`**。插件启动时会读取它作为 base 层；如果文件不存在，则使用内置默认值。

如需按部署覆盖，插件也注册了 `dsh-turn-nav` 设置命名空间。修改 `$DSH_HOME/settings.yaml`（或 `settings.json`）即可覆盖默认值：

```yaml
dsh-turn-nav:
  waveTransitionMs: 120
  barWidth: 14
  focusedBarWidth: 30
  previewEnabled: true
```

也可以在浏览器控制台读取和更新当前生效配置：

```js
// 读取当前生效配置。
dshTurnNav.getConfig()

// 更新一个或多个字段（会通过 DSH settings 持久化）。
dshTurnNav.updateConfig({ waveTransitionMs: 120 })

// 清除所有用户覆盖，恢复默认值。
dshTurnNav.resetConfig()
```

未配置的字段使用默认值。默认值保持原有短条质感，同时让聚焦波浪更柔和、更圆润。

### 变体

通过 `variant` 切换视觉风格：

| 变体 | 说明 |
| --- | --- |
| `mixed` | 当前默认：短条 + 宽度波浪 + 共享预览卡片。 |
| `deepseek` | 延续短条语言，静止时更细、更淡。 |
| `codex` | 语义化圆点，无波浪；悬停时单点高亮。 |

### 配置参数

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `variant` | `mixed` | 视觉风格：`mixed`、`deepseek` 或 `codex`。 |
| `barWidth` | `12` | 未聚焦条宽（px）。 |
| `focusedBarWidth` | `24` | 悬停/聚焦条宽（px）。 |
| `adjacentBarWidth` | `16` | 第一相邻条宽（px）。 |
| `neighborBarWidth` | `13` | 第二相邻条宽（px）。 |
| `waveTransitionMs` | `100` | 波浪过渡时长（ms）。**数值越短，视觉越“硬”、越干脆；数值越长，视觉越“软”、越平滑。** |
| `previewEnabled` | `true` | 是否显示消息预览卡片。 |
| `previewWidth` | `240` | 预览卡片宽度（px）。 |
| `previewMaxHeight` | `132` | 预览卡片最大高度（px），超出后隐藏溢出。 |
| `minTurns` | `1` | 至少多少轮用户消息后显示导航轨。 |
| `hideOnNarrow` | `true` | 窄屏（`max-width: 767px`）下是否隐藏导航轨。 |
| `railOffsetRight` | `8` | 导航轨距右边缘距离（px）。 |
| `previewGap` | `10` | 导航轨与预览卡片间距（px）。 |
| `itemWidth` | `28` | 点击目标/条目宽度（px）。 |
| `itemHeight` | `14` | 条目高度（px）。 |
| `dotSize` | `8` | Codex 变体圆点直径（px）。 |
| `scrollOffset` | `16` | 点击跳转时的额外滚动偏移（px）。 |

## 目录结构

- `lib/client.js` — 预构建的浏览器插件包（已提交，可直接使用）。
- `lib/index.js` — node half，注册 `dsh-turn-nav` 设置命名空间并读取根目录配置文件。
- `dsh-turn-nav.config.json` — 根目录默认配置，可直接编辑。
- `src/` — 源代码，供参考。

## AI 制作提示

本插件由 AI 辅助生成。源码与预构建产物仅供学习与测试；在正式环境中使用前，请自行审查源码、测试功能，并确认其行为符合你的预期。

## License

MIT

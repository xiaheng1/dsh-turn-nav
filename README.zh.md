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

最直接的修改方式是编辑仓库/插件包根目录下的 **`dsh-turn-nav.config.json`**。插件启动时会读取它作为 base 层；如果文件不存在，则使用内置默认值。请只写入你真正想固定的字段——未填写的视觉尺寸会回落到当前变体自身的默认值，因此切换 `variant` 时会按新变体的外观重新取基线，而不会继承上一个变体的尺寸（例如切到 `codex` 而不固定 `barWidth`，得到的是 codex 的 6px 静止刻度，而不是 mixed 的 12px 条）。

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

// 更新一个或多个字段（会话内即时生效，不写回 settings 文档；
// 要持久化请改 dsh-turn-nav.config.json 或 settings.yaml）。
dshTurnNav.updateConfig({ waveTransitionMs: 120 })

// 清除所有用户覆盖，恢复默认值。
dshTurnNav.resetConfig()
```

未配置的字段使用对应变体的推荐默认值（`mixed` / `deepseek` / `codex` 各有不同）。默认值保持原有短条质感，同时让聚焦波浪更柔和、更圆润。

### 变体

通过 `variant` 切换视觉风格：

| 变体 | 说明 |
| --- | --- |
| `mixed` | 当前默认：右侧短条 + 宽度波浪 + 左侧共享预览卡片。 |
| `deepseek` | 单一列表双态呈现（对齐真实 quick-nav）：收起时是 34px 磨砂短条列（8×2px、30px 行距、文本隐藏），悬停展开为 240px 清单卡片，短条与卡片行一一对齐；当前对话轮次的短条标记为蓝色，随对话滚动在行间瞬时切换（对齐原生 quick-nav），当对话滚动使该行超出面板可视区时，面板平滑滚动将蓝条带回中间；点击收起列可跳转到当前轮次。悬停行文字与短条变近黑，移出收起。卡片可滚动、上下渐隐，完全无波浪。 |
| `codex` | 左侧密集刻度条，贴齐会话窗口左缘（侧边栏右侧），刻度左缘距会话列左缘约 15px；随侧边栏拖动/收起自动跟随不悬空，仅顶部边缘渐隐（底部不渐隐）。静止刻度是 6×2px 灰色短条（浅色 `rgb(210,211,211)` / 深色 `rgb(70,70,70)`），行距 10px。悬停/聚焦时，聚焦条变为主题最强前景色（浅色近黑 `rgb(26,28,31)` / 深色近白 `rgb(223,223,223)`，26×2px），两侧各 3 条（20/14/10px）仅加长、保持灰色——形成 7 条长度波浪；点击/当前轮刻度持续近黑（同悬停色），悬停刻度保持默认箭头光标（不变手型）。预览卡片在右侧弹出：宽 321px、距刻度 10px、以悬停条垂直居中，深色为纯 `#2C2C2C` 无边框无阴影，浅色为白底+阴影；padding 13/10，13px/20px 文字——第一行为用户消息（聚焦色：浅色近黑/深色近白，单行省略号），第二行起为助手回答（静止灰）。刻度与卡片尺寸均为浅色（150% 缩放）与深色（200% 缩放）同客户端截图交叉验证结果。 |

### 配置参数

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `variant` | `mixed` | 视觉风格：`mixed`、`deepseek` 或 `codex`。 |
| `position` | `default` | 导航轨位置：`default`（沿用变体内建位置，mixed/deepseek 在右、codex 在左）、`left` 或 `right`（强制指定）。 |
| `barWidth` | `12`（codex：`6`）| 未聚焦条宽（px）。 |
| `focusedBarWidth` | `24`（codex：`26`）| 悬停/聚焦条宽（px）。`deepseek` 变体无波浪，默认等于 `barWidth`（`8`），聚焦条不伸长。 |
| `adjacentBarWidth` | `16`（codex：`20`）| 第一相邻条宽（px）。 |
| `neighborBarWidth` | `13`（codex：`14`）| 第二相邻条宽（px）。 |
| `waveTransitionMs` | `100` | 波浪过渡时长（ms）。**数值越短，视觉越“硬”、越干脆；数值越长，视觉越“软”、越平滑。** |
| `previewEnabled` | `true` | 是否显示消息预览卡片。 |
| `previewWidth` | `240`（codex：`321`）| 预览卡片宽度（px）。 |
| `previewMaxHeight` | `132`（codex：`106`）| 预览卡片最大高度（px），超出后隐藏溢出。 |
| `panelMaxHeight` | `300` | DeepSeek 清单面板可滚动最大高度（px）。 |
| `minTurns` | `1` | 至少多少轮用户消息后显示导航轨。 |
| `hideOnNarrow` | `true` | 窄屏（`max-width: 767px`）下是否隐藏导航轨。 |
| `railOffsetRight` | `8` | 导航轨距右边缘距离（px）。 |
| `previewGap` | `10` | 导航轨与预览卡片间距（px）。 |
| `itemWidth` | `28`（codex：`30`）| 点击目标/条目宽度（px）。 |
| `itemHeight` | `14`（codex：`10`）| 条目高度（px）（codex：行距）。 |
| `dotSize` | `8`（mixed / deepseek）/ `2`（codex）| Codex 变体刻度条高度（px）。 |
| `scrollOffset` | `16` | 点击跳转时的额外滚动偏移（px）。 |
| `colors` | `{}` | 颜色覆写，未设置的字段跟随 DSH 主题。子字段：`bar`（条）、`barActive`（当前轮次标记条，DeepSeek 默认蓝）、`barHover`（悬停/当前条，DeepSeek 默认近黑）、`text`（预览/面板文本）、`textActive`（激活行文本）、`backdrop`（DeepSeek 磨砂底衬）、`panelBackground`（面板/卡片背景）。值可为任意 CSS 颜色或 DSH token（如 `var(--dsw-alias-label-primary)`）。DeepSeek 与 Codex 变体均跟随 DSH **应用主题**（非系统 `prefers-color-scheme`）：组件通过读取 `--dsw-alias-label-primary` 的解析值检测当前主题。实测深色调色板——DeepSeek：磨砂底衬 `rgba(21,21,23,.6)`、短条 `rgba(255,255,255,.2)`、静止文本 `#ADB2B8`、激活文本/短条 `#F9FAFB`、面板 `#232324` + 更深阴影；Codex：灰色刻度 `rgb(70,70,70)`、悬停/当前刻度 `rgb(223,223,223)`、卡片 `#2C2C2C`、卡片正文 `#949494`。 |

示例：强制左侧 + 自定义激活色
```yaml
dsh-turn-nav:
  variant: deepseek
  position: left
  colors:
    barActive: "#2563eb"
```

## 目录结构

- `lib/client.js` — 预构建的浏览器插件包（已提交，可直接使用）。
- `lib/index.js` — node half，注册 `dsh-turn-nav` 设置命名空间并读取根目录配置文件。
- `dsh-turn-nav.config.json` — 根目录默认配置，可直接编辑。
- `src/` — 源代码，供参考。

## AI 制作提示

本插件由 AI 辅助生成。源码与预构建产物仅供学习与测试；在正式环境中使用前，请自行审查源码、测试功能，并确认其行为符合你的预期。

## License

MIT

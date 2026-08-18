# AGENTS.md — dsh-turn-nav 独立项目 AI 助手第一入口

本文件供 AI 编码助手在 `dsh-turn-nav` 独立项目中使用。开始改动前先读本文件、`README.md`、`CONTRIBUTING.md`。

## 项目是什么

`dsh-turn-nav` 是 **DeepSeek Harness Web 客户端插件**，提供对话轮次直方图导航：

- 右侧固定导航轨，将用户/steering 轮次渲染为短条
- hover/键盘聚焦时形成波浪效果，并显示该轮消息预览
- 点击条平滑滚动到对应对话位置

## 技术栈与结构

- TypeScript + React + CSS Modules
- 浏览器端源码在 `src/client/`
  - `TurnHistogramNav.tsx`：主组件与交互逻辑
  - `TurnHistogramNav.module.css`：样式（波浪/预览/布局）
  - `index.ts`：插件注册入口
- 发布/运行入口在 `lib/`
  - `lib/client.js`：浏览器端 bundle，由 DSH ModuleLoader 加载
  - `lib/index.js`：node 端空实现
- `package.json` 通过 `dsh.client` / `dsh.bundle` 声明插件形态

## 重要约定

1. **源码为准**：`src/client/` 是真正的源码；`lib/client.js` 是打包产物，必须与 `src/` 同步。
2. **独立仓库不直接改 DeepSeek-Harness 官方源码**：本插件通过 `conversation.composer.dock` slot 挂载，不修改 `ui-conversation`。
3. **同步 `lib/client.js` 时保持插件 ID 不变**：
   - loader `id` 必须是 `"dsh-turn-nav"`
   - style tag `id` / `dataset.plugin` 必须是 `"dsh-turn-nav"`
   - CSS module 哈希类名要与 `src/client/TurnHistogramNav.module.css` 一致
4. **改动交互或视觉后**，同步更新 `README.md`、`README.zh.md`、`CHANGELOG.md`。
5. **提交前检查**：
   - `node --check lib/client.js`
   - `npm pack --dry-run`
   - 若在 DeepSeek-Harness 工作区内开发：`pnpm --filter @deepseek-ai/dsh-client-ui-turn-nav run bundle` + `pnpm --filter @deepseek-ai/dsh-client-ui-turn-nav exec tsc -b`
6. **不要提交** `node_modules/`、`*.tgz`、`demo-frames/`、`demo.gif`（已加入 `.gitignore`）。
7. **语言**：与用户交流用中文；README 保持中英双语；代码注释中英均可。

## 常用命令

- `npm pack --dry-run`：检查发布包内容与体积
- `node --check lib/client.js`：校验 bundle 语法
- `node scripts/record-demo.mjs`：Playwright 帧录制演示
- `python scripts/make-gif.py demo-frames demo.gif --duration 30`：合成 GIF
- `python scripts/mouse-demo.py`：Zoominator/OBS 系统鼠标演示

## 当前功能状态

- 已完成：短条/波浪、共享预览卡片平滑过渡、点击跳转、独立 GitHub 包、录制工具链。
- 规划中：4.4 配置化（配置文件 + 设置接口）。

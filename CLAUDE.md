# CLAUDE.md

Claude Code 项目指引。请先阅读 `AGENTS.md`，那里是本仓库的完整 AI 助手约定。

## 快速要点

- 这是一个 DeepSeek Harness Web 客户端插件：`dsh-turn-nav`。
- 源码在 `src/client/`，发布 bundle 在 `lib/client.js`，两者必须同步。
- 不要修改 DeepSeek-Harness 官方源码；插件通过 `conversation.composer.dock` slot 挂载。
- 修改交互/视觉后同步更新 README 中英与 CHANGELOG。
- 提交前运行 `node --check lib/client.js` 和 `npm pack --dry-run`。

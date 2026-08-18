# 维护指南

## 日常流程

1. 用户通过 Issues 报告问题或提建议。
2. 你给 Issue 打标签：`bug`、`enhancement`、`question`。
3. 修复或实现时，新建分支：
   ```powershell
   git checkout -b fix/some-bug
   ```
4. 提交并推送到 GitHub：
   ```powershell
   git add .
   git commit -m "fix: some bug"
   git push -u origin fix/some-bug
   ```
5. 在 GitHub 仓库页面打开 Pull Request，按 PR 模板填写。
6. 等 GitHub Actions 变绿后合并 PR。

## 常用标签

- `bug` — 缺陷
- `enhancement` — 功能增强
- `question` — 使用问题
- `documentation` — 文档
- `good first issue` — 适合新手

## 发布 Release

1. 确认 `main` 分支 Actions 已通过。
2. 在 GitHub 仓库页面进入 Releases，点击 Draft a new release。
3. 创建标签，例如 `v0.1.0`。
4. 填写说明，并上传 Actions 产出的 `dsh-turn-nav-0.1.0.tgz`。

## 本地同步

```powershell
git pull origin main
```

## 依赖安装与常见问题

### 核心原则

1. **不要依赖全局 `dsh` 的模块解析**
   - 全局安装的 `dsh` 启动时，不会自动把当前项目根目录的 `node_modules` 加入解析路径。
   - 插件必须作为项目/工作区的一个可解析依赖存在，由项目包管理器安装。

2. **项目用 pnpm，就始终用 pnpm**
   - 在 pnpm workspace 中不要混用 `npm install`。
   - 公共依赖在根目录用：
     ```powershell
     pnpm add -w <package>
     ```
   - 本地 workspace 包用：
     ```json
     "@deepseek-ai/schemastery": "workspace:^"
     ```

3. **避免使用 `link:` 相对路径**
   - `link:vendor\schemastery` 依赖文件系统相对位置，插件被复制/移动后极易失效。
   - 优先使用：
     - `workspace:^`：在 monorepo 内引用本地包
     - npm 版本号：独立插件包发布后直接从 npm 安装

### 当前插件的依赖写法

独立仓库 `dsh-turn-nav` 当前应保持：

```json
"dependencies": {
  "@deepseek-ai/dsh-settings": "^0.1.0-rc.5",
  "@deepseek-ai/schemastery": "^3.18.1"
}
```

不要改成 `link:vendor\schemastery` 或依赖某个不存在的本地 vendor 路径。

### 排查 `Cannot find package '@deepseek-ai/schemastery'`

出现类似：

```text
Cannot find package '@deepseek-ai/schemastery' imported from ...\dsh-turn-nav\lib\index.js
```

按顺序检查：

1. 插件 `package.json` 的 `dependencies` 是否使用标准版本号或 `workspace:^`。
2. 是否在 pnpm workspace 中误用了 `npm install`。
3. 是否在插件目录下创建了不存在/错误的 `vendor` 链接。
4. 是否把插件复制进 monorepo 后忘记加入 `workspaces` 或执行 `pnpm install`。
5. `dsh.config.js` / 插件入口是否使用包名而非错误相对路径。

修复后统一执行：

```powershell
pnpm install
```

再启动 `dsh web`。

### 文档化建议

后续新增 DSH 插件时，按以下顺序处理：

1. 在 workspace 中创建插件包。
2. 用 `workspace:^` 或 npm 版本号声明依赖。
3. 在 `dsh.config.js` 中使用包名引用插件。
4. 用 `pnpm install` 安装后启动。

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

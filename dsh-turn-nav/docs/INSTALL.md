# 安装与验证

## 安装

```powershell
dsh plugin --profile web add git+https://github.com/xiaheng1/dsh-turn-nav.git
dsh plugin --profile web install
```

## 验证

1. 重启 `dsh web`。
2. 浏览器强制刷新：`Ctrl+F5`。
3. 打开一个真实会话，右侧应出现导航短条。
4. 鼠标悬停短条，应出现波浪，并在左侧显示该轮消息预览。
5. 点击短条，应平滑滚动到对应轮次。

## 卸载

```powershell
dsh plugin --profile web remove dsh-turn-nav
dsh plugin --profile web install
```

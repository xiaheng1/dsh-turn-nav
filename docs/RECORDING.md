# 录制演示 GIF / 视频（OBS + Zoominator）

## 安装 Zoominator

1. 从 [mmlTools/zoominator Releases](https://github.com/mmlTools/zoominator/releases) 下载 Windows 版。
2. 将 `zoominator.dll` 放入：
   ```
   C:\Program Files\obs-studio\obs-plugins\64bit\
   ```
3. 重启 OBS。

## 打开 Zoominator

Zoominator **不是源滤镜**，不在源的滤镜列表里。

位置：

```
OBS 顶部菜单 → 工具 → Zoominator
```

## 配置触发器

在 Zoominator 窗口里：

1. 点击 `Dialog.Tab.Trigger`
2. 设置 `Dialog.Trigger.Keyboard` 快捷键（例如 `F9`）
3. 也可以设置 `Dialog.Trigger.MouseButton` 作为鼠标触发

## 录制流程

1. OBS 添加显示器/窗口源，开始录制。
2. 按快捷键（如 `F9`）启动 Zoominator 跟随。
3. 运行系统鼠标演示脚本：
   ```powershell
   cd C:\Users\czx\Desktop\code\DSH\dsh-turn-nav
   npm run demo:mouse
   ```
4. 脚本会提示你依次把鼠标放到：
   - 底部导航条
   - 顶部导航条
   - 要点击的导航条
   每个位置放好后按回车。
5. 脚本会自动完成：自下而上扫过 → 悬停 → 点击跳转。
6. 录制完成后，再按一次快捷键关闭 Zoominator 跟随。

## 固定坐标模式

```powershell
python scripts/mouse-demo.py --bottom 1874,946 --top 1874,306 --target 1874,474
```

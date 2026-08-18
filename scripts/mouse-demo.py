"""Smoothly move the real Windows mouse for a Zoominator / OBS recording.

Usage:
    python scripts/mouse-demo.py
        Prompts you to move the mouse to three points:
        bottom rail item -> top rail item -> target item.
        Press Enter after each.

    python scripts/mouse-demo.py --bottom 1874,946 --top 1874,306 --target 1874,474
        Skips calibration and runs the same sequence with fixed coordinates.
"""
import argparse
import ctypes
import time

from ctypes import wintypes

user32 = ctypes.windll.user32

MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004


def parse_point(text: str):
    x, y = text.split(',', 1)
    return int(x.strip()), int(y.strip())


def get_cursor() -> tuple[int, int]:
    pt = wintypes.POINT()
    user32.GetCursorPos(ctypes.byref(pt))
    return pt.x, pt.y


def set_cursor(x: int, y: int) -> None:
    user32.SetCursorPos(x, y)


def click(x: int, y: int) -> None:
    set_cursor(x, y)
    time.sleep(0.1)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)


def ease(t: float) -> float:
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def move_to(x: int, y: int, steps: int = 90, hold: float = 0.012) -> None:
    sx, sy = get_cursor()
    for i in range(1, steps + 1):
        t = i / steps
        e = ease(t)
        set_cursor(round(sx + (x - sx) * e), round(sy + (y - sy) * e))
        time.sleep(hold)
    set_cursor(x, y)


def ask_point(name: str) -> tuple[int, int]:
    input(f'把鼠标移到【{name}】，然后回车：')
    x, y = get_cursor()
    print(f'  {name} = {x},{y}')
    return x, y


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='System mouse demo for Zoominator / OBS')
    parser.add_argument('--bottom', help='bottom point: x,y')
    parser.add_argument('--top', help='top point: x,y')
    parser.add_argument('--target', help='target item point: x,y')
    parser.add_argument('--steps', type=int, default=90, help='sweep interpolation steps')
    parser.add_argument('--hold', type=float, default=0.012, help='seconds between steps')
    parser.add_argument('--hover', type=float, default=1.6, help='hover seconds on target before click')
    parser.add_argument('--jump-wait', type=float, default=2.2, help='seconds to wait after click')
    parser.add_argument('--countdown', type=float, default=3.0, help='countdown before starting')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    bottom = parse_point(args.bottom) if args.bottom else ask_point('底部导航条')
    top = parse_point(args.top) if args.top else ask_point('顶部导航条')
    target = parse_point(args.target) if args.target else ask_point('要点击的导航条')

    print('准备开始。请切到 OBS 录制，然后保持窗口聚焦。')
    for i in range(int(args.countdown), 0, -1):
        print(f'{i}...')
        time.sleep(1)

    print('自下而上扫过导航轨')
    move_to(top[0], top[1], args.steps, args.hold)

    print('移动到目标导航点并悬停')
    move_to(target[0], target[1], 30, 0.012)
    time.sleep(args.hover)

    print('点击目标，展示跳转')
    click(target[0], target[1])
    time.sleep(args.jump_wait)
    print('完成')


if __name__ == '__main__':
    main()

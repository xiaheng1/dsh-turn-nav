"""Stitch captured PNG frames into a GIF with Pillow."""
import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Stitch demo frames into a GIF')
    parser.add_argument('frames', type=Path, help='directory containing 0000.png ...')
    parser.add_argument('out', type=Path, help='output .gif path')
    parser.add_argument('--duration', type=int, default=30, help='frame duration in ms')
    parser.add_argument('--scale', type=float, default=1.0, help='resize factor, e.g. 0.8')
    parser.add_argument('--width', type=int, default=900, help='target GIF width in px')
    parser.add_argument('--height', type=int, default=None, help='target GIF height in px; defaults to first-frame aspect')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    files = sorted(args.frames.glob('*.png'))
    if not files:
        raise SystemExit(f'No PNG frames found in {args.frames}')
    images = []
    for file in files:
        img = Image.open(file).convert('RGB')
        images.append(img)

    if not images:
        raise SystemExit('No images loaded')
    first = images[0]
    target_width = max(1, int(args.width * args.scale))
    target_height = max(1, int((first.height / first.width) * target_width)) if args.height is None else max(1, int(args.height * args.scale))

    resized = []
    for img in images:
        if img.size != (target_width, target_height):
            img = img.resize((target_width, target_height))
        resized.append(img)
    images = resized
    images[0].save(
        args.out,
        save_all=True,
        append_images=images[1:],
        duration=args.duration,
        loop=0,
        optimize=True,
    )
    print(f'Wrote {args.out} ({len(images)} frames)')


if __name__ == '__main__':
    main()

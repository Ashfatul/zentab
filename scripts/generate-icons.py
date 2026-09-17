import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    padding = max(1, size // 16)
    radius = (size - 2 * padding) // 2
    center = size // 2

    # Draw rounded background circle (emerald #10b981)
    bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(bbox, fill=(16, 185, 129, 255))

    # Inner zen circle or mark
    inner_pad = max(2, size // 4)
    inner_bbox = [inner_pad, inner_pad, size - inner_pad, size - inner_pad]
    draw.ellipse(inner_bbox, outline=(255, 255, 255, 240), width=max(1, size // 10))

    # Center dot
    dot_rad = max(1, size // 10)
    dot_bbox = [center - dot_rad, center - dot_rad, center + dot_rad, center + dot_rad]
    draw.ellipse(dot_bbox, fill=(255, 255, 255, 255))

    return img

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 32, 48, 128]
    for size in sizes:
        img = create_icon(size)
        filepath = os.path.join(icons_dir, f'icon{size}.png')
        img.save(filepath, 'PNG')
        print(f"Generated {filepath} ({size}x{size})")

if __name__ == '__main__':
    main()

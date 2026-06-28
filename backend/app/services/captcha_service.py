"""Self-hosted image grid captcha.

Generates a 3x3 grid of shape images (rendered via Pillow) and asks the
user to select all images of a target shape. Challenges are stored
in-memory with a short TTL (5 minutes) for verification.

Shapes: star, circle, triangle, square, diamond, hexagon
Each image has random background noise, rotation, and color variation
so automated parsing is non-trivial.
"""
from __future__ import annotations

import io
import math
import random
import secrets
import time
import base64
from typing import Any

from PIL import Image, ImageDraw, ImageFilter

SHAPES = ["star", "circle", "triangle", "square", "diamond", "hexagon"]
CHALLENGE_TTL = 300  # 5 minutes
IMG_SIZE = 120

# In-memory challenge store. For single-process dev/small-scale this is fine.
# Multi-worker production should swap for Redis or MongoDB TTL collection.
_challenges: dict[str, dict[str, Any]] = {}


def _cleanup_expired() -> None:
    """Remove expired challenges to prevent memory leak."""
    now = time.time()
    expired = [k for k, v in _challenges.items() if now - v["created"] > CHALLENGE_TTL]
    for k in expired:
        del _challenges[k]


def _random_color() -> tuple[int, int, int]:
    """Generate a vivid random color."""
    hue = random.randint(0, 360)
    # Convert HSV to RGB (full saturation, high value)
    import colorsys
    r, g, b = colorsys.hsv_to_rgb(hue / 360, 0.7 + random.random() * 0.3, 0.6 + random.random() * 0.4)
    return (int(r * 255), int(g * 255), int(b * 255))


def _draw_noise(draw: ImageDraw.ImageDraw, size: int) -> None:
    """Add random dots/lines noise to background."""
    for _ in range(random.randint(15, 30)):
        x, y = random.randint(0, size), random.randint(0, size)
        r = random.randint(2, 5)
        color = (random.randint(150, 220), random.randint(150, 220), random.randint(150, 220))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)
    for _ in range(random.randint(3, 6)):
        x1, y1 = random.randint(0, size), random.randint(0, size)
        x2, y2 = random.randint(0, size), random.randint(0, size)
        color = (random.randint(180, 230), random.randint(180, 230), random.randint(180, 230))
        draw.line([x1, y1, x2, y2], fill=color, width=1)


def _draw_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    points = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        radius = r if i % 2 == 0 else r * 0.4
        points.append((cx + radius * math.cos(angle), cy - radius * math.sin(angle)))
    draw.polygon(points, fill=color, outline=(0, 0, 0))


def _draw_circle(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color, outline=(0, 0, 0))


def _draw_triangle(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    points = []
    for i in range(3):
        angle = math.pi / 2 + i * 2 * math.pi / 3
        points.append((cx + r * math.cos(angle), cy - r * math.sin(angle)))
    draw.polygon(points, fill=color, outline=(0, 0, 0))


def _draw_square(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    half = int(r * 0.8)
    draw.rectangle([cx - half, cy - half, cx + half, cy + half], fill=color, outline=(0, 0, 0))


def _draw_diamond(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    points = [(cx, cy - r), (cx + r * 0.7, cy), (cx, cy + r), (cx - r * 0.7, cy)]
    draw.polygon(points, fill=color, outline=(0, 0, 0))


def _draw_hexagon(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple) -> None:
    points = []
    for i in range(6):
        angle = i * math.pi / 3
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=color, outline=(0, 0, 0))


DRAW_FN = {
    "star": _draw_star,
    "circle": _draw_circle,
    "triangle": _draw_triangle,
    "square": _draw_square,
    "diamond": _draw_diamond,
    "hexagon": _draw_hexagon,
}

SHAPE_LABELS = {
    "star": "stars",
    "circle": "circles",
    "triangle": "triangles",
    "square": "squares",
    "diamond": "diamonds",
    "hexagon": "hexagons",
}


def _render_shape_image(shape: str) -> str:
    """Render a single shape image and return as base64 PNG data URI."""
    img = Image.new("RGB", (IMG_SIZE, IMG_SIZE), (240, 240, 240))
    draw = ImageDraw.Draw(img)

    # Background noise
    _draw_noise(draw, IMG_SIZE)

    # Draw shape with random color, slight size variation
    color = _random_color()
    cx, cy = IMG_SIZE // 2, IMG_SIZE // 2
    r = random.randint(28, 38)
    DRAW_FN[shape](draw, cx, cy, r, color)

    # Apply slight blur for anti-aliasing and to make OCR harder
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))

    # Random rotation
    angle = random.randint(-15, 15)
    img = img.rotate(angle, fillcolor=(240, 240, 240))

    # Encode to base64
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/png;base64,{b64}"


def generate_challenge() -> dict[str, Any]:
    """Generate a new captcha challenge.

    Returns dict with:
    - id: challenge identifier
    - target: human-readable target label (e.g. "stars")
    - images: list of 9 base64 image data URIs
    """
    _cleanup_expired()

    # Pick target shape and fill grid
    target_shape = random.choice(SHAPES)
    other_shapes = [s for s in SHAPES if s != target_shape]

    # 2-4 target images in random positions
    num_targets = random.randint(2, 4)
    grid_shapes = [target_shape] * num_targets + [
        random.choice(other_shapes) for _ in range(9 - num_targets)
    ]
    random.shuffle(grid_shapes)

    # Render images
    images = [_render_shape_image(shape) for shape in grid_shapes]

    # Correct answer: indices where target_shape appears
    correct_indices = [i for i, s in enumerate(grid_shapes) if s == target_shape]

    # Store challenge
    challenge_id = secrets.token_urlsafe(16)
    _challenges[challenge_id] = {
        "correct": sorted(correct_indices),
        "created": time.time(),
    }

    return {
        "id": challenge_id,
        "target": SHAPE_LABELS[target_shape],
        "images": images,
    }


def verify_challenge(challenge_id: str, selected_indices: list[int]) -> bool:
    """Verify a captcha response. Returns True if correct.

    Consumes the challenge (one-time use) regardless of result.
    """
    _cleanup_expired()

    challenge = _challenges.pop(challenge_id, None)
    if not challenge:
        return False

    if time.time() - challenge["created"] > CHALLENGE_TTL:
        return False

    return sorted(selected_indices) == challenge["correct"]

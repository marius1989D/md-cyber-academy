#!/usr/bin/env python3
"""
Render a LinkedIn carousel to PNG slides and a combined PDF, locked to the
MD Cyber Academy brand defined in docs/brand.md.

Usage:
    python3 scripts/build_carousel.py content/carousel-deployment.json out/deployment

Slide JSON is a list of objects:
    {"title": "...", "bullets": ["...", "..."], "kicker": "optional label"}

Inline markup inside titles and bullets:
    `code`   -> JetBrains Mono in ACCENT_WARM
    *word*   -> emphasised in ACCENT

The palette, margins and type scale are the single source of truth for every
outward-facing post. Change them here, not per design.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "assets" / "fonts"
LOGO = ROOT / "public" / "brand" / "md-logo.png"

# --- Brand tokens (docs/brand.md) --------------------------------------------
W, H = 1080, 1350
SURFACE = "#14100d"
TEXT = "#f0e9dd"
TEXT_2 = "#cbbfae"
ACCENT = "#ef7a55"
ACCENT_WARM = "#f59042"
RULE = "#3a3028"

MARGIN = 88
LOGO_W = 168
LOGO_H = round(168 * 639 / 1200)
TITLE_SIZE = 74
TITLE_LEAD = 1.12
KICKER_SIZE = 26
BODY_SIZE = 31
BODY_LEAD = 1.5
BULLET_GAP = 56


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


TOKEN = re.compile(r"(`[^`]+`|\*[^*]+\*)")


def runs(text: str, size: int, *, title: bool):
    """Split text into (string, font, colour) runs honouring `code` and *accent*."""
    body_face = "Syne-ExtraBold.ttf" if title else "Inter-Regular.ttf"
    mono_face = "JetBrainsMono-Bold.ttf" if title else "JetBrainsMono-Regular.ttf"
    base_colour = TEXT if title else TEXT_2
    # Mono renders visually larger than Inter at the same nominal size.
    mono_size = int(size * (0.86 if title else 0.92))
    out = []
    for part in TOKEN.split(text):
        if not part:
            continue
        if part.startswith("`") and part.endswith("`"):
            out.append((part[1:-1], font(mono_face, mono_size), ACCENT_WARM))
        elif part.startswith("*") and part.endswith("*"):
            out.append((part[1:-1], font(body_face, size), ACCENT))
        else:
            out.append((part, font(body_face, size), base_colour))
    return out


def wrap(draw, parts, max_w):
    """Greedy word wrap across styled runs. Returns list of lines of runs.

    Leading whitespace stays attached to its word, so the space between a
    `code` run and the prose following it survives. Dropping it silently
    welds the two together ("src/worker.tsroutes").
    """
    lines, line, x = [], [], 0
    for text, f, colour in parts:
        words = re.findall(r"\s*\S+", text) or [text]
        # A run ending in whitespace loses it to the regex; re-attach it or the
        # run that follows welds on ("routes/api/progress", "likefixed").
        trailing = re.search(r"\s+$", text)
        if trailing and words:
            words[-1] += trailing.group(0)
        for word in words:
            w = draw.textlength(word, font=f)
            if x + w > max_w and line:
                lines.append(line)
                line, x = [], 0
                word = word.lstrip()
                w = draw.textlength(word, font=f)
            line.append((word, f, colour))
            x += w
    if line:
        lines.append(line)
    return lines


def block_height(lines, leading):
    return sum(int(max(f.size for _, f, _ in line) * leading) for line in lines)


def draw_lines(draw, lines, x0, y, leading):
    for line in lines:
        x = x0
        height = 0
        for word, f, colour in line:
            draw.text((x, y), word, font=f, fill=colour)
            x += draw.textlength(word, font=f)
            height = max(height, f.size)
        y += int(height * leading)
    return y


def render_slide(spec: dict, index: int, total: int, logo: Image.Image) -> Image.Image:
    img = Image.new("RGB", (W, H), SURFACE)
    d = ImageDraw.Draw(img)
    max_w = W - 2 * MARGIN
    y = MARGIN + 30

    if spec.get("kicker"):
        kf = font("JetBrainsMono-Regular.ttf", KICKER_SIZE)
        d.text((MARGIN, y), spec["kicker"].upper(), font=kf, fill=ACCENT)
        y += int(KICKER_SIZE * 2.2)

    title_lines = wrap(d, runs(spec["title"], TITLE_SIZE, title=True), max_w)
    y = draw_lines(d, title_lines, MARGIN, y, TITLE_LEAD)

    y += 46
    d.line([(MARGIN, y), (W - MARGIN, y)], fill=RULE, width=2)
    y += 62

    # Distribute the bullets through the space left above the logo rather than
    # stacking them at the top and leaving a dead third at the bottom.
    wrapped = [
        wrap(d, runs(b, BODY_SIZE, title=False), max_w - 46)
        for b in spec.get("bullets", [])
    ]
    if wrapped:
        floor = H - MARGIN - LOGO_H - 56
        used = sum(block_height(w, BODY_LEAD) for w in wrapped)
        slack = floor - y - used
        # Clamp tightly: the gap should absorb a little slack without varying
        # so much between slides that the sequence looks inconsistent.
        gap = min(max(BULLET_GAP, slack // max(len(wrapped) - 1, 1)), BULLET_GAP + 30)
        for lines in wrapped:
            d.ellipse([MARGIN, y + 13, MARGIN + 11, y + 24], fill=ACCENT)
            y = draw_lines(d, lines, MARGIN + 46, y, BODY_LEAD)
            y += gap

    # slide number bottom-left
    nf = font("JetBrainsMono-Regular.ttf", 25)
    d.text((MARGIN, H - MARGIN - 26), f"{index:02d}/{total:02d}", font=nf, fill=TEXT_2)

    # logo bottom-right
    img.paste(logo, (W - MARGIN - logo.width, H - MARGIN - logo.height + 4), logo)
    return img


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    spec_path, out_prefix = Path(sys.argv[1]), Path(sys.argv[2])
    slides = json.loads(spec_path.read_text())
    out_prefix.parent.mkdir(parents=True, exist_ok=True)

    logo = Image.open(LOGO).convert("RGBA")
    logo = logo.resize((LOGO_W, round(LOGO_W * logo.height / logo.width)), Image.LANCZOS)

    images = [
        render_slide(s, i + 1, len(slides), logo) for i, s in enumerate(slides)
    ]
    for i, im in enumerate(images, 1):
        im.save(f"{out_prefix}-{i:02d}.png")
    images[0].save(
        f"{out_prefix}.pdf", save_all=True, append_images=images[1:], resolution=72.0
    )
    print(f"Wrote {len(images)} slides and {out_prefix}.pdf")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

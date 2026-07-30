# MD Cyber Academy — social/post brand

The locked visual system for LinkedIn carousels, blog headers and any other
outward-facing post. Derived from the site's own design tokens in
`src/styles/global.css`, so posts and platform stay one identity.

Every value here has been checked with a WCAG contrast calculation against the
surface it sits on. The ratios are the reason for the choices, not decoration.

---

## Surface: dark, always

Posts use the site's **night** palette, not the parchment day palette.

This is a deliberate decision, and the logo forced it. The logo green
`#00b040` scores **2.54:1** on parchment `#f5f0e8` — well under the 4.5:1 AA
threshold, and unusable. On the night surface `#14100d` the same green scores
**6.56:1** and passes comfortably. Dark is the only surface where the existing
logo and the existing palette coexist without recolouring one of them.

---

## Palette

| Role | Hex | On `#14100d` | Use |
|---|---|---|---|
| Surface | `#14100d` | — | Slide background. Never anything else. |
| Surface raised | `#1e1813` | — | Cards, code blocks, callout panels |
| Text primary | `#f0e9dd` | 15.68:1 | Titles, body copy |
| Text secondary | `#cbbfae` | 10.46:1 | Captions, labels, slide numbers |
| Accent | `#ef7a55` | 6.84:1 | Headline emphasis, the one word that matters |
| Accent warm | `#f59042` | 8.07:1 | Numerals, step markers, highlights |
| Resolved | `#6fcf97` | 9.96:1 | A fixed state, a passing check |
| Fault | `#ef6b5c` | 6.24:1 | A broken state, a failure |
| Rule | `#3a3028` | 1.47:1 | Dividers and borders **only** — never text |
| Logo green | `#00b040` | 6.56:1 | The logo mark. Not a UI colour. |

`#3a3028` fails contrast by design: it is a hairline rule, not a readable
element. Never set type in it.

## Type

Carried from `global.css`:

- **Display / titles** — Syne
- **Body** — Inter
- **Code, file paths, config keys** — JetBrains Mono

Set every file path, flag and config key in the mono face. On the deployment
carousel that covers `exit 0`, `wrangler.toml`, `functions/`, `dist/index.html`.

## Logo

Master asset: `public/brand/md-logo.png` — trimmed to its artwork, transparent
background, 1200x643 (aspect 1.865:1).

- Position bottom-right, consistent across every slide.
- 180-260px wide on a 1080x1350 slide. Below ~180px the "CYBER FORENSICS"
  wordmark stops being legible; at that size use a crop of the "MD" mark alone.
- Full opacity on the night surface. No drop shadow, no container.

## Layout rules

- **1080x1350** (4:5 portrait). Takes the most mobile screen space in the
  LinkedIn feed; 1:1 and 16:9 both give up height for nothing.
- Title: **7 words maximum**, one idea per slide.
- Body: **3 bullets maximum**, roughly 12 words each.
- Keep a slide number bottom-left in text-secondary so readers track depth.

## Accessibility

Never encode meaning with red against green alone. Roughly 8% of men have a
red-green deficiency, and this audience skews heavily that way. Whenever
`#ef6b5c` and `#6fcf97` both appear, carry the meaning in a word or a shape as
well as the colour.

---

## Open question: the wordmark

The logo reads **MD CYBER FORENSICS**. The platform is **MD Cyber Academy** and
the target role is SOC analysis, not forensics. Two names in circulation splits
the brand. Worth settling before this system is used widely.

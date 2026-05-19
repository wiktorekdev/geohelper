# Custom Themes Documentation

GeoHelper allows you to define, style, and load your own custom color themes directly from a `themes.json` file.

## Theme Location
* **Standard Mode**: `%APPDATA%\geohelper\themes.json`
* **Portable Mode**: `data\themes.json` (next to `geohelper.exe`)

---

## File Format

The `themes.json` file consists of a simple JSON object containing two main keys:
1. `userThemes`: An array of custom theme objects.
2. `hiddenBuiltins`: An array of built-in theme IDs you want to hide from the UI (e.g. `["light"]`).

Here is a full template with examples:

```json
{
  "userThemes": [
    {
      "id": "nordish",
      "name": "Nordish Theme",
      "mode": "dark",
      "icon": "Compass",
      "vars": {
        "background": "oklch(0.25 0.02 240)",
        "foreground": "oklch(0.88 0.02 240)",
        "sidebar": "oklch(0.20 0.02 240)",
        "sidebar-border": "oklch(0.7 0.02 240 / 15%)",
        "card": "oklch(0.28 0.02 240)",
        "popover": "oklch(0.28 0.02 240)",
        "popover-foreground": "oklch(0.88 0.02 240)",
        "primary": "oklch(0.78 0.10 210)",
        "primary-foreground": "oklch(0.20 0.02 240)",
        "secondary": "oklch(0.32 0.02 240)",
        "muted": "oklch(0.32 0.02 240)",
        "muted-foreground": "oklch(0.70 0.02 240)",
        "accent": "oklch(0.35 0.04 220)",
        "accent-foreground": "oklch(0.88 0.02 240)",
        "border": "oklch(0.7 0.02 240 / 15%)",
        "input": "oklch(0.7 0.02 240 / 20%)",
        "ring": "oklch(0.78 0.10 210)",
        "brand": "oklch(0.78 0.10 210)"
      }
    }
  ],
  "hiddenBuiltins": []
}
```

---

## Styling Fields Reference

### Core Properties
* `id` (string, required): A unique lowercase identifier (e.g. `"my-dark-preset"`).
* `name` (string, required): Display name of your theme.
* `mode` (string, required): Choose `"dark"` or `"light"`. This controls styling primitives and base map themes.

### Swatch Representation
You can define what icon or representation appears in the settings drop-down swatch box:
* **Option A: Lucide Icon**: Set `icon` to any valid [Lucide React Icon](https://lucide.dev/icons) name (e.g. `"Moon"`, `"Compass"`, `"Sparkles"`, `"Flame"`).
* **Option B: Emoji**: Set `emoji` to any emoji character (e.g. `emoji: "🌌"`).
* **Option C: Custom URL**: Set `iconUrl` to a URL or a base64 encoded image path.

### CSS variables (`vars`)
You can map standard CSS values (RGB, Hex, HSL, or OKLCH) to custom design tokens. Using `oklch(lightness chroma hue)` is highly recommended for rich, consistent colors:

| Variable | Description |
|---|---|
| `background` | Primary app screen backdrop color |
| `foreground` | Main body text color |
| `sidebar` | Sidebar navigation panel backdrop |
| `sidebar-border` | Subtle vertical border lines |
| `card` | Card/Widget panels background color |
| `popover` | Dropdowns and popups background |
| `popover-foreground` | Popups text color |
| `primary` | Selection button highlights and active highlights |
| `primary-foreground` | High contrast text color shown on top of primary button |
| `muted` | Secondary or dismissed status buttons |
| `muted-foreground` | Faint secondary text |
| `accent` | Hover effects and tool highlights |
| `accent-foreground` | Text color shown on accent hover backgrounds |
| `border` | Card borders and horizontal separator rules |
| `input` | Text field outlines and interactive inputs |
| `ring` | Active focus indicator rings |
| `brand` | Core accent branding color (active checkmark color) |

### Ambient Background Gradient (`background`)
To add a premium glassmorphic vibe, you can overlay a CSS gradient or ambient radial mask:
* `image` (string): Standard CSS gradient rules (e.g., `linear-gradient(...)`, `radial-gradient(...)`).
* `opacity` (number): Decimal opacity level between `0` and `1` (e.g., `0.35`).

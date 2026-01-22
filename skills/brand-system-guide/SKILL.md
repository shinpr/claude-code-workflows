---
name: brand-system-guide
description: This skill enforces brand design standards including OKLCH color palette, AI gradient usage, accessibility compliance (WCAG 2.1 AA), dark mode patterns, and CSS utility classes. Automatically loaded when implementing UI components, styling, ensuring visual consistency, or when "brand colors", "OKLCH", "accessibility", "dark mode", or "design system" are mentioned.
---

# Brand System Guide

## Soft Intelligence Positioning

Litskills embodies **Soft Intelligence** - a design philosophy that balances AI-powered capability with human-centered warmth. Our brand identity uses pastel colors and smooth gradients to create an approachable, trustworthy experience.

**Core Brand Values**:

- **Approachable**: Pastel colors reduce cognitive load and create welcoming interfaces
- **Intelligent**: AI-specific gradients signal sophisticated technology
- **Trustworthy**: Perceptual uniformity ensures consistency and professionalism
- **Accessible**: WCAG 2.1 AA compliant color contrast for all users

## OKLCH Color Space

We use **OKLCH (Oklab Lightness Chroma Hue)** instead of traditional HSL/RGB for:

1. **Perceptual Uniformity**: Colors with same lightness appear equally bright
2. **Smooth Gradient Interpolation**: Natural gradients without "muddy" middle tones
3. **Wider Color Gamut**: Supports P3 and Rec2020 color spaces
4. **Industry Adoption**: Tailwind CSS v4 and modern browsers natively support OKLCH

**Format**: `L C H` (space-separated, no units)

- **L** (Lightness): 0-1 (0 = black, 1 = white)
- **C** (Chroma): 0-0.4 (saturation intensity)
- **H** (Hue): 0-360 (color angle in degrees)

## Color Palette

### Light Mode Colors

#### Background Colors

| Name             | OKLCH          | Hex       | Usage                |
| ---------------- | -------------- | --------- | -------------------- |
| Warm Cream       | `0.97 0.02 85` | `#FDFBF5` | Main page background |
| Elevated Surface | `0.98 0.01 85` | `#FEFDF9` | Cards, popovers      |

#### Primary Colors

| Name              | OKLCH                  | Hex       | Usage                                |
| ----------------- | ---------------------- | --------- | ------------------------------------ |
| Pastel Periwinkle | `0.8528 0.0731 298.05` | `#D4C5F9` | Primary buttons, links, focus states |
| Soft Blue         | `0.77 0.045 240`       | `#A7BED3` | Secondary buttons, informational     |

**Foreground**: Dark gray `#1F2937` (OKLCH `0.24 0.015 255`)

#### Accent Colors

| Name        | OKLCH          | Hex       | Usage                            |
| ----------- | -------------- | --------- | -------------------------------- |
| Soft Coral  | `0.82 0.08 20` | `#FFB4AB` | Highlights, interactive elements |
| Peach Cream | `0.87 0.09 75` | `#FFD4A3` | Warm highlights, badges          |

#### Semantic Colors

| Name          | OKLCH            | Hex       | Usage                       |
| ------------- | ---------------- | --------- | --------------------------- |
| Soft Red-Pink | `0.70 0.10 15`   | `#E88B8B` | Errors, destructive actions |
| Pastel Green  | `0.78 0.055 150` | `#9BCAA9` | Success, confirmations      |

#### Supporting Colors

| Name        | OKLCH          | Hex       | Usage                               |
| ----------- | -------------- | --------- | ----------------------------------- |
| Muted Warm  | `0.92 0.02 85` | `#ECEADB` | Subtle backgrounds, disabled states |
| Warm Border | `0.85 0.02 85` | `#D9D6C7` | Form borders, separators            |

### Dark Mode Colors

Dark mode uses **enhanced saturation and lightness** for visibility.

#### Primary Colors

| Name                | OKLCH                  | Hex       |
| ------------------- | ---------------------- | --------- |
| Brighter Periwinkle | `0.8528 0.0731 298.05` | `#D8C8FA` |
| Brighter Soft Blue  | `0.7656 0.0515 244.82` | `#98B7D2` |

**Foreground**: Very dark text `#131318` (OKLCH `0.15 0.01 285`)

#### Accent Colors

| Name           | OKLCH                 | Hex       |
| -------------- | --------------------- | --------- |
| Brighter Coral | `0.7932 0.1192 27.56` | `#FF9D91` |
| Brighter Peach | `0.8515 0.119 71.42`  | `#FFC173` |

#### Semantic Colors

| Name            | OKLCH                  | Hex       |
| --------------- | ---------------------- | --------- |
| Softer Red-Pink | `0.6729 0.1203 20.74`  | `#D67676` |
| Brighter Green  | `0.7267 0.0939 152.43` | `#78B88A` |

#### Supporting Colors

| Name                | OKLCH            | Hex       | Usage             |
| ------------------- | ---------------- | --------- | ----------------- |
| Very Dark Blue-Gray | `0.15 0.015 255` | `#131318` | Background        |
| Dark Card Surface   | `0.18 0.015 255` | `#1C1C24` | Cards             |
| Dark Gray           | `0.22 0.015 255` | `#272733` | Muted backgrounds |
| Subtle Border       | `0.24 0.015 255` | `#2E2E3D` | Borders           |

## AI Gradient System

The **AI Gradient** is a signature visual element that identifies AI-powered features.

**Gradient Stops**:

1. **Pastel Periwinkle** - `oklch(0.8528 0.0731 298.05)` #D4C5F9 (0%)
2. **Soft Blue** - `oklch(0.791 0.0391 245.87)` #A7BED3 (50%)
3. **Pale Turquoise** - `oklch(0.824 0.0714 207.19)` #8DD3DD (100%)

**Direction**: 135 degrees diagonal (top-left to bottom-right)

### When to Use AI Gradients

**Use For**:

- AI-powered action buttons (e.g., "Generate with AI", "Ask AI Assistant")
- Chat interfaces with AI agents
- AI feature badges and indicators
- Loading states for AI processing
- Premium AI features (Pro/Enterprise tiers)

**Do NOT Use For**:

- Large background areas (>10% viewport)
- Non-AI features (standard CRUD operations, navigation, settings)
- Text or body copy (readability issues)
- Subtle UI elements (borders, dividers, icons)

### Performance Guidelines

**Viewport Coverage Limit**: <10% of visible screen area

- CSS gradients are GPU-intensive on low-end devices
- Use solid `--primary` color if gradient causes performance issues

**Browser Support**:

- Chrome 111+ (March 2023): Full OKLCH support
- Safari 16.4+ (March 2023): Full OKLCH support
- Firefox 113+ (May 2023): Full OKLCH support

## CSS Utility Classes

### `.ai-gradient`

Apply 3-stop AI gradient to backgrounds:

```css
.ai-gradient {
  background: linear-gradient(135deg in oklch, oklch(0.8528 0.0731 298.05) 0%, oklch(0.791 0.0391 245.87) 50%, oklch(0.824 0.0714 207.19) 100%);
}
```

### `.ai-gradient-button`

Complete button styling with AI gradient and hover effects:

```css
.ai-gradient-button {
  background: linear-gradient(135deg in oklch, oklch(0.8528 0.0731 298.05) 0%, oklch(0.791 0.0391 245.87) 50%, oklch(0.824 0.0714 207.19) 100%);
  color: oklch(0.24 0.015 255);
  font-weight: 600;
  transition: opacity 0.2s ease-in-out;
}

.ai-gradient-button:hover {
  opacity: 0.9;
}
```

### `.ai-gradient-border`

Apply gradient to element borders:

```css
.ai-gradient-border {
  border: 2px solid transparent;
  background-origin: border-box;
  background-clip: padding-box, border-box;
  background-image: linear-gradient(white, white), linear-gradient(135deg in oklch, oklch(0.8528 0.0731 298.05), oklch(0.791 0.0391 245.87), oklch(0.824 0.0714 207.19));
}
```

### Dark Mode Variants

```css
.dark .ai-gradient {
  background: linear-gradient(135deg in oklch, oklch(0.82 0.11 296) 0%, oklch(0.74 0.055 240) 50%, oklch(0.83 0.075 210) 100%);
}

.dark .ai-gradient-button {
  color: oklch(0.15 0.01 285);
}
```

## Tailwind CSS Integration

All color tokens are available as Tailwind utilities via CSS custom properties:

```html
<!-- Background Colors -->
<div class="bg-background text-foreground">Page Content</div>
<div class="bg-card text-card-foreground">Card Surface</div>
<div class="bg-muted text-muted-foreground">Muted Section</div>

<!-- Primary Colors (Interactive) -->
<button class="bg-primary text-primary-foreground">Primary Button</button>
<button class="bg-secondary text-secondary-foreground">Secondary Button</button>

<!-- Background Variants (for sections, not buttons) -->
<section class="bg-primary-bg">Pastel Periwinkle Section</section>
<section class="bg-secondary-bg">Soft Blue Section</section>
<section class="bg-accent-bg">Soft Coral Section</section>

<!-- Accent Colors -->
<span class="bg-accent text-accent-foreground">Accent Badge</span>
<span class="bg-accent-warm text-accent-warm-foreground">Warm Badge</span>

<!-- Semantic Colors -->
<div class="bg-destructive text-destructive-foreground">Error Message</div>
<div class="bg-success text-success-foreground">Success Message</div>

<!-- Supporting Colors -->
<div class="border border-border">Bordered Container</div>
<input class="border-input focus:ring-ring">Form Input</input>
```

## Component Examples

### Buttons

```html
<!-- Primary Button -->
<button class="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">Primary Action</button>

<!-- Secondary Button -->
<button class="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-90">Secondary Action</button>

<!-- AI Gradient Button -->
<button class="ai-gradient-button px-4 py-2 rounded">Generate with AI</button>

<!-- Destructive Button -->
<button class="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:opacity-90">Delete</button>
```

### Alerts and Toasts

```html
<!-- Info Alert -->
<div class="bg-secondary/10 border-l-4 border-secondary p-4">
  <p class="text-secondary-foreground">Informational message</p>
</div>

<!-- Success Alert -->
<div class="bg-success/10 border-l-4 border-success p-4">
  <p class="text-success-foreground">Success message</p>
</div>

<!-- Error Alert -->
<div class="bg-destructive/10 border-l-4 border-destructive p-4">
  <p class="text-destructive-foreground">Error message</p>
</div>
```

### Form Elements

```html
<!-- Text Input -->
<input type="text" class="border-input focus:border-primary focus:ring-2 focus:ring-primary/20 px-3 py-2 rounded" placeholder="Enter text..." />

<!-- Select Dropdown -->
<select class="border-input focus:border-primary focus:ring-2 focus:ring-primary/20 px-3 py-2 rounded">
  <option>Option 1</option>
</select>

<!-- Checkbox -->
<input type="checkbox" class="border-input checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20" />
```

### Cards

```html
<!-- Light Card -->
<div class="bg-card border border-border rounded-lg p-6 shadow-sm">
  <h3 class="text-card-foreground font-semibold mb-2">Card Title</h3>
  <p class="text-muted-foreground">Card description text</p>
</div>

<!-- AI Feature Card with Gradient -->
<div class="ai-gradient rounded-lg p-6 shadow-lg">
  <h3 class="text-primary-foreground font-semibold mb-2">AI Feature</h3>
  <p class="text-primary-foreground/80">AI-powered content</p>
</div>
```

## Accessibility Guidelines

### Contrast Ratios (WCAG 2.1 AA Compliance)

All color combinations meet **WCAG 2.1 AA** standards:

**Light Mode**:

- Dark gray text (`#1F2937`) on all pastel backgrounds: >=4.5:1 (normal text)
- Dark gray text on white: 12.63:1 (exceeds AAA)

**Dark Mode**:

- Very dark text (`#131318`) on bright pastels: >=4.5:1 (normal text)
- Off-white text (`#FAFAFA`) on very dark background: 13.98:1 (exceeds AAA)

### Focus Indicators

All interactive elements MUST have visible focus indicators:

```css
.focus-visible {
  outline: 3px solid oklch(var(--ring));
  outline-offset: 2px;
}
```

**Requirements**:

- **Minimum width**: 3px
- **Color**: Primary color (Pastel Periwinkle)
- **Offset**: 2px from element edge
- **Visibility**: Must be visible in both light and dark modes

### Keyboard Navigation

All UI components must be fully keyboard-accessible:

- Tab order follows visual flow
- Focus visible at all times (no `:focus { outline: none }` without replacement)
- Interactive elements have hover, focus, and active states

## White-Label Customization

### Overriding Color Tokens

For white-label deployments, override CSS custom properties in `:root`:

```css
:root {
  /* Example: Change primary to brand blue */
  --primary: 0.6 0.18 240; /* OKLCH for #0066CC */
  --primary-foreground: 0.98 0 0; /* White text */

  /* Example: Change accent to brand orange */
  --accent: 0.75 0.15 40; /* OKLCH for #FF7733 */
  --accent-foreground: 0.15 0.01 255; /* Dark text */
}
```

### OKLCH Conversion Tools

**Recommended Tools**:

1. **[oklch.com](https://oklch.com/)** - Interactive OKLCH picker with hex conversion
2. **[Coloraide](https://facelessuser.github.io/coloraide/)** - Python library for color space conversions
3. **Chrome DevTools** - Native OKLCH support in color picker (Chrome 111+)

### Conversion Process

1. Start with existing brand hex color (e.g., `#0066CC`)
2. Use [oklch.com](https://oklch.com/) to convert to OKLCH format
3. Test contrast ratios with foreground colors
4. Adjust lightness/chroma for accessibility compliance
5. Update CSS custom property values

## References

**Color Science**:

- [OKLCH Color Space (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
- [Oklab Perceptual Color Space (Bjorn Ottosson)](https://bottosson.github.io/posts/oklab/)

**Tools**:

- [oklch.com](https://oklch.com/) - Interactive OKLCH color picker
- [Who Can Use](https://www.whocanuse.com/) - Accessibility contrast checker

**Web Standards**:

- [CSS Color Module Level 4 (W3C)](https://www.w3.org/TR/css-color-4/)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

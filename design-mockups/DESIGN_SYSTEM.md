# HealthLens Design System

**Generated with ui-ux-pro-max** - Accessible, dyslexia-friendly medical document explainer

---

## Design Principles

1. **Accessibility First** - WCAG AAA contrast ratios, screen reader friendly, keyboard navigable
2. **Icon-Driven** - Visual symbols before text for dyslexic users
3. **High Contrast** - Clear visual hierarchy, no gray-on-gray
4. **Mobile-First** - Touch targets 48px+, designed for one-handed use
5. **Minimalist Swiss Style** - Clean, functional, spacious, no decoration

---

## Color Palette

### Primary Colors
- **Primary (Cyan):** `#0891B2` - Main brand color, headers, interactive elements
- **Accent (Health Green):** `#059669` - Success states, normal priority actions
- **Destructive (Red):** `#DC2626` - Critical actions, urgent warnings

### Background & Surfaces
- **Background:** `#ECFEFF` - Light cyan tint, reduces eye strain
- **Card:** `#FFFFFF` - Pure white for content cards
- **Muted:** `#E8F1F6` - Subtle backgrounds for icons/sections

### Text Colors
- **Foreground:** `#164E63` - Primary text (cyan-900)
- **Muted Foreground:** `#475569` - Secondary text (slate-600)

### Borders
- **Border:** `#A5F3FC` - Cyan-200 for card outlines

---

## Typography

**Font Family:** [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible)
- Designed specifically for low vision and dyslexic readers
- Greater character differentiation and bouma shape
- Free, open source from Braille Institute

**Google Fonts Import:**
```html
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');
```

**Scale:**
- **H1 (Page Title):** 36px / 700 weight
- **H2 (Card Title):** 22-24px / 700 weight
- **Body Text:** 18px / 400 weight
- **Subtitle/Secondary:** 17-18px / 400 weight
- **Minimum Size:** 16px (never go below)

**Line Height:** 1.5 for body, 1.3 for headings

---

## Spacing Scale

```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
```

Use generous whitespace - reduces cognitive load for users.

---

## Components

### Buttons / Action Cards

**Touch Target:** Minimum 48px height (WCAG 2.2 Level AAA)
**Padding:** 28-36px vertical, 24-28px horizontal
**Border:** 3px solid for visibility
**Border Radius:** 16px (friendly, accessible)
**Hover:** 
- Transform: `translateY(-3px)`
- Border color change to primary
- Shadow: `0 8px 24px rgba(8, 145, 178, 0.12)`

**Focus State:**
- Outline: `3px solid var(--color-primary)`
- Outline offset: `2px`

### Icon Guidelines

**Size:** 48-64px in action cards, 32px in buttons
**Stroke Width:** 2.5 (thicker = more visible)
**Source:** Heroicons or Lucide (SVG only, NO emoji)
**Every icon button needs:** `aria-label` attribute

### Priority Cards (Results Screen)

**Visual Hierarchy:**
1. **Critical (Red):** Left border + red icon + red badge
2. **Important (Amber):** Left border + amber icon + amber badge  
3. **Normal (Green):** Left border + green icon + green badge

**Border Left:** 8px solid (strong visual cue)
**Card Border:** 3px solid `--color-border`
**Background Gradient:** Subtle 4% opacity tint matching priority color

---

## Accessibility Checklist

- ✅ **Contrast Ratios:** Text 4.5:1 minimum (7:1 preferred)
- ✅ **Focus Visible:** All interactive elements have visible focus
- ✅ **Keyboard Navigation:** Tab order logical, Enter/Space activate
- ✅ **ARIA Labels:** Icon-only buttons labeled
- ✅ **Touch Targets:** 48px minimum (prefer 56-64px)
- ✅ **Reduced Motion:** `prefers-reduced-motion` respected
- ✅ **Screen Reader:** Semantic HTML, proper heading hierarchy
- ✅ **Color Independence:** Never rely on color alone (use icons + text + position)

---

## Animation (Standard Tier)

**Hover Transitions:** 250ms ease
**Card Movement:** `translateY(-3px)` on hover
**Button Scale:** `scale(1.05-1.08)` on hover
**Easing:** `ease` or `cubic-bezier(0.4, 0, 0.2, 1)`

**Respect Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

## Screen Breakpoints

- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

Design mobile-first, then scale up.

---

## Anti-Patterns (Avoid These)

❌ Emoji as icons (use SVG instead)
❌ Text below 16px
❌ Gray-on-gray text
❌ Hover-only interactions (must work on touch)
❌ Removing focus indicators
❌ Motion without reduced-motion fallback
❌ Icon buttons without aria-labels
❌ Decorative animations
❌ AI-generated purple/pink gradients
❌ Center cards floating in whitespace

---

## For v0 Implementation

When you paste these screens into v0, emphasize:

1. **"Use Atkinson Hyperlegible font from Google Fonts"**
2. **"Minimum 48px touch targets"**
3. **"Include aria-labels for all icon buttons"**
4. **"Respect prefers-reduced-motion"**
5. **"High contrast cyan + green color scheme"**
6. **"SVG icons with 2.5 stroke width"**

---

## Design Files

- `01-upload.html` - Upload screen with camera/batch options
- `02-processing.html` - Processing state with animated scan
- `03-results.html` - Results with priority-coded action cards

Open in browser to see full designs.

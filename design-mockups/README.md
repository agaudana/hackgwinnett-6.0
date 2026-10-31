# HealthLens Design Mockups

Full-screen, accessible, PRETTY designs for HealthLens.

## View the Mockups

Open these files in your browser:

1. **01-upload.html** - Upload screen with gradient header, big touch targets
2. **02-processing.html** - Animated processing state
3. **03-results.html** - Results with color-coded priority cards

## Design System

### Colors
- **Primary Gradient:** Purple (#667eea) to Violet (#764ba2)
- **Critical Actions:** Red (#E63946)
- **Important Actions:** Amber (#F59E0B)
- **Normal Actions:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Text:** Near-black (#1A1A1A)
- **Gray Scale:** #6B7280, #E5E7EB, #F3F4F6

### Typography
- **Font:** System sans-serif (Inter fallback)
- **Sizes:** 28px+ for headlines, 16-20px for body, minimum 15px
- **Weights:** 400 (regular), 600 (semibold), 700 (bold)

### Icons
- Custom SVG icons (Lucide/Heroicons style)
- Icons first, then text
- 28-48px icon sizes in cards
- Colored by priority level

### Layout Principles
1. **Full-screen designs** - No lonely center cards
2. **Gradient headers** - Visual anchor, not generic white
3. **Border-left color coding** - Accessible priority signaling
4. **60px+ touch targets** - Easy tapping
5. **Generous whitespace** - Reduces cognitive load
6. **Tap to expand** - Details on demand

### Accessibility Features
- High contrast text (4.5:1+ ratio)
- Color + icons + text (triple redundancy for priority)
- Large touch targets (60px minimum)
- TTS button always visible
- Clean, uncluttered layouts

## For v0 Implementation

When building in v0, use these prompts:

### Upload Screen Prompt
```
Create a mobile-first upload screen with:
- Full-screen gradient background (purple #667eea to violet #764ba2)
- White rounded content area with 32px top border radius
- Large camera icon in gradient circle at top
- Two prominent action buttons with icons and labels
- Each button: white background, gray border, 32px padding, icon on left
- Buttons should be 100% width, stack vertically with 16px gap
- Help text at bottom with question mark icon
- Modern, clean design with custom SVG icons
```

### Processing Screen Prompt
```
Create a full-screen processing state with:
- Gradient background (purple to violet)
- Centered animated document icon with scanning line effect
- Scanning line moves top to bottom continuously
- Text: "Reading Your Document" 
- Animated progress dots below
- Lots of whitespace, calming design
- White color scheme on gradient background
```

### Results Screen Prompt
```
Create a results screen with:
- Gradient header with back button (left) and speaker/TTS button (right)
- White rounded content area below
- Cards with left border color coding (red for critical, amber for important, blue for normal)
- Each card: icon on left, title and subtitle, right chevron, priority badge
- Cards fill width, stack vertically with 16px gaps
- Section divider (horizontal line)
- Secondary actions at bottom as gray buttons with icons
- Modern shadows, gradient backgrounds on cards matching border color
```

## What Makes This Design Work

✅ **Not AI-generated looking** - Custom gradient, full-screen layouts, intentional color system
✅ **Accessibility first** - Visual hierarchy through color + icons + text + position
✅ **Icon-driven** - Text is minimal, icons do the heavy lifting
✅ **Touch-friendly** - Everything is large and easy to tap
✅ **Professional** - Gradient polish without being over-designed
✅ **Fills the screen** - No sad lonely cards floating in white space

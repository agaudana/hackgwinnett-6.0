# v0 Implementation Prompts

Copy these prompts into v0.dev to build the React components.

---

## Screen 1: Upload Page

```
Create a mobile-first upload page for HealthLens, an accessible medical document scanner.

Design System:
- Font: Atkinson Hyperlegible from Google Fonts (dyslexia-friendly)
- Primary color: #0891B2 (cyan)
- Background: #ECFEFF (light cyan)
- Card background: #FFFFFF
- Border color: #A5F3FC

Layout:
- Header: solid cyan (#0891B2) background, white text, 32px padding
- Logo "HealthLens" centered, 32px bold, with tagline "Your medical documents, simplified" below
- Main content area: white background, generous padding (48px+)
- Large icon at top: 140px × 140px with cyan icon inside, light blue background, border
- Heading: "Snap Your Documents" 36px bold
- Two action buttons stacked vertically with 20px gap

Action Buttons:
- White cards with 3px border (#A5F3FC), 16px border radius
- 36px vertical padding, full width
- Left: 64px cyan square icon with white camera/grid icon inside
- Text: 24px bold title + 17px subtitle below
- Button 1: Camera icon, "Take Photo", "Quick single scan"
- Button 2: Grid icon, "Multiple Pages", "Scan full document set"
- Hover: lift 4px, border turns cyan, add shadow
- Focus: 3px cyan outline with 2px offset

Bottom: "What can I upload?" with question mark icon, cyan text, clickable

Accessibility:
- All buttons have aria-labels
- Touch targets 48px minimum
- Include prefers-reduced-motion support
```

---

## Screen 2: Processing State

```
Create a full-screen processing state for HealthLens document analysis.

Design:
- Full viewport cyan background (#0891B2)
- White text centered
- Animated document with scanning line effect
- Document: 140px white card with rounded corners, subtle text lines inside
- Scanning line: animated cyan glow moving top to bottom, 2s loop
- Heading: "Reading Your Document" 32px bold white
- Progress dots: 5 white dots below, pulsing animation with stagger
- Subtitle: "This usually takes 10-15 seconds" 18px white, 90% opacity

Animations:
- Scan line moves from 20% to 80% height with fade in/out
- Dots pulse with 0.2s delay between each
- Respect prefers-reduced-motion: show static final state

Accessibility:
- Include role="status" aria-live="polite" on status text
- No animation if prefers-reduced-motion is set
```

---

## Screen 3: Results Page

```
Create an accessible results page for HealthLens showing simplified medical instructions.

Design System:
- Font: Atkinson Hyperlegible from Google Fonts
- Colors:
  - Primary: #0891B2 (cyan)
  - Green: #059669 (normal priority)
  - Amber: #F59E0B (important)
  - Red: #DC2626 (critical)
  - Background: #ECFEFF
  - Card: #FFFFFF
  - Border: #A5F3FC

Header:
- Cyan background (#0891B2), 24px padding
- Left: back button (48px, white icon, rounded, rgba white background)
- Right: TTS speaker button (64px white card, cyan speaker icon, shadow)
- Both buttons need focus states (3px white outline)

Main Content:
- White background, 40px padding
- Title: "Your Care Instructions" 36px bold
- Subtitle: "Tap any card to see more details" 18px gray
- 36px margin below

Action Cards (stack vertically, 20px gap):
- White background with 3px cyan border
- Left border: 8px colored (red/amber/green based on priority)
- 28px padding, 16px border radius
- Subtle gradient background matching priority color (4% opacity)
- Hover: lift 3px, border becomes cyan, show shadow

Card Structure:
- Left: 48px colored icon (medication/thermometer/warning/calendar)
- Center: Bold 22px title + 18px detail text
- Right top: Small uppercase badge "CRITICAL"/"IMPORTANT"/"ROUTINE"
- Right: chevron icon (24px, low opacity)

Example Cards:
1. CRITICAL - Red - Pill icon - "Take amoxicillin twice daily with food" / "Morning and evening, 500mg each time"
2. IMPORTANT - Amber - Thermometer - "Watch for fever above 101°F" / "Check your temperature if you feel warm"
3. CRITICAL - Red - Warning triangle - "Return to ER if breathing worsens" / "Don't wait—go immediately if you struggle to breathe"
4. ROUTINE - Green - Calendar - "Schedule follow-up in 7-10 days" / "Call your regular doctor to book appointment"

Bottom Section:
- Horizontal divider (1px gray)
- Two secondary buttons: gray background, white icons, "See what the doctor wrote" + "Tap any word to explain"

Accessibility:
- All cards are keyboard accessible with tab navigation
- Focus visible on all interactive elements
- aria-labels on all icon buttons
- Touch targets 48px minimum
- Icons use Heroicons or Lucide (SVG, 2.5 stroke width)
- prefers-reduced-motion support
```

---

## General Requirements for All Screens

**Must Include:**
1. `<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">`
2. Minimum touch target: 48px × 48px
3. Focus indicators: 3px solid outline, 2px offset
4. Aria labels on all icon-only buttons
5. Smooth transitions: 250ms ease
6. Reduced motion support:
   ```css
   @media (prefers-reduced-motion: reduce) {
     * { animation: none !important; transition: none !important; }
   }
   ```

**Tech Stack:**
- React 18+
- Tailwind CSS (configure custom colors in tailwind.config)
- Lucide React for icons
- Responsive: mobile-first (375px), scale to desktop

**Color Tokens for Tailwind:**
```js
colors: {
  primary: '#0891B2',
  accent: '#059669',
  background: '#ECFEFF',
  foreground: '#164E63',
  destructive: '#DC2626',
  border: '#A5F3FC',
}
```

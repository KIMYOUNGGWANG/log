# VibeFlow Design System (Warm Journal)

## 1. Brand Identity
VibeFlow is an intimate, relationship-based wellness tracker. The brand personality is "Warm & Cozy", functioning like a shared digital diary that encourages vulnerability and connection over clinical data tracking.

## 2. Color Palette
- **Background (`--background`)**: `#FDFBF7` (Warm Ivory) - Reduces eye strain, mimics paper.
- **Foreground (`--foreground`)**: `#292524` (Warm Dark Gray) - Softer than pure black for text.
- **Border (`--border`)**: `#EBE8E3` (Soft Beige) - Used for structural dividers.
- **Dopamine (`--dopamine`)**: `#ED7D5D` (Terracotta) - Energizing but grounded.
- **Serotonin (`--serotonin`)**: `#7BA376` (Sage Green) - Calming, natural.
- **Endorphin (`--endorphin`)**: `#D1738E` (Dusty Rose) - Comforting, loving.
- **Oxytocin (`--oxytocin`)**: `#9C78C4` (Muted Violet) - Deep, spiritual, bonding.

## 3. Typography
- **Headings**: Soft, slightly rounded or Serif-inspired (system fonts with cozy weights).
- **Body**: Clean Sans-serif for readability.

## 4. Layout & Spacing
- **Bento/Card UI**: Use distinct bordered cards with soft borders (`border-border`) and flat backgrounds instead of heavy shadows.
- **Radius**: Highly rounded corners (`rounded-2xl`, `rounded-3xl`) to eliminate sharp, aggressive edges.
- **Spacing**: Generous internal padding (`p-6`, `p-8`) to create "breathing room" and a calm feeling.

## 5. Components
- **Buttons**: Pill-shaped or heavily rounded (`rounded-full`), using hormone colors as backgrounds with white text. 
- **Inputs**: Flat, subtle background colors instead of harsh borders.

## 6. Motion (Conceptual)
- Page-turning or smooth slide transitions.
- Soft bouncy springs on button presses (using `react-native-reanimated`).

## 7. Accessibility
- WCAG AA contrast ratio maintained for text on hormone backgrounds. All primary tokens are calibrated for readability against white/ivory text.

## 8. Anti-Patterns
- 🚫 Avoid sharp corners (`rounded-none`, `rounded-sm`).
- 🚫 Avoid heavy, dark drop shadows.
- 🚫 Avoid pure black (`#000000`) or pure white (`#FFFFFF`) for main structural elements.
- 🚫 Avoid neon or high-saturation colors.

## 9. Agent Prompt Guide
When generating new components for VibeFlow, use the following prompt context:
"Apply the VibeFlow 'Warm Journal' design system: use `bg-background` for the main screen canvas, `text-foreground` for main text. Cards should use `bg-white` (or a slightly elevated ivory) with `border border-border` and `rounded-3xl`. Do not use shadows. Use hormone tokens (`bg-dopamine`, `text-serotonin`, etc.) for accents, buttons, and visual data."

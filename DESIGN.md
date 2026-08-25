---
name: Analog Fidelity
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5b403a'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#8f7069'
  outline-variant: '#e3beb6'
  surface-tint: '#b52603'
  primary: '#b22300'
  on-primary: '#ffffff'
  primary-container: '#d53d1b'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a3'
  secondary: '#77574d'
  on-secondary: '#ffffff'
  secondary-container: '#fed3c7'
  on-secondary-container: '#795950'
  tertiary: '#5f5b54'
  on-tertiary: '#ffffff'
  tertiary-container: '#79746c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8b1900'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e7bdb1'
  on-secondary-fixed: '#2c160e'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#e8e2d8'
  tertiary-fixed-dim: '#ccc6bc'
  on-tertiary-fixed: '#1e1b15'
  on-tertiary-fixed-variant: '#4a463f'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-meter:
    fontFamily: Space Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.05em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 12px
  handwritten-tape:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  component-gap: 24px
  deck-margin: 40px
  gutter: 16px
---

## Brand & Style

This design system is rooted in the tactile, mechanical era of 1970s and 80s audio equipment. The brand personality is nostalgic, high-fidelity, and intentional. It prioritizes the "physicality" of music, moving away from ephemeral digital interfaces toward a grounded, object-based experience.

The design style is **Tactile/Skeuomorphic**, utilizing heavy shadows, inner glows, and material textures to simulate cream-colored injection-molded plastic, brushed aluminum, and rubberized toggles. The emotional response is one of warmth and focused listening—evoking the feeling of sitting in front of a high-end home stereo system rather than browsing a database.

## Colors

The palette is inspired by "Studio Pro" gear and home hi-fi systems of the late 70s.

*   **Primary (Safety Orange):** Used sparingly for record buttons, active "LED" indicators, and critical playhead positions.
*   **Secondary (Walnut/Tobacco):** Represents the warmth of the era, used for subtle accents and depth in shadows.
*   **Surface (Parchment/Cream):** The primary background color, simulating aged, high-quality plastic.
*   **Neutral (Charcoal/Black):** Used for the "well" of the cassette deck, speaker grilles, and high-contrast text.
*   **Accent (VU Green/Yellow):** A separate functional scale for analog meters, moving from a pale green to a warm yellow before hitting the "Red Zone."

## Typography

Typography functions as "printed labeling" on a physical object. 

*   **UI Controls:** Use **Hanken Grotesk** for product branding and major headings. It provides a sharp, Swiss-style clarity common on professional gear.
*   **Information/Body:** **Inter** is used for readability in tracklists and descriptions.
*   **The "Display":** **Space Mono** represents the technical, low-resolution character of monochrome LCDs or vacuum fluorescent displays (VFDs).
*   **Cassette Labels:** Use a medium-weight Inter with increased tracking and a slight italic skew to mimic felt-tip marker handwriting on tape labels.

## Layout & Spacing

The layout follows a **Fixed Grid** model, treating the screen as a physical chassis. Elements are grouped into "modules" (the Player Module, the Tape Deck Module, the Library Module).

*   **Symmetry:** Use centered alignments for primary controls to mimic the balanced aesthetic of home stereos.
*   **Grouping:** Components should be housed within "inset panels"—recessed areas of the UI that separate functional groups (e.g., transport controls vs. EQ).
*   **Margins:** Generous outer margins (40px+) should be used to make the central "device" feel like a singular object floating in space.

## Elevation & Depth

Hierarchy is defined by **Physical Displacement** rather than digital shadows.

*   **Insets:** The "deck" and "screen" should use inner shadows (`box-shadow: inset ...`) to appear recessed into the plastic chassis.
*   **Extrusions:** Buttons use a "stacked" approach—a dark bottom border (the base), a mid-tone body, and a light top highlight (the edge catch) to create a 3D mechanical feel.
*   **Knobs:** Use conical gradients to simulate the top of a brushed-metal dial, paired with a sharp drop shadow to lift it off the surface.
*   **Grain:** Apply a subtle 3% noise overlay across the entire UI to break the digital perfection and simulate the texture of matte plastic.

## Shapes

The shape language is "Functional Geometric." 

*   **Chassis:** Outer containers use `rounded-lg` (16px) to simulate molded plastic corners.
*   **Mechanical Buttons:** Square or slightly rounded (4px) to represent hard physical toggles.
*   **The Tape Window:** A specific "stadium" shape (pill-shaped) but recessed deep into the deck.
*   **Knobs:** Perfectly circular, defined by radial highlights.

## Components

*   **Transport Buttons (Play/Pause/Stop):** Large, rectangular blocks. The "Play" button features a mechanical down-state (darker, shifted 2px down) when active.
*   **The LCD Display:** A dark charcoal panel with a subtle inner glow. Text inside is "Phosphor Green" or "Amber," using Space Mono. 
*   **VU Meters:** Analog needles that respond to audio levels. The scale is printed directly on the "plastic" background.
*   **Cassette Tape Card:** A skeuomorphic representation of a cassette. The "label" area is a white rectangle with a slight paper texture, featuring the artist/album name in a "handwritten" style.
*   **Rotary Knobs:** Used for volume and seeking. They include a small "indicator dot" in safety orange.
*   **Toggle Switches:** Vertical silver switches that "click" up or down, used for settings like "Dolby NR" or "Auto-Reverse."
/**
 * Shared Tailwind CSS Configuration for CASSETTE
 */
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "surface-container": "#f0eded",
        "on-tertiary-fixed-variant": "#4a463f",
        "tertiary-fixed-dim": "#ccc6bc",
        "secondary-fixed-dim": "#e7bdb1",
        "on-secondary-fixed": "#2c160e",
        "surface-dim": "#dcd9d9",
        "on-tertiary-fixed": "#1e1b15",
        "on-primary-fixed": "#3d0600",
        "secondary": "#77574d",
        "on-secondary": "#ffffff",
        "surface-tint": "#b52603",
        "outline": "#8f7069",
        "on-error": "#ffffff",
        "primary-fixed-dim": "#ffb4a3",
        "tertiary-container": "#79746c",
        "outline-variant": "#e3beb6",
        "surface-container-highest": "#e4e2e1",
        "tertiary-fixed": "#e8e2d8",
        "primary-fixed": "#ffdad2",
        "error-container": "#ffdad6",
        "inverse-on-surface": "#f3f0f0",
        "on-secondary-fixed-variant": "#5d4037",
        "tertiary": "#5f5b54",
        "on-secondary-container": "#795950",
        "primary": "#b22300",
        "error": "#ba1a1a",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#d53d1b",
        "on-error-container": "#93000a",
        "secondary-container": "#fed3c7",
        "on-primary": "#ffffff",
        "surface-bright": "#fcf9f8",
        "background": "#fcf9f8",
        "surface": "#fcf9f8",
        "on-surface": "#1b1c1c",
        "inverse-primary": "#ffb4a3",
        "secondary-fixed": "#ffdbd0",
        "inverse-surface": "#303030",
        "surface-container-high": "#eae7e7",
        "on-surface-variant": "#5b403a",
        "surface-container-low": "#f6f3f2",
        "on-tertiary-container": "#fffbff",
        "on-background": "#1b1c1c",
        "on-primary-fixed-variant": "#8b1900",
        "on-primary-container": "#fffbff",
        "on-tertiary": "#ffffff",
        "surface-variant": "#e4e2e1",
        "retro-orange": "#c24930",
        "retro-gold": "#c3ae7f",
        "retro-cream": "#e8dbcb"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "gutter": "16px",
        "component-gap": "24px",
        "unit": "4px",
        "deck-margin": "40px"
      },
      "fontFamily": {
        "headline-lg-mobile": ["Hanken Grotesk"],
        "body-md": ["Inter"],
        "handwritten-tape": ["Inter"],
        "label-mono": ["Space Mono"],
        "display-meter": ["Space Mono"],
        "headline-lg": ["Hanken Grotesk"]
      }
    }
  }
};

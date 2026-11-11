/** @type {import('tailwindcss').Config} */
// All colours, shadows and radii resolve to CSS variables defined in src/index.css,
// so the light and dark themes can be tuned independently without touching components.
// Surfaces carry an opacity multiplier (--surface-alpha etc., default 1) that the Liquid Glass
// theme lowers, turning every panel translucent from one place.
export default {
  darkMode: "class",
  // Hover styles (card lift, tints) only on devices that can hover, so taps never leave a card "stuck" lifted.
  future: { hoverOnlyWhenSupported: true },
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // One stack per language, resolved from the nearest [lang] attribute (see "Typography" in
      // src/index.css): Google Sans for English, IBM Plex Sans Arabic for Arabic characters.
      fontFamily: {
        sans: ["var(--font-stack)"],
        display: ["var(--font-stack)"],
      },
      // The type ladder: meta 13 · body 16 · lead 20 · section 32 · display (fluid).
      fontSize: {
        meta: ["0.8125rem", { lineHeight: "1.25rem" }],
        body: ["1rem", { lineHeight: "1.6rem" }],
        lead: ["1.25rem", { lineHeight: "1.8rem" }],
        section: ["2rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["clamp(3rem, 6.4vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        band: "rgb(var(--band) / calc(<alpha-value> * var(--band-alpha, 1)))",
        surface: "rgb(var(--surface) / calc(<alpha-value> * var(--surface-alpha, 1)))",
        "surface-2": "rgb(var(--surface-2) / calc(<alpha-value> * var(--surface-2-alpha, 1)))",
        "surface-3": "rgb(var(--surface-3) / calc(<alpha-value> * var(--surface-3-alpha, 1)))",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
        // "primary" is calendar red: the ink for marked days, today, the current place and the one main action.
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          fg: "rgb(var(--primary-fg) / <alpha-value>)",
          soft: "rgb(var(--primary-soft) / <alpha-value>)",
          track: "rgb(var(--primary-track) / <alpha-value>)",
          ink: "rgb(var(--primary-ink) / <alpha-value>)",
        },
        ink: "rgb(var(--fg) / <alpha-value>)",
        paper: "rgb(var(--surface) / calc(<alpha-value> * var(--surface-alpha, 1)))",
        accent: "rgb(var(--accent) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      // One printed radius: paper and controls share a crisp 4px corner (the leaf itself is 2px).
      borderRadius: { sm: "2px", DEFAULT: "4px", md: "4px", lg: "4px", xl: "4px", "2xl": "4px", "3xl": "6px" },
      boxShadow: {
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
        float: "var(--shadow-float)",
        control: "var(--shadow-control)",
      },
      // Motion — every value resolves to the tokens in src/index.css ("Motion tokens"):
      //   easing   standard (state changes) · out (things arriving) · in (things leaving)
      //   duration 120ms press/exit · 180ms hover/state · 240ms panels · 280ms content
      // Transform + opacity only, no overshoot except the "saved" heart, nothing over 300ms,
      // so motion confirms an action without ever making anyone wait for it.
      transitionTimingFunction: {
        DEFAULT: "var(--ease-standard)",
        standard: "var(--ease-standard)",
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        "in-out": "var(--ease-standard)",
      },
      transitionDuration: { DEFAULT: "180ms" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "page-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        "menu-in": { from: { opacity: "0", transform: "translateY(-4px) scale(.98)" }, to: { opacity: "1", transform: "none" } },
        "menu-out": { from: { opacity: "1", transform: "none" }, to: { opacity: "0", transform: "translateY(-2px) scale(.98)" } },
        "dialog-in": { from: { opacity: "0", transform: "translateY(8px) scale(.98)" }, to: { opacity: "1", transform: "none" } },
        "dialog-out": { from: { opacity: "1", transform: "none" }, to: { opacity: "0", transform: "translateY(4px) scale(.98)" } },
        "sheet-in": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        "sheet-out": { from: { opacity: "1", transform: "none" }, to: { opacity: "0", transform: "translateY(16px)" } },
        "toast-out": { from: { opacity: "1", transform: "none" }, to: { opacity: "0", transform: "translateY(6px) scale(.98)" } },
        "slide-next": { from: { opacity: ".2", transform: "translateX(12px)" }, to: { opacity: "1", transform: "none" } },
        "slide-prev": { from: { opacity: ".2", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "none" } },
        // A calm settle (no bounce) for confirmations: selected date, counters, swapped icons.
        pop: { from: { transform: "scale(.9)" }, to: { transform: "scale(1)" } },
        heart: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.22)" }, "100%": { transform: "scale(1.1)" } },
        burst: { from: { opacity: ".4", transform: "scale(.6)" }, to: { opacity: "0", transform: "scale(1.45)" } },
        // The tear-off leaf: the old page lifts away, the next one settles onto the pad.
        rise: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
        "leaf-out": { from: { opacity: "1", transform: "none" }, to: { opacity: "0", transform: "translateY(-14px) rotate(-2deg)" } },
        "leaf-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up": "fade-up 280ms var(--ease-out) both",
        "fade-in": "fade-in 180ms var(--ease-out) both",
        "fade-out": "fade-out 120ms var(--ease-in) both",
        "page-in": "page-in 260ms var(--ease-out) both",
        "menu-in": "menu-in 180ms var(--ease-out) both",
        "menu-out": "menu-out 120ms var(--ease-in) both",
        "dialog-in": "dialog-in 240ms var(--ease-out) both",
        "dialog-out": "dialog-out 120ms var(--ease-in) both",
        "sheet-in": "sheet-in 280ms var(--ease-out) both",
        "sheet-out": "sheet-out 120ms var(--ease-in) both",
        "toast-out": "toast-out 200ms var(--ease-in) both",
        "slide-next": "slide-next 240ms var(--ease-out) both",
        "slide-prev": "slide-prev 240ms var(--ease-out) both",
        pop: "pop 200ms var(--ease-out) both",
        heart: "heart 280ms var(--ease-out) both",
        burst: "burst 320ms var(--ease-out) both",
        rise: "rise 640ms var(--ease-out) both",
        "leaf-out": "leaf-out 260ms var(--ease-in) both",
        "leaf-in": "leaf-in 300ms var(--ease-out) both",
      },
    },
  },
  plugins: [],
};

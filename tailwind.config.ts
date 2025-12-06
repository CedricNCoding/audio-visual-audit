import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ═══════════════════════════════════════════════════════════════════════
         TYPOGRAPHY
         ═══════════════════════════════════════════════════════════════════════ */
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': ['1.625rem', { lineHeight: '1.2', fontWeight: '600' }],
        'subtitle': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['0.9375rem', { lineHeight: '1.6' }],
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         COLOR PALETTE
         ═══════════════════════════════════════════════════════════════════════ */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neon accent colors
        "neon-yellow": "hsl(var(--neon-yellow))",
        "neon-cyan": "hsl(var(--neon-cyan))",
        // Glass colors for direct usage
        "glass-subtle": "hsl(var(--glass-subtle))",
        "glass-light": "hsl(var(--glass-light))",
        "glass-medium": "hsl(var(--glass-medium))",
        "glass-strong": "hsl(var(--glass-strong))",
        "glass-border": "hsl(var(--glass-border))",
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         BORDER RADIUS
         ═══════════════════════════════════════════════════════════════════════ */
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         SHADOWS & EFFECTS
         ═══════════════════════════════════════════════════════════════════════ */
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'glass': 'var(--shadow-glass)',
        'glass-hover': 'var(--shadow-glass-hover)',
        'elevated': 'var(--shadow-elevated)',
        'glow-yellow': 'var(--glow-yellow)',
        'glow-cyan': 'var(--glow-cyan)',
        'glow-yellow-subtle': 'var(--glow-yellow-subtle)',
        'glow-cyan-subtle': 'var(--glow-cyan-subtle)',
        'neon-yellow': '0 0 20px hsl(66 100% 62% / 0.4), 0 0 40px hsl(66 100% 62% / 0.2)',
        'neon-cyan': '0 0 20px hsl(187 100% 65% / 0.4), 0 0 40px hsl(187 100% 65% / 0.2)',
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         BACKDROP BLUR
         ═══════════════════════════════════════════════════════════════════════ */
      backdropBlur: {
        'glass-sm': 'var(--blur-sm)',
        'glass': 'var(--blur-md)',
        'glass-lg': 'var(--blur-lg)',
        'glass-xl': 'var(--blur-xl)',
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         SPACING
         ═══════════════════════════════════════════════════════════════════════ */
      spacing: {
        'section': 'var(--spacing-section)',
      },
      
      /* ═══════════════════════════════════════════════════════════════════════
         KEYFRAMES & ANIMATIONS
         ═══════════════════════════════════════════════════════════════════════ */
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(66 100% 62% / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(66 100% 62% / 0.5), 0 0 50px hsl(66 100% 62% / 0.2)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

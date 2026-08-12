/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6",
        surface: "#FFFFFF",
        "surface-muted": "#F3F1EC",
        "text-primary": "#1C1B19",
        "text-secondary": "#6B6862",
        "border-light": "#E7E4DD",
        accent: "#B8925A",
        "accent-hover": "#9E7B47",
        "accent-light": "#F7F3EC",
        success: "#3E7A55",
        error: "#B3413B",
        ivory: "#FAF9F6",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
        card: "0 8px 24px -4px rgba(28, 27, 25, 0.08)",
        hover: "0 12px 32px -4px rgba(28, 27, 25, 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
} 
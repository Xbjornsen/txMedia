/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          accent: "var(--accent)",
          secondary: "var(--secondary)",
          "secondary-alt": "var(--secondary-alt)", // Added new color
          "gradient-start": "var(--gradient-start)",
          "gradient-end": "var(--gradient-end)",
        },
        fontFamily: {
          sans: ["Inter", "Arial", "sans-serif"],
        },
      },
    },
    plugins: [],
  };
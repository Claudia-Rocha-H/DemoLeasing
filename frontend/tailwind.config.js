/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandYellow: "#facc15",
        brandBlack: "#0b0b0b",
        brandWhite: "#ffffff"
      }
    }
  },
  plugins: []
};

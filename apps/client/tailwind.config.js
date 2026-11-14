/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6B4226",
        secondary: "#F5E6D3",
        accent: "#4A7C59",
      },
    },
  },
  plugins: [],
}

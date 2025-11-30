/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#002145',
        'orange': '#FF6A00',
        'light-blue': '#00AEEF',
      },
    },
  },
  plugins: [],
}


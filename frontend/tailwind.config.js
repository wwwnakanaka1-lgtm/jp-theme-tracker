/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'stock-up': '#00C853',
        'stock-down': '#FF5252',
        'stock-up-bg': 'rgba(0, 200, 83, 0.1)',
        'stock-down-bg': 'rgba(255, 82, 82, 0.1)',
      },
    },
  },
  plugins: [],
}

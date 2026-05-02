/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card-red': '#E24B4A',
        'card-blue': '#378ADD',
        'wizard-purple': '#534AB7',
        'jester-pink': '#F09595',
      },
    },
  },
  plugins: [],
}

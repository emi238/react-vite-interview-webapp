/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'headerblue': '#3C4F76',
        'primary': '#383F51',
        'button-active': '#868CA2',
        'button-hover': '#959CB7',
        'page-primary': '#383F51',
        'static-background': '#E0E0E0',
        'grey-background': '#EFEEEE',
        'dark-lilac': '#B9C0DA',
        'question-quote': '#D3D6E3'
      }
    },
  },
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-yellow': '#FFFFF0', // Un amarillo muy pálido, cercano a #FFFF99 pero más suave
        'brand-fuchsia': '#FF00A0',
        'brand-fuchsia-dark': '#cc007a',
        'brand-blue': '#0000CC',
      },
      fontFamily: {
        // Se necesitará importar estas fuentes en index.html o vía CSS
        'sans': ['Nunito', 'sans-serif'], 
        'display': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

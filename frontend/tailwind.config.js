/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // Ana arka plan (Derin Lacivert)
          light: '#1e293b',   // Kartlar ve menüler (Biraz daha açık lacivert)
          primary: '#10b981', // Butonlar ve gelirler (Zümrüt Yeşili)
          accent: '#f43f5e',  // Uyarılar ve giderler (Mercan)
          text: '#f8fafc'     // Metin rengi (Kirli Beyaz)
        }
      }
    },
  },
  plugins: [],
}
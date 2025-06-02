module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs par défaut Tailwind (aucune surcharge custom ici)
        // Si vous aviez des couleurs custom, retirez-les pour revenir au comportement Tailwind natif
      },
    },
    // ...existing code...
  },
  plugins: [
    // ...existing code...
  ],
}
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Only include source files with Tailwind classes
      "./public/index.html", // If you intentionally want to scan `index.html`
    ],
    theme: {
        extend: {
          fontFamily: {
            sans: ['Geist', 'sans-serif'], // Set Geist as the primary font
          },
          fontWeight: {
            light: '300', // Tailwind's `font-light`
          },
        },
      },

    plugins: [],
  };

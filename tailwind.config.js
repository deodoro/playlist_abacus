module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Only include source files with Tailwind classes
      "./public/index.html", // If you intentionally want to scan `index.html`
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };

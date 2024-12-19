module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        carnesDuarteRed: '#ce0019',
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        md: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        lg: '3px 3px 6px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
};

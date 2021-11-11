module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  variants: {
    extend: {
      tableLayout: ["hover", "focus"],
      display: ["group-hover"],
    },
  },
  plugins: [],
};

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lufga", "sans-serif"],
      },
      backgroundImage: {
        "hero-bg": "url(./assets/bursts.svg)",
      },
      backgroundSize: {
        125: "175%",
      },
      backgroundPosition: {
        "bottom-1": "52% 8%",
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        plex: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        mont: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          gold: "#7F6C2E",   // primary brand gold
          cream: "#F4F2EA",  // background cream
          gray: {
            50:  "#444444",
            100: "#444444",
            200: "#444444",
            300: "#444444",
            400: "#444444",
            500: "#444444",
            600: "#444444",
            700: "#444444",
            800: "#444444",
            900: "#444444",
          },
        },
      },

      // Animations
      keyframes: {
        subtlePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        // LIVE (green) background tint shift
        livePulse: {
          "0%, 100%": { backgroundColor: "rgba(220, 252, 231, 1)" }, // green-100
          "50%": { backgroundColor: "rgba(187, 247, 208, 1)" },      // green-200
        },
        // Votáil (red) background tint shift
        votePulse: {
          "0%, 100%": { backgroundColor: "rgba(254, 226, 226, 1)" }, // red-100
          "50%": { backgroundColor: "rgba(252, 165, 165, 1)" },      // red-300
        },
      },
      animation: {
        subtlePulse: "subtlePulse 3s ease-in-out infinite",
        livePulse: "livePulse 2.5s ease-in-out infinite",
        votePulse: "votePulse 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
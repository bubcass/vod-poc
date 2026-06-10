/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        plex: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        mont: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          gold: "#6B5922",
          cream: "#F6F3EA",
          ink: "#17191C",
          gray: {
            50: "#FBF8F1",
            100: "#F1EDE3",
            200: "#E2DAC8",
            300: "#D4CCB8",
            400: "#A79D8A",
            500: "#7A7264",
            600: "#5F5A50",
            700: "#4A463D",
            800: "#3B382F",
            900: "#2B2822",
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

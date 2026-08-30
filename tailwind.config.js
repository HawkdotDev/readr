/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        readr: {
          light: { canvas: "#FFFFFF", surface: "#F4F4F5", primary: "#18181B", secondary: "#71717A", border: "#E4E4E7", accent: "#18181B" },
          sepia: { canvas: "#F5F5F0", surface: "#ECECE6", primary: "#262624", secondary: "#73736E", border: "#DDDDD5", accent: "#262624" },
          dark: { canvas: "#18181B", surface: "#27272A", primary: "#FAFAFA", secondary: "#A1A1AA", border: "#3F3F46", accent: "#FAFAFA" },
          oled: { canvas: "#000000", surface: "#121212", primary: "#F4F4F5", secondary: "#71717A", border: "#27272A", accent: "#FFFFFF" },
        },
      },
    },
  },
  plugins: [],
};

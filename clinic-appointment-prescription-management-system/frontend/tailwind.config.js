/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette from uploaded theme image (teal/green healthcare style)
        primary: {
          DEFAULT: '#0FA3A3', // teal primary
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#116E6E', // darker teal
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#19C2C2', // bright accent teal
          foreground: '#0B3C3C',
        },
        background: '#F4F8F8', // light background
        surface: '#FFFFFF',
        muted: '#7A9494',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}



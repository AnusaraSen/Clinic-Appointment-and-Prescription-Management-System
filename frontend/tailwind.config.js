/**
 * Tailwind CSS Config (kept minimal for v4) – improves IntelliSense & reduces unknown utility warnings.
 * We mirror the CSS variable palette here so the editor can suggest proper classes.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0FA3A3', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#116E6E', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#19C2C2', foreground: '#0B3C3C' },
        background: '#F4F8F8',
        surface: '#FFFFFF',
        muted: '#7A9494',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      boxShadow: { soft: '0 6px 20px rgba(0,0,0,0.08)' },
      borderRadius: { card: '14px' }
    }
  },
  plugins: []
};



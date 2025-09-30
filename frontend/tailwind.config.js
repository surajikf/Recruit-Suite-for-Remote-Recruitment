/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
      colors: {
        // LinkedIn-inspired palette
        primary: '#0A66C2',
        primaryDark: '#004182',
        primaryLight: '#E8F3FF',
        success: '#1FA66A', // green
        warning: '#F59E0B', // amber
        danger: '#EF4444', // red
        background: '#F3F2EF', // LinkedIn light background
        surface: '#FFFFFF',
        text: '#0F172A', // dark
        muted: '#6B7280',
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
      },
      fontSize: {
        'h1': '28px',
        'h2': '22px',
        'h3': '18px',
        'body': '14px',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0a0a0a',
        surface: {
          1: '#111111',
          2: '#1a1a1a',
          3: '#242424',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          light: 'rgba(255, 255, 255, 0.05)',
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.4)',
        },
        primary: {
          DEFAULT: '#ffffff',
          50: '#f9fafb',
          100: '#ffffff',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

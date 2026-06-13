/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#4361EE', foreground: '#ffffff' },
        accent: { DEFAULT: '#0FAE8E', foreground: '#ffffff' },
      },
      borderRadius: { lg: '0.75rem', xl: '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
}

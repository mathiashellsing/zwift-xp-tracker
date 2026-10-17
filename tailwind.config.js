/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      opacity: { 6: '0.06', 8: '0.08', 12: '0.12', 15: '0.15' },
      colors: {
        'gray-750': '#2d3748',
        page: 'rgb(var(--page) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

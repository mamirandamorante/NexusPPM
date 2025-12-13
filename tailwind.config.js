/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Portavia Brand Colors - Black, White, Grey
        portavia: {
          dark: '#2C2C2C',      // Main dark color
          grey: '#F5F5F5',       // Sidebar/Header background
          'grey-light': '#FAFAFA', // Lighter grey variant
          border: '#D1D1D1',     // Fine border color
        },
        // Status Colors - Red, Orange, Green (for flags only)
        status: {
          green: '#10B981',      // On Track
          orange: '#F59E0B',     // At Risk
          red: '#EF4444',        // Critical
        },
        // Chart colors (can use various colors)
        chart: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          yellow: '#EAB308',
          teal: '#14B8A6',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

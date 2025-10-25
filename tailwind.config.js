module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: {
          1: '#0F0F10',
          2: '#1A1A1C',
          3: '#222224',
          4: '#27272A'
        },
        gray: {
          1: '#F3F4F6',
          2: '#9CA3AF'
        },
        blue: {
          1: '#2563EB',
          2: '#3B82F6',
          3: '#60A5FA'
        },
        red: {
          1: '#EF4444'
        }
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.4)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
}

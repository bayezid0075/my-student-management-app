import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant retro rainbow colors - high contrast & eye-catching
        'retro-pink': '#FF1493',        // Deep pink
        'retro-pink-light': '#FF69B4',  // Hot pink
        'retro-mint': '#00CBA9',        // Bright turquoise
        'retro-mint-light': '#5FFBF1',  // Cyan
        'retro-lavender': '#9D4EDD',    // Purple
        'retro-lavender-light': '#C77DFF', // Light purple
        'retro-peach': '#FF6B35',       // Coral orange
        'retro-peach-light': '#FF8C61', // Light coral
        'retro-blue': '#4361EE',        // Royal blue
        'retro-blue-light': '#4CC9F0',  // Sky blue
        'retro-yellow': '#FFD60A',      // Bright yellow
        'retro-cream': '#FFF8F0',       // Warm cream
        'retro-dark': '#2B2D42',        // Dark blue-gray
      },
      borderRadius: {
        'retro': '12px',
        'retro-lg': '16px',
      },
      boxShadow: {
        'retro': '0 4px 6px rgba(0, 0, 0, 0.15)',
        'retro-lg': '0 8px 16px rgba(0, 0, 0, 0.25)',
        'retro-xl': '0 12px 24px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config

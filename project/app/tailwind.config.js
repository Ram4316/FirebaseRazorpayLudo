/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light theme
        primary: "#0066FF",
        "primary-600": "#0052CC",
        secondary: "#00B37E",
        background: "#F7FBFF",
        surface: "#FFFFFF",
        text: "#0F1724",
        muted: "#667085",
        border: "#E6E9EE",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#EF4444",
        
        // Dark theme
        dark: {
          background: "#071129",
          surface: "#0B1220",
          text: "#E6EEF8",
          muted: "#9AA7B9",
          primary: "#3B82F6"
        },
        
        // Ludo player colors
        player: {
          red: "#E02424",
          green: "#16A34A",
          yellow: "#FBBF24",
          blue: "#2563EB"
        }
      },
      fontFamily: {
        'poppins': ['Poppins'],
        'inter': ['Inter']
      },
      fontSize: {
        'h1': '28px',
        'h2': '20px',
        'body': '16px',
        'caption': '12px'
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px'
      },
      borderRadius: {
        'card': '12px'
      },
      minHeight: {
        'touch': '48px'
      },
      minWidth: {
        'touch': '48px'
      }
    }
  },
  plugins: []
}
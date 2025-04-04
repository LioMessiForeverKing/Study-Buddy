export const theme = {
  colors: {
    // Primary Google Colors
    primary: {
      blue: '#4285F4',
      red: '#EA4335',
      yellow: '#FBBC05',
      green: '#34A853'
    },
    // Extended Primary Shades
    primaryShades: {
      // Blue shades
      blue100: '#E8F0FE',
      blue200: '#C2D7F9',
      blue300: '#9CBEF4',
      blue400: '#75A5F0',
      blue500: '#4285F4', // Main blue
      blue600: '#3B76D9',
      blue700: '#2F5FB3',
      blue800: '#24478C',
      blue900: '#1A3366',
      // Red shades
      red100: '#FCE8E6',
      red200: '#F8C9C5',
      red300: '#F4A9A4',
      red400: '#F08983',
      red500: '#EA4335', // Main red
      red600: '#D03C2F',
      red700: '#B33228',
      red800: '#8C2820',
      red900: '#661D18',
      // Yellow shades
      yellow100: '#FEF6E0',
      yellow200: '#FEEAB8',
      yellow300: '#FDDE8F',
      yellow400: '#FCD267',
      yellow500: '#FBBC05', // Main yellow
      yellow600: '#E0A800',
      yellow700: '#B38600',
      yellow800: '#8C6900',
      yellow900: '#664D00',
      // Green shades
      green100: '#E6F4EA',
      green200: '#CEEAD6',
      green300: '#A8DAB5',
      green400: '#81C995',
      green500: '#34A853', // Main green
      green600: '#2E9549',
      green700: '#27823F',
      green800: '#1F6E34',
      green900: '#155724'
    },
    // Accent Colors
    accent: {
      lightBlue: '#8AB4F8',
      lightRed: '#F28B82',
      lightYellow: '#FDD663',
      lightGreen: '#81C995',
      // Additional accent colors
      purple: '#A142F4',
      lightPurple: '#D0BCFF',
      orange: '#FF8800',
      lightOrange: '#FFCC80',
      teal: '#00C4B4',
      lightTeal: '#A7FFEB'
    },
    // Semantic Colors
    semantic: {
      success: '#34A853',
      error: '#EA4335',
      warning: '#FBBC05',
      info: '#4285F4',
      // Additional semantic colors
      successLight: '#E6F4EA',
      errorLight: '#FCE8E6',
      warningLight: '#FEF6E0',
      infoLight: '#E8F0FE'
    },
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F3F4',
      // Additional background colors
      blueLight: '#E8F0FE',
      redLight: '#FCE8E6',
      yellowLight: '#FEF6E0',
      greenLight: '#E6F4EA',
      dark: '#202124',
      darkSecondary: '#303134'
    },
    // Text Colors
    text: {
      primary: '#202124',
      secondary: '#5F6368',
      disabled: '#80868B',
      // Additional text colors
      onDark: '#FFFFFF',
      onDarkSecondary: '#DADCE0',
      onPrimary: '#FFFFFF',
      onAccent: '#FFFFFF',
      link: '#1A73E8'
    },
    // UI-specific Colors
    ui: {
      border: '#DADCE0',
      borderLight: '#E8EAED',
      hover: 'rgba(66, 133, 244, 0.04)',
      focus: 'rgba(66, 133, 244, 0.12)',
      selected: 'rgba(66, 133, 244, 0.16)',
      divider: '#DADCE0',
      shadow: 'rgba(60, 64, 67, 0.3)',
      shadowLight: 'rgba(60, 64, 67, 0.15)'
    },
    // Gradient Colors
    gradients: {
      googleMulticolor: 'linear-gradient(45deg, #4285F4, #34A853, #FBBC05, #EA4335)',
      blueToLightBlue: 'linear-gradient(45deg, #4285F4, #8AB4F8)',
      redToLightRed: 'linear-gradient(45deg, #EA4335, #F28B82)',
      yellowToLightYellow: 'linear-gradient(45deg, #FBBC05, #FDD663)',
      greenToLightGreen: 'linear-gradient(45deg, #34A853, #81C995)'
    }
  },
  // Typography
  fonts: {
    primary: 'Google Sans, sans-serif',
    secondary: 'Roboto, sans-serif'
  },
  // Font Weights
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700
  },
  // Font Sizes
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem'     // 48px
  },
  // Border Radius
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '1rem',       // 16px
    full: '9999px'    // Circular
  }
}
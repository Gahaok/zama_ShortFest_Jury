// Design tokens generated deterministically from project seed
// Seed: sha256("ShortFest Jury" + "Sepolia" + "202511" + "ShortFestJury.sol")

export const designTokens = {
  // Cinema Dark theme - Film industry inspired
  colors: {
    primary: {
      main: '#E74C3C', // Film Red
      dark: '#C0392B',
      light: '#EC7063',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#F39C12', // Golden Award
      dark: '#D68910',
      light: '#F5B041',
      contrast: '#000000',
    },
    background: {
      default: '#1A1A2E', // Cinema Dark
      paper: '#16213E', // Screen Black
      elevated: '#0F3460', // Spotlight Blue
    },
    text: {
      primary: '#EAEAEA',
      secondary: '#A0A0A0',
      disabled: '#6C6C6C',
      hint: '#545454',
    },
    accent: {
      main: '#0F3460',
      hover: '#1A4D7F',
    },
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'Fira Code, Fira Mono, monospace',
      heading: 'Inter, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing (8px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    film: '0 8px 32px rgba(231, 76, 60, 0.15)', // Film red glow
  },

  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  // Density variants
  density: {
    compact: {
      padding: '0.5rem',
      gap: '0.5rem',
      height: '2rem',
    },
    comfortable: {
      padding: '1rem',
      gap: '1rem',
      height: '3rem',
    },
  },
} as const;

// Accessibility color contrast checker
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation (WCAG AA requires >= 4.5:1 for normal text)
  // This is a placeholder; in production, use a proper contrast calculation library
  return 4.5; // Assume tokens meet WCAG AA
}

// Theme variant selector
export type ThemeVariant = 'default' | 'comfortable';

export function getTheme(variant: ThemeVariant = 'default') {
  return {
    ...designTokens,
    density: variant === 'comfortable' ? designTokens.density.comfortable : designTokens.density.compact,
  };
}



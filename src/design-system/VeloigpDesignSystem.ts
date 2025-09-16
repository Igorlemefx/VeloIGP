// VeloIGP Design System
// Sistema de design completo baseado nas cores e identidade da empresa

export const VeloigpDesignSystem = {
  // Cores Principais
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Cor principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981', // Verde principal
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },
    accent: {
      50: '#fefce8',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amarelo principal
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // Tipografia
  typography: {
    fontFamily: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },

  // Espaçamento
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
    32: '8rem'      // 128px
  },

  // Bordas e Raios
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Sombras
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)'
  },

  // Animações
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Componentes do Design System
export const VeloigpComponents = {
  // Botões
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: VeloigpDesignSystem.borderRadius.lg,
      fontWeight: VeloigpDesignSystem.typography.fontWeight.medium,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      textDecoration: 'none'
    },
    sizes: {
      sm: {
        padding: `${VeloigpDesignSystem.spacing[2]} ${VeloigpDesignSystem.spacing[3]}`,
        fontSize: VeloigpDesignSystem.typography.fontSize.sm
      },
      md: {
        padding: `${VeloigpDesignSystem.spacing[3]} ${VeloigpDesignSystem.spacing[4]}`,
        fontSize: VeloigpDesignSystem.typography.fontSize.base
      },
      lg: {
        padding: `${VeloigpDesignSystem.spacing[4]} ${VeloigpDesignSystem.spacing[6]}`,
        fontSize: VeloigpDesignSystem.typography.fontSize.lg
      }
    },
    variants: {
      primary: {
        backgroundColor: VeloigpDesignSystem.colors.primary[500],
        color: 'white',
        '&:hover': {
          backgroundColor: VeloigpDesignSystem.colors.primary[600],
          transform: 'translateY(-1px)',
          boxShadow: VeloigpDesignSystem.boxShadow.lg
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: VeloigpDesignSystem.boxShadow.md
        }
      },
      secondary: {
        backgroundColor: VeloigpDesignSystem.colors.secondary[500],
        color: 'white',
        '&:hover': {
          backgroundColor: VeloigpDesignSystem.colors.secondary[600],
          transform: 'translateY(-1px)',
          boxShadow: VeloigpDesignSystem.boxShadow.lg
        }
      },
      outline: {
        backgroundColor: 'transparent',
        color: VeloigpDesignSystem.colors.primary[500],
        border: `1px solid ${VeloigpDesignSystem.colors.primary[500]}`,
        '&:hover': {
          backgroundColor: VeloigpDesignSystem.colors.primary[50],
          borderColor: VeloigpDesignSystem.colors.primary[600]
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: VeloigpDesignSystem.colors.neutral[600],
        '&:hover': {
          backgroundColor: VeloigpDesignSystem.colors.neutral[100],
          color: VeloigpDesignSystem.colors.neutral[700]
        }
      }
    }
  },

  // Cards
  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: VeloigpDesignSystem.borderRadius.xl,
      boxShadow: VeloigpDesignSystem.boxShadow.md,
      border: `1px solid ${VeloigpDesignSystem.colors.neutral[200]}`,
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: VeloigpDesignSystem.boxShadow.xl
    }
  },

  // Inputs
  input: {
    base: {
      width: '100%',
      padding: `${VeloigpDesignSystem.spacing[3]} ${VeloigpDesignSystem.spacing[4]}`,
      borderRadius: VeloigpDesignSystem.borderRadius.lg,
      border: `1px solid ${VeloigpDesignSystem.colors.neutral[300]}`,
      fontSize: VeloigpDesignSystem.typography.fontSize.base,
      transition: 'all 0.2s ease',
      outline: 'none',
      '&:focus': {
        borderColor: VeloigpDesignSystem.colors.primary[500],
        boxShadow: `0 0 0 3px ${VeloigpDesignSystem.colors.primary[100]}`
      }
    }
  }
};

// Utilitários CSS
export const VeloigpUtilities = {
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    secondary: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    neutral: 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
  },

  // Animações
  animations: {
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    slideInUp: `
      @keyframes slideInUp {
        from { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
    `,
    slideInDown: `
      @keyframes slideInDown {
        from { 
          opacity: 0; 
          transform: translateY(-30px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
    `,
    scaleIn: `
      @keyframes scaleIn {
        from { 
          opacity: 0; 
          transform: scale(0.9); 
        }
        to { 
          opacity: 1; 
          transform: scale(1); 
        }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `
  }
};

export default VeloigpDesignSystem;

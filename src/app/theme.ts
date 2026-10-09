import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * Chalock visual system
 *
 * Tuned to match the dark, high-end productivity UI used in the design mocks:
 * - near-black navy canvas
 * - layered blue-black surfaces
 * - restrained borders instead of heavy shadows
 * - vibrant indigo/violet primary accent
 * - subtle purple glow only for primary/selected states
 * - cool, readable text hierarchy
 */
export const appThemeConfig = defineConfig({
  globalCss: {
    'html, body': {
      background: 'bg.canvas',
      color: 'fg',
    },

    html: {
      colorScheme: 'light dark',
    },

    body: {
      minWidth: '20rem',
      minHeight: '100vh',
      fontSynthesis: 'none',
      textRendering: 'optimizeLegibility',
    },

    '::selection': {
      background: 'brand.muted',
      color: 'fg',
    },

    "[data-scope='progress'] [data-part='range']": {
      background: 'info.solid !important',
    },

    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },

    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },

    '::-webkit-scrollbar-thumb': {
      background: 'border.emphasized',
      border: '3px solid transparent',
      backgroundClip: 'padding-box',
      borderRadius: '999px',
    },

    '::-webkit-scrollbar-thumb:hover': {
      background: 'border.hover',
      border: '3px solid transparent',
      backgroundClip: 'padding-box',
    },
  },

  theme: {
    tokens: {
      fonts: {
        body: {
          value:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        heading: {
          value:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        mono: {
          value:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
        },
      },

      colors: {
        /** Primary indigo/violet used by buttons, selected navigation and focus UI. */
        brand: {
          50: { value: '#F4F2FF' },
          100: { value: '#E9E5FF' },
          200: { value: '#D6D0FF' },
          300: { value: '#B7AEFF' },
          400: { value: '#8F80FF' },
          500: { value: '#6C5CF6' },
          600: { value: '#5B4CEB' },
          700: { value: '#493CCB' },
          800: { value: '#3B329F' },
          900: { value: '#312A7C' },
          950: { value: '#1D184B' },
        },

        /** Cool slate/navy neutrals rather than neutral grey. */
        neutral: {
          25: { value: '#FCFCFD' },
          50: { value: '#F8FAFC' },
          100: { value: '#F1F5F9' },
          200: { value: '#E2E8F0' },
          300: { value: '#CBD5E1' },
          400: { value: '#A1ACBC' },
          500: { value: '#7F8A9D' },
          600: { value: '#667085' },
          700: { value: '#334155' },
          800: { value: '#1E293B' },
          850: { value: '#162033' },
          900: { value: '#101827' },
          925: { value: '#0B1220' },
          950: { value: '#070B14' },
        },

        success: {
          50: { value: '#ECFDF5' },
          100: { value: '#D1FAE5' },
          500: { value: '#34D399' },
          600: { value: '#10B981' },
          700: { value: '#047857' },
        },

        warning: {
          50: { value: '#FFFBEB' },
          100: { value: '#FEF3C7' },
          500: { value: '#F7B955' },
          600: { value: '#F59E0B' },
          700: { value: '#B45309' },
        },

        danger: {
          50: { value: '#FFF1F2' },
          100: { value: '#FFE4E6' },
          500: { value: '#FB7185' },
          600: { value: '#F43F5E' },
          700: { value: '#BE123C' },
        },

        info: {
          50: { value: '#EFF6FF' },
          100: { value: '#DBEAFE' },
          500: { value: '#60A5FA' },
          600: { value: '#3B82F6' },
          700: { value: '#1D4ED8' },
        },

        /** Shared chart accents used across Finance, Goals, Tasks and Habits. */
        chart: {
          violet: { value: '#7C6CF6' },
          blue: { value: '#4C9AFF' },
          cyan: { value: '#38BDF8' },
          green: { value: '#34D399' },
          amber: { value: '#F7B955' },
          pink: { value: '#F472B6' },
          red: { value: '#FB7185' },
          slate: { value: '#64748B' },
        },
      },

      radii: {
        control: { value: '0.625rem' },
        app: { value: '0.75rem' },
        panel: { value: '0.875rem' },
        hero: { value: '1rem' },
        pill: { value: '9999px' },
      },
    },

    semanticTokens: {
      colors: {
        bg: {
          /** Main page canvas. */
          canvas: {
            value: {
              _light: '{colors.neutral.50}',
              _dark: '{colors.neutral.950}',
            },
          },

          /** Sidebar and app chrome. */
          sidebar: {
            value: {
              _light: '{colors.white}',
              _dark: '#080E19',
            },
          },

          topbar: {
            value: {
              _light: 'rgba(255,255,255,0.92)',
              _dark: '#0A111D',
            },
          },

          /** Inputs, search boxes and low-level containers. */
          surface: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.neutral.925}',
            },
          },

          /** Default card/panel surface. */
          panel: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.neutral.925}',
            },
          },

          /** Menus, popovers, inspectors and visually raised content. */
          elevated: {
            value: {
              _light: '{colors.white}',
              _dark: '#0b111b',
            },
          },

          subtle: {
            value: {
              _light: '{colors.neutral.100}',
              _dark: '#0a101a',
            },
          },

          muted: {
            value: {
              _light: '{colors.neutral.200}',
              _dark: '#0b111c',
            },
          },

          hover: {
            value: {
              _light: '{colors.neutral.100}',
              _dark: '#131D2E',
            },
          },

          active: {
            value: {
              _light: '{colors.neutral.200}',
              _dark: '#1A2540',
            },
          },

          sunken: {
            value: {
              _light: '{colors.neutral.100}',
              _dark: '#060A12',
            },
          },

          overlay: {
            value: {
              _light: 'rgba(15, 23, 42, 0.38)',
              _dark: 'rgba(1, 5, 12, 0.72)',
            },
          },
        },

        fg: {
          DEFAULT: {
            value: {
              _light: '#111827',
              _dark: '#F7F8FC',
            },
          },

          muted: {
            value: {
              _light: '{colors.neutral.600}',
              _dark: '#A1ACBC',
            },
          },

          subtle: {
            value: {
              _light: '{colors.neutral.500}',
              _dark: '#7F8A9D',
            },
          },

          disabled: {
            value: {
              _light: '{colors.neutral.400}',
              _dark: '#586579',
            },
          },

          inverted: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.neutral.950}',
            },
          },
        },

        border: {
          DEFAULT: {
            value: {
              _light: '{colors.neutral.200}',
              _dark: '#223047',
            },
          },

          subtle: {
            value: {
              _light: '#ECEFF3',
              _dark: '#1A2638',
            },
          },

          emphasized: {
            value: {
              _light: '{colors.neutral.300}',
              _dark: '#31405A',
            },
          },

          hover: {
            value: {
              _light: '{colors.neutral.400}',
              _dark: '#3A4A66',
            },
          },
        },

        brand: {
          solid: {
            value: {
              _light: '{colors.brand.600}',
              _dark: '{colors.brand.500}',
            },
          },

          solidHover: {
            value: {
              _light: '{colors.brand.700}',
              _dark: '{colors.brand.400}',
            },
          },

          fg: {
            value: {
              _light: '{colors.brand.700}',
              _dark: '#A99FFF',
            },
          },

          contrast: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.white}',
            },
          },

          subtle: {
            value: {
              _light: '{colors.brand.50}',
              _dark: 'rgba(108, 92, 246, 0.11)',
            },
          },

          muted: {
            value: {
              _light: '{colors.brand.100}',
              _dark: 'rgba(108, 92, 246, 0.17)',
            },
          },

          emphasized: {
            value: {
              _light: '{colors.brand.200}',
              _dark: 'rgba(108, 92, 246, 0.26)',
            },
          },

          border: {
            value: {
              _light: '{colors.brand.300}',
              _dark: 'rgba(143, 128, 255, 0.48)',
            },
          },

          focusRing: {
            value: {
              _light: '{colors.brand.500}',
              _dark: '{colors.brand.400}',
            },
          },
        },

        success: {
          fg: {
            value: {
              _light: '{colors.success.700}',
              _dark: '#66E7AE',
            },
          },
          subtle: {
            value: {
              _light: '{colors.success.50}',
              _dark: 'rgba(52, 211, 153, 0.11)',
            },
          },
          solid: {
            value: {
              _light: '{colors.success.600}',
              _dark: '{colors.success.500}',
            },
          },
        },

        warning: {
          fg: {
            value: {
              _light: '{colors.warning.700}',
              _dark: '#FFD27A',
            },
          },
          subtle: {
            value: {
              _light: '{colors.warning.50}',
              _dark: 'rgba(247, 185, 85, 0.11)',
            },
          },
          solid: {
            value: {
              _light: '{colors.warning.600}',
              _dark: '{colors.warning.500}',
            },
          },
        },

        danger: {
          fg: {
            value: {
              _light: '{colors.danger.700}',
              _dark: '#FF9AA9',
            },
          },
          subtle: {
            value: {
              _light: '{colors.danger.50}',
              _dark: 'rgba(251, 113, 133, 0.11)',
            },
          },
          solid: {
            value: {
              _light: '{colors.danger.600}',
              _dark: '{colors.danger.500}',
            },
          },
        },

        info: {
          fg: {
            value: {
              _light: '{colors.info.700}',
              _dark: '#8FC2FF',
            },
          },
          subtle: {
            value: {
              _light: '{colors.info.50}',
              _dark: 'rgba(96, 165, 250, 0.11)',
            },
          },
          solid: {
            value: {
              _light: '{colors.info.600}',
              _dark: '{colors.info.500}',
            },
          },
        },

        chart: {
          primary: {
            value: {
              _light: '{colors.brand.600}',
              _dark: '{colors.brand.400}',
            },
          },
          secondary: {
            value: { _light: '#6D5BD0', _dark: '{colors.chart.violet}' },
          },
          blue: { value: { _light: '#2563EB', _dark: '{colors.chart.blue}' } },
          cyan: { value: { _light: '#0284C7', _dark: '{colors.chart.cyan}' } },
          green: {
            value: {
              _light: '{colors.success.600}',
              _dark: '{colors.chart.green}',
            },
          },
          amber: {
            value: {
              _light: '{colors.warning.600}',
              _dark: '{colors.chart.amber}',
            },
          },
          red: {
            value: {
              _light: '{colors.danger.600}',
              _dark: '{colors.chart.red}',
            },
          },
          grid: { value: { _light: '{colors.neutral.200}', _dark: '#223047' } },
          axis: {
            value: {
              _light: '{colors.neutral.600}',
              _dark: '{colors.neutral.400}',
            },
          },
          tooltipBg: { value: { _light: '{colors.white}', _dark: '#141E30' } },
          tooltipBorder: {
            value: { _light: '{colors.neutral.200}', _dark: '#31405A' },
          },
        },
      },

      radii: {
        l1: { value: '{radii.control}' },
        l2: { value: '{radii.app}' },
        l3: { value: '{radii.panel}' },
        l4: { value: '{radii.hero}' },
      },

      shadows: {
        xs: {
          value: {
            _light:
              '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.04)',
            _dark: '0 1px 2px rgba(0, 0, 0, 0.20)',
          },
        },

        sm: {
          value: {
            _light:
              '0 2px 8px rgba(15, 23, 42, 0.05), 0 4px 14px rgba(15, 23, 42, 0.04)',
            _dark:
              '0 4px 14px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.16)',
          },
        },

        md: {
          value: {
            _light:
              '0 10px 28px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
            _dark:
              '0 10px 30px rgba(0, 0, 0, 0.30), 0 2px 8px rgba(0, 0, 0, 0.18)',
          },
        },

        lg: {
          value: {
            _light:
              '0 18px 52px rgba(15, 23, 42, 0.11), 0 4px 14px rgba(15, 23, 42, 0.05)',
            _dark:
              '0 20px 58px rgba(0, 0, 0, 0.38), 0 6px 16px rgba(0, 0, 0, 0.22)',
          },
        },

        focus: {
          value: {
            _light: '0 0 0 3px rgba(108, 92, 246, 0.18)',
            _dark: '0 0 0 3px rgba(143, 128, 255, 0.24)',
          },
        },

        brandGlow: {
          value: {
            _light:
              '0 0 0 1px rgba(108, 92, 246, 0.20), 0 8px 24px rgba(108, 92, 246, 0.15)',
            _dark:
              '0 0 0 1px rgba(143, 128, 255, 0.26), 0 10px 30px rgba(108, 92, 246, 0.22)',
          },
        },

        brandGlowStrong: {
          value: {
            _light:
              '0 0 0 1px rgba(108, 92, 246, 0.28), 0 12px 34px rgba(108, 92, 246, 0.20)',
            _dark:
              '0 0 0 1px rgba(143, 128, 255, 0.40), 0 14px 40px rgba(108, 92, 246, 0.30)',
          },
        },
      },
    },
  },
})

export const appSystem = createSystem(defaultConfig, appThemeConfig)

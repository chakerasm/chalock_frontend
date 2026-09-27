import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

export const appThemeConfig = defineConfig({
  globalCss: {
    'html, body': {
      background: 'bg.canvas',
      color: 'fg',
    },
    body: {
      minWidth: '20rem',
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#eef5ff' },
          100: { value: '#d9e9ff' },
          200: { value: '#bcd8ff' },
          300: { value: '#8fc0ff' },
          400: { value: '#5a9eff' },
          500: { value: '#3678f0' },
          600: { value: '#285fd1' },
          700: { value: '#214bad' },
          800: { value: '#213f8c' },
          900: { value: '#21376f' },
          950: { value: '#172345' },
        },
      },
      radii: {
        app: { value: '1rem' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: {
            value: { _dark: '{colors.gray.950}', _light: '{colors.gray.50}' },
          },
          panel: {
            value: { _dark: '{colors.gray.900}', _light: '{colors.white}' },
          },
          elevated: {
            value: { _dark: '{colors.gray.800}', _light: '{colors.white}' },
          },
          subtle: {
            value: { _dark: '{colors.gray.900}', _light: '{colors.gray.100}' },
          },
        },
        border: {
          DEFAULT: {
            value: { _dark: '{colors.gray.700}', _light: '{colors.gray.200}' },
          },
          emphasized: {
            value: { _dark: '{colors.gray.600}', _light: '{colors.gray.300}' },
          },
        },
        brand: {
          border: {
            value: {
              _dark: '{colors.brand.400}',
              _light: '{colors.brand.500}',
            },
          },
          contrast: {
            value: { _dark: '{colors.white}', _light: '{colors.white}' },
          },
          emphasized: {
            value: {
              _dark: '{colors.brand.700}',
              _light: '{colors.brand.200}',
            },
          },
          fg: {
            value: {
              _dark: '{colors.brand.300}',
              _light: '{colors.brand.700}',
            },
          },
          focusRing: {
            value: {
              _dark: '{colors.brand.400}',
              _light: '{colors.brand.500}',
            },
          },
          muted: {
            value: {
              _dark: '{colors.brand.800}',
              _light: '{colors.brand.200}',
            },
          },
          solid: {
            value: {
              _dark: '{colors.brand.400}',
              _light: '{colors.brand.600}',
            },
          },
          subtle: {
            value: {
              _dark: '{colors.brand.900}',
              _light: '{colors.brand.100}',
            },
          },
        },
        fg: {
          DEFAULT: {
            value: { _dark: '{colors.gray.100}', _light: '{colors.gray.950}' },
          },
          muted: {
            value: { _dark: '{colors.gray.400}', _light: '{colors.gray.600}' },
          },
        },
      },
      radii: {
        l1: { value: '{radii.app}' },
        l2: { value: '{radii.xl}' },
      },
      shadows: {
        xs: {
          value: {
            _dark: '0 1px 2px 0 rgba(0, 0, 0, 0.45)',
            _light: '0 1px 2px 0 rgba(15, 23, 42, 0.08)',
          },
        },
        sm: {
          value: {
            _dark: '0 6px 16px 0 rgba(0, 0, 0, 0.3)',
            _light: '0 6px 18px 0 rgba(15, 23, 42, 0.1)',
          },
        },
        md: {
          value: {
            _dark: '0 18px 40px 0 rgba(0, 0, 0, 0.36)',
            _light: '0 18px 40px 0 rgba(15, 23, 42, 0.13)',
          },
        },
      },
    },
  },
})

export const appSystem = createSystem(defaultConfig, appThemeConfig)
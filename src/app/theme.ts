import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

export const appThemeConfig = defineConfig({
  globalCss: {
    "html, body": {
      background: "bg.canvas",
      color: "fg",
    },

    html: {
      colorScheme: "light dark",
    },

    body: {
      minWidth: "20rem",
      minHeight: "100vh",
      fontSynthesis: "none",
      textRendering: "optimizeLegibility",
    },

    "::selection": {
      background: "brand.muted",
      color: "fg",
    },
  },

  theme: {
    tokens: {
      colors: {
        /*
         * Brand
         *
         * A slightly muted indigo/blue.
         * Less "corporate SaaS", more modern workspace/productivity.
         */
        brand: {
          50: { value: "#f1f5ff" },
          100: { value: "#e3eaff" },
          200: { value: "#c7d4fe" },
          300: { value: "#a3b7fc" },
          400: { value: "#7c91f8" },
          500: { value: "#6366f1" },
          600: { value: "#5457e5" },
          700: { value: "#4547c7" },
          800: { value: "#3b3da1" },
          900: { value: "#343681" },
          950: { value: "#20204d" },
        },

        /*
         * Neutral palette
         *
         * Slightly cool neutral tones work well for productivity apps.
         */
        neutral: {
          25: { value: "#fcfcfd" },
          50: { value: "#f8f9fb" },
          100: { value: "#f1f3f5" },
          200: { value: "#e5e7eb" },
          300: { value: "#d1d5db" },
          400: { value: "#9ca3af" },
          500: { value: "#6b7280" },
          600: { value: "#4b5563" },
          700: { value: "#374151" },
          800: { value: "#24272e" },
          850: { value: "#1d2026" },
          900: { value: "#181a1f" },
          925: { value: "#14161a" },
          950: { value: "#0f1115" },
        },

        success: {
          50: { value: "#ecfdf3" },
          100: { value: "#d1fadf" },
          500: { value: "#22a06b" },
          600: { value: "#16865a" },
          700: { value: "#146c4a" },
        },

        warning: {
          50: { value: "#fff8e6" },
          100: { value: "#ffedbd" },
          500: { value: "#d99000" },
          600: { value: "#b87600" },
          700: { value: "#925d00" },
        },

        danger: {
          50: { value: "#fff1f2" },
          100: { value: "#ffe4e6" },
          500: { value: "#e5484d" },
          600: { value: "#d13438" },
          700: { value: "#b4232a" },
        },
      },

      radii: {
        app: { value: "0.75rem" },
        control: { value: "0.625rem" },
        panel: { value: "0.875rem" },
      },
    },

    semanticTokens: {
      colors: {
        /*
         * App backgrounds
         */
        bg: {
          canvas: {
            value: {
              _light: "{colors.neutral.50}",
              _dark: "{colors.neutral.950}",
            },
          },

          surface: {
            value: {
              _light: "{colors.white}",
              _dark: "{colors.neutral.925}",
            },
          },

          panel: {
            value: {
              _light: "{colors.white}",
              _dark: "{colors.neutral.900}",
            },
          },

          elevated: {
            value: {
              _light: "{colors.white}",
              _dark: "{colors.neutral.850}",
            },
          },

          subtle: {
            value: {
              _light: "{colors.neutral.100}",
              _dark: "{colors.neutral.900}",
            },
          },

          muted: {
            value: {
              _light: "{colors.neutral.200}",
              _dark: "{colors.neutral.800}",
            },
          },

          hover: {
            value: {
              _light: "{colors.neutral.100}",
              _dark: "{colors.neutral.850}",
            },
          },

          active: {
            value: {
              _light: "{colors.neutral.200}",
              _dark: "{colors.neutral.800}",
            },
          },

          overlay: {
            value: {
              _light: "rgba(15, 17, 21, 0.36)",
              _dark: "rgba(0, 0, 0, 0.64)",
            },
          },
        },

        /*
         * Foreground/text hierarchy
         */
        fg: {
          DEFAULT: {
            value: {
              _light: "{colors.neutral.950}",
              _dark: "{colors.neutral.50}",
            },
          },

          muted: {
            value: {
              _light: "{colors.neutral.600}",
              _dark: "{colors.neutral.400}",
            },
          },

          subtle: {
            value: {
              _light: "{colors.neutral.500}",
              _dark: "{colors.neutral.500}",
            },
          },

          disabled: {
            value: {
              _light: "{colors.neutral.400}",
              _dark: "{colors.neutral.600}",
            },
          },

          inverted: {
            value: {
              _light: "{colors.white}",
              _dark: "{colors.neutral.950}",
            },
          },
        },

        /*
         * Borders
         */
        border: {
          DEFAULT: {
            value: {
              _light: "{colors.neutral.200}",
              _dark: "{colors.neutral.800}",
            },
          },

          subtle: {
            value: {
              _light: "#eceef1",
              _dark: "#24272e",
            },
          },

          emphasized: {
            value: {
              _light: "{colors.neutral.300}",
              _dark: "{colors.neutral.700}",
            },
          },

          hover: {
            value: {
              _light: "{colors.neutral.300}",
              _dark: "{colors.neutral.600}",
            },
          },
        },

        /*
         * Brand semantics
         */
        brand: {
          solid: {
            value: {
              _light: "{colors.brand.600}",
              _dark: "{colors.brand.500}",
            },
          },

          solidHover: {
            value: {
              _light: "{colors.brand.700}",
              _dark: "{colors.brand.400}",
            },
          },

          fg: {
            value: {
              _light: "{colors.brand.700}",
              _dark: "{colors.brand.300}",
            },
          },

          contrast: {
            value: {
              _light: "{colors.white}",
              _dark: "{colors.white}",
            },
          },

          subtle: {
            value: {
              _light: "{colors.brand.50}",
              _dark: "rgba(99, 102, 241, 0.12)",
            },
          },

          muted: {
            value: {
              _light: "{colors.brand.100}",
              _dark: "rgba(99, 102, 241, 0.18)",
            },
          },

          emphasized: {
            value: {
              _light: "{colors.brand.200}",
              _dark: "rgba(99, 102, 241, 0.28)",
            },
          },

          border: {
            value: {
              _light: "{colors.brand.300}",
              _dark: "{colors.brand.700}",
            },
          },

          focusRing: {
            value: {
              _light: "{colors.brand.500}",
              _dark: "{colors.brand.400}",
            },
          },
        },

        /*
         * Semantic states
         */
        success: {
          fg: {
            value: {
              _light: "{colors.success.700}",
              _dark: "#6ce9a6",
            },
          },

          subtle: {
            value: {
              _light: "{colors.success.50}",
              _dark: "rgba(34, 160, 107, 0.12)",
            },
          },

          solid: {
            value: {
              _light: "{colors.success.600}",
              _dark: "{colors.success.500}",
            },
          },
        },

        warning: {
          fg: {
            value: {
              _light: "{colors.warning.700}",
              _dark: "#facb5a",
            },
          },

          subtle: {
            value: {
              _light: "{colors.warning.50}",
              _dark: "rgba(217, 144, 0, 0.12)",
            },
          },

          solid: {
            value: {
              _light: "{colors.warning.600}",
              _dark: "{colors.warning.500}",
            },
          },
        },

        danger: {
          fg: {
            value: {
              _light: "{colors.danger.700}",
              _dark: "#ff8b8f",
            },
          },

          subtle: {
            value: {
              _light: "{colors.danger.50}",
              _dark: "rgba(229, 72, 77, 0.12)",
            },
          },

          solid: {
            value: {
              _light: "{colors.danger.600}",
              _dark: "{colors.danger.500}",
            },
          },
        },
      },

      radii: {
        l1: { value: "{radii.control}" },
        l2: { value: "{radii.app}" },
        l3: { value: "{radii.panel}" },
      },

      shadows: {
        xs: {
          value: {
            _light:
              "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.05)",
            _dark:
              "0 1px 2px rgba(0, 0, 0, 0.28), 0 1px 3px rgba(0, 0, 0, 0.24)",
          },
        },

        sm: {
          value: {
            _light:
              "0 2px 6px rgba(16, 24, 40, 0.05), 0 4px 12px rgba(16, 24, 40, 0.04)",
            _dark:
              "0 2px 6px rgba(0, 0, 0, 0.28), 0 5px 14px rgba(0, 0, 0, 0.22)",
          },
        },

        md: {
          value: {
            _light:
              "0 8px 24px rgba(16, 24, 40, 0.08), 0 2px 6px rgba(16, 24, 40, 0.04)",
            _dark:
              "0 10px 28px rgba(0, 0, 0, 0.34), 0 2px 8px rgba(0, 0, 0, 0.24)",
          },
        },

        lg: {
          value: {
            _light:
              "0 16px 48px rgba(16, 24, 40, 0.11), 0 4px 12px rgba(16, 24, 40, 0.05)",
            _dark:
              "0 18px 52px rgba(0, 0, 0, 0.42), 0 4px 14px rgba(0, 0, 0, 0.28)",
          },
        },

        focus: {
          value: {
            _light: "0 0 0 3px rgba(99, 102, 241, 0.20)",
            _dark: "0 0 0 3px rgba(124, 145, 248, 0.26)",
          },
        },
      },
    },
  },
});

export const appSystem = createSystem(defaultConfig, appThemeConfig);

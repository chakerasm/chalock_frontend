import { Box } from '@chakra-ui/react'
import type { Preview } from '@storybook/react-vite'
import { AppProviders } from '../src/app/providers'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const forcedTheme =
        context.globals.colorMode === 'dark' ? 'dark' : 'light'

      return (
        <AppProviders forcedTheme={forcedTheme}>
          <Box
            bg="bg.canvas"
            color="fg"
            minH="100dvh"
            p={{ base: '4', md: '8' }}
          >
            <Story />
          </Box>
        </AppProviders>
      )
    },
  ],
  globalTypes: {
    colorMode: {
      defaultValue: 'light',
      description: 'Preview the component in a Chakra UI color mode.',
      toolbar: {
        icon: 'mirror',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
    },
  },
  parameters: {
    controls: { expanded: true },
    layout: 'fullscreen',
  },
}

export default preview

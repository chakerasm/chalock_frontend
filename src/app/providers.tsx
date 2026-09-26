import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from '@/components/ui/Toaster/Toaster'
import { i18n } from '@/lib/i18n/i18n'
import { createQueryClient } from '@/lib/query/query-client'
import { appSystem } from './theme'

type AppProvidersProps = {
  children: ReactNode
  forcedTheme?: 'dark' | 'light'
}

export function AppProviders({ children, forcedTheme }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      forcedTheme={forcedTheme}
    >
      <ChakraProvider value={appSystem}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
          </QueryClientProvider>
        </I18nextProvider>
      </ChakraProvider>
    </ThemeProvider>
  )
}

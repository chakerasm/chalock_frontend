import { Box, CloseButton, Drawer, Flex, Portal } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppNavbar } from '@/components/shared/AppNavbar/AppNavbar'
import { AppSidebar } from '@/components/shared/AppSidebar/AppSidebar'

type AppShellProps = {
  children: ReactNode
  onLogout?: () => void
}

export function AppShell({ children, onLogout }: AppShellProps) {
  const { t } = useTranslation()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  return (
    <Flex bg="bg.canvas" color="fg" minH="100dvh">
      <Box
        alignSelf="flex-start"
        borderRightWidth="1px"
        display={{ base: 'none', lg: 'block' }}
        flex="0 0 16rem"
        h="100dvh"
        overflowY="auto"
        position="sticky"
        top="0"
      >
        <AppSidebar />
      </Box>
      <Box flex="1" minW="0">
        <AppNavbar
          onLogout={onLogout}
          onOpenNavigation={() => setIsNavigationOpen(true)}
        />
        <Box as="main">{children}</Box>
      </Box>
      <Drawer.Root
        onOpenChange={(details) => setIsNavigationOpen(details.open)}
        open={isNavigationOpen}
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW="xs">
              <Drawer.Header>
                <Drawer.Title>{t('appShell.primaryNavigation')}</Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body p="0">
                <AppSidebar onNavigate={() => setIsNavigationOpen(false)} />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  )
}

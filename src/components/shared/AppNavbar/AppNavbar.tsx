import { Box, Flex, HStack, IconButton } from '@chakra-ui/react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CommandMenu } from '@/components/shared/CommandMenu/CommandMenu'
import { ProfileMenu } from '@/components/shared/ProfileMenu/ProfileMenu'
import { ColorModeToggle } from '@/components/ui/ColorModeToggle/ColorModeToggle'
import { LanguageSelect } from '@/components/ui/LanguageSelect/LanguageSelect'
import { PrivacyModeToggle } from '@/components/ui/PrivacyModeToggle/PrivacyModeToggle'

type AppNavbarProps = {
  onOpenNavigation: () => void
  onLogout?: () => void
}

export function AppNavbar({ onOpenNavigation, onLogout }: AppNavbarProps) {
  const { t } = useTranslation()

  return (
    <Box
      as="header"
      backdropFilter="blur(16px)"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex
        align="center"
        gap="3"
        justify="space-between"
        minH="14"
        px={{ base: '3', md: '5' }}
      >
        <HStack gap="3" minW="0" flex="1">
          <IconButton
            aria-label={t('appShell.openNavigation')}
            display={{ base: 'inline-flex', lg: 'none' }}
            onClick={onOpenNavigation}
            size="sm"
            variant="outline"
          >
            <Menu aria-hidden="true" size={19} />
          </IconButton>
          <Box flex="1" maxW="36rem" minW="0">
            <CommandMenu />
          </Box>
        </HStack>
        <HStack gap={{ base: '1', sm: '2' }} flexShrink="0">
          <Box display={{ base: 'none', sm: 'block' }}>
            <LanguageSelect />
          </Box>
          <PrivacyModeToggle />
          <ColorModeToggle />
          <ProfileMenu onLogout={onLogout} />
        </HStack>
      </Flex>
    </Box>
  )
}

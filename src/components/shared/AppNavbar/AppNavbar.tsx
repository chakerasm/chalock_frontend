import { Box, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppInfoMenu } from '@/components/shared/AppInfoMenu/AppInfoMenu'
import { CommandMenu } from '@/components/shared/CommandMenu/CommandMenu'
import { ProfileMenu } from '@/components/shared/ProfileMenu/ProfileMenu'
import { ColorModeToggle } from '@/components/ui/ColorModeToggle/ColorModeToggle'
import { LanguageSelect } from '@/components/ui/LanguageSelect/LanguageSelect'

type AppNavbarProps = {
  onOpenNavigation: () => void
  onLogout?: () => void
}

export function AppNavbar({ onOpenNavigation, onLogout }: AppNavbarProps) {
  const { t } = useTranslation()

  return (
    <Box
      as="header"
      bg="bg.panel"
      borderBottomWidth="1px"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex
        align="center"
        gap="3"
        justify="space-between"
        minH="16"
        px={{ base: '4', md: '6' }}
      >
        <HStack gap="3" minW="0">
          <IconButton
            aria-label={t('appShell.openNavigation')}
            display={{ base: 'inline-flex', lg: 'none' }}
            onClick={onOpenNavigation}
            size="sm"
            variant="ghost"
          >
            <Menu aria-hidden="true" size={20} />
          </IconButton>
          <Text
            display={{ base: 'none', sm: 'block' }}
            fontWeight="semibold"
            truncate
          >
            {t('appShell.workspace')}
          </Text>
        </HStack>
        <HStack gap={{ base: '1', sm: '2' }}>
          <CommandMenu />
          <Box display={{ base: 'none', md: 'block' }}>
            <LanguageSelect />
          </Box>
          <AppInfoMenu />
          <ColorModeToggle />
          <ProfileMenu onLogout={onLogout} />
        </HStack>
      </Flex>
    </Box>
  )
}

import { Box, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import { Boxes, Menu } from 'lucide-react'
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
        minH={{ base: '16', md: '18' }}
        px={{ base: '4', md: '6', xl: '8' }}
      >
        <HStack gap="3" minW="0">
          <IconButton
            aria-label={t('appShell.openNavigation')}
            display={{ base: 'inline-flex', lg: 'none' }}
            onClick={onOpenNavigation}
            size="sm"
            variant="outline"
          >
            <Menu aria-hidden="true" size={19} />
          </IconButton>
          <Flex
            align="center"
            bg="brand.subtle"
            color="brand.fg"
            display={{ base: 'none', sm: 'flex', lg: 'none' }}
            h="9"
            justify="center"
            rounded="l1"
            w="9"
          >
            <Boxes aria-hidden="true" size={18} />
          </Flex>
          <Text fontWeight="semibold" letterSpacing="tight" truncate>
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
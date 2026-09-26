import { Button, HStack, Menu, Portal, Text } from '@chakra-ui/react'
import { CircleUserRound, LogOut, Settings, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'

type ProfileMenuProps = {
  onLogout?: () => void
}

export function ProfileMenu({ onLogout }: ProfileMenuProps) {
  const { t } = useTranslation()

  function notifyUnavailable() {
    toast.warning({ title: t('common.notAvailable') })
  }

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <Button
          aria-label={t('appShell.profileMenu')}
          size="sm"
          variant="ghost"
        >
          <CircleUserRound aria-hidden="true" size={19} />
          <Text display={{ base: 'none', sm: 'inline' }} fontWeight="medium">
            {t('appShell.profileName')}
          </Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="52">
            <Menu.Item disabled value="identity">
              <HStack gap="2">
                <UserRound aria-hidden="true" size={16} />
                <Text>{t('appShell.profileEmail')}</Text>
              </HStack>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item onClick={notifyUnavailable} value="settings">
              <Settings aria-hidden="true" size={16} />
              {t('appShell.settings')}
            </Menu.Item>
            <Menu.Item
              color="fg.error"
              onClick={onLogout ?? notifyUnavailable}
              value="logout"
            >
              <LogOut aria-hidden="true" size={16} />
              {t('appShell.logout')}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

import { Button, HStack, Menu, Portal, Text } from '@chakra-ui/react'
import { CircleUserRound, LogOut, Settings, UserRound } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { APP_ROUTES } from '@/lib/routes'

type ProfileMenuProps = {
  onLogout?: () => void
}

export function ProfileMenu({ onLogout }: ProfileMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const settingsQuery = useSettings(isOpen)
  const displayName =
    settingsQuery.data?.profile.displayName ?? t('appShell.profileName')

  function notifyUnavailable() {
    toast.warning({ title: t('common.notAvailable') })
  }

  return (
    <Menu.Root
      onOpenChange={(details) => setIsOpen(details.open)}
      positioning={{ placement: 'bottom-end' }}
    >
      <Menu.Trigger asChild>
        <Button
          aria-label={t('appShell.profileMenu')}
          size="sm"
          variant="ghost"
        >
          <CircleUserRound aria-hidden="true" size={19} />
          <Text display={{ base: 'none', sm: 'inline' }} fontWeight="medium">
            {displayName}
          </Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content bg="bg.elevated" borderColor="border.subtle" borderWidth="1px" minW="52" rounded="l2" shadow="md">
            <Menu.Item disabled value="identity">
              <HStack gap="2">
                <UserRound aria-hidden="true" size={16} />
                <Text>{t('appShell.profileEmail')}</Text>
              </HStack>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item
              onClick={() => void navigate({ to: APP_ROUTES.settings })}
              value="settings"
            >
              <Settings aria-hidden="true" size={16} />
              {t('appShell.settings')}
            </Menu.Item>
            <Menu.Item
              color="danger.fg"
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

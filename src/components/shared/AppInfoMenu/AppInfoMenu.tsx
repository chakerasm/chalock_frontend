import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Menu,
  Portal,
  Stack,
  Table,
} from '@chakra-ui/react'
import { CircleHelp, Info } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataList } from '@/components/shared/DataList/DataList'
import { DataListCell } from '@/components/shared/DataList/DataListCell'
import { DataListContent } from '@/components/shared/DataList/DataListContent'
import { appInfo } from '@/lib/env/app-info'

export function AppInfoMenu() {
  const { t } = useTranslation()
  const [isVersionOpen, setIsVersionOpen] = useState(false)

  return (
    <>
      <Menu.Root positioning={{ placement: 'bottom-end' }}>
        <Menu.Trigger asChild>
          <Button aria-label={t('appInfo.menuLabel')} size="sm" variant="ghost">
            <CircleHelp aria-hidden="true" size={18} />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="44">
              <Menu.Item onClick={() => setIsVersionOpen(true)} value="version">
                <HStack gap="2">
                  <Info aria-hidden="true" size={16} />
                  <span>{t('appInfo.version')}</span>
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Dialog.Root
        onOpenChange={(details) => setIsVersionOpen(details.open)}
        open={isVersionOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Stack gap="1">
                  <Dialog.Title>{t('appInfo.versionTitle')}</Dialog.Title>
                  <Dialog.Description>
                    {t('appInfo.versionDescription')}
                  </Dialog.Description>
                </Stack>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <DataList>
                  <DataListContent>
                    <Table.Row>
                      <DataListCell>{t('appInfo.version')}</DataListCell>
                      <DataListCell>{appInfo.version}</DataListCell>
                    </Table.Row>
                    <Table.Row>
                      <DataListCell>{t('appInfo.environment')}</DataListCell>
                      <DataListCell>{appInfo.environment}</DataListCell>
                    </Table.Row>
                  </DataListContent>
                </DataList>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setIsVersionOpen(false)}>
                  {t('common.close')}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

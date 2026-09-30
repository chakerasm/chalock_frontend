import {
  Box,
  Button,
  Field,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BellRing, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldSwitch } from '@/components/ui/FieldSwitch/FieldSwitch'
import { toast } from '@/components/ui/Toaster/Toaster'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/features/settings/hooks/use-notification-preferences'
import { notificationPreferencesSchema } from '@/features/settings/schemas/notification-preferences.schemas'
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from '@/features/settings/services/browser-notifications.service'
import type {
  NotificationCategory,
  NotificationPreferences,
} from '@/features/settings/types/notification-preferences.types'

const categories: NotificationCategory[] = [
  'tasks',
  'habits',
  'planner',
  'reminders',
  'subscriptions',
  'finance',
  'goals',
]

export function NotificationPreferencesSection() {
  const { t } = useTranslation()
  const preferencesQuery = useNotificationPreferences()
  const updateMutation = useUpdateNotificationPreferences()
  const [permission, setPermission] = useState(getBrowserNotificationPermission)
  const form = useForm<NotificationPreferences>({
    defaultValues: preferencesQuery.data,
    resolver: zodResolver(notificationPreferencesSchema),
  })
  const quietHoursEnabled = useWatch({
    control: form.control,
    name: 'quietHours.enabled',
  })

  useEffect(() => {
    if (preferencesQuery.data) form.reset(preferencesQuery.data)
  }, [form, preferencesQuery.data])

  if (preferencesQuery.isPending) {
    return (
      <Box borderTopWidth="1px" pt={{ base: '5', md: '6' }}>
        <Stack gap="4">
          <Skeleton h="6" w="36" />
          <Skeleton h="4" maxW="xl" />
          <Skeleton h="22rem" rounded="l2" />
        </Stack>
      </Box>
    )
  }

  if (preferencesQuery.isError || !preferencesQuery.data) {
    return (
      <Box borderTopWidth="1px" pt={{ base: '5', md: '6' }}>
        <ErrorState
          description={t('settings.notificationsLoadErrorDescription')}
          onRetry={() => void preferencesQuery.refetch()}
          title={t('settings.notificationsLoadErrorTitle')}
        />
      </Box>
    )
  }

  async function requestPermission() {
    const nextPermission = await requestBrowserNotificationPermission()
    setPermission(nextPermission)
    if (nextPermission === 'granted') {
      form.setValue('browserEnabled', true, { shouldDirty: true })
    }
  }

  function submit(preferences: NotificationPreferences) {
    updateMutation.mutate(preferences, {
      onError: () =>
        toast.error({ title: t('settings.notificationsSaveError') }),
      onSuccess: () =>
        toast.success({ title: t('settings.notificationsSaveSuccess') }),
    })
  }

  const permissionKey =
    permission === 'unsupported' ? 'unsupported' : permission

  return (
    <Box borderTopWidth="1px" pt={{ base: '5', md: '6' }}>
      <form onSubmit={form.handleSubmit(submit)}>
        <Stack gap="5">
          <Stack gap="1">
            <Text fontSize="lg" fontWeight="semibold">
              {t('settings.notifications')}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('settings.notificationsDescription')}
            </Text>
          </Stack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <FieldSwitch
              control={form.control}
              description={t('settings.inAppNotificationsDescription')}
              label={t('settings.inAppNotifications')}
              name="inAppEnabled"
            />
            <FieldSwitch
              control={form.control}
              description={t('settings.soundsDescription')}
              label={t('settings.sounds')}
              name="soundsEnabled"
            />
            <FieldSwitch
              control={form.control}
              description={t('settings.browserNotificationsDescription')}
              disabled={permission !== 'granted'}
              label={t('settings.browserNotifications')}
              name="browserEnabled"
            />
            <Field.Root disabled>
              <Switch.Root checked={false} disabled>
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>{t('settings.emailNotifications')}</Switch.Label>
              </Switch.Root>
              <Field.HelperText>
                {t('settings.emailNotificationsDescription')}
              </Field.HelperText>
            </Field.Root>
          </SimpleGrid>
          <Box bg="bg.subtle" p="4" rounded="l1">
            <Stack
              align={{ base: 'start', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between"
            >
              <Stack gap="1">
                <Text fontWeight="medium">
                  {t('settings.browserPermission')}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {t(`settings.browserPermissionStates.${permissionKey}`)}
                </Text>
              </Stack>
              {permission === 'default' ? (
                <Button
                  onClick={() => void requestPermission()}
                  size="sm"
                  variant="outline"
                >
                  <BellRing aria-hidden="true" size={16} />
                  {t('settings.enableBrowserNotifications')}
                </Button>
              ) : null}
            </Stack>
          </Box>
          <Stack gap="3">
            <FieldSwitch
              control={form.control}
              description={t('settings.quietHoursDescription')}
              label={t('settings.quietHours')}
              name="quietHours.enabled"
            />
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
              <FieldInput
                control={form.control}
                disabled={!quietHoursEnabled}
                label={t('settings.quietHoursStart')}
                name="quietHours.start"
                required
                type="time"
              />
              <FieldInput
                control={form.control}
                disabled={!quietHoursEnabled}
                label={t('settings.quietHoursEnd')}
                name="quietHours.end"
                required
                type="time"
              />
            </SimpleGrid>
          </Stack>
          <Stack gap="3">
            <Text fontWeight="medium">
              {t('settings.notificationCategories')}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('settings.notificationCategoriesDescription')}
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="3">
              {categories.map((category) => (
                <FieldSwitch
                  control={form.control}
                  key={category}
                  label={t(`settings.notificationCategory.${category}`)}
                  name={`categories.${category}`}
                />
              ))}
            </SimpleGrid>
          </Stack>
          <HStack justify="flex-end">
            <Button
              colorPalette="brand"
              loading={updateMutation.isPending}
              type="submit"
            >
              <Save aria-hidden="true" size={17} />
              {t('settings.saveNotifications')}
            </Button>
          </HStack>
        </Stack>
      </form>
    </Box>
  )
}

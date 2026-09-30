import {
  Box,
  Button,
  Container,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldRadioGroup } from '@/components/ui/FieldRadioGroup/FieldRadioGroup'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'
import { toast } from '@/components/ui/Toaster/Toaster'
import { NotificationPreferencesSection } from '@/features/settings/components/NotificationPreferencesSection'
import { SettingsPageSkeleton } from '@/features/settings/components/SettingsPageSkeleton'
import {
  useSettings,
  useUpdateSettings,
} from '@/features/settings/hooks/use-settings'
import { settingsSnapshotSchema } from '@/features/settings/schemas/settings.schemas'
import type { SettingsSnapshot } from '@/features/settings/types/settings.types'

function getTimezones() {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[]
  }
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
  const values = intl.supportedValuesOf?.('timeZone') ?? [
    'Africa/Casablanca',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Paris',
    'UTC',
  ]
  return [...new Set([detected, ...values].filter(Boolean))].sort()
}

function SettingsSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <Box borderTopWidth="1px" pt={{ base: '5', md: '6' }}>
      <Stack gap="5">
        <Stack gap="1">
          <Text fontSize="lg" fontWeight="semibold">
            {title}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {description}
          </Text>
        </Stack>
        {children}
      </Stack>
    </Box>
  )
}

export function SettingsPage() {
  const { i18n, t } = useTranslation()
  const { setTheme } = useTheme()
  const settingsQuery = useSettings()
  const updateMutation = useUpdateSettings()
  const timezones = useMemo(getTimezones, [])
  const form = useForm<SettingsSnapshot>({
    defaultValues: settingsQuery.data,
    resolver: zodResolver(settingsSnapshotSchema),
  })

  const timeIncrementMinutes = useWatch({
    control: form.control,
    name: 'settings.planning.timeIncrementMinutes',
  })
  const defaultBlockMinutes = useWatch({
    control: form.control,
    name: 'settings.planning.defaultBlockMinutes',
  })

  useEffect(() => {
    if (settingsQuery.data) form.reset(settingsQuery.data)
  }, [form, settingsQuery.data])

  useEffect(() => {
    if (
      timeIncrementMinutes &&
      defaultBlockMinutes &&
      defaultBlockMinutes % timeIncrementMinutes !== 0
    ) {
      form.setValue(
        'settings.planning.defaultBlockMinutes',
        timeIncrementMinutes,
      )
    }
  }, [defaultBlockMinutes, form, timeIncrementMinutes])

  if (settingsQuery.isPending) return <SettingsPageSkeleton />

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <Container maxW="4xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          description={t('settings.loadErrorDescription')}
          onRetry={() => void settingsQuery.refetch()}
          title={t('settings.loadErrorTitle')}
        />
      </Container>
    )
  }

  function submit(values: SettingsSnapshot) {
    const snapshot: SettingsSnapshot = {
      ...values,
      profile: {
        ...values.profile,
        avatarUrl: values.profile.avatarUrl?.trim() || undefined,
        bio: values.profile.bio?.trim() || undefined,
        displayName: values.profile.displayName.trim(),
      },
      settings: {
        ...values.settings,
        defaultCurrency: values.settings.defaultCurrency.trim().toUpperCase(),
      },
    }
    updateMutation.mutate(snapshot, {
      onError: () => toast.error({ title: t('settings.saveError') }),
      onSuccess: (saved) => {
        setTheme(saved.settings.theme)
        void i18n.changeLanguage(saved.settings.locale)
        toast.success({ title: t('settings.saveSuccess') })
      },
    })
  }

  return (
    <Container maxW="4xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '7', md: '9' }}>
        <form onSubmit={form.handleSubmit(submit)}>
          <Stack gap={{ base: '7', md: '9' }}>
            <PageHeader
              actions={
                <Button
                  colorPalette="brand"
                  loading={updateMutation.isPending}
                  type="submit"
                >
                  <Save aria-hidden="true" size={17} />
                  {t('settings.save')}
                </Button>
              }
              description={t('settings.description')}
              eyebrow={t('settings.eyebrow')}
              title={t('settings.title')}
            />
            <SettingsSection
              description={t('settings.profileDescription')}
              title={t('settings.profile')}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <FieldInput
                  control={form.control}
                  label={t('settings.displayName')}
                  name="profile.displayName"
                  required
                />
                <FieldInput
                  control={form.control}
                  label={t('settings.avatarUrl')}
                  name="profile.avatarUrl"
                  placeholder="https://…"
                  type="url"
                />
              </SimpleGrid>
              <FieldTextarea
                control={form.control}
                label={t('settings.bio')}
                name="profile.bio"
                rows={3}
              />
            </SettingsSection>
            <SettingsSection
              description={t('settings.regionalDescription')}
              title={t('settings.regional')}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <FieldSelect
                  control={form.control}
                  label={t('settings.timezone')}
                  name="settings.timezone"
                  options={timezones.map((timezone) => ({
                    label: timezone,
                    value: timezone,
                  }))}
                  required
                />
                <FieldSelect
                  control={form.control}
                  label={t('settings.locale')}
                  name="settings.locale"
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Français', value: 'fr' },
                  ]}
                  required
                />
                <FieldInput
                  control={form.control}
                  label={t('settings.defaultCurrency')}
                  name="settings.defaultCurrency"
                  required
                />
                <FieldSelect
                  control={form.control}
                  label={t('settings.dateFormat')}
                  name="settings.dateFormat"
                  options={[
                    'locale',
                    'DD/MM/YYYY',
                    'MM/DD/YYYY',
                    'YYYY-MM-DD',
                  ].map((value) => ({
                    label: t(`settings.dateFormats.${value}`),
                    value,
                  }))}
                  required
                />
                <FieldRadioGroup
                  control={form.control}
                  label={t('settings.timeFormat')}
                  name="settings.timeFormat"
                  options={[
                    { label: t('settings.timeFormats.12h'), value: '12h' },
                    { label: t('settings.timeFormats.24h'), value: '24h' },
                  ]}
                />
                <FieldSelect
                  control={form.control}
                  label={t('settings.weekStartsOn')}
                  name="settings.weekStartsOn"
                  options={[
                    { label: t('settings.sunday'), value: '0' },
                    { label: t('settings.monday'), value: '1' },
                  ]}
                  required
                  valueAsNumber
                />
              </SimpleGrid>
            </SettingsSection>
            <SettingsSection
              description={t('settings.appearanceDescription')}
              title={t('settings.appearance')}
            >
              <FieldRadioGroup
                control={form.control}
                label={t('settings.theme')}
                name="settings.theme"
                options={[
                  { label: t('settings.themes.system'), value: 'system' },
                  { label: t('settings.themes.light'), value: 'light' },
                  { label: t('settings.themes.dark'), value: 'dark' },
                ]}
              />
            </SettingsSection>
            <SettingsSection
              description={t('settings.planningDescription')}
              title={t('settings.planning')}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <FieldInputNumber
                  control={form.control}
                  label={t('settings.dayStartHour')}
                  max={22}
                  min={0}
                  name="settings.planning.dayStartHour"
                  required
                />
                <FieldInputNumber
                  control={form.control}
                  label={t('settings.dayEndHour')}
                  max={23}
                  min={1}
                  name="settings.planning.dayEndHour"
                  required
                />
                <FieldSelect
                  control={form.control}
                  label={t('settings.defaultBlockMinutes')}
                  name="settings.planning.defaultBlockMinutes"
                  options={['15', '30', '45', '60', '90', '120']
                    .filter(
                      (value) =>
                        !timeIncrementMinutes ||
                        Number(value) % timeIncrementMinutes === 0,
                    )
                    .map((value) => ({
                      label: t('settings.minutes', { value }),
                      value,
                    }))}
                  required
                  valueAsNumber
                />
                <FieldSelect
                  control={form.control}
                  label={t('settings.timeIncrementMinutes')}
                  name="settings.planning.timeIncrementMinutes"
                  options={['5', '10', '15', '30'].map((value) => ({
                    label: t('settings.minutes', { value }),
                    value,
                  }))}
                  required
                  valueAsNumber
                />
              </SimpleGrid>
            </SettingsSection>
            <HStack justify="flex-end">
              <Button
                colorPalette="brand"
                loading={updateMutation.isPending}
                type="submit"
              >
                <Save aria-hidden="true" size={17} />
                {t('settings.save')}
              </Button>
            </HStack>
          </Stack>
        </form>
        <NotificationPreferencesSection />
      </Stack>
    </Container>
  )
}

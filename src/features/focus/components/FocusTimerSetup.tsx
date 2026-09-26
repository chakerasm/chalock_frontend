import {
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Clock3, Play, Timer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StartFocusTimerInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'

const timerPresets = [5, 10, 15, 25, 30, 45, 60]

type FocusTimerSetupProps = {
  onStart: (input: StartFocusTimerInput) => void
}

function getOptionalIdentifier(value: string) {
  return value || undefined
}

export function FocusTimerSetup({ onStart }: FocusTimerSetupProps) {
  const { t } = useTranslation()
  const tasksQuery = useTasks()
  const dashboardQuery = useTodayDashboard()
  const [selectedPreset, setSelectedPreset] = useState(25)
  const [customMinutes, setCustomMinutes] = useState('')
  const [taskId, setTaskId] = useState('')
  const [goalId, setGoalId] = useState('')
  const customDuration = Number(customMinutes)
  const selectedDurationMinutes = customMinutes
    ? customDuration
    : selectedPreset
  const hasValidCustomDuration =
    Number.isInteger(customDuration) &&
    customDuration > 0 &&
    customDuration <= 1_440

  function createAssociations() {
    return {
      goalId: getOptionalIdentifier(goalId),
      taskId: getOptionalIdentifier(taskId),
    }
  }

  return (
    <Stack gap="5">
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Stack gap="5">
            <Stack gap="1">
              <Clock3 aria-hidden="true" size={22} />
              <Text fontSize="lg" fontWeight="semibold">
                {t('focus.stopwatchTitle')}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {t('focus.stopwatchDescription')}
              </Text>
            </Stack>
            <Text
              fontSize="4xl"
              fontVariantNumeric="tabular-nums"
              fontWeight="bold"
            >
              00:00
            </Text>
            <Button
              colorPalette="brand"
              onClick={() =>
                onStart({ ...createAssociations(), type: 'stopwatch' })
              }
            >
              <Play aria-hidden="true" size={17} />
              {t('focus.startStopwatch')}
            </Button>
          </Stack>
        </Box>
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Stack gap="5">
            <Stack gap="1">
              <Timer aria-hidden="true" size={22} />
              <Text fontSize="lg" fontWeight="semibold">
                {t('focus.timerTitle')}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {t('focus.timerDescription')}
              </Text>
            </Stack>
            <SimpleGrid columns={4} gap="2">
              {timerPresets.map((minutes) => (
                <Button
                  colorPalette={
                    !customMinutes && selectedPreset === minutes
                      ? 'brand'
                      : undefined
                  }
                  key={minutes}
                  onClick={() => {
                    setCustomMinutes('')
                    setSelectedPreset(minutes)
                  }}
                  size="sm"
                  variant={
                    !customMinutes && selectedPreset === minutes
                      ? 'subtle'
                      : 'outline'
                  }
                >
                  {t('focus.minutes', { minutes })}
                </Button>
              ))}
            </SimpleGrid>
            <Field.Root
              invalid={Boolean(customMinutes) && !hasValidCustomDuration}
            >
              <Field.Label>{t('focus.customDuration')}</Field.Label>
              <Input
                aria-label={t('focus.customDuration')}
                max="1440"
                min="1"
                onChange={(event) => setCustomMinutes(event.target.value)}
                placeholder={t('focus.customDurationPlaceholder')}
                type="number"
                value={customMinutes}
              />
              {customMinutes && !hasValidCustomDuration ? (
                <Field.ErrorText>{t('focus.invalidDuration')}</Field.ErrorText>
              ) : null}
            </Field.Root>
            <Button
              colorPalette="brand"
              disabled={Boolean(customMinutes) && !hasValidCustomDuration}
              onClick={() =>
                onStart({
                  ...createAssociations(),
                  plannedDurationSeconds: selectedDurationMinutes * 60,
                  type: 'timer',
                })
              }
            >
              <Play aria-hidden="true" size={17} />
              {t('focus.startTimer')}
            </Button>
          </Stack>
        </Box>
      </SimpleGrid>
      <Box bg="bg.subtle" borderWidth="1px" p="4" rounded="l2">
        <Stack gap="3">
          <Text fontSize="sm" fontWeight="semibold">
            {t('focus.optionalAssociation')}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {t('focus.optionalAssociationDescription')}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <Field.Root>
              <Field.Label>{t('focus.taskLabel')}</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  onChange={(event) => setTaskId(event.target.value)}
                  value={taskId}
                >
                  <option value="">{t('focus.noTask')}</option>
                  {(tasksQuery.data ?? [])
                    .filter((task) => task.status !== 'completed')
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('focus.goalLabel')}</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  onChange={(event) => setGoalId(event.target.value)}
                  value={goalId}
                >
                  <option value="">{t('focus.noGoal')}</option>
                  {(dashboardQuery.data?.activeGoals ?? []).map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  )
}

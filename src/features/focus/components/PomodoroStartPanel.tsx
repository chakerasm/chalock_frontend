import {
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StartPomodoroInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'

type PomodoroStartPanelProps = {
  blockedByActiveTimer: boolean
  onStart: (input: StartPomodoroInput) => void
}

function optionalValue(value: string) {
  return value || undefined
}

export function PomodoroStartPanel({
  blockedByActiveTimer,
  onStart,
}: PomodoroStartPanelProps) {
  const { t } = useTranslation()
  const tasksQuery = useTasks()
  const dashboardQuery = useTodayDashboard()
  const [intention, setIntention] = useState('')
  const [taskId, setTaskId] = useState('')
  const [goalId, setGoalId] = useState('')

  return (
    <Box
      bg="transparent"
      maxW="md"
      mx="auto"
      px={{ base: '2', md: '4' }}
      py="2"
      w="full"
    >
      <Stack gap="3">
        <Stack align="center" gap="2" textAlign="center">
          <Text color="white" fontSize="xl" fontWeight="semibold">
            {t('pomodoro.readyTitle')}
          </Text>
          <Text color="whiteAlpha.900" fontSize="sm">
            {t('pomodoro.readyDescription')}
          </Text>
        </Stack>
        <Field.Root>
          <Field.Label>{t('pomodoro.intentionLabel')}</Field.Label>
          <Input
            aria-label={t('pomodoro.intentionLabel')}
            maxLength={120}
            onChange={(event) => setIntention(event.target.value)}
            placeholder={t('pomodoro.intentionPlaceholder')}
            value={intention}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>{t('pomodoro.taskLabel')}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              onChange={(event) => setTaskId(event.target.value)}
              value={taskId}
            >
              <option value="">{t('pomodoro.noTask')}</option>
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
          <Field.Label>{t('pomodoro.goalLabel')}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              onChange={(event) => setGoalId(event.target.value)}
              value={goalId}
            >
              <option value="">{t('pomodoro.noGoal')}</option>
              {(dashboardQuery.data?.activeGoals ?? []).map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        {blockedByActiveTimer ? (
          <Text color="fg.muted" fontSize="sm" textAlign="center">
            {t('pomodoro.activeTimerNotice')}
          </Text>
        ) : null}
        <Button
          colorPalette="brand"
          disabled={blockedByActiveTimer}
          onClick={() =>
            onStart({
              goalId: optionalValue(goalId),
              intention: optionalValue(intention.trim()),
              taskId: optionalValue(taskId),
            })
          }
          size="lg"
        >
          <Play aria-hidden="true" size={18} />
          {t('pomodoro.start')}
        </Button>
      </Stack>
    </Box>
  )
}

import { Box, Button, Container, Flex, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'
import { PomodoroHistory } from '@/features/focus/components/PomodoroHistory'
import { PomodoroSessionView } from '@/features/focus/components/PomodoroSessionView'
import { PomodoroStartPanel } from '@/features/focus/components/PomodoroStartPanel'
import { usePomodoro } from '@/features/focus/hooks/use-pomodoro'
import type { StartPomodoroInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'

export function PomodoroPage() {
  const { t } = useTranslation()
  const pomodoro = usePomodoro()
  const tasksQuery = useTasks()
  const dashboardQuery = useTodayDashboard()

  function handleStart(input: StartPomodoroInput) {
    pomodoro.start(input)
  }

  function handleStop() {
    pomodoro.stop()
    toast.warning({ title: t('pomodoro.sessionCancelled') })
  }

  return (
    <Container maxW="3xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '8', md: '12' }} minH="calc(100vh - 8rem)">
        <Flex align="center" justify="space-between">
          <Text fontSize="sm" fontWeight="semibold">
            {t('pomodoro.title')}
          </Text>
          <Button asChild size="sm" variant="ghost">
            <RouterLink to="/focus">
              <ArrowLeft aria-hidden="true" size={16} />
              {t('pomodoro.exitMode')}
            </RouterLink>
          </Button>
        </Flex>
        <Box flex="1" placeContent="center">
          {pomodoro.cycle ? (
            <PomodoroSessionView
              cycle={pomodoro.cycle}
              onPause={pomodoro.pause}
              onResume={pomodoro.resume}
              onSkip={pomodoro.skip}
              onStop={handleStop}
              progress={pomodoro.progress}
              remainingSeconds={pomodoro.remainingSeconds}
              sessionNumber={pomodoro.sessionNumber}
            />
          ) : (
            <PomodoroStartPanel
              blockedByActiveTimer={Boolean(pomodoro.activeFocusTimer)}
              onStart={handleStart}
            />
          )}
        </Box>
        <PomodoroHistory
          goals={dashboardQuery.data?.activeGoals ?? []}
          history={pomodoro.history}
          tasks={tasksQuery.data ?? []}
        />
      </Stack>
    </Container>
  )
}

import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Check, Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import type { TodayHabit } from '@/features/today/types/today.types'

type TodayHabitsCardProps = {
  habits: TodayHabit[]
  isUpdating: boolean
  onUpdateHabit: (
    habit: TodayHabit,
    action: 'complete' | 'decrement' | 'increment',
  ) => void
}

export function TodayHabitsCard({
  habits,
  isUpdating,
  onUpdateHabit,
}: TodayHabitsCardProps) {
  const { t } = useTranslation()
  const incompleteHabits = habits.filter((habit) => !habit.completed)

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Flex align="center" justify="space-between" mb="4">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            {t('today.habitsTitle')}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {t('today.habitsSummary', {
              completed: habits.length - incompleteHabits.length,
              total: habits.length,
            })}
          </Text>
        </Box>
        <Check aria-hidden="true" size={22} />
      </Flex>
      {habits.length === 0 || incompleteHabits.length === 0 ? (
        <EmptyState
          description={t('today.habitsEmptyDescription')}
          title={t('today.habitsEmptyTitle')}
        />
      ) : (
        <Stack gap="3">
          {habits.map((habit) => {
            const hasTarget = Boolean(habit.targetCount)
            return (
              <Stack
                gap="2"
                key={habit.id}
                opacity={habit.completed ? 0.65 : 1}
              >
                <Flex align="center" gap="3" justify="space-between">
                  <Checkbox.Root
                    checked={habit.completed}
                    disabled={habit.completed || isUpdating}
                    flex="1"
                    onCheckedChange={() => onUpdateHabit(habit, 'complete')}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{habit.name}</Checkbox.Label>
                  </Checkbox.Root>
                  {hasTarget ? (
                    <HStack gap="1">
                      <Text color="fg.muted" fontSize="sm">
                        {t('today.habitProgress', {
                          current: habit.currentCount ?? 0,
                          target: habit.targetCount,
                        })}
                      </Text>
                      <IconButton
                        aria-label={t('today.decreaseHabitProgress', {
                          habit: habit.name,
                        })}
                        disabled={
                          isUpdating || (habit.currentDayCount ?? 0) === 0
                        }
                        onClick={() => onUpdateHabit(habit, 'decrement')}
                        size="xs"
                        variant="ghost"
                      >
                        <Minus aria-hidden="true" size={15} />
                      </IconButton>
                      {!habit.completed ? (
                        <IconButton
                          aria-label={t('today.addHabitProgress', {
                            habit: habit.name,
                          })}
                          disabled={isUpdating}
                          onClick={() => onUpdateHabit(habit, 'increment')}
                          size="xs"
                          variant="ghost"
                        >
                          <Plus aria-hidden="true" size={15} />
                        </IconButton>
                      ) : null}
                    </HStack>
                  ) : null}
                </Flex>
                {hasTarget ? (
                  <Progress.Root
                    size="xs"
                    value={
                      habit.targetCount
                        ? ((habit.currentCount ?? 0) / habit.targetCount) * 100
                        : 0
                    }
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                ) : null}
              </Stack>
            )
          })}
        </Stack>
      )}
      {incompleteHabits.length > 0 ? (
        <Button
          mt="4"
          onClick={() => {
            incompleteHabits.forEach((habit) => {
              onUpdateHabit(habit, 'complete')
            })
          }}
          size="sm"
          variant="ghost"
        >
          {t('today.completeRemainingHabits')}
        </Button>
      ) : null}
    </Box>
  )
}

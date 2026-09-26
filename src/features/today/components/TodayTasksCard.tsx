import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CheckCircle2, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import type {
  TodayTask,
  TodayTaskPriority,
} from '@/features/today/types/today.types'

type TodayTasksCardProps = {
  isUpdating: boolean
  onUpdateTask: (taskId: string, completed: boolean) => void
  tasks: TodayTask[]
}

const priorityColors: Record<TodayTaskPriority, 'blue' | 'orange' | 'red'> = {
  high: 'red',
  low: 'blue',
  medium: 'orange',
}

export function TodayTasksCard({
  isUpdating,
  onUpdateTask,
  tasks,
}: TodayTasksCardProps) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const visibleTasks = showAll ? tasks : tasks.slice(0, 4)

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
            {t('today.tasksTitle')}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {t('today.tasksSummary', {
              remaining: tasks.filter((task) => task.status !== 'completed')
                .length,
            })}
          </Text>
        </Box>
        <CheckCircle2 aria-hidden="true" size={22} />
      </Flex>
      {tasks.length === 0 ? (
        <EmptyState
          description={t('today.tasksEmptyDescription')}
          title={t('today.tasksEmptyTitle')}
        />
      ) : (
        <Stack gap="1">
          {visibleTasks.map((task) => (
            <Flex
              align="center"
              gap="3"
              justify="space-between"
              key={task.id}
              minH="12"
              py="2"
            >
              <Checkbox.Root
                checked={task.status === 'completed'}
                disabled={isUpdating}
                flex="1"
                minW="0"
                onCheckedChange={({ checked }) =>
                  onUpdateTask(task.id, checked === true)
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label
                  textDecoration={
                    task.status === 'completed' ? 'line-through' : undefined
                  }
                  truncate
                >
                  {task.title}
                </Checkbox.Label>
              </Checkbox.Root>
              <HStack color="fg.muted" flexShrink="0" fontSize="xs" gap="2">
                {task.dueTime ? <Text>{task.dueTime}</Text> : null}
                {task.estimatedMinutes ? (
                  <HStack gap="1">
                    <Clock3 aria-hidden="true" size={13} />
                    <Text>
                      {t('today.duration', { minutes: task.estimatedMinutes })}
                    </Text>
                  </HStack>
                ) : null}
                {task.priority ? (
                  <Badge colorPalette={priorityColors[task.priority]} size="sm">
                    {t(`today.priority.${task.priority}`)}
                  </Badge>
                ) : null}
              </HStack>
            </Flex>
          ))}
        </Stack>
      )}
      {tasks.length > 4 ? (
        <Button
          mt="3"
          onClick={() => setShowAll((value) => !value)}
          size="sm"
          variant="ghost"
        >
          {showAll ? t('today.showFewerTasks') : t('today.viewAllTasks')}
        </Button>
      ) : null}
    </Box>
  )
}

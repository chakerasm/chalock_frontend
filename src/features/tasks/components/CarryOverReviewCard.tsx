import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import { TaskDateActions } from '@/features/tasks/components/TaskDateActions'
import type { Task } from '@/features/tasks/types/tasks.types'

type CarryOverReviewCardProps = {
  isUpdating: boolean
  onComplete: (tasks: Task[]) => void
  onReschedule: (tasks: Task[], dueDate: string | null) => void
  onSkip: () => void
  plannerBlocks: TimeBlock[]
  tasks: Task[]
}

export function CarryOverReviewCard({
  isUpdating,
  onComplete,
  onReschedule,
  onSkip,
  plannerBlocks,
  tasks,
}: CarryOverReviewCardProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(tasks.map((task) => task.id)),
  )
  const selectedTasks = useMemo(
    () => tasks.filter((task) => selectedIds.has(task.id)),
    [selectedIds, tasks],
  )

  if (tasks.length === 0) return null

  function toggleTask(taskId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(taskId)
      else next.delete(taskId)
      return next
    })
  }

  return (
    <Box
      bg="warning.subtle"
      borderColor="warning.fg"
      borderWidth="1px"
      p={{ base: '3', md: '4' }}
      rounded="l2"
    >
      <Flex
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
        justify="space-between"
      >
        <HStack align="start" gap="3">
          <CalendarClock aria-hidden="true" size={20} />
          <Stack gap="0">
            <Text fontWeight="semibold">
              {t('tasks.carryOver.summary', { count: tasks.length })}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('tasks.carryOver.description')}
            </Text>
          </Stack>
        </HStack>
        <HStack gap="2">
          <Button onClick={onSkip} size="sm" variant="ghost">
            {t('tasks.carryOver.skip')}
          </Button>
          <Button
            colorPalette="brand"
            onClick={() => setIsOpen((open) => !open)}
            size="sm"
          >
            {t(
              isOpen ? 'tasks.carryOver.hideReview' : 'tasks.carryOver.review',
            )}
            {isOpen ? (
              <ChevronUp aria-hidden="true" size={16} />
            ) : (
              <ChevronDown aria-hidden="true" size={16} />
            )}
          </Button>
        </HStack>
      </Flex>
      {isOpen ? (
        <Stack borderTopWidth="1px" gap="3" mt="4" pt="4">
          <Flex
            align={{ base: 'start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="2"
            justify="space-between"
          >
            <Text color="fg.muted" fontSize="sm">
              {t('tasks.carryOver.selected', { count: selectedTasks.length })}
            </Text>
            <HStack gap="1" wrap="wrap">
              <Button
                disabled={!selectedTasks.length || isUpdating}
                onClick={() => onComplete(selectedTasks)}
                size="xs"
                variant="outline"
              >
                {t('tasks.carryOver.completeSelected')}
              </Button>
              <TaskDateActions
                disabled={!selectedTasks.length || isUpdating}
                onSelect={(dueDate) => onReschedule(selectedTasks, dueDate)}
              />
            </HStack>
          </Flex>
          {tasks.map((task) => {
            const hasPastPlannerBlock = plannerBlocks.some(
              (block) => block.taskId === task.id,
            )
            return (
              <Flex
                align={{ base: 'start', md: 'center' }}
                bg="bg.panel"
                direction={{ base: 'column', md: 'row' }}
                gap="3"
                justify="space-between"
                key={task.id}
                p="3"
                rounded="l2"
              >
                <Stack gap="1" minW="0">
                  <Checkbox.Root
                    checked={selectedIds.has(task.id)}
                    disabled={isUpdating}
                    onCheckedChange={({ checked }) =>
                      toggleTask(task.id, checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontWeight="semibold">
                      <PrivateText>{task.title}</PrivateText>
                    </Checkbox.Label>
                  </Checkbox.Root>
                  {hasPastPlannerBlock ? (
                    <Text color="fg.muted" fontSize="xs">
                      {t('tasks.carryOver.pastPlannerBlock')}
                    </Text>
                  ) : null}
                </Stack>
                <HStack gap="1" wrap="wrap">
                  <Button
                    disabled={isUpdating}
                    onClick={() => onComplete([task])}
                    size="xs"
                    variant="outline"
                  >
                    {t('tasks.carryOver.complete')}
                  </Button>
                  <TaskDateActions
                    disabled={isUpdating}
                    onSelect={(dueDate) => onReschedule([task], dueDate)}
                  />
                </HStack>
              </Flex>
            )
          })}
        </Stack>
      ) : null}
    </Box>
  )
}

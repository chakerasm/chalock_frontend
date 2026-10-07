import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Check, ChevronRight, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import type { Task } from '@/features/tasks/types/tasks.types'

type Props = {
  milestones: Task[]
  onEditTask: (task: Task) => void
  onViewAll: () => void
}

export const GoalDetailsMilestones = ({
  milestones,
  onEditTask,
  onViewAll,
}: Props) => {
  const { t } = useTranslation()
  return (
    <Box
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      p="4"
      rounded="l2"
    >
      <Flex align="center" justify="space-between" mb="3">
        <HStack gap="2">
          <Flag aria-hidden="true" color="brand.fg" size={18} />
          <Text fontWeight="semibold">
            {t('goals.milestones')} ({milestones.length})
          </Text>
        </HStack>
        {milestones.length ? (
          <Button onClick={onViewAll} size="xs" variant="ghost">
            {t('goals.viewAll')} <ChevronRight aria-hidden="true" size={14} />
          </Button>
        ) : null}
      </Flex>
      <Stack gap="2">
        {milestones.slice(0, 4).map((task) => (
          <Button
            _hover={{ bg: 'bg.subtle' }}
            alignItems="start"
            aria-label={t('tasks.editTask')}
            justifyContent="start"
            key={task.id}
            onClick={() => onEditTask(task)}
            p="2"
            variant="ghost"
          >
            <Flex
              align="center"
              bg="brand.solid"
              color="brand.contrast"
              flexShrink="0"
              fontSize="xs"
              h="6"
              justify="center"
              rounded="full"
              w="6"
            >
              <Check aria-hidden="true" size={13} />
            </Flex>
            <Box flex="1" minW="0" textAlign="start">
              <Text fontSize="sm" fontWeight="medium">
                <PrivateText>{task.title}</PrivateText>
              </Text>
              <Text color="fg.muted" fontSize="xs">
                {task.description ?? t('goals.milestoneDetail')}
              </Text>
            </Box>
            <ChevronRight aria-hidden="true" color="fg.muted" size={16} />
          </Button>
        ))}
        {!milestones.length ? (
          <Text color="fg.muted" fontSize="sm">
            {t('goals.noMilestones')}
          </Text>
        ) : null}
      </Stack>
    </Box>
  )
}

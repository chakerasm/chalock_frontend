import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
} from '@chakra-ui/react'
import { Archive, CalendarDays, Check, Pencil, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import type { Goal, GoalStatus } from '@/features/goals/types/goals.types'

type GoalDetailsHeaderProps = {
  goal: Goal
  isArchiving: boolean
  isUpdating: boolean
  onAddTask: () => void
  onPlanGoal: () => void
  onArchive: () => void
  onEdit: () => void
  onSetStatus: (status: GoalStatus) => void
}

export const GoalDetailsHeader = ({
  goal,
  isArchiving,
  isUpdating,
  onAddTask,
  onPlanGoal,
  onArchive,
  onEdit,
  onSetStatus,
}: GoalDetailsHeaderProps) => {
  const { t } = useTranslation()
  const isCompleted = goal.status === 'completed'
  const isArchived = goal.status === 'archived'

  return (
    <Box
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l3"
      shadow="xs"
    >
      <Flex
        align={{ base: 'start', lg: 'center' }}
        direction={{ base: 'column', lg: 'row' }}
        gap="4"
        justify="space-between"
      >
        <HStack align="center" gap={{ base: '3', md: '4' }}>
          {goal.goalImageUrl ? (
            <Image
              alt=""
              borderColor="brand.border"
              borderWidth="1px"
              boxSize={{ base: '14', md: '20' }}
              objectFit="cover"
              rounded="l2"
              src={goal.goalImageUrl}
            />
          ) : (
            <Flex
              align="center"
              bg="brand.muted"
              borderColor="brand.border"
              borderWidth="1px"
              color="brand.fg"
              h={{ base: '14', md: '20' }}
              justify="center"
              rounded="l2"
              w={{ base: '14', md: '20' }}
            >
              <Trophy aria-hidden="true" size={34} />
            </Flex>
          )}
          <Box>
            <HStack gap="2" mb="1">
              <Text
                color="fg.muted"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
              >
                {t('goals.title')}
              </Text>
              <Text
                bg={goal.status === 'active' ? 'success.subtle' : 'bg.subtle'}
                color={goal.status === 'active' ? 'success.fg' : 'fg.muted'}
                fontSize="xs"
                fontWeight="semibold"
                px="2"
                py="0.5"
                rounded="full"
              >
                {goal.status === 'active'
                  ? t('goals.onTrack')
                  : t(`goals.status.${goal.status}`)}
              </Text>
            </HStack>
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              <PrivateText>{goal.title}</PrivateText>
            </Text>
          </Box>
        </HStack>
        <HStack flexWrap="wrap" gap="2">
          {!isArchived ? (
            <Button colorPalette="brand" onClick={onAddTask} size="sm">
              <Check aria-hidden="true" size={16} />
              {t('goals.addTask')}
            </Button>
          ) : null}
          {!isArchived ? (
            <Button onClick={onPlanGoal} size="sm" variant="outline">
              <CalendarDays aria-hidden="true" size={16} />
              {t('goals.planning.trigger')}
            </Button>
          ) : null}
          {!isCompleted && !isArchived ? (
            <Button
              disabled={isUpdating}
              onClick={() => onSetStatus('completed')}
              size="sm"
              variant="outline"
            >
              {t('goals.markComplete')}
            </Button>
          ) : null}
          {goal.status === 'active' ? (
            <Button
              onClick={() => onSetStatus('paused')}
              size="sm"
              variant="ghost"
            >
              {t('goals.pause')}
            </Button>
          ) : goal.status === 'paused' ? (
            <Button
              onClick={() => onSetStatus('active')}
              size="sm"
              variant="ghost"
            >
              {t('goals.resume')}
            </Button>
          ) : null}
          <IconButton
            aria-label={t('goals.editTitle')}
            onClick={onEdit}
            size="sm"
            title={t('goals.editTitle')}
            variant="outline"
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          {!isArchived ? (
            <IconButton
              aria-label={t('goals.archive')}
              colorPalette="danger"
              disabled={isArchiving}
              onClick={onArchive}
              size="sm"
              title={t('goals.archive')}
              variant="outline"
            >
              <Archive aria-hidden="true" size={16} />
            </IconButton>
          ) : null}
        </HStack>
      </Flex>
    </Box>
  )
}

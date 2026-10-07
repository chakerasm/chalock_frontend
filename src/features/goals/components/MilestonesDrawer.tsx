import {
  Button,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Check, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import type { Task } from '@/features/tasks/types/tasks.types'

type MilestonesDrawerProps = {
  milestones: Task[]
  onEditTask: (task: Task) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function MilestonesDrawer({
  milestones,
  onEditTask,
  onOpenChange,
  open,
}: MilestonesDrawerProps) {
  const { t } = useTranslation()

  return (
    <Drawer.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop backdropFilter="blur(4px)" bg="bg.overlay" />
        <Drawer.Positioner>
          <Drawer.Content
            bg="bg.elevated"
            borderColor="border.subtle"
            borderWidth="1px"
            shadow="lg"
          >
            <Drawer.Header>
              <Stack gap="1">
                <Drawer.Title>{t('goals.milestones')}</Drawer.Title>
                <Drawer.Description>
                  {t('goals.taskSummary', {
                    completed: milestones.length,
                    total: milestones.length,
                  })}
                </Drawer.Description>
              </Stack>
              <Drawer.CloseTrigger asChild>
                <CloseButton aria-label={t('common.close')} size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>
              {milestones.length ? (
                <Stack gap="2">
                  {milestones.map((task) => (
                    <Button
                      _hover={{ bg: 'bg.subtle' }}
                      alignItems="start"
                      justifyContent="start"
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      p="3"
                      variant="ghost"
                    >
                      <Flex
                        align="center"
                        bg="brand.solid"
                        color="brand.contrast"
                        flexShrink="0"
                        h="7"
                        justify="center"
                        rounded="full"
                        w="7"
                      >
                        <Check aria-hidden="true" size={14} />
                      </Flex>
                      <Stack align="start" flex="1" gap="0" minW="0">
                        <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                          <PrivateText>{task.title}</PrivateText>
                        </Text>
                        <Text color="fg.muted" fontSize="xs" lineClamp={2}>
                          {task.description ?? t('goals.milestoneDetail')}
                        </Text>
                      </Stack>
                      <ChevronRight
                        aria-hidden="true"
                        color="fg.muted"
                        size={16}
                      />
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Text color="fg.muted" fontSize="sm">
                  {t('goals.noMilestones')}
                </Text>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

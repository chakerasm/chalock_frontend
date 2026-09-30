import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Pencil, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatDuration,
  getTimeBlockDurationMinutes,
  isTimeBlockCurrent,
  timeToMinutes,
} from '@/features/planner/services/planner-calculations'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import type {
  PlanningPreferences,
  TimeFormat,
} from '@/features/settings/types/settings.types'

const pixelsPerMinute = 1.1

type PlannerTimelineProps = {
  blocks: TimeBlock[]
  focusAvailable: boolean
  locale: string
  now: Date
  onAddAt: (time: string) => void
  onEdit: (block: TimeBlock) => void
  onStartFocus: (block: TimeBlock) => void
  planning: PlanningPreferences
  selectedDate: string
  timeFormat: TimeFormat
}

function categoryBackground(block: TimeBlock) {
  if (block.status === 'completed') return 'bg.subtle'
  if (block.status === 'cancelled') return 'bg.muted'
  if (block.category === 'focus' || block.category === 'study')
    return 'brand.subtle'
  if (block.category === 'fitness') return 'success.subtle'
  if (block.category === 'break') return 'warning.subtle'
  return 'bg.subtle'
}

function formatPlannerTime(
  time: string,
  locale: string,
  timeFormat: TimeFormat,
) {
  const [hours, minutes] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hour12: timeFormat === '12h',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hours, minutes))
}

function timeFromMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(
    minutes % 60,
  ).padStart(2, '0')}`
}

export function PlannerTimeline({
  blocks,
  focusAvailable,
  locale,
  now,
  onAddAt,
  onEdit,
  onStartFocus,
  planning,
  selectedDate,
  timeFormat,
}: PlannerTimelineProps) {
  const { t } = useTranslation()
  const dayStartMinutes = planning.dayStartHour * 60
  const timelineMinutes = (planning.dayEndHour - planning.dayStartHour) * 60
  const timelineHours = Array.from(
    { length: planning.dayEndHour - planning.dayStartHour + 1 },
    (_, offset) => planning.dayStartHour + offset,
  )
  const isToday =
    selectedDate ===
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const showNow =
    isToday &&
    currentMinutes >= dayStartMinutes &&
    currentMinutes <= dayStartMinutes + timelineMinutes

  return (
    <>
      <Stack display={{ base: 'none', md: 'flex' }} gap="0">
        <Box bg="bg.panel" borderWidth="1px" overflow="hidden" rounded="l2">
          <Flex>
            <Stack aria-hidden="true" flex="0 0 4rem" gap="0">
              {timelineHours.map((hour) => (
                <Box h={`${60 * pixelsPerMinute}px`} key={hour} pt="-1">
                  <Text color="fg.muted" fontSize="xs">
                    {formatPlannerTime(
                      `${String(hour).padStart(2, '0')}:00`,
                      locale,
                      timeFormat,
                    )}
                  </Text>
                </Box>
              ))}
            </Stack>
            <Box
              flex="1"
              h={`${timelineMinutes * pixelsPerMinute}px`}
              position="relative"
            >
              {Array.from(
                {
                  length: timelineMinutes / planning.timeIncrementMinutes,
                },
                (_, index) => {
                  const time = timeFromMinutes(
                    dayStartMinutes + index * planning.timeIncrementMinutes,
                  )
                  return (
                    <Box
                      _hover={{ bg: 'bg.hover' }}
                      aria-label={t('planner.addAtTime', {
                        time: formatPlannerTime(time, locale, timeFormat),
                      })}
                      as="button"
                      borderColor="border.subtle"
                      borderTopWidth={
                        index % (60 / planning.timeIncrementMinutes) === 0
                          ? '1px'
                          : '0'
                      }
                      cursor="pointer"
                      h={`${planning.timeIncrementMinutes * pixelsPerMinute}px`}
                      key={time}
                      onClick={() => onAddAt(time)}
                      w="full"
                    />
                  )
                },
              )}
              {showNow ? (
                <Flex
                  align="center"
                  color="brand.fg"
                  left="0"
                  pointerEvents="none"
                  position="absolute"
                  right="0"
                  top={`${(currentMinutes - dayStartMinutes) * pixelsPerMinute}px`}
                  zIndex="1"
                >
                  <Box bg="brand.solid" boxSize="2" rounded="full" />
                  <Box bg="brand.solid" flex="1" h="px" />
                  <Text
                    bg="bg.panel"
                    fontSize="xs"
                    fontWeight="semibold"
                    px="2"
                  >
                    {now.toLocaleTimeString(locale, {
                      hour: 'numeric',
                      hour12: timeFormat === '12h',
                      minute: '2-digit',
                    })}
                  </Text>
                </Flex>
              ) : null}
              {blocks.map((block) => {
                const top =
                  (timeToMinutes(block.startTime) - dayStartMinutes) *
                  pixelsPerMinute
                const current = isTimeBlockCurrent(block, now)
                return (
                  <Box
                    bg={categoryBackground(block)}
                    borderColor={current ? 'brand.border' : 'border.subtle'}
                    borderLeftWidth="3px"
                    borderWidth="1px"
                    cursor="default"
                    insetInlineEnd="3"
                    key={block.id}
                    left="2"
                    minH="52px"
                    opacity={block.status === 'cancelled' ? 0.55 : 1}
                    overflow="hidden"
                    p="3"
                    position="absolute"
                    rounded="l1"
                    shadow={current ? 'xs' : undefined}
                    top={`${top}px`}
                    zIndex="2"
                  >
                    <Flex align="start" gap="3" justify="space-between">
                      <Stack gap="0" minW="0">
                        <Text fontSize="sm" fontWeight="semibold" lineClamp="1">
                          {block.title}
                        </Text>
                        <Text color="fg.muted" fontSize="xs">
                          {formatPlannerTime(
                            block.startTime,
                            locale,
                            timeFormat,
                          )}
                          –
                          {formatPlannerTime(block.endTime, locale, timeFormat)}{' '}
                          · {formatDuration(getTimeBlockDurationMinutes(block))}
                        </Text>
                      </Stack>
                      <HStack gap="1">
                        {block.status !== 'completed' &&
                        block.status !== 'cancelled' ? (
                          <Button
                            aria-label={t('planner.startFocusFor', {
                              title: block.title,
                            })}
                            disabled={!focusAvailable}
                            onClick={() => onStartFocus(block)}
                            size="xs"
                            variant="ghost"
                          >
                            <Play aria-hidden="true" size={14} />
                          </Button>
                        ) : null}
                        <Button
                          aria-label={t('planner.editBlock')}
                          onClick={() => onEdit(block)}
                          size="xs"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" size={14} />
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                )
              })}
            </Box>
          </Flex>
        </Box>
      </Stack>
      <Stack display={{ base: 'flex', md: 'none' }} gap="3">
        {blocks.map((block) => (
          <Box
            bg={categoryBackground(block)}
            borderWidth="1px"
            key={block.id}
            p="4"
            rounded="l2"
          >
            <Flex gap="3" justify="space-between">
              <Stack gap="1">
                <Text color="fg.muted" fontSize="sm">
                  {formatPlannerTime(block.startTime, locale, timeFormat)}–
                  {formatPlannerTime(block.endTime, locale, timeFormat)} ·{' '}
                  {formatDuration(getTimeBlockDurationMinutes(block))}
                </Text>
                <Text fontWeight="semibold">{block.title}</Text>
                {block.description ? (
                  <Text color="fg.muted" fontSize="sm">
                    {block.description}
                  </Text>
                ) : null}
              </Stack>
              <Stack align="end" gap="1">
                {block.status !== 'completed' &&
                block.status !== 'cancelled' ? (
                  <Button
                    disabled={!focusAvailable}
                    onClick={() => onStartFocus(block)}
                    size="xs"
                    variant="outline"
                  >
                    <Play aria-hidden="true" size={14} />
                    {t('planner.startFocus')}
                  </Button>
                ) : null}
                <Button onClick={() => onEdit(block)} size="xs" variant="ghost">
                  {t('planner.edit')}
                </Button>
              </Stack>
            </Flex>
          </Box>
        ))}
      </Stack>
    </>
  )
}

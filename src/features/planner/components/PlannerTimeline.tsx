import { Badge, Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Check, Pencil, Play, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import {
  formatDuration,
  getTimeBlockDurationMinutes,
  getTimeBlockTimelineLayout,
  isTimeBlockCurrent,
  isTimeBlockPassed,
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
  onUpdateStatus: (block: TimeBlock, status: TimeBlock['status']) => void
  planning: PlanningPreferences
  selectedDate: string
  timeFormat: TimeFormat
}

type TimeBlockColor = { accent: string; background: string }

function getTimeBlockColor(block: TimeBlock): TimeBlockColor {
  if (block.status === 'completed')
    return { accent: 'success.solid', background: 'success.subtle' }
  if (block.status === 'cancelled')
    return { accent: 'fg.disabled', background: 'bg.muted' }

  switch (block.category) {
    case 'focus':
    case 'work':
      return { accent: 'brand.solid', background: 'brand.muted' }
    case 'study':
    case 'break':
      return { accent: 'warning.solid', background: 'warning.subtle' }
    case 'fitness':
    case 'personal':
      return { accent: 'success.solid', background: 'success.subtle' }
    case 'routine':
      return { accent: 'danger.solid', background: 'danger.subtle' }
    default:
      return { accent: 'border.emphasized', background: 'bg.subtle' }
  }
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
  onUpdateStatus,
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
  const blockLayouts = getTimeBlockTimelineLayout(blocks)

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
                const start = timeToMinutes(block.startTime)
                const end = start + getTimeBlockDurationMinutes(block)
                const visibleStart = Math.max(start, dayStartMinutes)
                const visibleEnd = Math.min(
                  end,
                  dayStartMinutes + timelineMinutes,
                )
                if (visibleEnd <= visibleStart) return null
                const top = (visibleStart - dayStartMinutes) * pixelsPerMinute
                const height = Math.max(
                  52,
                  (visibleEnd - visibleStart) * pixelsPerMinute,
                )
                const layout = blockLayouts.get(block.id) ?? {
                  lane: 0,
                  laneCount: 1,
                }
                const current = isTimeBlockCurrent(block, now)
                const passed = isTimeBlockPassed(block, now)
                const colors = getTimeBlockColor(block)
                return (
                  <Box
                    bg={colors.background}
                    borderColor={current ? 'brand.border' : colors.accent}
                    borderLeftColor={colors.accent}
                    borderLeftWidth="4px"
                    borderWidth="1px"
                    cursor="default"
                    key={block.id}
                    h={`${height}px`}
                    left={`calc(${(layout.lane / layout.laneCount) * 100}% + 2px)`}
                    minH="52px"
                    opacity={block.status === 'cancelled' ? 0.55 : 1}
                    overflow="hidden"
                    p="3"
                    position="absolute"
                    rounded="l1"
                    shadow={current ? 'xs' : undefined}
                    top={`${top}px`}
                    w={`calc(${100 / layout.laneCount}% - 6px)`}
                    zIndex="2"
                  >
                    <Flex align="start" gap="3" justify="space-between">
                      <Stack gap="0" minW="0">
                        <HStack gap="2">
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            lineClamp="1"
                          >
                            <PrivateText>{block.title}</PrivateText>
                          </Text>
                          {passed ? (
                            <Badge colorPalette="gray" size="sm">
                              {t('planner.passed')}
                            </Badge>
                          ) : null}
                        </HStack>
                        <Text color="fg.muted" fontSize="xs">
                          {formatPlannerTime(
                            block.startTime,
                            locale,
                            timeFormat,
                          )}
                          {' \u2013 '}
                          {formatPlannerTime(block.endTime, locale, timeFormat)}
                          {' \u00b7 '}
                          {formatDuration(getTimeBlockDurationMinutes(block))}
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
                        {block.status !== 'completed' &&
                        block.status !== 'cancelled' ? (
                          <Button
                            aria-label={t('planner.markComplete')}
                            onClick={() => onUpdateStatus(block, 'completed')}
                            size="xs"
                            variant="ghost"
                          >
                            <Check aria-hidden="true" size={14} />
                          </Button>
                        ) : null}
                        {block.status !== 'completed' &&
                        block.status !== 'cancelled' ? (
                          <Button
                            aria-label={t('planner.cancelBlock')}
                            onClick={() => onUpdateStatus(block, 'cancelled')}
                            size="xs"
                            variant="ghost"
                          >
                            <X aria-hidden="true" size={14} />
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
            bg={getTimeBlockColor(block).background}
            borderLeftColor={getTimeBlockColor(block).accent}
            borderLeftWidth="4px"
            borderWidth="1px"
            key={block.id}
            p="4"
            rounded="l2"
          >
            <Flex gap="3" justify="space-between">
              <Stack gap="1">
                <Text color="fg.muted" fontSize="sm">
                  {formatPlannerTime(block.startTime, locale, timeFormat)}
                  {' \u2013 '}
                  {formatPlannerTime(block.endTime, locale, timeFormat)}
                  {' \u00b7 '}
                  {formatDuration(getTimeBlockDurationMinutes(block))}
                </Text>
                <Text fontWeight="semibold">
                  <PrivateText>{block.title}</PrivateText>
                </Text>
                {isTimeBlockPassed(block, now) ? (
                  <Badge alignSelf="start" colorPalette="gray" size="sm">
                    {t('planner.passed')}
                  </Badge>
                ) : null}
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
                {block.status !== 'completed' &&
                block.status !== 'cancelled' ? (
                  <Button
                    onClick={() => onUpdateStatus(block, 'completed')}
                    size="xs"
                    variant="outline"
                  >
                    <Check aria-hidden="true" size={14} />
                    {t('planner.markComplete')}
                  </Button>
                ) : null}
                {block.status !== 'completed' &&
                block.status !== 'cancelled' ? (
                  <Button
                    onClick={() => onUpdateStatus(block, 'cancelled')}
                    size="xs"
                    variant="ghost"
                  >
                    <X aria-hidden="true" size={14} />
                    {t('planner.cancelBlock')}
                  </Button>
                ) : null}
              </Stack>
            </Flex>
          </Box>
        ))}
      </Stack>
    </>
  )
}

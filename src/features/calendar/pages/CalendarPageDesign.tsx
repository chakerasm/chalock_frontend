import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Goal,
  ListTodo,
  Plus,
  Repeat2,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCalendar } from '@/features/calendar/hooks/use-calendar'
import { getCalendarRange } from '@/features/calendar/services/calendar.service'
import type {
  CalendarFilter,
  CalendarItem,
  CalendarView,
} from '@/features/calendar/types/calendar.types'

const filters: Array<{
  icon: typeof CalendarDays
  label: string
  value: CalendarFilter
}> = [
  { icon: CalendarDays, label: 'All', value: 'all' },
  { icon: CalendarDays, label: 'Planner', value: 'planner' },
  { icon: ListTodo, label: 'Tasks', value: 'task' },
  { icon: Bell, label: 'Reminders', value: 'reminder' },
  { icon: Goal, label: 'Goals', value: 'goal' },
  { icon: Repeat2, label: 'Subscriptions', value: 'subscription' },
  { icon: WalletCards, label: 'Finance', value: 'finance' },
]
const sourceStyles: Record<
  CalendarItem['sourceType'],
  { bg: string; color: string; icon: typeof CalendarDays }
> = {
  planner: { bg: 'brand.subtle', color: 'brand.fg', icon: CalendarDays },
  task: { bg: 'danger.subtle', color: 'danger.fg', icon: Flag },
  reminder: { bg: 'warning.subtle', color: 'warning.fg', icon: Bell },
  goal: { bg: 'success.subtle', color: 'success.fg', icon: Goal },
  subscription: { bg: 'brand.muted', color: 'brand.fg', icon: Repeat2 },
  finance: { bg: 'warning.subtle', color: 'warning.fg', icon: WalletCards },
}
const isoDate = (date: Date) => date.toISOString().slice(0, 10)
const eventDate = (event: CalendarItem) => event.start.slice(0, 10)
const asDate = (date: string) => new Date(`${date}T12:00:00`)

function EventChip({ event }: { event: CalendarItem }) {
  const style = sourceStyles[event.sourceType]
  const Icon = style.icon
  const label = (
    <>
      <Icon aria-hidden="true" size={11} />
      <Text lineClamp={1}>
        {event.allDay
          ? event.title
          : `${event.start.slice(11, 16)} ${event.title}`}
      </Text>
    </>
  )
  const link =
    event.sourceType === 'goal' ? (
      <RouterLink search={{ goalId: event.sourceId }} to="/goals">
        {label}
      </RouterLink>
    ) : event.sourceType === 'subscription' ? (
      <RouterLink
        search={{ subscriptionId: event.sourceId }}
        to="/subscriptions"
      >
        {label}
      </RouterLink>
    ) : event.sourceType === 'planner' ? (
      <RouterLink search={{ date: eventDate(event) }} to="/planner">
        {label}
      </RouterLink>
    ) : (
      <RouterLink
        to={
          event.sourceType === 'task'
            ? '/tasks'
            : event.sourceType === 'reminder'
              ? '/reminders'
              : '/finance'
        }
      >
        {label}
      </RouterLink>
    )
  return (
    <Button
      asChild
      bg={style.bg}
      color={style.color}
      fontSize="2xs"
      h="6"
      justifyContent="flex-start"
      minW="0"
      px="1.5"
      rounded="sm"
      variant="subtle"
      w="full"
    >
      {link}
    </Button>
  )
}

function MiniCalendar({
  anchor,
  onChange,
}: {
  anchor: Date
  onChange: (next: Date) => void
}) {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  start.setDate(start.getDate() - start.getDay())
  return (
    <Stack bg="bg.panel" borderWidth="1px" gap="3" p="3" rounded="l2">
      <HStack justify="space-between">
        <IconButton
          aria-label="Previous month"
          onClick={() =>
            onChange(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))
          }
          size="2xs"
          variant="ghost"
        >
          <ChevronLeft />
        </IconButton>
        <Text fontSize="xs" fontWeight="bold">
          {new Intl.DateTimeFormat(undefined, {
            month: 'long',
            year: 'numeric',
          }).format(anchor)}
        </Text>
        <IconButton
          aria-label="Next month"
          onClick={() =>
            onChange(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
          }
          size="2xs"
          variant="ghost"
        >
          <ChevronRight />
        </IconButton>
      </HStack>
      <Grid
        templateColumns="repeat(7, minmax(0, 1fr))"
        gap="1"
        textAlign="center"
      >
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
          <Text
            color="fg.muted"
            fontSize="2xs"
            fontWeight="bold"
            key={`${label}-${index}`}
          >
            {label}
          </Text>
        ))}
        {Array.from({ length: 42 }, (_, index) => {
          const day = new Date(start)
          day.setDate(start.getDate() + index)
          const date = isoDate(day)
          return (
            <Button
              aria-label={date}
              colorPalette={date === isoDate(anchor) ? 'brand' : undefined}
              color={
                day.getMonth() === anchor.getMonth() ? 'fg' : 'fg.disabled'
              }
              fontSize="2xs"
              h="6"
              key={date}
              minW="0"
              onClick={() => onChange(day)}
              p="0"
              rounded="sm"
              variant={date === isoDate(anchor) ? 'solid' : 'ghost'}
            >
              {day.getDate()}
            </Button>
          )
        })}
      </Grid>
    </Stack>
  )
}

export function CalendarPageDesign() {
  const [view, setView] = useState<CalendarView>('month')
  const [filter, setFilter] = useState<CalendarFilter>('all')
  const [anchor, setAnchor] = useState(() => new Date())
  const range = useMemo(() => getCalendarRange(anchor, view), [anchor, view])
  const query = useCalendar(range.from, range.to)
  const events =
    filter === 'all'
      ? query.items
      : query.items.filter((event) => event.sourceType === filter)
  const dates = useMemo(
    () =>
      Array.from({ length: view === 'month' ? 42 : 7 }, (_, index) => {
        const date = asDate(range.from)
        date.setDate(date.getDate() + index)
        return isoDate(date)
      }),
    [range.from, view],
  )
  const move = (amount: number) =>
    setAnchor((current) => {
      const next = new Date(current)
      next.setDate(next.getDate() + amount * (view === 'month' ? 30 : 7))
      return next
    })
  const upcoming = events
    .filter((event) => event.start >= new Date().toISOString())
    .slice(0, 6)
  const heading = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(anchor)
  return (
    <Container
      maxW="full"
      px={{ base: '4', lg: '6' }}
      py={{ base: '5', lg: '6' }}
    >
      <Grid
        gap="4"
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 17rem' }}
      >
        <Stack gap="4" minW="0">
          <Box>
            <Text
              as="h1"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
            >
              Calendar
            </Text>
            <Text color="fg.muted" fontSize="sm">
              A unified view of your plans, tasks, reminders, goals, and
              renewals.
            </Text>
          </Box>
          <Flex
            align={{ base: 'stretch', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="3"
            justify="space-between"
          >
            <HStack>
              <IconButton
                aria-label="Previous period"
                onClick={() => move(-1)}
                size="sm"
                variant="outline"
              >
                <ChevronLeft />
              </IconButton>
              <Text
                fontSize="sm"
                fontWeight="bold"
                minW="9rem"
                textAlign="center"
              >
                {heading}
              </Text>
              <IconButton
                aria-label="Next period"
                onClick={() => move(1)}
                size="sm"
                variant="outline"
              >
                <ChevronRight />
              </IconButton>
              <Button
                onClick={() => setAnchor(new Date())}
                size="sm"
                variant="outline"
              >
                Today
              </Button>
            </HStack>
            <HStack>
              <Button colorPalette="brand" size="sm">
                <Plus aria-hidden="true" size={15} />
                Add
              </Button>
              <HStack
                bg="bg.subtle"
                borderWidth="1px"
                gap="0"
                p="1"
                rounded="l1"
              >
                {(['month', 'week'] as const).map((option) => (
                  <Button
                    colorPalette={view === option ? 'brand' : undefined}
                    key={option}
                    onClick={() => setView(option)}
                    size="xs"
                    textTransform="capitalize"
                    variant={view === option ? 'subtle' : 'ghost'}
                  >
                    {option}
                  </Button>
                ))}
              </HStack>
            </HStack>
          </Flex>
          <HStack gap="1.5" overflowX="auto" pb="1">
            {filters.map(({ icon: Icon, label, value }) => (
              <Button
                colorPalette={filter === value ? 'brand' : undefined}
                flexShrink="0"
                key={value}
                onClick={() => setFilter(value)}
                size="xs"
                variant={filter === value ? 'subtle' : 'outline'}
              >
                <Icon aria-hidden="true" size={13} />
                {label}
              </Button>
            ))}
          </HStack>
          {query.isPending ? (
            <Text color="fg.muted">Loading calendar…</Text>
          ) : query.isError ? (
            <Button onClick={() => void query.refetch()} variant="outline">
              Retry calendar
            </Button>
          ) : (
            <>
              <Box
                borderWidth="1px"
                display={{ base: 'none', md: 'block' }}
                overflow="hidden"
                rounded="l2"
              >
                <Grid
                  bg="bg.subtle"
                  borderBottomWidth="1px"
                  templateColumns="repeat(7, minmax(0, 1fr))"
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                    (day) => (
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        key={day}
                        p="2"
                        textAlign="center"
                      >
                        {day}
                      </Text>
                    ),
                  )}
                </Grid>
                <Grid templateColumns="repeat(7, minmax(0, 1fr))">
                  {dates.map((date) => {
                    const dayEvents = events.filter(
                      (event) => eventDate(event) === date,
                    )
                    const isToday = date === isoDate(new Date())
                    return (
                      <Stack
                        bg={isToday ? 'brand.subtle' : 'bg.panel'}
                        borderBottomWidth="1px"
                        borderRightWidth="1px"
                        gap="1"
                        key={date}
                        minH={view === 'month' ? '8.5rem' : '30rem'}
                        p="2"
                      >
                        <Flex justify="space-between">
                          <Text
                            color={
                              asDate(date).getMonth() === anchor.getMonth()
                                ? 'fg'
                                : 'fg.disabled'
                            }
                            fontSize="xs"
                            fontWeight={isToday ? 'bold' : 'medium'}
                          >
                            {asDate(date).getDate()}
                          </Text>
                          {dayEvents.length > 3 ? (
                            <Text color="brand.fg" fontSize="2xs">
                              +{dayEvents.length - 3}
                            </Text>
                          ) : null}
                        </Flex>
                        {dayEvents.slice(0, 3).map((event) => (
                          <EventChip event={event} key={event.id} />
                        ))}
                      </Stack>
                    )
                  })}
                </Grid>
              </Box>
              <Stack display={{ base: 'flex', md: 'none' }} gap="2">
                {dates.map((date) => {
                  const dayEvents = events.filter(
                    (event) => eventDate(event) === date,
                  )
                  return dayEvents.length ? (
                    <Box
                      bg="bg.panel"
                      borderWidth="1px"
                      key={date}
                      p="3"
                      rounded="l2"
                    >
                      <Text fontSize="sm" fontWeight="bold" mb="2">
                        {new Intl.DateTimeFormat(undefined, {
                          day: 'numeric',
                          month: 'short',
                          weekday: 'long',
                        }).format(asDate(date))}
                      </Text>
                      <Stack gap="1">
                        {dayEvents.map((event) => (
                          <EventChip event={event} key={event.id} />
                        ))}
                      </Stack>
                    </Box>
                  ) : null
                })}
              </Stack>
            </>
          )}
        </Stack>
        <Stack display={{ base: 'none', xl: 'flex' }} gap="3">
          <MiniCalendar anchor={anchor} onChange={setAnchor} />
          <Stack bg="bg.panel" borderWidth="1px" gap="3" p="3" rounded="l2">
            <Text fontSize="sm" fontWeight="bold">
              Quick add
            </Text>
            <Input placeholder="Add an event, task, or reminder…" size="sm" />
            <HStack>
              <IconButton
                aria-label="Add planner block"
                colorPalette="brand"
                size="sm"
                variant="subtle"
              >
                <CalendarDays />
              </IconButton>
              <IconButton
                aria-label="Add task"
                colorPalette="danger"
                size="sm"
                variant="subtle"
              >
                <ListTodo />
              </IconButton>
              <IconButton
                aria-label="Add reminder"
                colorPalette="success"
                size="sm"
                variant="subtle"
              >
                <Clock3 />
              </IconButton>
            </HStack>
          </Stack>
          <Stack bg="bg.panel" borderWidth="1px" gap="2" p="3" rounded="l2">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold">
                Calendars
              </Text>
              <Text color="brand.fg" fontSize="xs">
                Manage
              </Text>
            </HStack>
            {filters.slice(1).map(({ icon: Icon, label, value }) => (
              <HStack justify="space-between" key={value}>
                <HStack gap="2">
                  <Box
                    bg="brand.solid"
                    color="brand.contrast"
                    p="0.5"
                    rounded="sm"
                  >
                    <Check size={10} />
                  </Box>
                  <Icon aria-hidden="true" color="fg.muted" size={13} />
                  <Text fontSize="xs">{label}</Text>
                </HStack>
                <Text color="fg.muted" fontSize="xs">
                  •••
                </Text>
              </HStack>
            ))}
          </Stack>
          <Stack bg="bg.panel" borderWidth="1px" gap="3" p="3" rounded="l2">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold">
                Upcoming
              </Text>
              <Text color="brand.fg" fontSize="xs">
                View all
              </Text>
            </HStack>
            {upcoming.map((event) => {
              const Icon = sourceStyles[event.sourceType].icon
              return (
                <HStack align="start" gap="2" key={event.id}>
                  <Box
                    bg={sourceStyles[event.sourceType].bg}
                    color={sourceStyles[event.sourceType].color}
                    mt="0.5"
                    p="1"
                    rounded="sm"
                  >
                    <Icon size={11} />
                  </Box>
                  <Box minW="0">
                    <Text fontSize="xs" fontWeight="medium" lineClamp={1}>
                      {event.title}
                    </Text>
                    <Text color="fg.muted" fontSize="2xs">
                      {new Intl.DateTimeFormat(undefined, {
                        day: 'numeric',
                        month: 'short',
                      }).format(new Date(event.start))}
                    </Text>
                  </Box>
                </HStack>
              )
            })}
          </Stack>
        </Stack>
      </Grid>
    </Container>
  )
}

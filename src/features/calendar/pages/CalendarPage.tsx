import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { useCalendar } from '@/features/calendar/hooks/use-calendar'
import { getCalendarRange } from '@/features/calendar/services/calendar.service'
import type {
  CalendarFilter,
  CalendarItem,
  CalendarView,
} from '@/features/calendar/types/calendar.types'

const filters: Array<{ label: string; value: CalendarFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Planner', value: 'planner' },
  { label: 'Tasks', value: 'task' },
  { label: 'Reminders', value: 'reminder' },
  { label: 'Goals', value: 'goal' },
  { label: 'Subscriptions', value: 'subscription' },
  { label: 'Finance', value: 'finance' },
]
const accents: Record<CalendarItem['sourceType'], string> = {
  planner: 'brand.fg',
  task: 'info.fg',
  reminder: 'warning.fg',
  goal: 'success.fg',
  subscription: 'chart.secondary',
  finance: 'chart.amber',
}
const isoDate = (value: Date) => value.toISOString().slice(0, 10)
const dateFromStart = (start: string) => start.slice(0, 10)

function itemLabel(item: CalendarItem) {
  return item.allDay ? item.title : `${item.start.slice(11, 16)} ${item.title}`
}

function CalendarItemLink({ item }: { item: CalendarItem }) {
  const content = <Text lineClamp={1}>{itemLabel(item)}</Text>
  const link =
    item.sourceType === 'goal' ? (
      <RouterLink search={{ goalId: item.sourceId }} to="/goals">
        {content}
      </RouterLink>
    ) : item.sourceType === 'subscription' ? (
      <RouterLink
        search={{ subscriptionId: item.sourceId }}
        to="/subscriptions"
      >
        {content}
      </RouterLink>
    ) : item.sourceType === 'planner' ? (
      <RouterLink search={{ date: dateFromStart(item.start) }} to="/planner">
        {content}
      </RouterLink>
    ) : (
      <RouterLink
        to={
          item.sourceType === 'task'
            ? '/tasks'
            : item.sourceType === 'reminder'
              ? '/reminders'
              : '/finance'
        }
      >
        {content}
      </RouterLink>
    )
  return (
    <Button
      asChild
      color={accents[item.sourceType]}
      fontSize="xs"
      justifyContent="flex-start"
      minW="0"
      px="1.5"
      size="xs"
      variant="subtle"
    >
      {link}
    </Button>
  )
}

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>('month')
  const [filter, setFilter] = useState<CalendarFilter>('all')
  const [anchor, setAnchor] = useState(() => new Date())
  const range = useMemo(() => getCalendarRange(anchor, view), [anchor, view])
  const calendar = useCalendar(range.from, range.to)
  const items =
    filter === 'all'
      ? calendar.items
      : calendar.items.filter((item) => item.sourceType === filter)
  const dates = useMemo(
    () =>
      Array.from({ length: view === 'month' ? 42 : 7 }, (_, index) => {
        const date = new Date(`${range.from}T12:00:00`)
        date.setDate(date.getDate() + index)
        return isoDate(date)
      }),
    [range.from, view],
  )
  const heading = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(anchor)
  const move = (direction: number) =>
    setAnchor((previous) => {
      const next = new Date(previous)
      next.setDate(next.getDate() + direction * (view === 'month' ? 30 : 7))
      return next
    })
  return (
    <Container maxW="8xl" py={{ base: '6', md: '10' }}>
      <Stack gap="5">
        <PageHeader
          description="A range-scoped view of your plans, deadlines, and renewals."
          eyebrow="Personal system"
          title="Calendar"
        />
        <Flex
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="3"
          justify="space-between"
        >
          <HStack>
            <Button
              aria-label="Previous period"
              onClick={() => move(-1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft />
            </Button>
            <Text fontWeight="semibold" minW="12rem" textAlign="center">
              {heading}
            </Text>
            <Button
              aria-label="Next period"
              onClick={() => move(1)}
              size="sm"
              variant="outline"
            >
              <ChevronRight />
            </Button>
            <Button
              onClick={() => setAnchor(new Date())}
              size="sm"
              variant="ghost"
            >
              Today
            </Button>
          </HStack>
          <HStack>
            <Button
              colorPalette={view === 'month' ? 'brand' : undefined}
              onClick={() => setView('month')}
              size="sm"
              variant={view === 'month' ? 'subtle' : 'ghost'}
            >
              Month
            </Button>
            <Button
              colorPalette={view === 'week' ? 'brand' : undefined}
              onClick={() => setView('week')}
              size="sm"
              variant={view === 'week' ? 'subtle' : 'ghost'}
            >
              Week
            </Button>
          </HStack>
        </Flex>
        <HStack gap="1" overflowX="auto" pb="1">
          {filters.map((item) => (
            <Button
              colorPalette={filter === item.value ? 'brand' : undefined}
              key={item.value}
              onClick={() => setFilter(item.value)}
              size="sm"
              variant={filter === item.value ? 'subtle' : 'ghost'}
            >
              {item.label}
            </Button>
          ))}
        </HStack>
        {calendar.isPending ? (
          <Text color="fg.muted">Loading calendar…</Text>
        ) : calendar.isError ? (
          <Button onClick={() => void calendar.refetch()} variant="outline">
            Retry calendar
          </Button>
        ) : (
          <>
            <SimpleGrid
              columns={{ base: 1, md: view === 'month' ? 7 : 7 }}
              display={{ base: 'none', md: 'grid' }}
              gap="1"
              borderWidth="1px"
              p="1"
              rounded="l2"
            >
              {dates.map((date) => (
                <Box
                  bg={
                    date === isoDate(new Date()) ? 'brand.subtle' : 'bg.panel'
                  }
                  key={date}
                  minH={view === 'month' ? '8rem' : '28rem'}
                  p="2"
                >
                  <Text color="fg.muted" fontSize="xs" mb="2">
                    {new Intl.DateTimeFormat(undefined, {
                      day: 'numeric',
                      weekday: view === 'week' ? 'short' : undefined,
                    }).format(new Date(`${date}T12:00:00`))}
                  </Text>
                  <Stack gap="1">
                    {items
                      .filter((item) => dateFromStart(item.start) === date)
                      .slice(0, 5)
                      .map((item) => (
                        <CalendarItemLink item={item} key={item.id} />
                      ))}
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
            <Stack display={{ base: 'flex', md: 'none' }} gap="2">
              {dates.map((date) => {
                const dayItems = items.filter(
                  (item) => dateFromStart(item.start) === date,
                )
                return dayItems.length ? (
                  <Box
                    bg="bg.panel"
                    borderWidth="1px"
                    key={date}
                    p="3"
                    rounded="l2"
                  >
                    <Text fontWeight="semibold" mb="2">
                      {new Intl.DateTimeFormat(undefined, {
                        day: 'numeric',
                        month: 'short',
                        weekday: 'long',
                      }).format(new Date(`${date}T12:00:00`))}
                    </Text>
                    <Stack gap="1">
                      {dayItems.map((item) => (
                        <CalendarItemLink item={item} key={item.id} />
                      ))}
                    </Stack>
                  </Box>
                ) : null
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  )
}

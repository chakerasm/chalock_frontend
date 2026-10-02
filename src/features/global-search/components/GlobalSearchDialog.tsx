import {
  Box,
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceSnapshot } from '@/features/finance/hooks/use-finance'
import {
  createSearchResults,
  searchResults,
} from '@/features/global-search/services/global-search.service'
import type {
  SearchResult,
  SearchResultGroup,
} from '@/features/global-search/types/global-search.types'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useHabits } from '@/features/habits/hooks/use-habits'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { useAllTimeBlocks } from '@/features/planner/hooks/use-planner'
import { useReminders } from '@/features/reminders/hooks/use-reminders'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { APP_ROUTES } from '@/lib/routes'

type PaletteItem = Pick<
  SearchResult,
  'href' | 'id' | 'metadata' | 'subtitle' | 'title'
>

function useDebouncedValue(value: string, delay = 180) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])
  return debouncedValue
}

export function GlobalSearchDialog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const debouncedQuery = useDebouncedValue(query)
  const tasksQuery = useTasks()
  const notesQuery = useNotes()
  const goalsQuery = useGoals()
  const habitsQuery = useHabits()
  const plannerQuery = useAllTimeBlocks()
  const remindersQuery = useReminders()
  const subscriptionsQuery = useSubscriptions()
  const financeQuery = useFinanceSnapshot()
  const queryText = query.trim()
  const isSearching = queryText.length >= 2
  const isDebouncing = queryText !== debouncedQuery.trim()
  const isLoading = [
    tasksQuery,
    notesQuery,
    goalsQuery,
    habitsQuery,
    plannerQuery,
    remindersQuery,
    subscriptionsQuery,
    financeQuery,
  ].some((item) => item.isPending)
  const hasError = [
    tasksQuery,
    notesQuery,
    goalsQuery,
    habitsQuery,
    plannerQuery,
    remindersQuery,
    subscriptionsQuery,
    financeQuery,
  ].some((item) => item.isError)

  const searchRecords = useMemo(
    () =>
      createSearchResults({
        finance: financeQuery.data,
        goals: goalsQuery.data,
        habits: habitsQuery.data,
        notes: notesQuery.data,
        plannerBlocks: plannerQuery.data,
        reminders: remindersQuery.data,
        subscriptions: subscriptionsQuery.data,
        tasks: tasksQuery.data,
      }),
    [
      financeQuery.data,
      goalsQuery.data,
      habitsQuery.data,
      notesQuery.data,
      plannerQuery.data,
      remindersQuery.data,
      subscriptionsQuery.data,
      tasksQuery.data,
    ],
  )
  const groups = useMemo(
    () => searchResults(searchRecords, debouncedQuery),
    [debouncedQuery, searchRecords],
  )
  const commands = useMemo<PaletteItem[]>(
    () => [
      { href: APP_ROUTES.home, id: 'today', title: t('app.home') },
      { href: APP_ROUTES.tasks, id: 'tasks', title: t('tasks.title') },
      { href: APP_ROUTES.habits, id: 'habits', title: t('habits.title') },
      { href: APP_ROUTES.goals, id: 'goals', title: t('goals.title') },
      { href: APP_ROUTES.planner, id: 'planner', title: t('planner.title') },
      {
        href: APP_ROUTES.reminders,
        id: 'reminders',
        title: t('reminders.title'),
      },
      { href: APP_ROUTES.notes, id: 'notes', title: t('notes.title') },
      { href: APP_ROUTES.finance, id: 'finance', title: t('finance.title') },
      {
        href: APP_ROUTES.subscriptions,
        id: 'subscriptions',
        title: t('subscriptions.title'),
      },
      { href: APP_ROUTES.settings, id: 'settings', title: t('settings.title') },
    ],
    [t],
  )
  const selectableItems = useMemo<PaletteItem[]>(
    () => (isSearching ? groups.flatMap((group) => group.results) : commands),
    [commands, groups, isSearching],
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [isOpen])

  function execute(item: PaletteItem) {
    setIsOpen(false)
    void navigate({ to: item.href })
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!selectableItems.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % selectableItems.length)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        (current) =>
          (current - 1 + selectableItems.length) % selectableItems.length,
      )
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const item = selectableItems[activeIndex]
      if (item) execute(item)
    }
  }

  function resultIndex(result: PaletteItem) {
    return selectableItems.findIndex((item) => item.id === result.id)
  }

  return (
    <>
      <Button
        aria-label={t('globalSearch.open')}
        justifyContent="flex-start"
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        w="full"
      >
        <Search aria-hidden="true" size={16} />
        <Text color="fg.muted" flex="1" textAlign="left" truncate>
          {t('globalSearch.placeholder')}
        </Text>
        <Text
          borderWidth="1px"
          borderColor="border.subtle"
          color="fg.muted"
          fontSize="xs"
          px="1.5"
          rounded="sm"
        >
          Ctrl K
        </Text>
      </Button>
      <Dialog.Root
        onOpenChange={(details) => setIsOpen(details.open)}
        open={isOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner alignItems={{ base: 'start', md: 'center' }} p="4">
            <Dialog.Content maxH="min(42rem, calc(100dvh - 2rem))">
              <Dialog.Header>
                <Dialog.Title>{t('globalSearch.title')}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    aria-label={t('common.close')}
                    size="xs"
                    variant="ghost"
                  >
                    <X aria-hidden="true" size={17} />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body overflowY="auto">
                <Stack gap="4">
                  <Input
                    aria-controls="global-search-results"
                    aria-expanded={isSearching}
                    aria-label={t('globalSearch.placeholder')}
                    autoComplete="off"
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setActiveIndex(0)
                    }}
                    onKeyDown={handleInputKeyDown}
                    placeholder={t('globalSearch.placeholder')}
                    ref={inputRef}
                    value={query}
                  />
                  {isSearching ? (
                    <SearchResults
                      activeIndex={activeIndex}
                      groups={groups}
                      hasError={hasError}
                      isLoading={isLoading || isDebouncing}
                      onExecute={execute}
                      onSelect={setActiveIndex}
                      query={queryText}
                      resultIndex={resultIndex}
                    />
                  ) : (
                    <Stack gap="2" id="global-search-results" role="listbox">
                      <Text
                        color="fg.muted"
                        fontSize="sm"
                        fontWeight="semibold"
                      >
                        {queryText
                          ? t('globalSearch.minimumQuery')
                          : t('globalSearch.commands')}
                      </Text>
                      {commands.map((command) => (
                        <SearchItem
                          active={resultIndex(command) === activeIndex}
                          item={command}
                          key={command.id}
                          onExecute={execute}
                          onSelect={() => setActiveIndex(resultIndex(command))}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

function SearchResults({
  activeIndex,
  groups,
  hasError,
  isLoading,
  onExecute,
  onSelect,
  query,
  resultIndex,
}: {
  activeIndex: number
  groups: SearchResultGroup[]
  hasError: boolean
  isLoading: boolean
  onExecute: (item: PaletteItem) => void
  onSelect: (index: number) => void
  query: string
  resultIndex: (result: PaletteItem) => number
}) {
  const { t } = useTranslation()
  return (
    <Stack gap="4" id="global-search-results" role="listbox">
      {isLoading ? (
        <HStack color="fg.muted" fontSize="sm">
          <Spinner size="sm" />
          <Text>{t('globalSearch.loading')}</Text>
        </HStack>
      ) : null}
      {hasError ? (
        <Text color="danger.fg" fontSize="sm">
          {t('globalSearch.error')}
        </Text>
      ) : null}
      {!isLoading && !groups.length ? (
        <Text color="fg.muted" fontSize="sm">
          {t('globalSearch.empty', { query })}
        </Text>
      ) : null}
      {groups.map((group) => (
        <Stack gap="1" key={group.type}>
          <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
            {t(`globalSearch.groups.${group.type}`)}
          </Text>
          {group.results.map((result) => (
            <SearchItem
              active={resultIndex(result) === activeIndex}
              item={result}
              key={result.id}
              onExecute={onExecute}
              onSelect={() => onSelect(resultIndex(result))}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

function SearchItem({
  active,
  item,
  onExecute,
  onSelect,
}: {
  active: boolean
  item: PaletteItem
  onExecute: (item: PaletteItem) => void
  onSelect: () => void
}) {
  return (
    <Button
      alignItems="start"
      aria-selected={active}
      justifyContent="space-between"
      onClick={() => onExecute(item)}
      onMouseMove={onSelect}
      role="option"
      textAlign="start"
      variant={active ? 'subtle' : 'ghost'}
      w="full"
    >
      <Stack align="start" gap="0" minW="0">
        <Text lineClamp="1">{item.title}</Text>
        {item.subtitle ? (
          <Text color="fg.muted" fontSize="sm" lineClamp="1">
            {item.subtitle}
          </Text>
        ) : null}
      </Stack>
      {item.metadata ? (
        <Box color="fg.muted" fontSize="xs">
          {item.metadata}
        </Box>
      ) : null}
    </Button>
  )
}

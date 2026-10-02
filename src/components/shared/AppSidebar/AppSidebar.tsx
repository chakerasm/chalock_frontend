import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink, useMatchRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bell,
  BookOpenCheck,
  Boxes,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  Clock3,
  Goal,
  History,
  ListTodo,
  LayoutTemplate,
  NotebookPen,
  Repeat,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { QuickAddDialog } from '@/features/quick-add/components/QuickAddDialog'
import { APP_ROUTES, type AppRoute } from '@/lib/routes'

type AppSidebarProps = {
  onNavigate?: () => void
}

type NavigationItem = {
  icon: LucideIcon
  label: string
  to: AppRoute
}

const navigationItems: NavigationItem[] = [
  { icon: CalendarCheck, label: 'app.home', to: APP_ROUTES.home },
  { icon: ListTodo, label: 'tasks.title', to: APP_ROUTES.tasks },
  { icon: CheckCheck, label: 'habits.title', to: APP_ROUTES.habits },
  { icon: Goal, label: 'goals.title', to: APP_ROUTES.goals },
  { icon: CalendarCheck, label: 'planner.title', to: APP_ROUTES.planner },
  { icon: Clock3, label: 'focus.title', to: APP_ROUTES.focus },
  { icon: Bell, label: 'reminders.title', to: APP_ROUTES.reminders },
  { icon: NotebookPen, label: 'notes.title', to: APP_ROUTES.notes },
  { icon: WalletCards, label: 'finance.title', to: APP_ROUTES.finance },
  { icon: Repeat, label: 'subscriptions.title', to: APP_ROUTES.subscriptions },
  { icon: LayoutTemplate, label: 'Templates', to: APP_ROUTES.templates },
]

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const isActive = (to: AppRoute) =>
    Boolean(
      matchRoute({
        fuzzy: to === APP_ROUTES.focus,
        to,
      }),
    )

  return (
    <Stack
      as="nav"
      aria-label={t('appShell.primaryNavigation')}
      gap="4"
      h="full"
      justify="space-between"
      p="3"
    >
      <Stack gap="5">
        <HStack gap="2" px="2">
          <Flex
            align="center"
            bg="brand.solid"
            color="brand.contrast"
            h="8"
            justify="center"
            rounded="l1"
            shadow="sm"
            w="8"
          >
            <Boxes aria-hidden="true" size={17} />
          </Flex>
          <Text fontSize="md" fontWeight="bold" letterSpacing="tight">
            {t('app.name')}
          </Text>
        </HStack>
        <Stack gap="0.5">
          {navigationItems.map((item) => (
            <NavigationLink
              isActive={isActive(item.to)}
              item={item}
              key={item.to}
              onNavigate={onNavigate}
            />
          ))}
          <Box bg="border.subtle" h="px" mx="2" my="1.5" />
          <Button
            asChild
            colorPalette={isActive(APP_ROUTES.statistics) ? 'brand' : undefined}
            fontWeight={isActive(APP_ROUTES.statistics) ? 'semibold' : 'medium'}
            justifyContent="flex-start"
            fontSize="sm"
            h="9"
            px="2.5"
            rounded="control"
            variant={isActive(APP_ROUTES.statistics) ? 'subtle' : 'ghost'}
            w="full"
          >
            <RouterLink
              activeOptions={{ includeSearch: false }}
              onClick={onNavigate}
              search={{ range: 'last-7-days' }}
              to={APP_ROUTES.statistics}
            >
              <Activity aria-hidden="true" size={16} />
              {t('statistics.title')}
            </RouterLink>
          </Button>
          <NavigationLink
            isActive={isActive(APP_ROUTES.review)}
            item={{
              icon: BookOpenCheck,
              label: 'weeklyReview.title',
              to: APP_ROUTES.review,
            }}
            onNavigate={onNavigate}
          />
          <NavigationLink
            isActive={isActive(APP_ROUTES.activity)}
            item={{
              icon: History,
              label: 'activity.title',
              to: APP_ROUTES.activity,
            }}
            onNavigate={onNavigate}
          />
        </Stack>
      </Stack>
      <Stack gap="3">
        <QuickAddDialog />
        <Box borderTopWidth="1px" borderColor="border.subtle" pt="3">
          <Text color="fg.muted" fontSize="xs" px="2">
            {t('appShell.workspace')}
          </Text>
          <HStack gap="2" px="2" pt="2">
            <CalendarDays aria-hidden="true" size={15} />
            <Text fontSize="sm" fontWeight="medium">
              {t('appShell.personalWorkspace')}
            </Text>
          </HStack>
        </Box>
      </Stack>
    </Stack>
  )
}

type NavigationLinkProps = {
  isActive: boolean
  item: NavigationItem
  onNavigate?: () => void
}

function NavigationLink({ isActive, item, onNavigate }: NavigationLinkProps) {
  const { t } = useTranslation()
  const Icon = item.icon

  return (
    <Button
      asChild
      colorPalette={isActive ? 'brand' : undefined}
      fontWeight={isActive ? 'semibold' : 'medium'}
      fontSize="sm"
      h="9"
      justifyContent="flex-start"
      px="2.5"
      rounded="control"
      variant={isActive ? 'subtle' : 'ghost'}
      w="full"
    >
      <RouterLink
        activeOptions={{ includeSearch: false }}
        onClick={onNavigate}
        to={item.to}
      >
        <Icon aria-hidden="true" size={16} />
        {t(item.label)}
      </RouterLink>
    </Button>
  )
}

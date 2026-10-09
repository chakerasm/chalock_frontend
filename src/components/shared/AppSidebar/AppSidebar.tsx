import { Box, Button, HStack, Image, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink, useMatchRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  Clock3,
  Goal,
  History,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutTemplate,
  NotebookPen,
  Repeat,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { QuickAddDialog } from '@/features/quick-add/components/QuickAddDialog'
import { APP_ROUTES, type AppRoute } from '@/lib/routes'

type AppSidebarProps = {
  collapsed?: boolean
  onNavigate?: () => void
  onToggle?: () => void
}

type NavigationItem = {
  icon: LucideIcon
  label: string
  to: AppRoute
}

const navigationItems: NavigationItem[] = [
  { icon: CalendarCheck, label: 'app.home', to: APP_ROUTES.home },
  { icon: CalendarDays, label: 'Calendar', to: APP_ROUTES.calendar },
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

export function AppSidebar({
  collapsed = false,
  onNavigate,
  onToggle,
}: AppSidebarProps) {
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
        <HStack gap="2" justify={collapsed ? 'center' : 'start'} px="2">
          <Image
            alt=""
            flexShrink="0"
            h="8"
            rounded="l1"
            shadow="brandGlow"
            src="/logo.png"
            w="8"
          />
          <Text
            display={collapsed ? 'none' : 'block'}
            fontSize="md"
            fontWeight="bold"
            letterSpacing="tight"
          >
            {t('app.name')}
          </Text>
        </HStack>
        <Stack gap="0.5">
          {navigationItems.map((item) => (
            <NavigationLink
              collapsed={collapsed}
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
            justifyContent={collapsed ? 'center' : 'flex-start'}
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
              <Text display={collapsed ? 'none' : 'block'}>
                {t('statistics.title')}
              </Text>
            </RouterLink>
          </Button>
          <NavigationLink
            collapsed={collapsed}
            isActive={isActive(APP_ROUTES.review)}
            item={{
              icon: BookOpenCheck,
              label: 'weeklyReview.title',
              to: APP_ROUTES.review,
            }}
            onNavigate={onNavigate}
          />
          <NavigationLink
            collapsed={collapsed}
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
        <Button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggle}
          size="sm"
          variant="ghost"
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" size={17} />
          ) : (
            <PanelLeftClose aria-hidden="true" size={17} />
          )}
        </Button>
        <Box display={collapsed ? 'none' : 'block'}>
          <QuickAddDialog />
        </Box>
        <Box
          borderTopWidth="1px"
          borderColor="border.subtle"
          display={collapsed ? 'none' : 'block'}
          pt="3"
        >
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
  collapsed: boolean
  isActive: boolean
  item: NavigationItem
  onNavigate?: () => void
}

function NavigationLink({
  collapsed,
  isActive,
  item,
  onNavigate,
}: NavigationLinkProps) {
  const { t } = useTranslation()
  const Icon = item.icon

  return (
    <Button
      asChild
      aria-label={t(item.label)}
      colorPalette={isActive ? 'brand' : undefined}
      fontWeight={isActive ? 'semibold' : 'medium'}
      fontSize="sm"
      h="9"
      justifyContent={collapsed ? 'center' : 'flex-start'}
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
        <Text display={collapsed ? 'none' : 'block'}>{t(item.label)}</Text>
      </RouterLink>
    </Button>
  )
}

import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink, useMatchRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Boxes,
  Bell,
  CalendarCheck,
  CheckCheck,
  Clock3,
  Goal,
  ListTodo,
  NotebookPen,
  Repeat,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  { icon: Bell, label: 'reminders.title', to: APP_ROUTES.reminders },
  { icon: NotebookPen, label: 'notes.title', to: APP_ROUTES.notes },
  { icon: WalletCards, label: 'finance.title', to: APP_ROUTES.finance },
  { icon: Repeat, label: 'subscriptions.title', to: APP_ROUTES.subscriptions },
  { icon: Clock3, label: 'focus.title', to: APP_ROUTES.focus },
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
      gap="6"
      h="full"
      justify="space-between"
      p="4"
    >
      <Stack gap="7">
        <HStack gap="3" px="2">
          <Flex
            align="center"
            bg="brand.solid"
            color="brand.contrast"
            h="10"
            justify="center"
            rounded="l1"
            shadow="sm"
            w="10"
          >
            <Boxes aria-hidden="true" size={20} />
          </Flex>
          <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
            {t('app.name')}
          </Text>
        </HStack>
        <Stack gap="1">
          {navigationItems.slice(0, 4).map((item) => (
            <NavigationLink
              isActive={isActive(item.to)}
              item={item}
              key={item.to}
              onNavigate={onNavigate}
            />
          ))}
          <Box bg="border.subtle" h="px" mx="2" my="2" />
          <Button
            asChild
            colorPalette={isActive(APP_ROUTES.statistics) ? 'brand' : undefined}
            fontWeight={isActive(APP_ROUTES.statistics) ? 'semibold' : 'medium'}
            justifyContent="flex-start"
            px="3"
            rounded="l1"
            variant={isActive(APP_ROUTES.statistics) ? 'subtle' : 'ghost'}
            w="full"
          >
            <RouterLink
              activeOptions={{ includeSearch: false }}
              onClick={onNavigate}
              search={{ range: 'last-7-days' }}
              to={APP_ROUTES.statistics}
            >
              <Activity aria-hidden="true" size={18} />
              {t('statistics.title')}
            </RouterLink>
          </Button>
          {navigationItems.slice(4).map((item) => (
            <NavigationLink
              isActive={isActive(item.to)}
              item={item}
              key={item.to}
              onNavigate={onNavigate}
            />
          ))}
        </Stack>
      </Stack>
      <Box
        bg="bg.subtle"
        borderColor="border.subtle"
        borderWidth="1px"
        p="3"
        rounded="l2"
      >
        <Text color="fg.muted" fontSize="xs" lineHeight="tall">
          {t('appShell.sidebarFooter')}
        </Text>
      </Box>
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
      justifyContent="flex-start"
      px="3"
      rounded="l1"
      variant={isActive ? 'subtle' : 'ghost'}
      w="full"
    >
      <RouterLink
        activeOptions={{ includeSearch: false }}
        onClick={onNavigate}
        to={item.to}
      >
        <Icon aria-hidden="true" size={18} />
        {t(item.label)}
      </RouterLink>
    </Button>
  )
}

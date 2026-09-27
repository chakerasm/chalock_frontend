import { Box, Button, Flex, Progress, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { Goal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { APP_ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import type { ActiveGoal } from "@/features/today/types/today.types";

type ActiveGoalsCardProps = { goals: ActiveGoal[] };

function formatTargetDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export function ActiveGoalsCard({ goals }: ActiveGoalsCardProps) {
  const { i18n, t } = useTranslation();
  const selectedGoals = goals.slice(0, 3);

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: "4", md: "5" }}
      rounded="l2"
    >
      <Flex align="center" gap="2" mb="4">
        <Goal aria-hidden="true" size={20} />
        <Text fontSize="lg" fontWeight="semibold">
          {t("today.goalsTitle")}
        </Text>
      </Flex>
      {selectedGoals.length === 0 ? (
        <EmptyState
          description={t("today.goalsEmptyDescription")}
          title={t("today.goalsEmptyTitle")}
        />
      ) : (
        <Stack gap="4">
          {selectedGoals.map((goal) => (
            <Stack gap="2" key={goal.id}>
              <Flex gap="3" justify="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  {goal.name}
                </Text>
                <Text color="fg.muted" flexShrink="0" fontSize="sm">
                  {t("today.goalProgress", {
                    current: goal.currentValue,
                    target: goal.targetValue,
                  })}
                </Text>
              </Flex>
              <Progress.Root
                size="sm"
                value={(goal.currentValue / goal.targetValue) * 100}
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              {goal.targetDate ? (
                <Text color="fg.muted" fontSize="xs">
                  {t("today.targetDate", {
                    date: formatTargetDate(goal.targetDate, i18n.language),
                  })}
                </Text>
              ) : null}
            </Stack>
          ))}
        </Stack>
      )}
      <Button asChild mt="4" size="sm" variant="ghost">
        <RouterLink to={APP_ROUTES.goals}>{t("today.viewAllGoals")}</RouterLink>
      </Button>
    </Box>
  );
}

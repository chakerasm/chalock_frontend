import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  CalendarCheck,
  CheckCheck,
  Clock3,
  Goal,
  ListTodo,
  NotebookPen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();

  return (
    <Stack
      as={"nav"}
      aria-label={t("appShell.primaryNavigation")}
      bg={"bg.panel"}
      gap={"6"}
      height={"full"}
      justify={"space-between"}
      p={"4"}
    >
      <Stack gap={"6"}>
        <HStack gap={"2"} px={"2"}>
          <Boxes aria-hidden={true} size={22} />
          <Text fontWeight={"bold"}>{t("app.name")}</Text>
        </HStack>
        <Stack gap={"1"}>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/"}>
              <CalendarCheck aria-hidden={true} size={18} />
              {t("app.home")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/tasks"}>
              <ListTodo aria-hidden={true} size={18} />
              {t("tasks.title")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/habits"}>
              <CheckCheck aria-hidden={true} size={18} />
              {t("habits.title")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/goals"}>
              <Goal aria-hidden={true} size={18} />
              {t("goals.title")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink
              onClick={onNavigate}
              search={{ range: "last-7-days" }}
              to={"/statistics"}
            >
              <Activity aria-hidden={true} size={18} />
              {t("statistics.title")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/notes"}>
              <NotebookPen aria-hidden={true} size={18} />
              {t("notes.title")}
            </RouterLink>
          </Button>
          <Button asChild justifyContent={"flex-start"} variant={"ghost"}>
            <RouterLink onClick={onNavigate} to={"/focus"}>
              <Clock3 aria-hidden={true} size={18} />
              {t("focus.title")}
            </RouterLink>
          </Button>
        </Stack>
      </Stack>
      <Box borderTopWidth={"1px"} pt={"4"}>
        <Text color={"fg.muted"} fontSize={"xs"} px={"2"}>
          {t("appShell.sidebarFooter")}
        </Text>
      </Box>
    </Stack>
  );
}

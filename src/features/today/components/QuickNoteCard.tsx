import { Box, Button, Flex, Stack, Text, Textarea } from "@chakra-ui/react";
import { NotebookPen } from "lucide-react";
import type { RefObject } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type QuickNoteCardProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  isSaving: boolean;
  onSave: (content: string, onSuccess: () => void) => void;
};

export function QuickNoteCard({
  inputRef,
  isSaving,
  onSave,
}: QuickNoteCardProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");

  function saveNote() {
    const trimmedContent = content.trim();
    if (trimmedContent) onSave(trimmedContent, () => setContent(""));
  }

  return (
    <Box
      bg="bg.elevated"
      borderColor="border.subtle"
      borderWidth="1px"
      p={{ base: "4", md: "5" }}
      rounded="l3"
      shadow="sm"
    >
      <Flex align="center" gap="2" mb="3">
        <NotebookPen aria-hidden="true" size={20} />
        <Text fontSize="lg" fontWeight="semibold">
          {t("today.quickNoteTitle")}
        </Text>
      </Flex>
      <Stack gap="3">
        <Textarea
          aria-label={t("today.quickNoteTitle")}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              saveNote();
            }
          }}
          placeholder={t("today.quickNotePlaceholder")}
          ref={inputRef}
          resize="none"
          rows={3}
          value={content}
        />
        <Button
          alignSelf="flex-end"
          disabled={!content.trim()}
          loading={isSaving}
          onClick={saveNote}
          size="sm"
        >
          {t("today.saveNote")}
        </Button>
      </Stack>
    </Box>
  );
}

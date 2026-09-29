import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Pin, Plus, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { NotesPageSkeleton } from "@/features/notes/components/NotesPageSkeleton";
import { ErrorState } from "@/components/shared/ErrorState/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { toast } from "@/components/ui/Toaster/Toaster";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/features/notes/hooks/use-notes";
import { searchNotes } from "@/features/notes/services/note-list.service";
import type { Note, UpdateNoteInput } from "@/features/notes/types/notes.types";

function formatUpdatedDate(date: string, locale: string) {
  const value = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(value);
}

type NoteEditorProps = {
  note: Note;
  onDelete: () => void;
  onSave: (input: UpdateNoteInput) => Promise<unknown>;
  onTogglePinned: (pinned: boolean) => void;
};

function NoteEditor({
  note,
  onDelete,
  onSave,
  onTogglePinned,
}: NoteEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  function retrySave() {
    setSaveState("saving");
    void saveRef
      .current({
        content,
        noteId: note.id,
        title: title.trim() || null,
      })
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  }

  useEffect(() => {
    if (title === (note.title ?? "") && content === note.content) {
      setSaveState("saved");
      return undefined;
    }

    setSaveState("saving");
    const timeoutId = window.setTimeout(() => {
      void saveRef
        .current({
          content,
          noteId: note.id,
          title: title.trim() || null,
        })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [content, note.content, note.id, note.title, title]);

  return (
    <Stack
      bg="bg.panel"
      borderWidth="1px"
      gap="0"
      minH={{ base: "24rem", lg: "38rem" }}
      rounded="l2"
    >
      <Flex
        align="center"
        borderBottomWidth="1px"
        gap="2"
        justify="space-between"
        p="3"
      >
        <Text color="fg.muted" fontSize="xs" aria-live="polite">
          {t(`notes.saveState.${saveState}`)}
        </Text>
        <HStack gap="1">
          <IconButton
            aria-label={t(note.pinned ? "notes.unpin" : "notes.pin")}
            colorPalette={note.pinned ? "brand" : undefined}
            onClick={() => onTogglePinned(!note.pinned)}
            size="sm"
            title={t(note.pinned ? "notes.unpin" : "notes.pin")}
            variant="ghost"
          >
            <Pin
              aria-hidden="true"
              fill={note.pinned ? "currentColor" : "none"}
              size={16}
            />
          </IconButton>
          <IconButton
            aria-label={t("notes.delete")}
            onClick={onDelete}
            size="sm"
            title={t("notes.delete")}
            variant="ghost"
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </HStack>
      </Flex>
      <Stack flex="1" gap="2" p={{ base: "4", md: "6" }}>
        <Input
          aria-label={t("notes.titleLabel")}
          border="0"
          fontSize="xl"
          fontWeight="semibold"
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("notes.titlePlaceholder")}
          px="0"
          value={title}
          _focusVisible={{ boxShadow: "none" }}
        />
        <Textarea
          aria-label={t("notes.contentLabel")}
          border="0"
          flex="1"
          fontSize="md"
          maxLength={20_000}
          minH={{ base: "18rem", lg: "29rem" }}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t("notes.contentPlaceholder")}
          px="0"
          resize="vertical"
          value={content}
          _focusVisible={{ boxShadow: "none" }}
        />
        {saveState === "error" ? (
          <HStack justify="space-between">
            <Text color="danger.fg" fontSize="sm" role="alert">
              {t("notes.saveError")}
            </Text>
            <Button onClick={retrySave} size="xs" variant="outline">
              {t("notes.retrySave")}
            </Button>
          </HStack>
        ) : null}
        <Text alignSelf="flex-end" color="fg.muted" fontSize="xs">
          {t("notes.characterCount", { count: content.length })}
        </Text>
      </Stack>
    </Stack>
  );
}

type NoteListSectionProps = {
  notes: Note[];
  onSelect: (noteId: string) => void;
  selectedNoteId?: string;
  title: string;
  emptyLabel?: string;
};

function NoteListSection({
  emptyLabel,
  notes,
  onSelect,
  selectedNoteId,
  title,
}: NoteListSectionProps) {
  const { i18n, t } = useTranslation();
  return (
    <Stack gap="1">
      <Text color="fg.muted" fontSize="xs" fontWeight="semibold" px="2" py="1">
        {title}
      </Text>
      {notes.map((note) => (
        <Button
          alignItems="flex-start"
          height="auto"
          key={note.id}
          justifyContent="flex-start"
          onClick={() => onSelect(note.id)}
          px="3"
          py="3"
          textAlign="left"
          variant={note.id === selectedNoteId ? "subtle" : "ghost"}
          whiteSpace="normal"
        >
          <Stack align="stretch" flex="1" gap="1" minW="0">
            <HStack gap="1" minW="0">
              {note.pinned ? <Pin aria-hidden="true" size={13} /> : null}
              <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                {note.title ||
                  note.content.split("\n")[0] ||
                  t("notes.untitled")}
              </Text>
            </HStack>
            <Text color="fg.muted" fontSize="xs" lineClamp={2}>
              {note.content}
            </Text>
            <Text color="fg.muted" fontSize="xs">
              {formatUpdatedDate(note.updatedAt, i18n.language)}
            </Text>
          </Stack>
        </Button>
      ))}
      {notes.length === 0 && emptyLabel ? (
        <Text color="fg.muted" fontSize="sm" px="2" py="2">
          {emptyLabel}
        </Text>
      ) : null}
    </Stack>
  );
}

export function NotesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [noteToDelete, setNoteToDelete] = useState<Note>();
  const captureRef = useRef<HTMLTextAreaElement>(null);
  const notesQuery = useNotes();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = notesQuery.data ?? [];
  const visibleNotes = searchNotes(notes, search);
  const pinnedNotes = visibleNotes.filter((note) => note.pinned);
  const recentNotes = visibleNotes.filter((note) => !note.pinned);
  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const saveNote = useCallback(
    (input: UpdateNoteInput) => updateMutation.mutateAsync(input),
    [updateMutation.mutateAsync],
  );

  function createFromCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = quickContent.trim();
    if (!content) return;
    createMutation.mutate(
      { content },
      {
        onError: () => toast.error({ title: t("notes.createError") }),
        onSuccess: (note) => {
          setQuickContent("");
          setSearch("");
          setSelectedNoteId(note.id);
        },
      },
    );
  }

  function togglePinned(noteId: string, pinned: boolean) {
    updateMutation.mutate(
      { noteId, pinned },
      { onError: () => toast.error({ title: t("notes.saveError") }) },
    );
  }

  async function confirmDelete() {
    if (!noteToDelete) return;
    try {
      await deleteMutation.mutateAsync(noteToDelete.id);
      if (selectedNoteId === noteToDelete.id) setSelectedNoteId(undefined);
      setNoteToDelete(undefined);
    } catch {
      toast.error({ title: t("notes.deleteError") });
    }
  }

  if (notesQuery.isPending) return <NotesPageSkeleton />;
  if (notesQuery.isError) {
    return (
      <Box
        maxW="6xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "12" }}
      >
        <ErrorState onRetry={() => void notesQuery.refetch()} />
      </Box>
    );
  }

  return (
    <Box
      maxW="7xl"
      mx="auto"
      px={{ base: "4", md: "8" }}
      py={{ base: "6", md: "10" }}
    >
      <Stack gap={{ base: "5", md: "7" }}>
        <PageHeader
          actions={
            <Button
              onClick={() => captureRef.current?.focus()}
              size="sm"
              variant="outline"
            >
              <Plus aria-hidden="true" size={16} />
              {t("notes.newNote")}
            </Button>
          }
          description={t("notes.description")}
          eyebrow={t("notes.eyebrow")}
          title={t("notes.title")}
        />

        <Grid
          alignItems="start"
          gap={{ base: "4", lg: "5" }}
          templateColumns={{
            base: "1fr",
            lg: "minmax(18rem, 0.8fr) minmax(0, 1.4fr)",
          }}
        >
          <Stack gap="4">
            <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
              <form onSubmit={createFromCapture}>
                <Stack gap="3">
                  <Textarea
                    aria-label={t("notes.quickCaptureLabel")}
                    maxLength={20_000}
                    onChange={(event) => setQuickContent(event.target.value)}
                    placeholder={t("notes.quickCapturePlaceholder")}
                    ref={captureRef}
                    resize="vertical"
                    rows={3}
                    value={quickContent}
                  />
                  <Button
                    alignSelf="flex-end"
                    colorPalette="brand"
                    disabled={!quickContent.trim() || createMutation.isPending}
                    loading={createMutation.isPending}
                    size="sm"
                    type="submit"
                  >
                    <Plus aria-hidden="true" size={16} />
                    {t("notes.capture")}
                  </Button>
                </Stack>
              </form>
            </Box>
            <Input
              aria-label={t("notes.searchLabel")}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("notes.searchPlaceholder")}
              value={search}
            />
            {notes.length === 0 ? (
              <EmptyState
                description={t("notes.emptyDescription")}
                title={t("notes.emptyTitle")}
              />
            ) : visibleNotes.length === 0 ? (
              <EmptyState
                description={t("notes.noSearchResultsDescription")}
                title={t("notes.noSearchResultsTitle")}
              />
            ) : (
              <Stack bg="bg.panel" borderWidth="1px" gap="3" p="3" rounded="l2">
                <NoteListSection
                  emptyLabel={search ? undefined : t("notes.noPinnedNotes")}
                  notes={pinnedNotes}
                  onSelect={setSelectedNoteId}
                  selectedNoteId={selectedNoteId}
                  title={t("notes.pinned")}
                />
                {recentNotes.length ? (
                  <NoteListSection
                    notes={recentNotes}
                    onSelect={setSelectedNoteId}
                    selectedNoteId={selectedNoteId}
                    title={t("notes.recent")}
                  />
                ) : null}
              </Stack>
            )}
          </Stack>

          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onDelete={() => setNoteToDelete(selectedNote)}
              onSave={saveNote}
              onTogglePinned={(pinned) => togglePinned(selectedNote.id, pinned)}
            />
          ) : (
            <EmptyState
              description={t("notes.selectDescription")}
              title={t("notes.selectTitle")}
            />
          )}
        </Grid>
      </Stack>
      <ConfirmDialog
        confirmLabel={t("notes.delete")}
        description={t("notes.deleteDescription", {
          title: noteToDelete?.title || t("notes.untitled"),
        })}
        isConfirming={deleteMutation.isPending}
        isDestructive
        onConfirm={confirmDelete}
        onOpenChange={(open) => {
          if (!open) setNoteToDelete(undefined);
        }}
        open={Boolean(noteToDelete)}
        title={t("notes.deleteTitle")}
      />
    </Box>
  );
}

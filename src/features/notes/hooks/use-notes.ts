import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "@/features/notes/services/notes.service";
import type {
  CreateNoteInput,
  NoteListFilters,
  UpdateNoteInput,
} from "@/features/notes/types/notes.types";

export const noteQueryKeys = {
  all: ["notes"] as const,
  list: (filters: NoteListFilters) => [...noteQueryKeys.all, filters] as const,
};

export function useNotes(filters: NoteListFilters = {}) {
  return useQuery({
    queryFn: () => getNotes(filters),
    queryKey: noteQueryKeys.list(filters),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.all }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.all }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: noteQueryKeys.all }),
  });
}

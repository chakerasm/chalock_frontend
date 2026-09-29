import {
  createNoteInputSchema,
  noteFromAPISchema,
  notesFromAPISchema,
  updateNoteInputSchema,
} from "@/features/notes/schemas/notes.schemas";
import type {
  CreateNoteInput,
  NoteListFilters,
  UpdateNoteInput,
} from "@/features/notes/types/notes.types";
import { apiFetch } from "@/lib/api/client";

async function parseResponse<T>(
  response: Response,
  schema: { parse: (data: unknown) => T },
  errorMessage: string,
): Promise<T> {
  if (!response.ok) throw new Error(errorMessage);
  return schema.parse(await response.json());
}

export async function getNotesFromAPI(filters: NoteListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const query = params.size ? `?${params.toString()}` : "";
  return parseResponse(
    await apiFetch(`/api/notes${query}`),
    notesFromAPISchema,
    "Unable to load notes.",
  );
}

export async function getNoteFromAPI(noteId: string) {
  return parseResponse(
    await apiFetch(`/api/notes/${encodeURIComponent(noteId)}`),
    noteFromAPISchema,
    "Unable to load this note.",
  );
}

export async function createNoteFromAPI(input: CreateNoteInput) {
  const request = createNoteInputSchema.parse(input);
  return parseResponse(
    await apiFetch("/api/notes", {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
    noteFromAPISchema,
    "Unable to save the note.",
  );
}

export async function updateNoteFromAPI({ noteId, ...input }: UpdateNoteInput) {
  const request = updateNoteInputSchema.parse(input);
  return parseResponse(
    await apiFetch(`/api/notes/${encodeURIComponent(noteId)}`, {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }),
    noteFromAPISchema,
    "Unable to save note changes.",
  );
}

export async function deleteNoteFromAPI(noteId: string) {
  const response = await apiFetch(`/api/notes/${encodeURIComponent(noteId)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Unable to delete the note.");
}

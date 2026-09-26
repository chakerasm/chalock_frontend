import {
  createNoteFromAPI,
  deleteNoteFromAPI,
  getNoteFromAPI,
  getNotesFromAPI,
  updateNoteFromAPI,
} from "@/features/notes/api/notes.api";
import {
  mapNoteFromAPI,
  mapNoteToAPI,
} from "@/features/notes/mappers/notes.mapper";
import { sortNotes } from "@/features/notes/services/note-list.service";
import type {
  CreateNoteInput,
  NoteListFilters,
  UpdateNoteInput,
} from "@/features/notes/types/notes.types";

export async function getNotes(filters: NoteListFilters = {}) {
  return sortNotes((await getNotesFromAPI(filters)).map(mapNoteFromAPI));
}

export async function getNote(noteId: string) {
  return mapNoteFromAPI(await getNoteFromAPI(noteId));
}

export async function createNote(input: CreateNoteInput) {
  return mapNoteFromAPI(await createNoteFromAPI(mapNoteToAPI(input)));
}

export async function updateNote(input: UpdateNoteInput) {
  return mapNoteFromAPI(await updateNoteFromAPI(input));
}

export async function deleteNote(noteId: string) {
  await deleteNoteFromAPI(noteId);
}

import type {
  CreateNoteInput,
  Note,
  NoteFromAPI,
} from "@/features/notes/types/notes.types";

export function mapNoteFromAPI(note: NoteFromAPI): Note {
  return { ...note };
}

export function mapNoteToAPI(note: CreateNoteInput): CreateNoteInput {
  return { ...note };
}

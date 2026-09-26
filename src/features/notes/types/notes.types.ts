export type NoteFromAPI = {
  content: string;
  createdAt: string;
  id: string;
  pinned: boolean;
  title?: string;
  updatedAt: string;
};

export type Note = NoteFromAPI;

export type CreateNoteInput = {
  content: string;
  title?: string;
};

export type UpdateNoteInput = {
  content?: string;
  noteId: string;
  pinned?: boolean;
  title?: string | null;
};

export type NoteListFilters = {
  search?: string;
};

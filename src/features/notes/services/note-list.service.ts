import type { Note } from "@/features/notes/types/notes.types";

export function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function searchNotes(notes: Note[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return notes;
  return notes.filter((note) =>
    `${note.title ?? ""} ${note.content}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}

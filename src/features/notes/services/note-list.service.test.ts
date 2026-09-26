import { describe, expect, it } from "vitest";
import type { Note } from "@/features/notes/types/notes.types";
import { searchNotes, sortNotes } from "./note-list.service";

const notes: Note[] = [
  {
    content: "Older pinned note",
    createdAt: "2026-09-20T00:00:00.000Z",
    id: "pinned-old",
    pinned: true,
    updatedAt: "2026-09-21T00:00:00.000Z",
  },
  {
    content: "Most recently edited note",
    createdAt: "2026-09-22T00:00:00.000Z",
    id: "recent",
    pinned: false,
    title: "Meeting",
    updatedAt: "2026-09-25T00:00:00.000Z",
  },
  {
    content: "New pinned note",
    createdAt: "2026-09-24T00:00:00.000Z",
    id: "pinned-new",
    pinned: true,
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
];

describe("note list helpers", () => {
  it("sorts pinned notes first and then by most recently updated", () => {
    expect(sortNotes(notes).map((note) => note.id)).toEqual([
      "pinned-new",
      "pinned-old",
      "recent",
    ]);
  });

  it("searches title and content without case sensitivity", () => {
    expect(searchNotes(notes, "MEETING").map((note) => note.id)).toEqual([
      "recent",
    ]);
  });
});

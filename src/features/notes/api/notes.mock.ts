import type { NoteFromAPI } from "@/features/notes/types/notes.types";

function timestamp(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

export const notesMock: NoteFromAPI[] = [
  {
    content:
      "Ask Priya about the conference room before booking.\nBring the draft agenda.",
    createdAt: timestamp(8),
    id: "note-1",
    pinned: true,
    title: "For Monday",
    updatedAt: timestamp(1),
  },
  {
    content:
      "A few ideas for the personal project:\n\n- Keep the first version small\n- Ask two people to try it",
    createdAt: timestamp(5),
    id: "note-2",
    pinned: true,
    title: "Project thoughts",
    updatedAt: timestamp(2),
  },
  {
    content: "“Attention is the beginning of devotion.”",
    createdAt: timestamp(3),
    id: "note-3",
    pinned: false,
    updatedAt: timestamp(3),
  },
  {
    content: "Try the new recipe with lemon and chickpeas.",
    createdAt: timestamp(1),
    id: "note-4",
    pinned: false,
    title: "Dinner idea",
    updatedAt: timestamp(1),
  },
];

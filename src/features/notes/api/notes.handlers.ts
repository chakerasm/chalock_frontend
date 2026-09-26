import { HttpResponse, http } from "msw";
import { notesMock } from "@/features/notes/api/notes.mock";
import {
  createNoteInputSchema,
  updateNoteInputSchema,
} from "@/features/notes/schemas/notes.schemas";
import { sortNotes } from "@/features/notes/services/note-list.service";

function findNote(noteId: string) {
  return notesMock.find((note) => note.id === noteId);
}

function searchNotesFromRequest(request: Request) {
  const query = new URL(request.url).searchParams
    .get("search")
    ?.trim()
    .toLocaleLowerCase();
  const notes = query
    ? notesMock.filter((note) =>
        `${note.title ?? ""} ${note.content}`
          .toLocaleLowerCase()
          .includes(query),
      )
    : notesMock;
  return sortNotes(notes);
}

export const noteHandlers = [
  http.get("/api/notes", ({ request }) =>
    HttpResponse.json(searchNotesFromRequest(request)),
  ),
  http.get("/api/notes/:noteId", ({ params }) => {
    const note = findNote(String(params.noteId));
    if (!note) {
      return HttpResponse.json(
        { code: "NOTE_NOT_FOUND", message: "Note not found." },
        { status: 404 },
      );
    }
    return HttpResponse.json(note);
  }),
  http.post("/api/notes", async ({ request }) => {
    const input = createNoteInputSchema.safeParse(await request.json());
    if (!input.success) {
      return HttpResponse.json(
        { code: "INVALID_NOTE", message: "Note input is invalid." },
        { status: 422 },
      );
    }
    const now = new Date().toISOString();
    const note = {
      ...input.data,
      createdAt: now,
      id: `note-${crypto.randomUUID()}`,
      pinned: false,
      updatedAt: now,
    };
    notesMock.unshift(note);
    return HttpResponse.json(note, { status: 201 });
  }),
  http.patch("/api/notes/:noteId", async ({ params, request }) => {
    const note = findNote(String(params.noteId));
    if (!note) {
      return HttpResponse.json(
        { code: "NOTE_NOT_FOUND", message: "Note not found." },
        { status: 404 },
      );
    }
    const input = updateNoteInputSchema.safeParse(await request.json());
    if (!input.success || Object.keys(input.data ?? {}).length === 0) {
      return HttpResponse.json(
        { code: "INVALID_NOTE", message: "Note update is invalid." },
        { status: 422 },
      );
    }
    const { title, ...fields } = input.data;
    Object.assign(note, fields);
    if (title !== undefined) note.title = title ?? undefined;
    note.updatedAt = new Date().toISOString();
    return HttpResponse.json(note);
  }),
  http.delete("/api/notes/:noteId", ({ params }) => {
    const index = notesMock.findIndex((note) => note.id === params.noteId);
    if (index === -1) {
      return HttpResponse.json(
        { code: "NOTE_NOT_FOUND", message: "Note not found." },
        { status: 404 },
      );
    }
    notesMock.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

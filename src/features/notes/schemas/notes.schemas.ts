import { z } from "zod";

export const noteFromAPISchema = z.object({
  content: z.string().min(1).max(20_000),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  pinned: z.boolean(),
  title: z.string().trim().min(1).max(120).optional(),
  updatedAt: z.string().datetime(),
});

export const notesFromAPISchema = z.array(noteFromAPISchema);

export const createNoteInputSchema = z.object({
  content: z.string().trim().min(1).max(20_000),
  title: z.string().trim().min(1).max(120).optional(),
});

export const updateNoteInputSchema = z.object({
  content: z.string().trim().min(1).max(20_000).optional(),
  pinned: z.boolean().optional(),
  title: z.string().trim().min(1).max(120).nullable().optional(),
});

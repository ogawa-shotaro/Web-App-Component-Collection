import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
});

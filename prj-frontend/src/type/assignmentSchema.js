import { z } from "zod";

export const assignmentSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().nullable().optional(),
  course_id: z.number(),
  course_title: z.string().optional(),
  status: z.enum(["pending", "submitted", "late", "graded"]).default("pending"),
  grade: z.number().nullable().optional(),
  created_at: z.string().optional(),
});

export const assignmentListSchema = z.array(assignmentSchema);

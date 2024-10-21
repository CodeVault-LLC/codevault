import { z } from "zod";

export const productStatus = z.enum([
  "stable",
  "beta",
  "alpha",
  "deprecated",
  "coming-soon",
  "planned",
  "in-progress",
]);

export const productCategory = z.enum([
  "api",
  "library",
  "framework",
  "tool",
  "plugin",
  "template",
  "other",
]);

export const productCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  tagline: z.string().optional(),

  isPublic: z.boolean().default(false).optional(),
  status: productStatus,
  category: productCategory,

  tags: z.array(z.string()).optional(),
});

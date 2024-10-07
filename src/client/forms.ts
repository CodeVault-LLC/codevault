import { z } from "zod";

export const projectStatus = z.enum([
  "stable",
  "beta",
  "alpha",
  "deprecated",
  "coming-soon",
  "planned",
  "in-progress",
]);

export const projectCategory = z.enum([
  "api",
  "library",
  "framework",
  "tool",
  "plugin",
  "template",
  "other",
]);

export const projectCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  tagline: z.string().optional(),

  isPublic: z.boolean(),
  status: projectStatus,
  category: projectCategory,

  tags: z.array(z.string()).optional(),
});

export const projectPricingSettingsSchema = z.object({
  apiKey: z
    .string({
      invalid_type_error: "Please enter an API key",
    })
    .optional(),
});

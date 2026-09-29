import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

// Single source of truth for article frontmatter.
// `type` is implied by the collection (worklog | knowledge), so it is not a field.

const status = z.enum(["investigating", "solved", "reference", "deprecated"]);

const article = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  topics: z.array(reference("topics")).min(1),
  tags: z.array(z.string()).default([]),
  project: reference("projects").optional(),
  status,
  draft: z.boolean().default(false),
});

// Hierarchical topic tree, e.g. magento-cloud → magento.
const topics = defineCollection({
  loader: file("src/content/topics.yaml"),
  schema: z.object({
    title: z.string(),
    parent: reference("topics").optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topics: z.array(reference("topics")).default([]),
  }),
});

const worklog = defineCollection({
  // Files: worklog/<yyyy>/<yyyy-mm-dd>-<slug>.md
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/worklog" }),
  schema: article,
});

const knowledge = defineCollection({
  // Files: knowledge/<topic>/<slug>.md
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/knowledge" }),
  schema: article,
});

export const collections = { topics, projects, worklog, knowledge };

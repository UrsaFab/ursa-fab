import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const imagePath = z.string().min(1);

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/portfolio" }),
  schema: z.object({
    order: z.number().int().positive().default(1),
    title: z.string(),
    summary: z.string(),
    description: z.string().default(""),
    images: z.array(imagePath).min(1),
  }),
});

const studiocarts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/studiocarts" }),
  schema: z.object({
    order: z.number().int().positive().default(1),
    title: z.string(),
    price: z.number().nonnegative(),
    thumbnail: imagePath,
    gallery: z.array(imagePath).min(1),
    description: z.string().default(""),
  }),
});

const ordering = defineCollection({
  loader: glob({ pattern: "*-order.yml", base: "./src/content" }),
  schema: z.object({
    items: z.array(
      z.union([z.string(), z.object({ entry: z.string() })]),
    ).default([]),
  }),
});

export const collections = { portfolio, studiocarts, ordering };

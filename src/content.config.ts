import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const hex = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "expected a hex colour like #f2740d");

/**
 * Case studies.
 *
 * Prose lives in the MDX body; frontmatter carries only what the index, the
 * hero and the metadata bar need. A `status` of "draft" renders locally and
 * disappears from the production build, so the site can ship with three pages
 * and no dead links.
 */
const work = defineCollection({
  loader: glob({ base: "./src/content/work", pattern: "**/*.mdx" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line, used on the index and under the case-study title. */
      tagline: z.string().max(140),
      /** Meta description and social card text. */
      summary: z.string().max(280),

      role: z.string(),
      org: z.string().optional(),
      context: z.enum([
        "research",
        "product",
        "client work",
        "personal",
        "hackathon",
      ]),

      dates: z.object({
        start: z.coerce.date(),
        end: z.coerce.date().optional(),
        /** Overrides the rendered range, e.g. "Nov 2024 — present". */
        label: z.string().optional(),
      }),

      stack: z.array(z.string()).min(1),

      accent: z.object({
        base: hex,
        /** Optional override for dark mode; otherwise derived. */
        dark: hex.optional(),
        onAccent: z.enum(["light", "dark"]).default("light"),
      }),

      hero: z
        .object({
          src: image(),
          alt: z.string().min(1),
          caption: z.string().optional(),
        })
        .optional(),

      /** The number that earns its place on the index row. */
      headline: z
        .object({
          value: z.string(),
          unit: z.string().optional(),
          label: z.string(),
        })
        .optional(),

      links: z
        .object({
          live: z.string().url().optional(),
          repo: z.string().url().optional(),
        })
        .default({}),

      status: z.enum(["draft", "published"]).default("draft"),
      featured: z.boolean().default(false),
      order: z.number().int().default(100),
    }),
});

export const collections = { work };

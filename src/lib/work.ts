import { getCollection, type CollectionEntry } from "astro:content";

export type Work = CollectionEntry<"work">;

/**
 * Drafts render in dev so they can be written and reviewed, and vanish from
 * the production build so the live site never carries a half-finished page.
 */
export async function publishedWork(): Promise<Work[]> {
  const entries = await getCollection("work", ({ data }) =>
    import.meta.env.DEV ? true : data.status === "published",
  );
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function featuredWork(): Promise<Work[]> {
  const all = await publishedWork();
  const featured = all.filter((e) => e.data.featured);
  // Never leave the home page empty while case studies are still being written.
  return featured.length > 0 ? featured : all.slice(0, 3);
}

export function dateLabel(data: Work["data"]): string {
  if (data.dates.label) return data.dates.label;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return data.dates.end
    ? `${fmt(data.dates.start)} — ${fmt(data.dates.end)}`
    : `${fmt(data.dates.start)} — present`;
}

/** Inline style that scopes a project's accent to a subtree. */
export function accentStyle(data: Work["data"]): string {
  const { base, dark, onAccent } = data.accent;
  return [
    `--accent-base:${base}`,
    dark ? `--accent-dark:${dark}` : "",
    `--on-accent:${onAccent === "dark" ? "var(--ink)" : "#fff"}`,
  ]
    .filter(Boolean)
    .join(";");
}

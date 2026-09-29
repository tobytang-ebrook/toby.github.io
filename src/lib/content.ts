import { getCollection, type CollectionEntry } from "astro:content";

export type Worklog = CollectionEntry<"worklog">;
export type Knowledge = CollectionEntry<"knowledge">;
export type Article = Worklog | Knowledge;

const WORKLOG_FILE = /^(\d{4})\/(\d{4})-(\d{2})-(\d{2})-([a-z0-9-]+)$/;

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** worklog id "2026/2026-09-29-foo" → route param "2026/09/29-foo". */
export function worklogSlug(entry: Worklog): string {
  const m = WORKLOG_FILE.exec(entry.id);
  if (!m) {
    throw new Error(
      `worklog "${entry.id}": file must be worklog/<yyyy>/<yyyy-mm-dd>-<slug>.md`,
    );
  }
  const [, dir, y, mo, d, slug] = m;
  const fileDate = `${y}-${mo}-${d}`;
  if (dir !== y || fileDate !== isoDate(entry.data.date)) {
    throw new Error(
      `worklog "${entry.id}": filename date ${fileDate} (dir ${dir}) does not match frontmatter date ${isoDate(entry.data.date)}`,
    );
  }
  return `${y}/${mo}/${d}-${slug}`;
}

export function articleUrl(entry: Article): string {
  return entry.collection === "worklog"
    ? `/worklog/${worklogSlug(entry)}/`
    : `/knowledge/${entry.id}/`;
}

const published = ({ data }: Article) => import.meta.env.DEV || !data.draft;

const byDateDesc = (a: Article, b: Article) =>
  (b.data.updated ?? b.data.date).getTime() -
  (a.data.updated ?? a.data.date).getTime();

export async function getWorklogs(): Promise<Worklog[]> {
  return (await getCollection("worklog", published)).sort(byDateDesc);
}

export async function getKnowledge(): Promise<Knowledge[]> {
  return (await getCollection("knowledge", published)).sort(byDateDesc);
}

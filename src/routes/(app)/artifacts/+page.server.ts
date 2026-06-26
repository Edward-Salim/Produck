import { db } from '$lib/server/db/index.js';
import { pmBook, pmArtifact, pmMethodology, artifactPick } from '$lib/server/db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { assertProjectAccess } from '$lib/server/access.js';
import type { PageServerLoad } from './$types.js';

export interface BookData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  year: number;
  coverPath: string;
  artifacts: ArtifactData[];
}

export interface ArtifactData {
  id: number;
  name: string;
  category: string;
  description: string;
  howTo: string[];
  figure: string | null;
  figures: string[];
  bookId: number;
  bookSlug: string;
  bookTitle: string;
  bookCoverPath: string;
}

export interface MethodologyData {
  id: number;
  name: string;
  phase: string;
  origin: string;
  description: string;
  relatedArtifacts: string[];
  figure: string | null;
}

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const projectId = Number(cookies.get('active_project'));
  if (projectId) await assertProjectAccess(locals, projectId);

  try {
    // Load books
    const books = await db.select().from(pmBook).orderBy(asc(pmBook.title));

    // Load artifacts with book join
    const rawArtifacts = await db
      .select({
        id: pmArtifact.id,
        name: pmArtifact.name,
        category: pmArtifact.category,
        description: pmArtifact.description,
        howTo: pmArtifact.howTo,
        figure: pmArtifact.figure,
        figures: pmArtifact.figures,
        bookId: pmArtifact.bookId,
        bookSlug: pmBook.slug,
        bookTitle: pmBook.title,
        bookCoverPath: pmBook.coverPath
      })
      .from(pmArtifact)
      .innerJoin(pmBook, eq(pmArtifact.bookId, pmBook.id))
      .orderBy(asc(pmArtifact.name));

    const artifacts: ArtifactData[] = rawArtifacts.map((a) => ({
      ...a,
      howTo: (a.howTo as string[]) ?? [],
      figures: (a.figures as string[]) ?? [],
      bookSlug: a.bookSlug ?? '',
      bookTitle: a.bookTitle ?? '',
      bookCoverPath: a.bookCoverPath ?? ''
    }));

    // Group into books
    const bookDataList: BookData[] = books.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      author: b.author ?? '',
      year: b.year ?? 0,
      coverPath: b.coverPath ?? '',
      artifacts: artifacts.filter((a) => a.bookId === b.id)
    }));

    bookDataList.sort((a, b) => {
      if (a.coverPath && !b.coverPath) return -1;
      if (!a.coverPath && b.coverPath) return 1;
      return a.title.localeCompare(b.title);
    });

    // Load methodologies
    const rawMethodologies = await db.select().from(pmMethodology).orderBy(asc(pmMethodology.name));
    const methodologies: MethodologyData[] = rawMethodologies.map((m) => ({
      ...m,
      origin: m.origin ?? '',
      description: m.description ?? '',
      relatedArtifacts: (m.relatedArtifacts as string[]) ?? []
    }));

    // Load picks
    const picks = projectId
      ? await db
          .select({ bookId: artifactPick.bookId, artifactName: artifactPick.artifactName })
          .from(artifactPick)
          .where(eq(artifactPick.projectId, projectId))
      : [];

    return { books: bookDataList, artifacts, methodologies, picks };
  } catch (err) {
    console.error('Failed to load PM data:', err);
    return { books: [], artifacts: [], methodologies: [], picks: [] };
  }
};

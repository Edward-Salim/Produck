export type BookStory = {
  phrase: string;
  title: string;
  summary: string;
};

export type BookChapterSummary = {
  number: number;
  group?: string;
  label?: string;
  title: string;
  pages: string;
  gist: string;
  summary: string[];
  stories?: BookStory[];
  takeaways: { title: string; description: string }[];
  example: { situation: string; application: string };
  reflection: string;
};

export type BookSummaryBlock =
  | string
  | { type: 'bullets' | 'numbered'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption: string; width: number; height: number };

export type BookPartSummary = {
  number: number;
  group?: string;
  label: string;
  title: string;
  pages: string;
  chapterRange: string;
  summary: BookSummaryBlock[];
  stories?: BookStory[];
};

export type BookAuthorPortrait = {
  name: string;
  src: string;
  credit?: string;
};

export type BookSummary = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorImage?: string;
  authorPortraits?: BookAuthorPortrait[];
  edition?: string;
  cover: string;
  source: { filename: string; chapterUrl?: string };
  parts?: BookPartSummary[];
  chapters: BookChapterSummary[];
};

export type BookLibraryItem = Pick<BookSummary, 'id' | 'title' | 'cover'> & {
  shelfCategory: 'work' | 'misc';
  shelfSpan?: 1 | 2;
  hasDownload?: boolean;
};

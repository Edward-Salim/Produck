type Tone = 'neutral' | 'success' | 'warning';

export type ArtifactLink = { type: 'link'; label: string; href: string };
export type ArtifactCell =
  | string
  | ArtifactLink
  | { type: 'status'; label: string; tone: Tone }
  | { type: 'condition'; text: string };
export type ArtifactText = string | (string | ArtifactLink | { type: 'strong'; text: string })[];
export type ArtifactTableRow =
  | ArtifactCell[]
  | {
      cells: ArtifactCell[];
      options?: ArtifactCell[][];
      requiredFor?: string;
      market?: string;
      kind?: 'document';
    };

type BlockFields = {
  id: string;
  title?: string;
  links?: ArtifactLink[];
};

type TableRows =
  | { rows: ArtifactTableRow[]; rowGroups?: never }
  | { rowGroups: { title: string; rows: ArtifactTableRow[] }[]; rows?: never };

type ContentBlock =
  | { type: 'text'; text: ArtifactText }
  | { type: 'callout'; text: ArtifactText; tone: Tone }
  | { type: 'heading'; title: string; level: 2 | 3 }
  | { type: 'list'; items: ArtifactText[]; ordered?: boolean }
  | ({
      type: 'table';
      columns: string[];
      compact?: boolean;
      mergeColumn?: number;
      bulletedColumn?: number;
      showAttributeCount?: boolean;
    } & TableRows)
  | { type: 'gallery'; images: unknown[] };

interface ExpandBlock<Child> {
  type: 'expand';
  title: string;
  text?: ArtifactText;
  blocks?: Child[];
}

export type ArtifactBlock = BlockFields & (ContentBlock | ExpandBlock<ArtifactBlock>);
type UnparsedBlock = BlockFields & (ContentBlock | ExpandBlock<unknown>);

type ArtifactDocument = { summary?: ArtifactText; blocks: ArtifactBlock[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isTone(value: unknown): value is Tone {
  return value === 'neutral' || value === 'success' || value === 'warning';
}

function isLink(value: unknown): value is ArtifactLink {
  return (
    isRecord(value) &&
    value.type === 'link' &&
    typeof value.label === 'string' &&
    typeof value.href === 'string'
  );
}

function isText(value: unknown): value is ArtifactText {
  return (
    typeof value === 'string' ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every(
        (part) =>
          typeof part === 'string' ||
          isLink(part) ||
          (isRecord(part) && part.type === 'strong' && typeof part.text === 'string')
      ))
  );
}

function isCell(value: unknown): value is ArtifactCell {
  return (
    typeof value === 'string' ||
    isLink(value) ||
    (isRecord(value) &&
      ((value.type === 'status' && typeof value.label === 'string' && isTone(value.tone)) ||
        (value.type === 'condition' && typeof value.text === 'string' && !!value.text.trim())))
  );
}

function isCellRow(value: unknown, columnCount: number): value is ArtifactCell[] {
  return Array.isArray(value) && value.length === columnCount && value.every(isCell);
}

function isTableRows(value: unknown, columnCount: number): value is ArtifactTableRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        isCellRow(row, columnCount) ||
        (isRecord(row) &&
          isCellRow(row.cells, columnCount) &&
          typeof row.cells[0] === 'string' &&
          !!row.cells[0].trim() &&
          (row.requiredFor === undefined ||
            (typeof row.requiredFor === 'string' && !!row.requiredFor.trim())) &&
          (row.market === undefined ||
            (typeof row.market === 'string' && /^[A-Z]{2}$/.test(row.market))) &&
          (row.kind === undefined || row.kind === 'document') &&
          (row.options === undefined
            ? row.requiredFor !== undefined || row.market !== undefined || row.kind !== undefined
            : Array.isArray(row.options) &&
              row.options.length > 0 &&
              row.options.every((option) => isCellRow(option, columnCount))))
    )
  );
}

function isBlock(value: unknown): value is UnparsedBlock {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    (value.title !== undefined && typeof value.title !== 'string') ||
    (value.links !== undefined && (!Array.isArray(value.links) || !value.links.every(isLink)))
  )
    return false;

  switch (value.type) {
    case 'text':
      return isText(value.text);
    case 'expand':
      return (
        typeof value.title === 'string' &&
        !!value.title.trim() &&
        (value.text === undefined || isText(value.text)) &&
        (value.blocks === undefined || Array.isArray(value.blocks))
      );
    case 'callout':
      return isText(value.text) && isTone(value.tone);
    case 'heading':
      return (
        typeof value.title === 'string' &&
        !!value.title.trim() &&
        (value.level === 2 || value.level === 3)
      );
    case 'list':
      return (
        (value.ordered === undefined || typeof value.ordered === 'boolean') &&
        Array.isArray(value.items) &&
        value.items.length > 0 &&
        value.items.every(isText)
      );
    case 'gallery':
      return Array.isArray(value.images);
    case 'table': {
      const columns = value.columns;
      if (
        (value.compact !== undefined && typeof value.compact !== 'boolean') ||
        (value.showAttributeCount !== undefined && typeof value.showAttributeCount !== 'boolean') ||
        !Array.isArray(columns) ||
        columns.length === 0 ||
        !columns.every((column) => typeof column === 'string' && column.trim())
      )
        return false;

      const dataColumns = [value.mergeColumn, value.bulletedColumn];
      if (
        dataColumns.some(
          (column) =>
            column !== undefined &&
            (typeof column !== 'number' ||
              !Number.isInteger(column) ||
              column < 1 ||
              column >= columns.length)
        )
      )
        return false;

      if (value.rowGroups === undefined) return isTableRows(value.rows, columns.length);
      return (
        value.rows === undefined &&
        Array.isArray(value.rowGroups) &&
        value.rowGroups.length > 0 &&
        value.rowGroups.every(
          (group) =>
            isRecord(group) &&
            typeof group.title === 'string' &&
            !!group.title.trim() &&
            isTableRows(group.rows, columns.length)
        )
      );
    }
    default:
      return false;
  }
}

function parseBlocks(source: unknown[], ids: Set<string>): ArtifactBlock[] {
  return source.flatMap((block): ArtifactBlock[] => {
    if (!isBlock(block) || ids.has(block.id)) return [];
    ids.add(block.id);

    if (block.type === 'expand') {
      const { blocks, ...expand } = block;
      const children = blocks ? parseBlocks(blocks, ids) : undefined;
      if (expand.text === undefined && !children?.length && !expand.links?.length) {
        ids.delete(block.id);
        return [];
      }
      return [children ? { ...expand, blocks: children } : expand];
    }

    return [block];
  });
}

export function parseCustomArtifact(source: string | undefined): ArtifactDocument | null {
  if (!source) return null;
  try {
    const value: unknown = JSON.parse(source);
    if (!isRecord(value) || !Array.isArray(value.blocks)) return null;

    return {
      summary: isText(value.summary) ? value.summary : undefined,
      blocks: parseBlocks(value.blocks, new Set())
    };
  } catch {
    return null;
  }
}

export function artifactColumnSpans(rows: ArtifactCell[][], column: number): number[] {
  const spans = rows.map(() => 1);
  let start = 0;
  for (let index = 1; index < rows.length; index++) {
    const value = rows[index][column];
    if (
      typeof value === 'string' &&
      value.trim() &&
      value !== '?' &&
      value === rows[start][column]
    ) {
      spans[start]++;
      spans[index] = 0;
    } else {
      start = index;
    }
  }
  return spans;
}

export function artifactLinkHref(href: string): string | undefined {
  const value = href.trim();
  try {
    if (value.startsWith('/')) {
      const origin = 'https://produck.invalid';
      const url = new URL(value, origin);
      if (url.origin === origin && !url.pathname.startsWith('//'))
        return url.pathname + url.search + url.hash;
      return undefined;
    }

    const url = new URL(value);
    if ((url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password)
      return url.href;
  } catch {
    return undefined;
  }
  return undefined;
}

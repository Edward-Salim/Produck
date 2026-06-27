import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { RequestHandler } from './$types.js';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 72;
const PANEL_X = 52;
const PANEL_Y = 52;
const PANEL_WIDTH = PAGE_WIDTH - PANEL_X * 2;
const PANEL_HEIGHT = PAGE_HEIGHT - PANEL_Y * 2;

const COLORS = {
  pageBg: rgb(236 / 255, 229 / 255, 216 / 255),
  panel: rgb(1, 1, 1),
  brand: rgb(130 / 255, 95 / 255, 55 / 255),
  ink: rgb(42 / 255, 35 / 255, 26 / 255),
  muted: rgb(107 / 255, 94 / 255, 74 / 255),
  coin: rgb(151 / 255, 124 / 255, 73 / 255),
  line: rgb(205 / 255, 195 / 255, 174 / 255)
};

type DrawTextOptions = {
  x: number;
  y: number;
  maxWidth: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
};

function safeFilename(value: string | undefined): string {
  const cleaned = (value ?? 'Company').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
  return cleaned || 'Company';
}

function getApplicationPhoneDisplay(): string {
  return env.APPLICATION_PHONE_DISPLAY?.trim() ?? 'Phone available on request';
}

function getApplicationEmail(): string {
  return env.APPLICATION_EMAIL?.trim() ?? 'email@example.com';
}

function getSignatureImageBase64(): string | undefined {
  const encodedSignature = env.APPLICATION_SIGNATURE_IMAGE_BASE64?.trim();
  if (encodedSignature) return encodedSignature;

  const chunkCount = Number.parseInt(env.APPLICATION_SIGNATURE_IMAGE_BASE64_CHUNKS ?? '', 10);
  if (!Number.isFinite(chunkCount) || chunkCount <= 0) return undefined;

  const chunks: string[] = [];
  for (let index = 0; index < chunkCount; index += 1) {
    const chunk = env[`APPLICATION_SIGNATURE_IMAGE_BASE64_${index}`]?.trim();
    if (!chunk) throw new Error(`Missing signature image chunk ${index}`);
    chunks.push(chunk);
  }

  return chunks.join('');
}

async function readPrivateSignatureImage(): Promise<Buffer> {
  const encodedSignature = getSignatureImageBase64();
  if (encodedSignature) return Buffer.from(encodedSignature, 'base64');

  const signaturePath =
    env.APPLICATION_SIGNATURE_PATH?.trim() ?? join(homedir(), '.produck-private', 'ttd_edward.png');
  return readFile(signaturePath);
}

function normalizeLatexText(value: string): string {
  return value
    .replace(/%[^\n\r]*/g, '')
    .replace(/\\href\{[^{}]*\}\{([^{}]*)\}/g, '$1')
    .replace(/\\textbackslash\{\}/g, '\\')
    .replace(/\\textasciicircum\{\}/g, '^')
    .replace(/\\textasciitilde\{\}/g, '~')
    .replace(/\\([{}%&$#_^~])/g, '$1')
    .replace(/\\\\(?:\[[^\]]*\])?/g, '\n')
    .replace(/\\par\b/g, '\n\n')
    .replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g, '$1')
    .replace(/\\textcolor\{[^{}]*\}\{([^{}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^{}]*\})?/g, '')
    .replace(/[{}]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function extractRecipient(latex: string): string {
  const match = latex.match(/\\textbf\{To\.\}\s*\\\\\s*([\s\S]*?)\s*\\end\{minipage\}/);
  const recipient = match ? normalizeLatexText(match[1]) : '';
  return recipient || 'Hiring Team';
}

function extractBody(latex: string): string[] {
  const match = latex.match(/\\setlength\{\\baselineskip\}\{14\.4pt\}\s*([\s\S]*?)\\par\}/);
  const body = match ? normalizeLatexText(match[1]) : normalizeLatexText(latex);
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : ['Cover letter body was empty.'];
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(page: PDFPage, text: string, options: DrawTextOptions): number {
  let y = options.y;
  const lines = wrapText(text, options.font, options.size, options.maxWidth);

  for (const line of lines) {
    page.drawText(line, {
      x: options.x,
      y,
      size: options.size,
      font: options.font,
      color: COLORS.ink
    });
    y -= options.lineHeight;
  }

  return y;
}

function estimateBodyHeight(paragraphs: string[], font: PDFFont, size: number, maxWidth: number) {
  return paragraphs.reduce((height, paragraph) => {
    return height + wrapText(paragraph, font, size, maxWidth).length * 14 + 11;
  }, 0);
}

function drawCoin(page: PDFPage, x: number, y: number, radius: number, opacity: number) {
  page.drawCircle({ x, y, size: radius, color: COLORS.coin, opacity });
  page.drawCircle({
    x,
    y,
    size: radius * 0.78,
    borderColor: COLORS.brand,
    borderWidth: 0.8,
    opacity: opacity + 0.12
  });
}

async function renderApplicationPdf(latex: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cvSourcePath = join(process.cwd(), 'static', 'assets', 'Edward_Salim_CV.pdf');
  const portraitSourcePath = join(process.cwd(), 'src', 'lib', 'assets', 'edward.jpg');
  const [cvBytes, portraitBytes, signatureBytes] = await Promise.all([
    readFile(cvSourcePath),
    readFile(portraitSourcePath),
    readPrivateSignatureImage()
  ]);

  const portrait = await pdf.embedJpg(portraitBytes);
  const signature = await pdf.embedPng(signatureBytes);
  const recipient = extractRecipient(latex);
  const paragraphs = extractBody(latex);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.pageBg });
  drawCoin(page, 26, PAGE_HEIGHT - 18, 54, 0.22);
  drawCoin(page, PAGE_WIDTH - 18, PAGE_HEIGHT - 210, 44, 0.2);
  drawCoin(page, 20, 44, 42, 0.18);
  drawCoin(page, PAGE_WIDTH - 48, 58, 22, 0.22);
  page.drawRectangle({
    x: PANEL_X,
    y: PANEL_Y,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    color: COLORS.panel
  });

  page.drawImage(portrait, { x: PAGE_MARGIN, y: PAGE_HEIGHT - 170, width: 96, height: 96 });
  page.drawText('Edward Salim, S.Kom', {
    x: PAGE_MARGIN + 124,
    y: PAGE_HEIGHT - 110,
    size: 24,
    font: bold,
    color: COLORS.ink
  });
  page.drawText('Building Fintech and AI Products', {
    x: PAGE_MARGIN + 124,
    y: PAGE_HEIGHT - 132,
    size: 11,
    font: sans,
    color: COLORS.muted
  });

  page.drawLine({
    start: { x: PAGE_MARGIN, y: PAGE_HEIGHT - 196 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_HEIGHT - 196 },
    thickness: 0.7,
    color: COLORS.line
  });

  page.drawText('To.', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 226,
    size: 12,
    font: bold,
    color: COLORS.ink
  });
  drawWrappedText(page, recipient, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 244,
    maxWidth: 250,
    font: regular,
    size: 11,
    lineHeight: 14
  });

  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
  page.drawText(date, {
    x: PAGE_WIDTH - PAGE_MARGIN - sans.widthOfTextAtSize(date, 10),
    y: PAGE_HEIGHT - 226,
    size: 10,
    font: sans,
    color: COLORS.muted
  });

  const bodySize =
    estimateBodyHeight(paragraphs, regular, 11.2, PANEL_WIDTH - 96) > 330 ? 10.3 : 11.2;
  let y = PAGE_HEIGHT - 292;
  for (const paragraph of paragraphs) {
    y = drawWrappedText(page, paragraph, {
      x: PAGE_MARGIN,
      y,
      maxWidth: PANEL_WIDTH - 96,
      font: regular,
      size: bodySize,
      lineHeight: bodySize + 3
    });
    y -= 10;
  }

  page.drawImage(signature, { x: PAGE_MARGIN, y: 126, width: 82, height: 36 });
  page.drawText('Edward Salim, S.Kom', {
    x: PAGE_MARGIN,
    y: 112,
    size: 11,
    font: bold,
    color: COLORS.ink
  });

  const contactX = PAGE_WIDTH - PAGE_MARGIN - 170;
  let contactY = 154;
  for (const line of [
    'Jakarta, Indonesia',
    getApplicationEmail(),
    getApplicationPhoneDisplay(),
    'linkedin.com/in/edward-salim'
  ]) {
    page.drawText(line, { x: contactX, y: contactY, size: 8.8, font: sansBold, color: COLORS.ink });
    contactY -= 15;
  }

  const cv = await PDFDocument.load(cvBytes);
  const cvPages = await pdf.copyPages(cv, cv.getPageIndices());
  for (const cvPage of cvPages) pdf.addPage(cvPage);

  return pdf.save();
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { latex, company, role } = (await request.json()) as {
    latex?: string;
    company?: string;
    role?: string;
  };
  const source = latex?.trim();
  if (!source) return json({ error: 'No LaTeX source provided' }, { status: 400 });
  if (source.length > 100000)
    return json(
      { error: 'LaTeX source is too long. Keep it under 100k characters.' },
      { status: 400 }
    );

  try {
    const pdf = await renderApplicationPdf(source);
    const filename = `Edward_Salim_Application_${safeFilename(company)}_${safeFilename(role)}.pdf`;

    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('Application PDF generation failed:', err);
    return json(
      {
        error:
          err instanceof Error ? `PDF generation failed: ${err.message}` : 'PDF generation failed'
      },
      { status: 500 }
    );
  }
};

import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import {
  clip,
  concatTransformationMatrix,
  endPath,
  PDFDocument,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  StandardFonts,
  PDFName,
  PDFString,
  rgb,
  type Color,
  type PDFImage,
  type PDFFont,
  type PDFPage
} from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { RequestHandler } from './$types.js';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PT = 72;
const CM = PT / 2.54;
const PANEL_X = 0.72 * PT;
const PANEL_Y = 0.62 * PT;
const PANEL_WIDTH = (7.78 - 0.72) * PT;
const PANEL_HEIGHT = (8.08 - 0.62) * PT;
const PANEL_RADIUS = 0.22 * PT;
const LETTER_X = 1.16 * PT;
const LETTER_WIDTH = 6.14 * PT;
const PORTRAIT_FRAME_X = 1.7 * PT;
const PORTRAIT_FRAME_TOP = PAGE_HEIGHT - 0.66 * PT;
const PORTRAIT_WIDTH = 1.48 * PT;
const PORTRAIT_TRIM_PX = 620;
const PORTRAIT_BORDER = 0.035 * PT;
const PORTRAIT_PADDING = 0.025 * PT;
const PORTRAIT_FRAME_INSET = PORTRAIT_BORDER + PORTRAIT_PADDING;
const SIGNATURE_WIDTH = 0.76 * PT;
const SIGNATURE_LABEL_Y = 158;
const SIGNATURE_Y = 92;
const CONTACT_X = LETTER_X + LETTER_WIDTH - 2.42 * PT;
const CONTACT_START_Y = SIGNATURE_LABEL_Y;
const BODY_FONT_SIZE = 11;
const BODY_COMPACT_FONT_SIZE = 10;
const BODY_LINE_HEIGHT = 14.4;
const BODY_COMPACT_LINE_HEIGHT = 13.6;
const CONTACT_FONT_SIZE = 10;

const COLORS = {
  pageBg: rgb(236 / 255, 229 / 255, 216 / 255),
  panel: rgb(1, 1, 1),
  brand: rgb(130 / 255, 95 / 255, 55 / 255),
  ink: rgb(42 / 255, 35 / 255, 26 / 255),
  muted: rgb(107 / 255, 94 / 255, 74 / 255),
  coin: rgb(151 / 255, 124 / 255, 73 / 255),
  coinRim: rgb(92 / 255, 75 / 255, 58 / 255),
  coinShine: rgb(221 / 255, 212 / 255, 194 / 255),
  line: rgb(205 / 255, 195 / 255, 174 / 255)
};

type DrawTextOptions = {
  x: number;
  y: number;
  maxWidth: number;
  font: PDFFont;
  size: number;
  lineHeight: number;
  justify?: boolean;
};

type FontAwesomeIconDefinition = {
  icon: [
    width: number,
    height: number,
    ligatures: unknown[],
    unicode: string,
    svgPathData: string | string[]
  ];
};

function safeFilename(value: string | undefined): string {
  const cleaned = (value ?? 'Company').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
  return cleaned || 'Company';
}

function getApplicationPhoneDisplay(): string {
  return env.APPLICATION_PHONE_DISPLAY?.trim() ?? 'Phone available on request';
}

function getApplicationPhoneUrl(): string {
  const configuredUrl = env.APPLICATION_PHONE_URL?.trim();
  if (configuredUrl) return configuredUrl;

  const digits = getApplicationPhoneDisplay().replace(/\D/g, '');
  if (digits.length >= 8) {
    const normalizedDigits = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    return `https://wa.me/${normalizedDigits}`;
  }

  return `mailto:${getApplicationEmail()}`;
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

function normalizePlainTextParagraphs(value: string): string[] {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

  return paragraphs;
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

  for (const [index, line] of lines.entries()) {
    const isLastLine = index === lines.length - 1;
    const lineWidth = options.font.widthOfTextAtSize(line, options.size);
    const words = line.split(/\s+/).filter(Boolean);
    const shouldJustify =
      options.justify && !isLastLine && words.length > 1 && lineWidth > options.maxWidth * 0.72;

    if (shouldJustify) {
      const normalSpaceWidth = options.font.widthOfTextAtSize(' ', options.size);
      const extraSpace = (options.maxWidth - lineWidth) / (words.length - 1);
      let x = options.x;

      for (const word of words) {
        page.drawText(word, {
          x,
          y,
          size: options.size,
          font: options.font,
          color: COLORS.ink
        });
        x += options.font.widthOfTextAtSize(word, options.size) + normalSpaceWidth + extraSpace;
      }
    } else {
      page.drawText(line, {
        x: options.x,
        y,
        size: options.size,
        font: options.font,
        color: COLORS.ink
      });
    }

    y -= options.lineHeight;
  }

  return y;
}

function estimateBodyHeight(
  paragraphs: string[],
  font: PDFFont,
  size: number,
  lineHeight: number,
  maxWidth: number
) {
  return paragraphs.reduce((height, paragraph) => {
    return height + wrapText(paragraph, font, size, maxWidth).length * lineHeight + 9.4;
  }, 0);
}

function drawRoundedPanel(page: PDFPage) {
  page.drawRectangle({
    x: PANEL_X + PANEL_RADIUS,
    y: PANEL_Y,
    width: PANEL_WIDTH - PANEL_RADIUS * 2,
    height: PANEL_HEIGHT,
    color: COLORS.panel
  });
  page.drawRectangle({
    x: PANEL_X,
    y: PANEL_Y + PANEL_RADIUS,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT - PANEL_RADIUS * 2,
    color: COLORS.panel
  });
  page.drawCircle({
    x: PANEL_X + PANEL_RADIUS,
    y: PANEL_Y + PANEL_RADIUS,
    size: PANEL_RADIUS,
    color: COLORS.panel
  });
  page.drawCircle({
    x: PANEL_X + PANEL_WIDTH - PANEL_RADIUS,
    y: PANEL_Y + PANEL_RADIUS,
    size: PANEL_RADIUS,
    color: COLORS.panel
  });
  page.drawCircle({
    x: PANEL_X + PANEL_RADIUS,
    y: PANEL_Y + PANEL_HEIGHT - PANEL_RADIUS,
    size: PANEL_RADIUS,
    color: COLORS.panel
  });
  page.drawCircle({
    x: PANEL_X + PANEL_WIDTH - PANEL_RADIUS,
    y: PANEL_Y + PANEL_HEIGHT - PANEL_RADIUS,
    size: PANEL_RADIUS,
    color: COLORS.panel
  });
}

function transformCoinPoint(
  originX: number,
  originY: number,
  scale: number,
  rotation: number,
  localX: number,
  localY: number
) {
  const radians = (rotation * Math.PI) / 180;
  const x = localX * CM * scale;
  const y = localY * CM * scale;

  return {
    x: originX + x * Math.cos(radians) - y * Math.sin(radians),
    y: originY + x * Math.sin(radians) + y * Math.cos(radians)
  };
}

function polygonPath(points: { x: number; y: number }[], flipY = false): string {
  return `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${flipY ? -point.y : point.y}`)
    .join(' ')} Z`;
}

function drawCoin(page: PDFPage, x: number, y: number, scale: number, rotation: number) {
  const point = (localX: number, localY: number) =>
    transformCoinPoint(x, y, scale, rotation, localX, localY);
  const radius = (value: number) => value * CM * scale;

  const shadow = point(0.08, -0.08);
  page.drawCircle({
    x: shadow.x,
    y: shadow.y,
    size: radius(1.04),
    color: COLORS.coinRim,
    opacity: 0.16
  });
  page.drawCircle({ x, y, size: radius(1), color: COLORS.coin, opacity: 0.34 });
  page.drawCircle({
    x,
    y,
    size: radius(0.96),
    borderColor: COLORS.coinRim,
    borderWidth: 1.6,
    borderOpacity: 0.48
  });
  page.drawCircle({
    x,
    y,
    size: radius(0.78),
    borderColor: COLORS.coinShine,
    borderWidth: 0.7,
    borderOpacity: 0.34
  });

  const square = [point(-0.22, -0.22), point(0.22, -0.22), point(0.22, 0.22), point(-0.22, 0.22)];
  const path = polygonPath(square, true);
  page.drawSvgPath(path, { color: COLORS.pageBg, opacity: 0.95 });
  page.drawSvgPath(path, {
    borderColor: COLORS.coinRim,
    borderWidth: 0.8,
    borderOpacity: 0.56
  });

  for (const [startX, startY, endX, endY] of [
    [-0.56, 0, -0.32, 0],
    [0.32, 0, 0.56, 0],
    [0, 0.32, 0, 0.56],
    [0, -0.32, 0, -0.56]
  ]) {
    const start = point(startX, startY);
    const end = point(endX, endY);
    page.drawLine({
      start,
      end,
      thickness: 0.65,
      color: COLORS.coinRim,
      opacity: 0.28
    });
  }
}

function drawImageClipped(
  page: PDFPage,
  image: PDFImage,
  clipBox: { x: number; y: number; width: number; height: number },
  imageBox: { x: number; y: number; width: number; height: number }
) {
  page.pushOperators(
    pushGraphicsState(),
    rectangle(clipBox.x, clipBox.y, clipBox.width, clipBox.height),
    clip(),
    endPath()
  );
  page.drawImage(image, imageBox);
  page.pushOperators(popGraphicsState());
}

function drawFontAwesomeIcon(
  page: PDFPage,
  icon: FontAwesomeIconDefinition,
  centerX: number,
  centerY: number,
  size: number,
  options: { color?: Color; flipX?: boolean } = {}
) {
  const [width, height, , , svgPathData] = icon.icon;
  const scale = size / Math.max(width, height);
  const left = centerX - (width * scale) / 2;
  const top = centerY + (height * scale) / 2;
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];

  if (options.flipX) {
    page.pushOperators(
      pushGraphicsState(),
      concatTransformationMatrix(-1, 0, 0, 1, centerX * 2, 0)
    );
  }

  for (const path of paths) {
    page.drawSvgPath(path, {
      x: left,
      y: top,
      scale,
      color: options.color ?? COLORS.brand,
      opacity: 1
    });
  }

  if (options.flipX) {
    page.pushOperators(popGraphicsState());
  }
}

function addUriAnnotation(
  page: PDFPage,
  url: string | undefined,
  rect: { x: number; y: number; width: number; height: number }
) {
  if (!url) return;

  const annotation = page.doc.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
    Border: [0, 0, 0],
    A: {
      Type: PDFName.of('Action'),
      S: PDFName.of('URI'),
      URI: PDFString.of(url)
    }
  });
  page.node.addAnnot(page.doc.context.register(annotation));
}

async function renderApplicationPdf(recipient: string, plainText: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const cvSourcePath = join(process.cwd(), 'static', 'assets', 'Edward_Salim_CV.pdf');
  const portraitSourcePath = join(process.cwd(), 'src', 'lib', 'assets', 'edward.jpg');
  const [cvBytes, portraitBytes, signatureBytes] = await Promise.all([
    readFile(cvSourcePath),
    readFile(portraitSourcePath),
    readPrivateSignatureImage()
  ]);

  const portrait = await pdf.embedJpg(portraitBytes);
  const signature = await pdf.embedPng(signatureBytes);
  const paragraphs = normalizePlainTextParagraphs(plainText);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.pageBg });
  drawCoin(page, 0, PAGE_HEIGHT - 0.08 * PT, 2.1, -10);
  drawCoin(page, 1.06 * PT, PAGE_HEIGHT - 0.58 * PT, 0.56, 18);
  drawCoin(page, PAGE_WIDTH - 0.92 * PT, PAGE_HEIGHT - 0.28 * PT, 0.42, 32);
  drawCoin(page, PAGE_WIDTH + 0.75 * PT, PAGE_HEIGHT - 3.4 * PT, 1.62, 14);
  drawCoin(page, PAGE_WIDTH - 0.26 * PT, PAGE_HEIGHT - 2.3 * PT, 0.52, -18);
  drawCoin(page, 0.05 * PT, 0.15 * PT, 1.55, -18);
  drawCoin(page, 1.05 * PT, 0.42 * PT, 0.5, 12);
  drawCoin(page, PAGE_WIDTH - 0.52 * PT, 0.44 * PT, 0.48, 17);
  drawRoundedPanel(page);

  const portraitRenderedHeight = (portrait.height / portrait.width) * PORTRAIT_WIDTH;
  const portraitTrim = (PORTRAIT_TRIM_PX / portrait.width) * PORTRAIT_WIDTH;
  const portraitClippedHeight = portraitRenderedHeight - portraitTrim * 2;
  const portraitFrameWidth = PORTRAIT_WIDTH + PORTRAIT_FRAME_INSET * 2;
  const portraitFrameHeight = portraitClippedHeight + PORTRAIT_FRAME_INSET * 2;
  const portraitFrameY = PORTRAIT_FRAME_TOP - portraitFrameHeight;
  const portraitX = PORTRAIT_FRAME_X + PORTRAIT_FRAME_INSET;
  const portraitY = portraitFrameY + PORTRAIT_FRAME_INSET;

  page.drawRectangle({
    x: PORTRAIT_FRAME_X,
    y: portraitFrameY,
    width: portraitFrameWidth,
    height: portraitFrameHeight,
    color: COLORS.panel
  });
  drawImageClipped(
    page,
    portrait,
    { x: portraitX, y: portraitY, width: PORTRAIT_WIDTH, height: portraitClippedHeight },
    {
      x: portraitX,
      y: portraitY - portraitTrim,
      width: PORTRAIT_WIDTH,
      height: portraitRenderedHeight
    }
  );
  page.drawText('Edward Salim, S.Kom', {
    x: PORTRAIT_FRAME_X + 1.52 * PT + 0.38 * PT,
    y: portraitFrameY + portraitFrameHeight / 2 + 8,
    size: 24,
    font: bold,
    color: COLORS.ink
  });
  page.drawText('Building Fintech and AI Products', {
    x: PORTRAIT_FRAME_X + 1.52 * PT + 0.38 * PT,
    y: portraitFrameY + portraitFrameHeight / 2 - 14,
    size: 12,
    font: regular,
    color: COLORS.muted
  });

  page.drawText('To.', {
    x: LETTER_X,
    y: 545,
    size: 12,
    font: bold,
    color: COLORS.ink
  });
  drawWrappedText(page, recipient, {
    x: LETTER_X,
    y: 527,
    maxWidth: 250,
    font: regular,
    size: 11,
    lineHeight: 14
  });

  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
  page.drawText(date, {
    x: LETTER_X + LETTER_WIDTH - regular.widthOfTextAtSize(date, 10),
    y: 545,
    size: 10,
    font: regular,
    color: COLORS.muted
  });

  const bodyHeight = estimateBodyHeight(
    paragraphs,
    regular,
    BODY_FONT_SIZE,
    BODY_LINE_HEIGHT,
    LETTER_WIDTH
  );
  const bodySize = bodyHeight > 315 ? BODY_COMPACT_FONT_SIZE : BODY_FONT_SIZE;
  const bodyLineHeight = bodyHeight > 315 ? BODY_COMPACT_LINE_HEIGHT : BODY_LINE_HEIGHT;
  let y = 488;
  for (const paragraph of paragraphs) {
    y = drawWrappedText(page, paragraph, {
      x: LETTER_X,
      y,
      maxWidth: LETTER_WIDTH,
      font: regular,
      size: bodySize,
      lineHeight: bodyLineHeight,
      justify: true
    });
    y -= 9.4;
  }

  page.drawText('Sincerely,', {
    x: LETTER_X,
    y: SIGNATURE_LABEL_Y,
    size: 11,
    font: regular,
    color: COLORS.ink
  });

  const signatureHeight = signature.height * (SIGNATURE_WIDTH / signature.width);
  page.drawImage(signature, {
    x: LETTER_X,
    y: SIGNATURE_Y,
    width: SIGNATURE_WIDTH,
    height: signatureHeight
  });

  const contactX = CONTACT_X;
  let contactY = CONTACT_START_Y;
  for (const [icon, line, url] of [
    [faMapMarkerAlt, 'Jakarta, Indonesia', undefined],
    [faEnvelope, getApplicationEmail(), `mailto:${getApplicationEmail()}`],
    [faPhoneAlt, getApplicationPhoneDisplay(), getApplicationPhoneUrl()],
    [faLinkedin, 'linkedin.com/in/edward-salim', 'http://linkedin.com/in/edward-salim']
  ] as const) {
    const isLinked = Boolean(url);
    const rowColor = isLinked ? COLORS.brand : COLORS.ink;
    drawFontAwesomeIcon(page, icon, contactX - 10, contactY + 3.1, 9.4, {
      color: rowColor,
      flipX: icon === faPhoneAlt
    });
    page.drawText(line, {
      x: contactX,
      y: contactY,
      size: CONTACT_FONT_SIZE,
      font: regular,
      color: rowColor
    });
    addUriAnnotation(page, url, {
      x: contactX - 18,
      y: contactY - 2,
      width: 18 + regular.widthOfTextAtSize(line, CONTACT_FONT_SIZE),
      height: 12
    });
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

  const { recipient, plainText, company, role } = (await request.json()) as {
    recipient?: string;
    plainText?: string;
    company?: string;
    role?: string;
  };
  const recipientText = recipient?.trim() || 'Hiring Team';
  const bodyText = plainText?.trim();
  if (!bodyText) return json({ error: 'No cover letter content provided' }, { status: 400 });
  if (bodyText.length > 40000)
    return json(
      { error: 'Cover letter content is too long. Keep it under 40k characters.' },
      { status: 400 }
    );

  try {
    const pdf = await renderApplicationPdf(recipientText, bodyText);
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

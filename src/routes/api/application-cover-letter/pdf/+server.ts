import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { compile } from 'node-latex-compiler';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import type { RequestHandler } from './$types.js';

const TIKZ_PACKAGE_PATTERN = /\\usepackage(?:\[[^\]]*\])?\{tikz\}/;
const XCOLOR_PACKAGE_PATTERN = /\\usepackage(?:\[[^\]]*\])?\{xcolor\}/;
const TIKZ_CALC_LIBRARY_PATTERN = /\\usetikzlibrary\{[^}]*\bcalc\b[^}]*\}/;
const TIKZ_CALC_COORDINATE_PATTERN = /\$\([^;\r\n]+\)\$/;

const COIN_STYLE_DEFINITION = String.raw`\definecolor{pagebg}{RGB}{236, 229, 216}
\definecolor{coinbase}{RGB}{151, 124, 73}
\definecolor{coinrim}{RGB}{92, 75, 58}
\definecolor{coinshine}{RGB}{221, 212, 194}

\tikzset{
  coin/.pic={
    \fill[coinrim, opacity=0.16] (0.08,-0.08) circle (1.04);
    \fill[coinbase, opacity=0.34] (0,0) circle (1);
    \draw[coinrim, opacity=0.48, line width=1.6pt] (0,0) circle (0.96);
    \draw[coinshine, opacity=0.34, line width=0.7pt] (0,0) circle (0.78);
    \fill[pagebg, opacity=0.95] (-0.22,-0.22) rectangle (0.22,0.22);
    \draw[coinrim, opacity=0.56, line width=0.8pt] (-0.22,-0.22) rectangle (0.22,0.22);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (-0.56,0.00) -- (-0.32,0.00);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.32,0.00) -- (0.56,0.00);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.00,0.32) -- (0.00,0.56);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.00,-0.32) -- (0.00,-0.56);
  }
}`;

function insertBeforeDocument(document: string, snippet: string): string {
  return document.replace('\\begin{document}', `${snippet}\n\n\\begin{document}`);
}

function insertAfterFirstMatch(document: string, pattern: RegExp, snippet: string): string {
  return document.replace(pattern, (match) => `${match}\n${snippet}`);
}

function safeFilename(value: string | undefined): string {
  const cleaned = (value ?? 'Company').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '');
  return cleaned || 'Company';
}

function escapeLatexText(text: string): string {
  return text.replace(/[\\{}%&$#_^~]/g, (char) => {
    switch (char) {
      case '\\':
        return String.raw`\textbackslash{}`;
      case '{':
        return String.raw`\{`;
      case '}':
        return String.raw`\}`;
      case '%':
        return String.raw`\%`;
      case '&':
        return String.raw`\&`;
      case '$':
        return String.raw`\$`;
      case '#':
        return String.raw`\#`;
      case '_':
        return String.raw`\_`;
      case '^':
        return String.raw`\textasciicircum{}`;
      case '~':
        return String.raw`\textasciitilde{}`;
      default:
        return char;
    }
  });
}

function getApplicationPhoneDisplay(): string {
  return env.APPLICATION_PHONE_DISPLAY?.trim() ?? 'Phone available on request';
}

function getApplicationPhoneUrl(): string {
  return env.APPLICATION_PHONE_URL?.trim() ?? `mailto:${getApplicationEmail()}`;
}

function getApplicationEmail(): string {
  return env.APPLICATION_EMAIL?.trim() ?? 'email@example.com';
}

function hydratePrivateContactLatex(latex: string): string {
  return latex
    .replaceAll('CONTACT_EMAIL', escapeLatexText(getApplicationEmail()))
    .replaceAll('CONTACT_PHONE_URL', getApplicationPhoneUrl())
    .replaceAll('CONTACT_PHONE_DISPLAY', escapeLatexText(getApplicationPhoneDisplay()));
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

function normalizeCoverLetterLatex(latex: string): string {
  let document = hydratePrivateContactLatex(latex).replace(
    /^(\s*)\\drawcoin\{([^{}]+)\}\{([^{}]+)\}\{([^{}]+)\};?\s*$/gm,
    '$1\\pic[scale=$3, rotate=$4] at $2 {coin};'
  );

  document = document.replace(
    /^(\s*)\\(?:pic|node|draw|path)(\[[^\]]*\])?\s+(?:at\s*)?(\([^;\r\n]+\))\s*\{coin\};?\s*$/gm,
    '$1\\pic$2 at $3 {coin};'
  );

  if (document.includes('\\begin{tikzpicture}') && !TIKZ_PACKAGE_PATTERN.test(document)) {
    document = insertBeforeDocument(document, String.raw`\usepackage{tikz}`);
  }

  if (TIKZ_CALC_COORDINATE_PATTERN.test(document) && !TIKZ_CALC_LIBRARY_PATTERN.test(document)) {
    document = TIKZ_PACKAGE_PATTERN.test(document)
      ? insertAfterFirstMatch(document, TIKZ_PACKAGE_PATTERN, String.raw`\usetikzlibrary{calc}`)
      : insertBeforeDocument(document, String.raw`\usetikzlibrary{calc}`);
  }

  if (document.includes('{coin};') && !document.includes('coin/.pic')) {
    if (!XCOLOR_PACKAGE_PATTERN.test(document)) {
      document = TIKZ_PACKAGE_PATTERN.test(document)
        ? document.replace(
            TIKZ_PACKAGE_PATTERN,
            (match) => String.raw`\usepackage{xcolor}` + `\n${match}`
          )
        : insertBeforeDocument(document, String.raw`\usepackage{xcolor}`);
    }

    document = document.includes('\\pdfgentounicode=1')
      ? document.replace('\\pdfgentounicode=1', `\\pdfgentounicode=1\n\n${COIN_STYLE_DEFINITION}`)
      : insertBeforeDocument(document, COIN_STYLE_DEFINITION);
  }

  return document;
}

function appendCvToLatex(latex: string): string {
  let document = normalizeCoverLetterLatex(latex.trim());

  if (!document.includes('\\begin{document}') || !document.includes('\\end{document}')) {
    throw new Error('LaTeX must include \\begin{document} and \\end{document}');
  }

  if (!document.includes('\\usepackage{pdfpages}')) {
    document = document.replace('\\begin{document}', '\\usepackage{pdfpages}\n\n\\begin{document}');
  }

  return document.replace(
    '\\end{document}',
    String.raw`\clearpage
\pagecolor{white}
\includepdf[pages=-]{Edward_Salim_CV.pdf}

\end{document}`
  );
}

function getLatexCompilerError(result: Awaited<ReturnType<typeof compile>>): string {
  return (
    result.error ||
    result.stderr?.slice(-4000) ||
    result.stdout?.slice(-4000) ||
    'LaTeX compiler returned an unknown error'
  );
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

  const tempDir = join(tmpdir(), `produck-application-${randomUUID()}`);
  const texPath = join(tempDir, 'application.tex');
  const pdfPath = join(tempDir, 'application.pdf');
  const logPath = join(tempDir, 'application.log');
  const cvSourcePath = join(process.cwd(), 'static', 'assets', 'Edward_Salim_CV.pdf');
  const cvTempPath = join(tempDir, 'Edward_Salim_CV.pdf');
  const portraitSourcePath = join(process.cwd(), 'src', 'lib', 'assets', 'edward.jpg');
  const portraitTempPath = join(tempDir, 'Edward_Salim.jpg');
  const signatureTempPath = join(tempDir, 'ttd_edward.png');

  try {
    await mkdir(tempDir, { recursive: true });
    await copyFile(cvSourcePath, cvTempPath);
    await copyFile(portraitSourcePath, portraitTempPath);
    await writeFile(signatureTempPath, await readPrivateSignatureImage());
    await writeFile(texPath, appendCvToLatex(source), 'utf8');

    const compilerResult = await compile({
      texFile: texPath,
      outputDir: tempDir,
      outputFile: pdfPath
    });
    if (compilerResult.status !== 'success') {
      throw new Error(getLatexCompilerError(compilerResult));
    }

    const pdf = await readFile(pdfPath);
    const filename = `Edward_Salim_Application_${safeFilename(company)}_${safeFilename(role)}.pdf`;

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    const log = await readFile(logPath, 'utf8').catch(() => '');
    console.error('Application PDF compilation failed:', err, log.slice(-4000));
    return json(
      {
        error:
          err instanceof Error ? `PDF compilation failed: ${err.message}` : 'PDF compilation failed'
      },
      { status: 500 }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
};

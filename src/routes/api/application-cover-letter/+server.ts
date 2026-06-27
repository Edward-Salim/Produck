import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import {
  APPLICATION_COVER_LETTER_SYSTEM_PROMPT,
  buildApplicationCoverLetterPrompt
} from '$lib/application-cover-letter-prompt.js';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

function getGeminiClient(): GoogleGenAI {
  const keys = (env.GEMINI_API_KEYS ?? '').split(',').filter(Boolean);
  if (keys.length === 0) throw new Error('No Gemini API keys configured');
  const key = keys[Math.floor(Date.now() / 1000) % keys.length];
  return new GoogleGenAI({ apiKey: key });
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function normalizeGeneratedPlainText(text: string): string {
  return text
    .replace(/[—–]/g, ', ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[ \t]+,/g, ',')
    .replace(/,(\p{L})/gu, ', $1')
    .replace(/[ \t]{2,}/g, ' ');
}

async function generateWithDeepSeek(prompt: string): Promise<string> {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No DeepSeek API key configured');

  const model = env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro';
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: APPLICATION_COVER_LETTER_SYSTEM_PROMPT
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) throw new Error(`DeepSeek API ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('DeepSeek returned empty content');
  return text;
}

async function generateWithGemini(prompt: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  });

  return response.text ?? '';
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { dump } = (await request.json()) as { dump?: string };
  const input = dump?.trim();
  if (!input)
    return json({ error: 'Paste a job post or application brief first' }, { status: 400 });
  if (input.length > 40000)
    return json({ error: 'Input is too long. Keep it under 40k characters.' }, { status: 400 });

  try {
    const prompt = buildApplicationCoverLetterPrompt(input);
    let model = env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
    let generated: string;

    try {
      generated = await generateWithDeepSeek(prompt);
    } catch (deepseekErr) {
      console.warn('DeepSeek cover letter generation failed, falling back to Gemini:', deepseekErr);
      generated = await generateWithGemini(prompt);
      model = 'gemini-2.5-flash';
    }

    const raw = stripFences(generated);
    const parsed = JSON.parse(raw) as {
      company: string;
      role: string;
      recipient: string;
      companyTag: string;
      plainText: string;
    };

    return json({
      company: parsed.company,
      role: parsed.role,
      recipient: parsed.recipient,
      companyTag: parsed.companyTag,
      plainText: normalizeGeneratedPlainText(parsed.plainText),
      model
    });
  } catch (err) {
    console.error('Application cover letter generation failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Cover letter generation failed' },
      { status: 500 }
    );
  }
};

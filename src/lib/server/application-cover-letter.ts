import { GoogleGenAI } from '@google/genai';
import {
  APPLICATION_COVER_LETTER_SYSTEM_PROMPT,
  buildApplicationCoverLetterPrompt,
  buildLinkedInMessagesPrompt
} from '../application-cover-letter-prompt.js';

type ApplicationEnv = {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  GEMINI_API_KEYS?: string;
};

export type GeneratedApplicationCoverLetter = {
  company: string;
  role: string;
  recipient: string;
  companyTag: string;
  plainText: string;
  model: string;
  linkedinMessages: LinkedInMessage[];
};

export type LinkedInMessage = {
  label: string;
  useCase: string;
  text: string;
};

function getGeminiClient(env: ApplicationEnv): GoogleGenAI {
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

async function generateWithDeepSeek(
  env: ApplicationEnv,
  prompt: string,
  modelOverride?: string
): Promise<string> {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No DeepSeek API key configured');

  const model = modelOverride ?? env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro';
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

async function generateWithGemini(env: ApplicationEnv, prompt: string): Promise<string> {
  const ai = getGeminiClient(env);
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

function normalizeLinkedInMessages(value: unknown): LinkedInMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((message) => {
      if (!message || typeof message !== 'object') return null;
      const candidate = message as Partial<LinkedInMessage>;
      if (
        typeof candidate.label !== 'string' ||
        typeof candidate.useCase !== 'string' ||
        typeof candidate.text !== 'string'
      ) {
        return null;
      }

      return {
        label: candidate.label.trim(),
        useCase: candidate.useCase.trim(),
        text: candidate.text.trim()
      };
    })
    .filter((message): message is LinkedInMessage => Boolean(message?.label && message.text))
    .slice(0, 3);
}

async function generateLinkedInMessages(
  env: ApplicationEnv,
  input: string,
  application: { company: string; role: string }
): Promise<LinkedInMessage[]> {
  const prompt = buildLinkedInMessagesPrompt(input, application);
  const generated = await generateWithDeepSeek(env, prompt, 'deepseek-v4-flash');
  const parsed = JSON.parse(stripFences(generated)) as { messages?: unknown };
  return normalizeLinkedInMessages(parsed.messages);
}

export async function generateApplicationCoverLetter(
  env: ApplicationEnv,
  input: string
): Promise<GeneratedApplicationCoverLetter> {
  const prompt = buildApplicationCoverLetterPrompt(input);
  let model = env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
  let generated: string;

  try {
    generated = await generateWithDeepSeek(env, prompt);
  } catch (deepseekErr) {
    console.warn('DeepSeek cover letter generation failed, falling back to Gemini:', deepseekErr);
    generated = await generateWithGemini(env, prompt);
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

  let linkedinMessages: LinkedInMessage[] = [];
  try {
    linkedinMessages = await generateLinkedInMessages(env, input, {
      company: parsed.company,
      role: parsed.role
    });
  } catch (err) {
    console.warn('LinkedIn message generation failed:', err);
  }

  return {
    company: parsed.company,
    role: parsed.role,
    recipient: parsed.recipient,
    companyTag: parsed.companyTag,
    plainText: normalizeGeneratedPlainText(parsed.plainText),
    model,
    linkedinMessages
  };
}

export function getApplicationJobSecret(env: {
  APPLICATION_JOB_SECRET?: string;
  DATABASE_URL?: string;
}) {
  return env.APPLICATION_JOB_SECRET || env.DATABASE_URL || '';
}

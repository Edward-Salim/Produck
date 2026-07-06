import {
  APPLICATION_COVER_LETTER_SYSTEM_PROMPT,
  buildApplicationCoverLetterPrompt,
  buildLinkedInMessagesPrompt
} from '../application-cover-letter-prompt.js';

type ApplicationEnv = {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
};

const COVER_LETTER_PROVIDER_TIMEOUT_MS = 5 * 60 * 1000;
const LINKEDIN_MESSAGE_TIMEOUT_MS = 90 * 1000;

export type GeneratedApplicationCoverLetter = {
  company: string;
  role: string;
  recipient: string;
  companyTag: string;
  plainText: string;
  model: string;
};

export type LinkedInMessage = {
  label: string;
  useCase: string;
  text: string;
};

export type LinkedInAssets = {
  skills: string;
  messages: LinkedInMessage[];
};

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
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?=\p{L}|\p{N})/gu, '$1 ')
    .replace(/('s)(?=\p{L}|\p{N})/giu, '$1 ')
    .replace(/[ \t]{2,}/g, ' ');
}

async function generateWithDeepSeek(
  env: ApplicationEnv,
  prompt: string,
  modelOverride?: string,
  timeoutMs = COVER_LETTER_PROVIDER_TIMEOUT_MS
): Promise<string> {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No DeepSeek API key configured');

  const model = modelOverride ?? env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: APPLICATION_COVER_LETTER_SYSTEM_PROMPT
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `DeepSeek generation timed out after ${Math.round(timeoutMs / 1000)} seconds`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`DeepSeek API ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('DeepSeek returned empty content');
  return text;
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
    .slice(0, 1);
}

function normalizeSkillKeywords(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 18)
    .join(', ');
}

function extractJsonObject(text: string): string {
  const raw = stripFences(text);
  const direct = raw.trim();
  if (direct.startsWith('{') && direct.endsWith('}')) return direct;

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) return raw.slice(start, index + 1);
    }
  }

  return direct;
}

function parseGeneratedJson<T>(text: string, label: string): T {
  try {
    return JSON.parse(extractJsonObject(text)) as T;
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'invalid JSON';
    throw new Error(`${label} returned malformed JSON: ${detail}`);
  }
}

function parseCoverLetterJson(text: string) {
  const parsed = parseGeneratedJson<{
    company?: unknown;
    role?: unknown;
    recipient?: unknown;
    companyTag?: unknown;
    plainText?: unknown;
  }>(text, 'Cover letter generator');

  if (
    typeof parsed.company !== 'string' ||
    typeof parsed.role !== 'string' ||
    typeof parsed.recipient !== 'string' ||
    typeof parsed.companyTag !== 'string' ||
    typeof parsed.plainText !== 'string'
  ) {
    throw new Error('Cover letter generator returned incomplete JSON');
  }

  return {
    company: parsed.company.trim(),
    role: parsed.role.trim(),
    recipient: parsed.recipient.trim(),
    companyTag: parsed.companyTag.trim(),
    plainText: parsed.plainText.trim()
  };
}

export async function generateLinkedInMessages(
  env: ApplicationEnv,
  input: string,
  application: { company: string; role: string }
): Promise<LinkedInAssets> {
  const prompt = buildLinkedInMessagesPrompt(input, application);
  const generated = await generateWithDeepSeek(
    env,
    prompt,
    'deepseek-v4-flash',
    LINKEDIN_MESSAGE_TIMEOUT_MS
  );
  const parsed = parseGeneratedJson<{ skills?: unknown; messages?: unknown }>(
    generated,
    'LinkedIn message generator'
  );
  return {
    skills: normalizeSkillKeywords(parsed.skills),
    messages: normalizeLinkedInMessages(parsed.messages)
  };
}

export async function generateApplicationCoverLetter(
  env: ApplicationEnv,
  input: string
): Promise<GeneratedApplicationCoverLetter> {
  const prompt = buildApplicationCoverLetterPrompt(input);
  const model = env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
  const generated = await generateWithDeepSeek(env, prompt);
  const parsed = parseCoverLetterJson(generated);

  return {
    company: parsed.company,
    role: parsed.role,
    recipient: parsed.recipient,
    companyTag: parsed.companyTag,
    plainText: normalizeGeneratedPlainText(parsed.plainText),
    model
  };
}

export function getApplicationJobSecret(env: {
  APPLICATION_JOB_SECRET?: string;
  DATABASE_URL?: string;
}) {
  return env.APPLICATION_JOB_SECRET || env.DATABASE_URL || '';
}

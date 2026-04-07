import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

function getClient(): GoogleGenAI {
  const keys = (env.GEMINI_API_KEYS ?? '').split(',').filter(Boolean);
  if (keys.length === 0) throw new Error('No Gemini API keys configured');
  // Rotate keys based on current second
  const key = keys[Math.floor(Date.now() / 1000) % keys.length];
  return new GoogleGenAI({ apiKey: key });
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // Admin only
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { instruction, currentJson, projectInfo, activeSection } = await request.json();
  if (!instruction || !currentJson) {
    return json({ error: 'Missing instruction or currentJson' }, { status: 400 });
  }

  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a JSON data editor for Produck, a product management tool for PM students. You modify JSON data structures and return ONLY the modified JSON.

## Data Model Reference

### Project
- id (int), workspaceId (int), name, shortName, levels (int, default 2)

### Actors (who uses the product)
- id (int), projectId (int), emoji (single emoji), label (role name), sortOrder (int)

### Activities (top-level groupings in story map)
- id (int), projectId (int), code (e.g. "A1", "A2"), title, actorEmojis (string[]), sortOrder (int)

### Story Map Tasks (sub-groupings under activities)
- id (int), activityId (int FK→activity), code (e.g. "T1.1"), title, sortOrder (int)

### Stories (user stories under tasks or activities)
- id (int), activityId (int FK→activity), taskId (int|null FK→storyMapTask), code (e.g. "S1", "S2")
- title, pic (person-in-charge name), picColor ("c1"-"c6"), done (boolean)
- kano: "must-have" | "performance" | "delighter"
- asA (persona), wantTo (action), soThat (benefit) — Connextra format
- pains (string[]), gains (string[]), details (string[] — acceptance criteria)
- checkedAcs: {index: number, checkedAt: ISO string}[]
- assumptions: {id (e.g. "S1-d1"), type: "desirability"|"feasibility"|"usability"|"viability", assumption, rationale, testMethod, successCriteria, actualResults, status: "untested"|"validated"|"revalidate"|"invalidated", lastTested: ISO|null, importance: 1-10, evidence: 1-10}[]
- sortOrder (int)

### Experience Phases (horizontal phases in experience map)
- id (int), projectId (int), title, actorEmojis (string[]), sortOrder (int)

### Experience Steps (sub-steps within a phase)
- id (int), phaseId (int FK→experiencePhase), title, sortOrder (int)

### Experience Touchpoints (individual moments within steps)
- id (int), stepId (int FK→experienceStep), title
- asA, wantTo, soThat — Connextra format
- pains (string[]), gains (string[]) — what hurts vs what delights
- pic (person name), picColor ("c1"-"c6"), sortOrder (int)

### Ideas
- id (int), workspaceId (int), projectId (int|null), title, description
- status: "triage" | "candidate" | "working-set" | "released" | "parked"
- proposer (name with @ prefix), okrCode (e.g. "KR-1.1"), createdAt, updatedAt

### Business Outcomes (yearly goals)
- id (int), projectId (int), year (int), code (e.g. "BO-1"), title, description
- metrics (string[] — measurable targets)

### Product Objectives (quarterly OKRs)
- id (int), projectId (int), year (int), quarter (1-4), code (e.g. "PO-1"), title, sortOrder (int)

### Key Results (under objectives)
- id (int), objectiveId (int FK→productObjective), code (e.g. "KR-1.1")
- description, target (human readable), targetValue (int), currentValue (int)
- unit (e.g. "page", "%", "users", "min"), carriedFrom (string|null), lastUpdated (date string)

### Personas
- id (int), projectId (int), name, role, avatarUrl, jobDescription
- companyName, companySize, industry, age, gender, income, educationLevel, residentialEnvironment
- quote, biography, goals (string[]), challenges (string[]), motivators (string[]), infoSources (string[])
- sortOrder (int)

### Interview Snapshots
- id (int), projectId (int), personName, personRole, personPhoto
- interviewDate (date string), quote (memorable quote)
- quickFacts (string[]), insights (string[]), opportunities (string[])
- transcript (full text)

## Conventions
- Codes are sequential: A1, A2, A3... for activities; S1, S2... for stories; PO-1, PO-2... for objectives
- Assumption IDs follow pattern: "{storyCode}-{typeInitial}{number}" e.g. "S1-d1", "S2-f1"
- PIC colors are "c1" through "c6"
- sortOrder starts at 0 and increments by 1
- Pains describe frustrations/problems, gains describe benefits/delights
- Kano: must-have = basic needs, performance = competitive, delighter = unexpected joy
- Language: project content is in Indonesian (Bahasa), field names are English

## Rules
- Return ONLY the modified JSON, no explanation, no markdown fences, no extra text
- Preserve exact structure and field names
- Keep existing IDs unchanged unless adding new items
- For new items, increment from the highest existing ID
- Maintain referential integrity (foreign keys must point to valid IDs)
- Match existing naming conventions and patterns in the data

${projectInfo ? `Project: ${projectInfo}\nEditing section: ${activeSection}\n\n` : ''}Current JSON:
${currentJson}

Instruction: ${instruction}`
            }
          ]
        }
      ]
    });

    const text = response.text?.trim() ?? '';

    // Strip markdown fences if the model included them
    let cleaned = text;
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Validate it's valid JSON
    JSON.parse(cleaned);

    return json({ result: cleaned });
  } catch (err) {
    console.error('Gemini API error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'AI processing failed' },
      { status: 500 }
    );
  }
};

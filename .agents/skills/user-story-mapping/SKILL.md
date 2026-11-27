---
name: user-story-mapping
description: Create or refine source-grounded user story maps in Produck using an activity, task, and story structure.
---

# User story mapping

## Procedure

1. Read the source and define one end-to-end journey. Keep facts separate from assumptions and open questions.
2. Use **Ongoing Screening** as the reference for flow and detail; adapt it to the source.
3. Keep tasks broader than their atomic stories. Group related story cards under a task instead of creating one task per story; avoid a repeated one-task/one-story column pattern. Before saving, inspect the task-to-story distribution and merge or reframe related singleton tasks so the story layer is visibly richer than the task layer. Keep a singleton task only when its outcome is genuinely distinct and cannot be grouped without blurring the journey. Do not merge stories that differ by actor, trigger, or outcome just to improve the ratio.
4. Check existing project maps first. Reuse one concise name and emoji for each recurring actor, and keep tool and status terms consistent. Give each story one canonical actor; do not join alternative roles with “or” or a slash. Choose the best-supported role and put any remaining uncertainty in Details as an assumption or open question. If maps conflict, choose a source-backed canonical form and flag the mismatch.
5. Write stories as “As a [role], I want [action], so that [outcome].” Above each green activity, show only actors from its yellow stories, ordered left to right by their first appearance in those stories.
6. Give stories a short map prefix and two-digit sequence, such as `OS-01`, `PR-01`, or `SMB-01`. Keep numbering out of titles.
7. Capture only current, source-backed workflow friction as a pain point; keep requested features and solutions separate. Add `Pain point: ...` to the affected story's Details and mark that story as a pain point. Keep each point atomic and concise, with no terminal period. Do not create a separate pain-point task or card.
8. Check for duplicates. Merge cards with the same actor, action, and outcome; keep similar cards separate only when their actor, trigger, or outcome differs.
9. Use a plain process title; avoid “Team Flow” and bracketed labels such as `[MVP]`. Review coverage and open questions, then save a new map in the correct project while preserving existing maps unless asked to remove them.
10. Add concise, map-specific terms in the map's Terminology field. Define unfamiliar acronyms in plain language; omit generic map vocabulary and unsupported expansions.

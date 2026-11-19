type FrameworkIdentity = { id: string; templateId: string };

export const PROJECT_BRIEF_TEMPLATE_ID = 'custom-artifact';

export function isRepeatableFramework(templateId: string): boolean {
  return templateId === 'story-map' || templateId === PROJECT_BRIEF_TEMPLATE_ID;
}

export function isReadOnlyFramework(templateId: string): boolean {
  return templateId === 'stakeholder-map' || templateId === PROJECT_BRIEF_TEMPLATE_ID;
}

export function dedupeFrameworkInstances<T extends FrameworkIdentity>(
  instances: readonly T[]
): T[] {
  return [
    ...new Map(
      instances.map((instance) => [
        isRepeatableFramework(instance.templateId)
          ? `instance:${instance.id}`
          : `template:${instance.templateId}`,
        instance
      ])
    ).values()
  ];
}

export function frameworkSelectionKey(instance: FrameworkIdentity): string {
  return isRepeatableFramework(instance.templateId) ? instance.id : instance.templateId;
}

export function findFrameworkInstance<T extends FrameworkIdentity>(
  instances: readonly T[],
  selection: string | null
): T | undefined {
  if (!selection) return undefined;
  return (
    instances.find((instance) => instance.id === selection) ??
    instances.find((instance) => instance.templateId === selection)
  );
}

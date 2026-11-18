type FrameworkIdentity = { id: string; templateId: string };

export function isRepeatableFramework(templateId: string): boolean {
  return templateId === 'story-map';
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

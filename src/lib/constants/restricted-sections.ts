const sectionRoutes = {
  'financial-tracker': ['/(app)/financial-tracker', '/api/financial-tracker'],
  trends: ['/(app)/trends', '/api/rss']
};

export type RestrictedSection = keyof typeof sectionRoutes;

export function isRestrictedSectionRoute(routeId: string, sections: RestrictedSection[]) {
  return sections.some((section) =>
    sectionRoutes[section]?.some((route) => routeId === route || routeId.startsWith(`${route}/`))
  );
}

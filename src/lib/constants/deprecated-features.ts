// Keep these features available by URL, but exclude them from active navigation and resume.
const deprecatedFeatures = [
  { name: 'Job Board', paths: ['/jobs'] },
  {
    name: 'Chinese Learning',
    paths: ['/chinese-learning', '/tools/chinese-game', '/tools/chinese-learning']
  }
];

export function getDeprecatedFeature(path: string) {
  const pathname = path.split(/[?#]/, 1)[0];
  return deprecatedFeatures.find((feature) =>
    feature.paths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

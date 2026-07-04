function safeFilenamePart(value: string | undefined, fallback: string): string {
  const cleaned = (value ?? fallback)
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

function splitFilenamePart(value: string): string[] {
  return value.split('_').filter(Boolean);
}

function startsWithTokens(tokens: string[], prefix: string[]): boolean {
  if (prefix.length === 0 || tokens.length < prefix.length) return false;

  return prefix.every((token, index) => token.toLowerCase() === tokens[index].toLowerCase());
}

function dedupeRoleForCompany(company: string, role: string): string {
  const companyTokens = splitFilenamePart(company);
  const roleTokens = splitFilenamePart(role);

  if (startsWithTokens(roleTokens, companyTokens)) {
    return roleTokens.slice(companyTokens.length).join('_') || role;
  }

  return role;
}

export function buildApplicationPdfFilename({
  company,
  role,
  includeCv
}: {
  company?: string;
  role?: string;
  includeCv: boolean;
}): string {
  const prefix = includeCv ? 'Application' : 'Cover_Letter';
  const safeCompany = safeFilenamePart(company, 'Company');
  const safeRole = dedupeRoleForCompany(safeCompany, safeFilenamePart(role, 'Role'));

  return `Edward_Salim_${prefix}_${safeCompany}_${safeRole}.pdf`;
}

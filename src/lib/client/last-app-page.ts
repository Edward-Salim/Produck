const storageKey = 'produck_last_app_page';
const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

type LastAppPage = {
  path: string;
  savedAt: number;
};

function isSafeAppPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') && path !== '/login';
}

export function getLastAppPagePath() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const saved = JSON.parse(raw) as LastAppPage;
    if (!isSafeAppPath(saved.path) || Date.now() - saved.savedAt > maxAgeMs) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return saved.path;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function saveLastAppPagePath(path: string) {
  if (!isSafeAppPath(path)) return;
  localStorage.setItem(storageKey, JSON.stringify({ path, savedAt: Date.now() }));
}

export function clearLastAppPagePath() {
  localStorage.removeItem(storageKey);
}

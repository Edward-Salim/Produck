/**
 * IndexedDB cache for tool results with history support.
 * Each tool gets a list of recent items (max 10).
 */

const DB_NAME = 'produck-image-cache';
const DB_VERSION = 2;
const STORE_NAME = 'images';
const MAX_HISTORY = 10;

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export interface CachedImage {
	original: Blob;
	result: Blob;
	width: number;
	height: number;
	/** Thumbnail for history list (small jpeg blob) */
	thumb?: Blob;
	meta?: Record<string, unknown>;
	timestamp: number;
}

/** Generate a small thumbnail blob from an image blob */
export async function createThumb(blob: Blob, size = 48): Promise<Blob> {
	const img = new Image();
	const url = URL.createObjectURL(blob);
	await new Promise<void>((res) => {
		img.onload = () => res();
		img.src = url;
	});
	URL.revokeObjectURL(url);

	const canvas = document.createElement('canvas');
	const aspect = img.naturalWidth / img.naturalHeight;
	canvas.width = aspect >= 1 ? size : Math.round(size * aspect);
	canvas.height = aspect >= 1 ? Math.round(size / aspect) : size;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.6));
}

/** Save an item to the history list for a tool */
export async function saveToCache(key: string, data: CachedImage): Promise<void> {
	const db = await openDB();
	const history = await getHistory(key);

	// Add new item to front
	history.unshift(data);

	// Trim to max
	if (history.length > MAX_HISTORY) {
		history.length = MAX_HISTORY;
	}

	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(history, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

/** Get the most recent cached item for a tool */
export async function loadFromCache(key: string): Promise<CachedImage | null> {
	const history = await getHistory(key);
	return history[0] ?? null;
}

/** Get full history list for a tool */
export async function getHistory(key: string): Promise<CachedImage[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const req = tx.objectStore(STORE_NAME).get(key);
		req.onsuccess = () => {
			const val = req.result;
			// Handle old format (single item) -> wrap in array
			if (val && !Array.isArray(val)) {
				resolve([val]);
			} else {
				resolve(val ?? []);
			}
		};
		req.onerror = () => reject(req.error);
	});
}

/** Load a specific history item by index */
export async function loadHistoryItem(key: string, index: number): Promise<CachedImage | null> {
	const history = await getHistory(key);
	return history[index] ?? null;
}

/** Remove a specific history item by index */
export async function removeHistoryItem(key: string, index: number): Promise<void> {
	const history = await getHistory(key);
	if (index < 0 || index >= history.length) return;
	history.splice(index, 1);
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		if (history.length === 0) {
			tx.objectStore(STORE_NAME).delete(key);
		} else {
			tx.objectStore(STORE_NAME).put(history, key);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

/** Clear all history for a tool */
export async function clearCache(key: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).delete(key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

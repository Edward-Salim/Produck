import type { FishboneDiagram, Category, Cause } from '$lib/types/fishbone.js';

function createId(): string {
	return crypto.randomUUID().slice(0, 8);
}

const DEFAULT_CATEGORIES: Category[] = [
	{
		id: createId(),
		label: 'Man',
		color: '#e74c3c',
		causes: [
			{ id: createId(), text: 'Tidak kenal senior pemenang' },
			{ id: createId(), text: 'Kreator takut diplagiasi' },
			{ id: createId(), text: 'Mahasiswa baru tanpa mentor' },
			{ id: createId(), text: 'Perlu persetujuan tim' }
		]
	},
	{
		id: createId(),
		label: 'Method',
		color: '#27ae60',
		causes: [
			{ id: createId(), text: 'Sharing via Drive link expired' },
			{ id: createId(), text: 'Belajar dari tips abstrak saja' },
			{ id: createId(), text: 'Knowledge transfer via mulut' },
			{ id: createId(), text: 'Tidak ada kurasi kualitas' }
		]
	},
	{
		id: createId(),
		label: 'Machine',
		color: '#3498db',
		causes: [
			{ id: createId(), text: 'Tidak ada platform terpusat' },
			{ id: createId(), text: 'Tidak ada DRM/watermark' },
			{ id: createId(), text: 'Tidak ada fitur discovery' },
			{ id: createId(), text: 'Google Drive rawan bocor' }
		]
	},
	{
		id: createId(),
		label: 'Material',
		color: '#f39c12',
		causes: [
			{ id: createId(), text: 'Karya juara tidak terdokumentasi' },
			{ id: createId(), text: 'Referensi tidak spesifik ID' },
			{ id: createId(), text: 'Contoh karya sulit diakses' },
			{ id: createId(), text: 'Format lomba berbeda-beda' }
		]
	}
];

function createDefaultDiagram(): FishboneDiagram {
	return {
		id: createId(),
		title: 'Root Cause Analysis',
		problemStatement: 'Mahasiswa sulit mengakses karya pemenang lomba untuk belajar, dan kreator tidak bisa sharing dengan aman',
		categories: DEFAULT_CATEGORIES.map((c) => ({
			...c,
			id: createId(),
			causes: c.causes.map((cause) => ({ ...cause, id: createId() }))
		}))
	};
}

export let diagram: FishboneDiagram = $state(createDefaultDiagram());

export function addCause(categoryId: string, text: string) {
	const cat = diagram.categories.find((c) => c.id === categoryId);
	if (!cat) return;
	cat.causes.push({ id: createId(), text });
}

export function removeCause(categoryId: string, causeId: string) {
	const cat = diagram.categories.find((c) => c.id === categoryId);
	if (!cat) return;
	cat.causes = cat.causes.filter((c) => c.id !== causeId);
}

export function updateCause(categoryId: string, causeId: string, text: string) {
	const cat = diagram.categories.find((c) => c.id === categoryId);
	if (!cat) return;
	const cause = cat.causes.find((c) => c.id === causeId);
	if (cause) cause.text = text;
}

export function updateCategory(categoryId: string, label: string) {
	const cat = diagram.categories.find((c) => c.id === categoryId);
	if (cat) cat.label = label;
}

export function updateProblemStatement(text: string) {
	diagram.problemStatement = text;
}

export function resetDiagram() {
	const fresh = createDefaultDiagram();
	diagram.id = fresh.id;
	diagram.title = fresh.title;
	diagram.problemStatement = fresh.problemStatement;
	diagram.categories = fresh.categories;
}

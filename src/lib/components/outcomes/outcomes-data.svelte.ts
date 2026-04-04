import type { BusinessOutcome, ProductObjective } from '$lib/types/outcomes.js';

function id(): string {
	return crypto.randomUUID().slice(0, 8);
}

type PeriodData = {
	productObjectives: ProductObjective[];
};

const BUSINESS_OUTCOMES: Record<number, BusinessOutcome> = {
	2025: {
		id: id(),
		code: 'BO-1',
		title: 'Menjadi platform referensi karya lomba #1 untuk mahasiswa Indonesia',
		description: 'Memvalidasi kebutuhan pasar dan membangun ekosistem sharing karya lomba yang aman, terpercaya, dan berkelanjutan bagi mahasiswa Indonesia.',
		metrics: ['500+ registered users', '50+ uploaded portfolios', '10+ universities', 'First paid transaction']
	}
};

const DATA: Record<string, PeriodData> = {
	'2025-Q1': {
		productObjectives: [
			{
				id: id(), code: 'PO-1', title: 'Launch MVP Search & Browse',
				keyResults: [
					{ id: id(), code: 'KR-1.1', description: 'Search page with keyword + category filter', target: '1 page', targetValue: 1, currentValue: 1, unit: 'page', lastUpdated: '2025-02-15' },
					{ id: id(), code: 'KR-1.2', description: 'Portfolio detail with 3-slide preview', target: '1 viewer', targetValue: 1, currentValue: 1, unit: 'viewer', lastUpdated: '2025-03-01' },
					{ id: id(), code: 'KR-1.3', description: 'Sample portfolios seeded', target: '20 portfolios', targetValue: 20, currentValue: 12, unit: 'portfolios', lastUpdated: '2025-03-10' }
				]
			},
			{
				id: id(), code: 'PO-2', title: 'Build Auth & Onboarding',
				keyResults: [
					{ id: id(), code: 'KR-2.1', description: 'Register & login with email verification', target: '1 flow', targetValue: 1, currentValue: 1, unit: 'flow', lastUpdated: '2025-01-20' },
					{ id: id(), code: 'KR-2.2', description: 'Onboarding completion time under target', target: '< 2 min', targetValue: 2, currentValue: 3.5, unit: 'min', lastUpdated: '2025-02-28' }
				]
			}
		]
	},
	'2025-Q2': {
		productObjectives: [
			{
				id: id(), code: 'PO-3', title: 'Enable Secure Upload & Team Management',
				keyResults: [
					{ id: id(), code: 'KR-3.1', description: 'Upload supporting PDF, PPTX, images', target: '3 formats', targetValue: 3, currentValue: 2, unit: 'formats', lastUpdated: '2025-04-20' },
					{ id: id(), code: 'KR-3.2', description: 'Auto-watermark coverage on uploads', target: '100%', targetValue: 100, currentValue: 60, unit: '%', lastUpdated: '2025-05-05' },
					{ id: id(), code: 'KR-3.3', description: 'Team invite + approval gate', target: '1 flow', targetValue: 1, currentValue: 0, unit: 'flow', lastUpdated: '2025-05-15' }
				]
			}
		]
	},
	'2025-Q3': {
		productObjectives: [
			{
				id: id(), code: 'PO-4', title: 'Build Access Control & Monetization',
				keyResults: [
					{ id: id(), code: 'KR-4.1', description: 'Grant/revoke access per portfolio', target: '1 feature', targetValue: 1, currentValue: 0, unit: 'feature', lastUpdated: '2025-07-01' },
					{ id: id(), code: 'KR-4.2', description: 'Payment integration live', target: '1 integration', targetValue: 1, currentValue: 0, unit: 'integration', lastUpdated: '2025-07-01' },
					{ id: id(), code: 'KR-4.3', description: 'Creator earnings dashboard', target: '1 dashboard', targetValue: 1, currentValue: 0, unit: 'dashboard', lastUpdated: '2025-07-01' }
				]
			}
		]
	},
	'2025-Q4': {
		productObjectives: [
			{
				id: id(), code: 'PO-5', title: 'Launch Creator Profiles & Social',
				keyResults: [
					{ id: id(), code: 'KR-5.1', description: 'Public creator profile pages', target: '50 profiles', targetValue: 50, currentValue: 0, unit: 'profiles', lastUpdated: '2025-10-01' },
					{ id: id(), code: 'KR-5.2', description: 'WhatsApp contact integration', target: '1 feature', targetValue: 1, currentValue: 0, unit: 'feature', lastUpdated: '2025-10-01' },
					{ id: id(), code: 'KR-5.3', description: 'Like/appreciate on portfolios', target: '1 feature', targetValue: 1, currentValue: 0, unit: 'feature', lastUpdated: '2025-10-01' }
				]
			}
		]
	}
};

export function getBusinessOutcome(year: number): BusinessOutcome | null {
	return BUSINESS_OUTCOMES[year] ?? null;
}

export function getProductObjectives(year: number, quarter: 1 | 2 | 3 | 4 | null): ProductObjective[] {
	if (quarter) {
		return DATA[`${year}-Q${quarter}`]?.productObjectives ?? [];
	}
	const all: ProductObjective[] = [];
	for (let q = 1; q <= 4; q++) {
		const d = DATA[`${year}-Q${q}`];
		if (d) all.push(...d.productObjectives);
	}
	return all;
}

export function updateKeyResultValue(krId: string, value: number) {
	for (const period of Object.values(DATA)) {
		for (const obj of period.productObjectives) {
			const kr = obj.keyResults.find((k) => k.id === krId);
			if (kr) {
				kr.currentValue = value;
				kr.lastUpdated = new Date().toISOString().split('T')[0];
				return;
			}
		}
	}
}

export const AVAILABLE_YEARS = [2025];

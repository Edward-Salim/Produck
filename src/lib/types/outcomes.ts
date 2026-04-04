export interface KeyResult {
	id: string;
	code: string;
	description: string;
	target: string;
	targetValue: number;
	currentValue: number;
	unit: string;
	lastUpdated: string; // ISO date
}

export interface ProductObjective {
	id: string;
	code: string;
	title: string;
	keyResults: KeyResult[];
}

export interface BusinessOutcome {
	id: string;
	code: string;
	title: string;
	description: string;
	metrics: string[];
}

export interface Timeframe {
	year: number;
	quarter: 1 | 2 | 3 | 4 | null;
}

export interface Cause {
	id: string;
	text: string;
}

export interface Category {
	id: string;
	label: string;
	color: string;
	causes: Cause[];
}

export interface FishboneDiagram {
	id: string;
	title: string;
	problemStatement: string;
	categories: Category[];
}

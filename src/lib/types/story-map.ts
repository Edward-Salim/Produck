export interface Actor {
	emoji: string;
	label: string;
}

export interface Task {
	id: string;
	title: string;
}

export interface Activity {
	id: string;
	title: string;
	actors?: string[];
	tasks?: Task[];
}

export interface Story {
	id: string;
	title: string;
	activity: string;
	task?: string;
	pic: string;
	picColor: string;
	done: boolean;
	asA?: string;
	wantTo?: string;
	soThat?: string;
	pains?: string[];
	gains?: string[];
	details?: string[];
}

export interface StoryMapData {
	product: string;
	goal?: string;
	actors: Actor[];
	levels?: number;
	activities: Activity[];
	stories: {
		"must-have": Story[];
		performance: Story[];
		delighter: Story[];
	};
}

export interface DataFile {
	id: string;
	label: string;
}

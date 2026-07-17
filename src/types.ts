export type PeriodType = 'weekly' | 'monthly' | 'yearly';

export type WeekStartsOn = 0 | 1; // 0 = Sunday, 1 = Monday

export interface Goal {
	text: string;
	done: boolean;
	carried: boolean;
}

export interface PeriodMeta {
	period: PeriodType;
	key: string;
	created: string;
}

export interface PeriodGoals {
	meta: PeriodMeta;
	goals: Goal[];
}

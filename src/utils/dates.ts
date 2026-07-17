import type { PeriodType, WeekStartsOn } from '../types';

function pad2(n: number): string {
	return n.toString().padStart(2, '0');
}

/** Local calendar date parts (avoids UTC shift from toISOString). */
export function getDateParts(date: Date = new Date()): {
	year: number;
	month: number;
	day: number;
} {
	return {
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
	};
}

export function getYearKey(date: Date = new Date()): string {
	return String(getDateParts(date).year);
}

export function getMonthKey(date: Date = new Date()): string {
	const { year, month } = getDateParts(date);
	return `${year}-${pad2(month)}`;
}

/**
 * Week key as YYYY-Www.
 * Monday start uses ISO week date; Sunday start uses a Sunday-based week year.
 */
export function getWeekKey(
	date: Date = new Date(),
	weekStartsOn: WeekStartsOn = 1,
): string {
	if (weekStartsOn === 1) {
		return getIsoWeekKey(date);
	}
	return getSundayWeekKey(date);
}

/** ISO week date: week starts Monday, week 1 has first Thursday. */
export function getIsoWeekKey(date: Date): string {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	// Thursday in current week decides the year
	d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
	const weekYear = d.getFullYear();
	const week1 = new Date(weekYear, 0, 4);
	const weekNo =
		1 +
		Math.round(
			((d.getTime() - week1.getTime()) / 86400000 -
				3 +
				((week1.getDay() + 6) % 7)) /
				7,
		);
	return `${weekYear}-W${pad2(weekNo)}`;
}

/** Sunday-start week key; week 1 is the week containing Jan 1. */
export function getSundayWeekKey(date: Date): string {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const day = d.getDay(); // 0 Sun … 6 Sat
	const sunday = new Date(d);
	sunday.setDate(d.getDate() - day);

	const year = sunday.getFullYear();
	const jan1 = new Date(year, 0, 1);
	const jan1Day = jan1.getDay();
	const firstSunday = new Date(year, 0, 1 - jan1Day);
	const weekNo =
		1 +
		Math.floor((sunday.getTime() - firstSunday.getTime()) / (7 * 86400000));
	return `${year}-W${pad2(weekNo)}`;
}

export function getPeriodKey(
	type: PeriodType,
	date: Date = new Date(),
	weekStartsOn: WeekStartsOn = 1,
): string {
	switch (type) {
		case 'yearly':
			return getYearKey(date);
		case 'monthly':
			return getMonthKey(date);
		case 'weekly':
			return getWeekKey(date, weekStartsOn);
	}
}

export function previousYearKey(key: string): string {
	return String(Number(key) - 1);
}

export function previousMonthKey(key: string): string {
	const match = /^(\d{4})-(\d{2})$/.exec(key);
	if (!match) {
		throw new Error(`Invalid month key: ${key}`);
	}
	let year = Number(match[1]);
	let month = Number(match[2]) - 1;
	if (month < 1) {
		month = 12;
		year -= 1;
	}
	return `${year}-${pad2(month)}`;
}

export function previousWeekKey(
	key: string,
	weekStartsOn: WeekStartsOn = 1,
): string {
	const match = /^(\d{4})-W(\d{2})$/.exec(key);
	if (!match) {
		throw new Error(`Invalid week key: ${key}`);
	}
	const year = Number(match[1]);
	const week = Number(match[2]);
	// Approximate: subtract 7 days from a day known to be in that week
	const ref = new Date(year, 0, 4 + (week - 1) * 7);
	const prev = new Date(ref);
	prev.setDate(ref.getDate() - 7);
	return getWeekKey(prev, weekStartsOn);
}

export function previousPeriodKey(
	type: PeriodType,
	key: string,
	weekStartsOn: WeekStartsOn = 1,
): string {
	switch (type) {
		case 'yearly':
			return previousYearKey(key);
		case 'monthly':
			return previousMonthKey(key);
		case 'weekly':
			return previousWeekKey(key, weekStartsOn);
	}
}

/** YYYY-MM-DD for local date (frontmatter `created`). */
export function formatLocalDate(date: Date = new Date()): string {
	const { year, month, day } = getDateParts(date);
	return `${year}-${pad2(month)}-${pad2(day)}`;
}

import type { App } from 'obsidian';
import type { PeriodType } from '../types';

const PERIOD_SUBFOLDERS: Record<PeriodType, string> = {
	weekly: 'Weekly',
	monthly: 'Monthly',
	yearly: 'Yearly',
};

/** Normalize vault-relative folder path (no leading/trailing slashes). */
export function normalizeFolder(folder: string): string {
	return folder.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/');
}

export function periodSubfolder(type: PeriodType): string {
	return PERIOD_SUBFOLDERS[type];
}

/** Vault-relative path to a period note, e.g. `Goals/Weekly/2026-W29.md`. */
export function pathForPeriod(
	goalsFolder: string,
	type: PeriodType,
	key: string,
): string {
	const root = normalizeFolder(goalsFolder);
	const sub = periodSubfolder(type);
	const file = `${key}.md`;
	return root ? `${root}/${sub}/${file}` : `${sub}/${file}`;
}

/** Parent folder of a vault path (`a/b/c.md` → `a/b`). */
export function parentFolder(path: string): string {
	const i = path.lastIndexOf('/');
	return i === -1 ? '' : path.slice(0, i);
}

/** Create folder and parents if missing. */
export async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const normalized = normalizeFolder(folderPath);
	if (!normalized) {
		return;
	}
	const existing = app.vault.getAbstractFileByPath(normalized);
	if (existing) {
		return;
	}
	const parent = parentFolder(normalized);
	if (parent) {
		await ensureFolder(app, parent);
	}
	await app.vault.createFolder(normalized);
}

/** Ensure goals root + Weekly / Monthly / Yearly folders exist. */
export async function ensureGoalsFolders(
	app: App,
	goalsFolder: string,
): Promise<void> {
	const root = normalizeFolder(goalsFolder);
	const periods: PeriodType[] = ['weekly', 'monthly', 'yearly'];
	for (const type of periods) {
		const folder = root
			? `${root}/${periodSubfolder(type)}`
			: periodSubfolder(type);
		await ensureFolder(app, folder);
	}
}

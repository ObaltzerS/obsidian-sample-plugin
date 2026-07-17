import { Notice, Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	GoalsSettingTab,
	type GoalsSettings,
} from './settings';
import type { PeriodType } from './types';
import {
	getMonthKey,
	getPeriodKey,
	getWeekKey,
	getYearKey,
	previousPeriodKey,
} from './utils/dates';
import { ensureGoalsFolders, pathForPeriod } from './utils/paths';

export default class GoalsPlugin extends Plugin {
	settings!: GoalsSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GoalsSettingTab(this.app, this));

		this.addCommand({
			id: 'debug-period-keys',
			name: 'Debug: show current period keys',
			callback: () => {
				const now = new Date();
				const weekStartsOn = this.settings.weekStartsOn;
				const weekly = getWeekKey(now, weekStartsOn);
				const monthly = getMonthKey(now);
				const yearly = getYearKey(now);
				const lines = [
					`Yearly: ${yearly} → ${pathForPeriod(this.settings.goalsFolder, 'yearly', yearly)}`,
					`Monthly: ${monthly} → ${pathForPeriod(this.settings.goalsFolder, 'monthly', monthly)}`,
					`Weekly: ${weekly} → ${pathForPeriod(this.settings.goalsFolder, 'weekly', weekly)}`,
					`Prev week: ${previousPeriodKey('weekly', weekly, weekStartsOn)}`,
					`Prev month: ${previousPeriodKey('monthly', monthly)}`,
					`Prev year: ${previousPeriodKey('yearly', yearly)}`,
				];
				new Notice(lines.join('\n'), 8000);
			},
		});

		this.addCommand({
			id: 'ensure-folder-structure',
			name: 'Ensure folder structure',
			callback: async () => {
				await ensureGoalsFolders(this.app, this.settings.goalsFolder);
				new Notice(`Created folders under ${this.settings.goalsFolder}`);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<GoalsSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** Resolve vault path for a period type on a date (default: today). */
	pathFor(
		type: PeriodType,
		date: Date = new Date(),
	): string {
		const key = getPeriodKey(type, date, this.settings.weekStartsOn);
		return pathForPeriod(this.settings.goalsFolder, type, key);
	}
}

import { App, PluginSettingTab, Setting } from 'obsidian';
import type GoalsPlugin from './main';
import type { WeekStartsOn } from './types';

export interface GoalsSettings {
	goalsFolder: string;
	/** 0 = Sunday, 1 = Monday */
	weekStartsOn: WeekStartsOn;
	carryOverMarker: string;
	autoCarryOver: boolean;
	openViewOnStartup: boolean;
}

export const DEFAULT_SETTINGS: GoalsSettings = {
	goalsFolder: 'Goals',
	weekStartsOn: 1,
	carryOverMarker: '#carried',
	autoCarryOver: true,
	openViewOnStartup: false,
};

export class GoalsSettingTab extends PluginSettingTab {
	plugin: GoalsPlugin;

	constructor(app: App, plugin: GoalsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Goals folder')
			.setDesc('Vault folder for yearly, monthly, and weekly goal notes.')
			.addText((text) =>
				text
					.setPlaceholder('Goals')
					.setValue(this.plugin.settings.goalsFolder)
					.onChange(async (value) => {
						this.plugin.settings.goalsFolder = value.trim() || 'Goals';
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Week starts on')
			.setDesc('Affects weekly keys (yyyy-www). Monday uses iso weeks.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('1', 'Monday')
					.addOption('0', 'Sunday')
					.setValue(String(this.plugin.settings.weekStartsOn))
					.onChange(async (value) => {
						this.plugin.settings.weekStartsOn =
							value === '0' ? 0 : 1;
						await this.plugin.saveSettings();
					}),
			);
	}
}

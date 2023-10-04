import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface VimLangmapPluginSettings {
	switcherPath: string;
}

const DEFAULT_SETTINGS: VimLangmapPluginSettings = {
	switcherPath: 'C:\\ObsidianVimLangmap\\KeyboardSwitcher.exe'
}

export default class VimLangmapPlugin extends Plugin {
	settings: VimLangmapPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new VimLangmapPluginSettingsTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class VimLangmapPluginSettingsTab extends PluginSettingTab {
	plugin: VimLangmapPlugin;

	constructor(app: App, plugin: VimLangmapPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Keyboard Switcher Path')
			.setDesc('The path to the KeyboardSwitcher.exe executable')
			.addText(text => text
				.setPlaceholder('C:\\ObsidianVimLangmap\\KeyboardSwitcher.exe')
				.setValue(this.plugin.settings.switcherPath)
				.onChange(async (value) => {
					this.plugin.settings.switcherPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
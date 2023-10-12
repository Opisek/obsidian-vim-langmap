import { App, Editor, FileSystemAdapter, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { execFile } from 'child_process';
import { join } from 'path';

interface VimLangmapPluginSettings {
	typingKeyboard: number;
	typingOffset: number;
	vimKeyboard: number;
	vimOffset: number;
}

const DEFAULT_SETTINGS: VimLangmapPluginSettings = {
	typingKeyboard: 1033,
	typingOffset: -1,
	vimKeyboard: 1031,
	vimOffset: 0,
}

enum KeyboardLayout {
  QWERTY,
  TYPING,
}

export default class VimLangmapPlugin extends Plugin {
	settings: VimLangmapPluginSettings;
	editor: Editor;
	registeredInterval: NodeJS.Timer;
	currentLayout: KeyboardLayout;	
	lastLayout: KeyboardLayout;
	switcherPath: string;
	hadFocus: boolean;
	statusBarElement: HTMLElement;

	async onload() {
		// Load Plugin Settings
		await this.loadSettings();
		this.addSettingTab(new VimLangmapPluginSettingsTab(this.app, this));

		// Register Status Bar Element
		this.statusBarElement = this.addStatusBarItem();

		// Find Keyboard Switcher
		const adapter = this.app.vault.adapter;
		this.switcherPath = "";
		if (adapter instanceof FileSystemAdapter) {
			const basePath = adapter.getBasePath(); 
			this.switcherPath = join(basePath, ".obsidian", "plugins", "obsidian-vim-langmap", "KeyboardSwitcher.exe");
		}

		// Default to Typing
		changeLayout(this, KeyboardLayout.TYPING);

		// Switching Logic
		this.app.workspace.on("active-leaf-change", async (leaf) => {
			clearInterval(this.registeredInterval);
			if (leaf?.view.getViewType() === "markdown") {
				// Default vim mode is normal
				changeLayout(this, KeyboardLayout.QWERTY);

				// Register vim mode change listener
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const cmEditor = (this.app.workspace.getActiveViewOfType(MarkdownView) as any).sourceMode?.cmEditor?.cm?.cm;
				cmEditor.off("vim-mode-change", handleVimModeChange);
				cmEditor.on("vim-mode-change", handleVimModeChange);

				// Register (active) focus listener
				this.hadFocus = true;
				this.registeredInterval = setInterval(() => {
					const hasFocus = (leaf?.view as MarkdownView).editor.hasFocus();

					if (this.hadFocus == hasFocus) return;
					this.hadFocus = hasFocus;

					if (hasFocus) {
						changeLayout(this, this.lastLayout);
					} else {
						this.lastLayout = this.currentLayout;
						changeLayout(this, KeyboardLayout.TYPING);
					}
				}, 100);
			} else {
				changeLayout(this, KeyboardLayout.TYPING);
			}
		});
		this.app.workspace.on("quit", () => { changeLayout(this, KeyboardLayout.TYPING) });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleVimModeChange = async (cm: any) => {
			if (cm.mode == "normal" || cm.mode == "visual")	await changeLayout(this, KeyboardLayout.QWERTY);
			else await changeLayout(this, KeyboardLayout.TYPING);
		}
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

async function changeLayout(plugin: VimLangmapPlugin, layout: KeyboardLayout) {
	plugin.currentLayout = layout;
	plugin.statusBarElement.setText(KeyboardLayout[layout]);
	return execFile(
		plugin.switcherPath,
		[
			(layout == KeyboardLayout.QWERTY ? plugin.settings.vimKeyboard : plugin.settings.typingKeyboard).toString(),
			(layout == KeyboardLayout.QWERTY ? plugin.settings.vimOffset : plugin.settings.typingOffset).toString(),
		]
	);
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
			.setName('Typing Keyboard')
			.setDesc('The keyboard layout code to switch to for typing.')
			.addText(text => text
				.setPlaceholder('1033')
				.setValue(this.plugin.settings.typingKeyboard.toString())
				.onChange(async (value) => {
					this.plugin.settings.typingKeyboard = parseInt(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Typing Keyboard Offset')
			.setDesc('How many additional layouts forwards or backwards to switch.')
			.addText(text => text
				.setPlaceholder('-1')
				.setValue(this.plugin.settings.typingOffset.toString())
				.onChange(async (value) => {
					this.plugin.settings.typingOffset = parseInt(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Vim Keyboard')
			.setDesc('The keyboard layout code to switch to for Vim keybinds.')
			.addText(text => text
				.setPlaceholder('1031')
				.setValue(this.plugin.settings.vimKeyboard.toString())
				.onChange(async (value) => {
					this.plugin.settings.vimKeyboard = parseInt(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Vim Keyboard Offset')
			.setDesc('How many additional layouts forwards or backwards to switch.')
			.addText(text => text
				.setPlaceholder('0')
				.setValue(this.plugin.settings.vimOffset.toString())
				.onChange(async (value) => {
					this.plugin.settings.vimOffset = parseInt(value);
					await this.plugin.saveSettings();
				}));
	}
}
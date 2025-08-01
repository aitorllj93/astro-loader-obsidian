import { type App, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface HAL9000Settings {
	websiteConfig: {
		author?: string;
		base?: string;
		defaultLocale?: string;
		description?: string;
		site?: string;
		title?: string;
		displayOptions?: {
			showAuthor?: boolean;
			showPublishDate?: boolean;
		};
	};
}

const DEFAULT_SETTINGS: HAL9000Settings = {
	websiteConfig: {}
};

export default class HAL9000Plugin extends Plugin {
	settings: HAL9000Settings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'spaceship-serve',
			name: 'Open Spaceship server',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
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

class SampleModal extends Modal {

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Work in Progress');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: HAL9000Plugin;

	constructor(app: App, plugin: HAL9000Plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Website Config' });


		new Setting(containerEl)
			.setName('Author')
			.setDesc('Documents default author')
			.addText(text => text
				.setPlaceholder('Enter your author')
				.setValue(this.plugin.settings.websiteConfig.author as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.author = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Base')
			.setDesc('The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.')
			.addText(text => text
				.setPlaceholder('Enter your base path')
				.setValue(this.plugin.settings.websiteConfig.base as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.base = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Locale')
			.setDesc('The default locale of your website/application')
			.addText(text => text
				.setPlaceholder('Enter your default locale')
				.setValue(this.plugin.settings.websiteConfig.defaultLocale as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.defaultLocale = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Description')
			.setDesc('The description of your website')
			.addText(text => text
				.setPlaceholder('Enter the description of your website')
				.setValue(this.plugin.settings.websiteConfig.description as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.description = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Site')
			.setDesc('Your final, deployed URL. Astro uses this full URL to generate your sitemap and canonical URLs in your final build. It is strongly recommended that you set this configuration to get the most out of Astro.')
			.addText(text => text
				.setPlaceholder('Enter your site URL')
				.setValue(this.plugin.settings.websiteConfig.site as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.site = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Title')
			.setDesc('The title of your website')
			.addText(text => text
				.setPlaceholder('Enter the title of your website')
				.setValue(this.plugin.settings.websiteConfig.title as string)
				.onChange(async (value) => {
					this.plugin.settings.websiteConfig.title = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Display Options' });

		new Setting(containerEl)
			.setName('Show Author')
			.setDesc('Whether display the author of the documents or not')
			.addToggle((value) => {
				value.setValue(this.plugin.settings.websiteConfig.displayOptions?.showAuthor ?? false).onChange((value) => {
					this.plugin.settings.websiteConfig.displayOptions = this.plugin.settings.websiteConfig.displayOptions ?? {};
					this.plugin.settings.websiteConfig.displayOptions.showAuthor = value;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Show Publish Date')
			.setDesc('Whether display the publish date of the documents or not')
			.addToggle((value) => {
				value.setValue(this.plugin.settings.websiteConfig.displayOptions?.showPublishDate ?? false).onChange((value) => {
					this.plugin.settings.websiteConfig.displayOptions = this.plugin.settings.websiteConfig.displayOptions ?? {};
					this.plugin.settings.websiteConfig.displayOptions.showPublishDate = value;
					this.plugin.saveSettings();
				});
			});
	}
}

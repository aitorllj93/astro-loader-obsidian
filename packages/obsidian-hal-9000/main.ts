import { Modal, Plugin } from 'obsidian';
import serve from 'src/lib/serve';
import { SettingsTab, type HAL9000Settings, DEFAULT_SETTINGS } from 'src/settings';

export default class HAL9000Plugin extends Plugin {
	settings: HAL9000Settings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'spaceship-serve',
			name: 'Open Spaceship server',
			checkCallback: (checking: boolean) => {
				const value = true; // check dependencies are installed

				if (value) {
					if (!checking) {
						serve(this.app);
					}

					return true
				}

				return false;
			},
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

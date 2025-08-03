import { type App, Modal } from "obsidian";
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { spawn as childSpawn } from "child_process";

const spawn = (
	command: string,
	args: string[],
	cwd: string = process.cwd(),
	onData?: (data: string) => void,
) => new Promise((resolve, reject) => {
	const serve = childSpawn(command, args, { cwd });

	if (onData) {
		serve.stdout.on('data', onData);
	}

	serve.on('close', (code) => resolve(code));
	serve.on('error', (err) => reject(err));
})


export default (app: App) => {
	const modal = new SampleModal(app)
	modal.open();
	spawn('/usr/local/bin/npm', ['start'], '/Users/aitorllamas/Projects/spaceship/astro-theme-spaceship', (data) => {
		modal.setContent(data);
	}).then(() => {
		modal.setTitle('done')
	}).catch((error) => {
		modal.setContent(error.message)
	});
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

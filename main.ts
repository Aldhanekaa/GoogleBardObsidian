import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
	addIcon,
} from "obsidian";
import { BardObsidianView, VIEW_TYPE_BardObsidian } from "src/plugin/view";
import { BardObsidianSettings, DEFAULT_SETTINGS } from "src/settings";
import Bard from "bard-ai";
import Chats from "bard-ai/Chats";

// Remember to rename these classes and interfaces!

export default class BardObsidian extends Plugin {
	// @ts-ignore
	settings: BardObsidianSettings;
	// @ts-ignore
	prevSettings: BardObsidianSettings;

	chatBardView?: BardObsidianView;
	bard?: Bard;

	// @ts-ignore
	chats: Chats;

	async onload() {
		this.chats = new Chats();

		await this.loadSettings();
		this.chats.load();

		addIcon(
			"sparkles",
			`<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`
		);

		this.registerView(
			VIEW_TYPE_BardObsidian,
			(leaf) => new BardObsidianView(leaf, this.settings, this.chats)
		);

		this.registerEvent(
			//@ts-ignore
			this.app.workspace.on("active-leaf-change", this.onActiveLeafChange)
		);

		this.addCommand({
			id: "google-bard-assistant",
			name: "Open Google Bard Assistant",
			callback: () => {
				this.activateView();
			},
		});

		this.addRibbonIcon("sparkles", "Open Bard", () => {
			this.activateView();
		});

		this.addSettingTab(new BardObsidianSettingTab(this.app, this));
		// this.bard();
	}

	onActiveLeafChange = async (e: WorkspaceLeaf) => {
		if (e?.view.getViewType() == VIEW_TYPE_BardObsidian) {
			if (
				this.bard == undefined ||
				this.chats.prevSettings.PSID != this.chats.settings.PSID ||
				this.chats.prevSettings.PSIDTS != this.chats.settings.PSIDTS
			) {
				await this.chats.load();
			}
			// console.log("lets go");
		}
	};

	/* COMMANDS */
	newChat() {}
	/* END of COMMANDS */

	/* CONFIGURATIONS */

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_BardObsidian);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_BardObsidian,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_BardObsidian)[0]
		);
	}

	async loadSettings() {
		const loadedData = await this.loadData();

		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		this.prevSettings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

		this.chats.loadSettings({
			settings: this.settings,
			prevSettings: this.prevSettings,
		});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class BardObsidianSettingTab extends PluginSettingTab {
	plugin: BardObsidian;

	constructor(app: App, plugin: BardObsidian) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("PSID Key")
			.setDesc("Your PSID Google Bard Key")
			.addText((text) =>
				text

					.setPlaceholder("The Key Is On Cookies")
					.setValue(this.plugin.settings.PSID)
					.onChange(async (value) => {
						this.plugin.settings.PSID = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("PSIDTS Key")
			.setDesc("Your PSIDTS Google Bard Key")
			.addText((text) =>
				text

					.setPlaceholder("The Key Is On Cookies")
					.setValue(this.plugin.settings.PSIDTS)
					.onChange(async (value) => {
						this.plugin.settings.PSIDTS = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

import { Root, createRoot as CreateRoot } from "react-dom/client";
import * as React from "react";

import { ItemView, Notice, WorkspaceLeaf } from "obsidian";

import ReactView from "../components/View/app";
import { AppContext } from "../components/hooks/context";
import { ChatGlobalStateProvider } from "src/machines/chat.context";
import { BardObsidianSettings } from "src/settings";
import Chats from "bard-ai/Chats";

export const VIEW_TYPE_BardObsidian = "BardObsidian-view";

export class BardObsidianView extends ItemView {
	viewType = VIEW_TYPE_BardObsidian;
	// loadObsidianBardPlugin: (
	// 	settingsArg?: BardObsidianSettings,
	// 	prevSettingsArg?: BardObsidianSettings
	// ) => Promise<void>;
	settings: BardObsidianSettings;
	prevsettings: BardObsidianSettings;

	chats: Chats;

	constructor(
		leaf: WorkspaceLeaf,
		settings: BardObsidianSettings,
		// loadObsidianBardPlugin: (
		// 	settingsArg?: BardObsidianSettings,
		// 	prevSettingsArg?: BardObsidianSettings
		// ) => Promise<void>,
		chats: Chats
	) {
		super(leaf);
		this.icon = "sparkles";
		// this.loadObsidianBardPlugin = loadObsidianBardPlugin;

		this.settings = settings;
		this.prevsettings = Object.assign({}, settings);

		this.chats = chats;
	}

	icon: string;

	// @ts-ignore
	reactRoot: Root;

	getViewType(): string {
		return VIEW_TYPE_BardObsidian;
	}

	getDisplayText() {
		return "Google Bard";
	}

	loadbardView() {
		// this.loadObsidianBardPlugin(this.settings, this.prevsettings);
	}

	async onOpen() {
		const container = this.containerEl.children[1];

		this.reactRoot = CreateRoot(container);

		this.reactRoot.render(
			<AppContext.Provider value={this.app}>
				<ChatGlobalStateProvider
					newChat={this.newChat}
					askBard={this.chatToBard}
					chats={this.chats}
					loadBard={() => {
						this.chats.load();
					}}
				>
					<ReactView />
				</ChatGlobalStateProvider>
			</AppContext.Provider>
		);
	}

	newChat = () => {
		console.log("new chat");
		this.chats.newChat();
	};

	chatToBard = async (ask: string) => {
		console.log(ask);
		const res = await this.chats.askAI(ask);

		if (typeof res == "string") {
			new Notice(res);
		}

		return res;
	};
	setChat = (chats: Chats) => {
		this.chats = chats;
	};

	/* CONFIGURATIONS */

	async onClose() {
		this.reactRoot.unmount();
	}
}

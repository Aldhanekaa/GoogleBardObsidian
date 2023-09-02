import Bard from "bard-ai/index";
import { IAskResponseJSON, TAskConfig, TIds } from "bard-ai";

import { Notice, requestUrl } from "obsidian";
import { BardObsidianSettings } from "src/settings";

export type StatusCodeT = "fetch_token_error" | "fetch_bard_error" | undefined;
export type StatusObjT = {
	code: StatusCodeT;
	message?: string;
};

class Chat {
	ids?: TIds;

	constructor() {}
	ask!: (
		message: string,
		config?: TAskConfig
	) => Promise<IAskResponseJSON | string>;
	export!: () => typeof this.ids;
}

export default class Chats {
	// @ts-ignore
	settings: BardObsidianSettings;
	// @ts-ignore
	prevSettings: BardObsidianSettings;

	status!: StatusObjT;

	chat!: Chat;
	bard?: Bard;

	chats: Array<IAskResponseJSON> = [];

	constructor() {
		this.status = {
			code: undefined,
			message: undefined,
		};
	}

	load = (done?: () => void) => {
		// if (
		// 	(this.settings != undefined ||
		// 		this.prevSettings != undefined) &&
		// 	settingsArg &&
		// 	prevSettingsArg
		// ) {
		// 	settings = settingsArg;
		// 	prevSettings = prevSettingsArg;
		// } else {
		// 	settings = this.settings;
		// 	prevSettings = this.prevSettings;
		// }

		const cookie = this.settings.Cookie;

		this.bard = new Bard(cookie, {
			// @ts-ignore
			async fetch(input, init) {
				const allowedHeaders = [
					"X-Same-Domain",
					"User-Agent",
					"Content-Type",
					"Origin",
					"Referer",
					"Cookie",
				];

				const reqHeaders: {
					[key: string]: string;
				} = {};
				for (const key in init?.headers) {
					if (allowedHeaders.includes(key)) {
						// @ts-ignore
						reqHeaders[key] = init.headers[key];
					}
				}

				const reqInput = {
					url: String(input),
					method: init?.method,
					// @ts-ignore
					headers: reqHeaders,
					credentials: init?.credentials,
				};
				if (init?.body) {
					// @ts-ignore
					reqInput.body = init.body;
				}

				// @ts-ignore
				const response = await requestUrl(reqInput);

				return {
					async text() {
						return response.text;
					},
				};
			},
		});

		this.chat = this.bard.createChat();

		this.bard.initPromise
			.then((success) => {
				if (done) done();

				new Notice("Successfully Loaded Bard");

				console.log("SUCCEESS! ", success);
			})
			.catch((err) => {
				err = String(err);
				console.log(err, typeof err == "string");
				if (typeof String(err) == "string") {
					if (err.includes("Could not fetch Google Bard")) {
						this.status.code = "fetch_bard_error";
						this.status.message =
							"Could not fetch Google Bard. You may be disconnected from internet! " +
							err;
					} else if (err.includes("Could not use your Cookie.")) {
						this.status.code = "fetch_token_error";
						this.status.message =
							"Could not use your Cookie. Make sure that you copied correctly the Cookie with name __Secure-1PSID exactly. If you are sure your cookie is correct, you may also have reached your rate limit." +
							err;
					}
					new Notice(err);
				}
				if (done) done();
			});

		// console.log();
	};

	getStatus = () => {
		return this.status;
	};

	async askAI(prompt: string) {
		const response = await this.chat.ask(prompt, {
			format: "json",
			ids:
				this.chats.length > 0
					? this.chats[this.chats.length - 1].ids
					: undefined,
		});
		// console.log("RESPONSE", response);

		if (typeof response != "string") {
			this.chats.push({
				content: response.content,
				ids: response.ids,
				images: response.images,
			});
		}

		return response;
	}

	loadSettings = ({
		settings,
		prevSettings,
	}: {
		settings: BardObsidianSettings;
		prevSettings: BardObsidianSettings;
	}) => {
		this.settings = settings;
		this.prevSettings = prevSettings;
	};

	newChat = () => {
		if (this.bard) {
			this.chat = this.bard?.createChat();
		}
	};
}

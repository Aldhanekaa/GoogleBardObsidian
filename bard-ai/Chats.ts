import { queryBardValidRes, Chat } from "bard-ai";
import Bard from "./index";

export type ChatsT = Array<queryBardValidRes | string>;
export default class Chats {
	chat: Chat;
	chats: Array<queryBardValidRes | string> = [];

	constructor() {
		this.chat = new Bard.Chat();
	}

	async askAI(prompt: string) {
		const response = await this.chat.ask(prompt, true);
		if (typeof response != "string") {
			this.chats.push({
				content: response.content,
				ids: response.ids,
				images: response.images,
			});
		}

		return response;
	}

	newChat = () => {
		this.chat = new Bard.Chat();
	};
}

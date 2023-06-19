import {
	Session,
	askAI as askAIT,
	formatMarkdown as formatMarkdownT,
	images as imagesT,
	init as initT,
	queryBard as queryBardT,
	Chat as ChatT,
	IdsT,
} from "bard-ai";
import { requestUrl } from "obsidian";

/* eslint-disable no-mixed-spaces-and-tabs */
let session: Session;
let SNlM0e: string;

export const init: initT = async (sessionID) => {
	session = {
		baseURL: "https://bard.google.com",
		headers: {
			"X-Same-Domain": "1",
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			Origin: "https://bard.google.com",
			Referer: "https://bard.google.com/",
			Cookie: `__Secure-1PSID=${sessionID};`,
		},
	};

	const response = await requestUrl({
		url: "https://bard.google.com/",
		method: "GET",
		headers: session.headers,
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
	});

	const data = response.text;
	// console.log(response, sessionID);

	const match = data.match(/SNlM0e":"(.*?)"/);

	if (match) SNlM0e = match[1];
	else
		throw new Error("Could not get Google Bard. Please Check Your API Key");

	return SNlM0e;
};

export const queryBard: queryBardT = async (message, ids = {}) => {
	if (!SNlM0e)
		throw new Error("Make sure to call Bard.init(SESSION_ID) first.");

	// console.log(message, ids);
	// Parameters and POST data
	const params: Record<string, string> = {
		bl: "boq_assistant-bard-web-server_20230613.09_p0",
		_reqID: ids._reqID ? `${ids._reqID}` : "0",
		rt: "c",
	};

	const messageStruct = [
		[message],
		null,
		ids ? Object.values(ids).slice(0, 3) : [null, null, null],
	];

	const data: Record<string, string> = {
		"f.req": JSON.stringify([null, JSON.stringify(messageStruct)]),
		at: SNlM0e,
	};

	const url = new URL(
		"/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
		session.baseURL
	);

	Object.keys(params).forEach((key) =>
		url.searchParams.append(key, params[key])
	);

	let formBody: Array<any> | string = [];

	for (const property in data) {
		const encodedKey = encodeURIComponent(property);
		const encodedValue = encodeURIComponent(data[property]);
		formBody.push(encodedKey + "=" + encodedValue);
	}

	formBody = formBody.join("&");

	// console.log(formBody, url.toString());
	const response = await requestUrl({
		url: url.toString(),
		method: "POST",
		headers: session.headers,
		body: formBody,
	});
	// console.log("RES", response);
	const responseData = response.text;
	// console.log(responseData, responseData);
	const chatData = JSON.parse(responseData.split("\n")[3])[0][2];

	// Check if there is data
	if (!chatData) {
		return `Google Bard encountered an error ${responseData}.`;
	}

	// console.log("chatData", chatData);

	// Get important data, and update with important data if set to do so
	const jsonChatData = JSON.parse(chatData);

	const text: string = jsonChatData[0][0];

	const images: imagesT = jsonChatData[4][0][4]
		? jsonChatData[4][0][4].map((x: any) => {
				return {
					tag: x[2],
					url: x[0][5].match(/imgurl=([^&%]+)/)[1],
				};
		  })
		: undefined;
	const conversationID: string = jsonChatData[1][0];
	const responseID: string = jsonChatData[1][1];
	const choiceID: string = jsonChatData[4][0][0];
	//@ts-ignore
	const rID: string = parseInt(ids._reqID ?? 0) + 100000;

	return {
		content: formatMarkdown(text, images),
		images: images,
		ids: {
			// Make sure kept in order, because using Object.keys() to query above
			conversationID: conversationID,
			responseID: responseID,
			choiceID: choiceID,
			// @ts-ignore
			_reqID: rID,
		},
	};
};

const formatMarkdown: formatMarkdownT = (text, images) => {
	if (!images) return text;

	const formattedTags = new Map();

	for (const imageData of images) {
		const formattedTag = `![${imageData.tag.slice(1, -1)}](${
			imageData.url
		})`;

		if (formattedTags.has(imageData.tag)) {
			const existingFormattedTag = formattedTags.get(imageData.tag);

			formattedTags.set(
				imageData.tag,
				`${existingFormattedTag}\n${formattedTag}`
			);
		} else {
			formattedTags.set(imageData.tag, formattedTag);
		}
	}

	for (const [tag, formattedTag] of formattedTags) {
		text = text.replace(tag, formattedTag);
	}

	return text;
};

export const askAI: askAIT = async (message, useJSON = false) => {
	const qBardRes = await queryBard(message);

	if (typeof qBardRes != "string") {
		if (useJSON) return qBardRes;
		else return qBardRes.content;
	}
	return undefined;
};

export class Chat implements ChatT {
	ids: IdsT | undefined | Record<string, string>;
	constructor(ids?: IdsT) {
		this.ids = ids ? ids : {};
	}

	async ask(message: string, useJSON = false) {
		// if (typeof this.ids != "string") {
		const request = await queryBard(message, this.ids);
		if (typeof request != "string") {
			this.ids = { ...request.ids };
			if (useJSON) return request;
			else return request.content;
		}

		return request;
		// }
		// return "";
	}

	export() {
		return this.ids;
	}
}

export default { init, askAI, Chat };

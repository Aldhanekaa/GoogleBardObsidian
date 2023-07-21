import { requestUrl } from "obsidian";

/* eslint-disable no-mixed-spaces-and-tabs */
let session, SNlM0e;

export const init = async (sessionID) => {
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
		credentials: "include",
	});
	console.log("DATA", response.text);

	const data = await response.text;

	const match = data.match(/SNlM0e":"(.*?)"/);
	console.log("DATA", data, match);

	if (match) SNlM0e = match[1];
	else throw new Error("Could not get Google Bard.");

	return SNlM0e;
};

export const queryBard = async (message, ids = {}) => {
	console.log("SNlM0e", SNlM0e);
	if (!SNlM0e)
		throw new Error("Make sure to call Bard.init(SESSION_ID) first.");

	// HTTPS parameters
	const params = {
		bl: "boq_assistant-bard-web-server_20230711.08_p0",
		_reqID: ids?._reqID ?? "0",
		rt: "c",
	};

	// If IDs are provided, but doesn't have every one of the expected IDs, error
	const messageStruct = [[message], null, [null, null, null]];

	if (ids) {
		const { conversationID, responseID, choiceID } = ids;
		messageStruct[2] = [conversationID, responseID, choiceID];
	}

	// HTTPs data
	const data = {
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

	// Append parameters to the URL
	for (const key in params) {
		url.searchParams.append(key, params[key]);
	}

	// Encode the data
	const formBody = Object.entries(data)
		.map(
			([property, value]) =>
				`${encodeURIComponent(property)}=${encodeURIComponent(value)}`
		)
		.join("&");

	// console.log("FORM BODY", formBody);
	const response = await requestUrl({
		url: url.toString(),
		method: "POST",
		headers: session.headers,
		body: formBody,
		credentials: "include",
	});
	// console.log("response", response);

	const responseData = await response.text;

	const chatData = JSON.parse(responseData.split("\n")[3])[0][2];

	// Check if there is data
	if (!chatData) {
		throw new Error(`Google Bard encountered an error ${responseData}.`);
	}

	// Get important data, and update with important data if set to do so
	const parsedChatData = JSON.parse(chatData);
	const bardResponseData = JSON.parse(chatData)[4][0];

	let text = bardResponseData[1][0];

	let images = bardResponseData[4]?.map((x) => {
		return {
			tag: x[2],
			url: x[3][0][0],
			source: {
				original: x[0][0][0],
				website: x[1][0][0],
				name: x[1][1],
				favicon: x[1][3],
			},
		};
	});

	return {
		content: formatMarkdown(text, images),
		images: images,
		ids: {
			// Make sure kept in order, because using Object.keys() to query above
			conversationID: parsedChatData[1][0],
			responseID: parsedChatData[1][1],
			choiceID: parsedChatData[4][0][0],
			_reqID: parseInt(ids._reqID ?? 0) + 100000,
		},
	};
};

const formatMarkdown = (text, images) => {
	if (!images) return text;

	for (let imageData of images) {
		const formattedTag = `!${imageData.tag}(${imageData.url})`;
		text = text.replace(
			new RegExp(`(?!\\!)\\[${imageData.tag.slice(1, -1)}\\]`),
			formattedTag
		);
	}

	return text;
};

export const askAI = async (message, useJSON = false) => {
	if (useJSON) return await queryBard(message);
	else return (await queryBard(message)).content;
};

export class Chat {
	constructor(ids) {
		this.ids = ids;
	}

	async ask(message, useJSON = false) {
		let request = await queryBard(message, this.ids);
		this.ids = { ...request.ids };
		if (useJSON) return request;
		else return request.content;
	}

	export() {
		return this.ids;
	}
}

export default { init, askAI, Chat };

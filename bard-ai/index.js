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
	console.log("DATA", data, match[1]);

	if (match) SNlM0e = match[1];
	else throw new Error("Could not get Google Bard.");

	return SNlM0e;
};

export const queryBard = async (message, ids = {}) => {
	console.log("SNlM0e", SNlM0e);
	if (!SNlM0e)
		throw new Error("Make sure to call Bard.init(SESSION_ID) first.");

	// Parameters and POST data
	const params = {
		bl: "boq_assistant-bard-web-server_20230613.09_p0",
		_reqID: ids._reqID ? `${ids._reqID}` : "0",
		rt: "c",
	};

	const messageStruct = [
		[message],
		null,
		ids ? Object.values(ids).slice(0, 3) : [null, null, null],
	];

	const data = {
		"f.req": JSON.stringify([null, JSON.stringify(messageStruct)]),
		at: SNlM0e,
	};

	let url = new URL(
		"/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
		session.baseURL
	);

	Object.keys(params).forEach((key) =>
		url.searchParams.append(key, params[key])
	);

	let formBody = [];

	for (let property in data) {
		let encodedKey = encodeURIComponent(property);
		let encodedValue = encodeURIComponent(data[property]);
		formBody.push(encodedKey + "=" + encodedValue);
	}

	formBody = formBody.join("&");

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
	// console.log(SNlM0e, responseData, chatData);

	// Check if there is data
	if (!chatData) {
		throw new Error(`Google Bard encountered an error ${responseData}.`);
	}

	// Get important data, and update with important data if set to do so
	const jsonChatData = JSON.parse(chatData);
	// console.log(jsonChatData);

	let text = jsonChatData[4][0][1][0];

	let images = jsonChatData[4][0][4]
		? jsonChatData[4][0][4].map((x) => {
				return {
					tag: x[2],
					url: x[0][5].match(/imgurl=([^&%]+)/)[1],
				};
		  })
		: undefined;

	return {
		content: formatMarkdown(text, images),
		images: images,
		ids: {
			// Make sure kept in order, because using Object.keys() to query above
			conversationID: jsonChatData[1][0],
			responseID: jsonChatData[1][1],
			choiceID: jsonChatData[4][0][0],
			_reqID: parseInt(ids._reqID ?? 0) + 100000,
		},
	};
};

const formatMarkdown = (text, images) => {
	if (!images) return text;

	const formattedTags = new Map();

	for (let imageData of images) {
		// This can be optimized? `[...slice...]` is equal to `original`
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

	for (let [tag, formattedTag] of formattedTags) {
		text = text.replace(tag, formattedTag);
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

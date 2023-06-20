import { Check, Copy, Sparkles, User } from "lucide-react";
import * as React from "react";

import { ChatGlobalContext } from "src/machines/chat.context";
import { useActor } from "@xstate/react";
import { queryBardValidRes } from "bard-ai";

import ReactMarkdown from "../memoizedMarkdownReact";
import { Notice } from "obsidian";

// function RenderContent(content: string, ref: HTMLElement) {
// 	return MarkdownRenderer.renderMarkdown(content, ref);
// }

function LoadingChatbot() {
	return (
		<div className="BotChatCardStyled">
			<div className="UserProfile">
				<img
					className="LoadingImg"
					width="35px"
					height="35px"
					src="https://www.gstatic.com/lamda/images/sparkle_thinking_v2_darkmode_4c6a95bde842a7825eb83.gif"
				></img>
				{/* <img src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"></img> */}
			</div>
		</div>
	);
}
function RenderChatCard({
	chat,
	maxLen,
	idx,
}: {
	chat: queryBardValidRes | string;
	maxLen: number;
	idx: number;
}) {
	const [state, setState] = React.useState("idle");

	const copyToClipboard = () => {
		if (state == "idle") {
			if (typeof chat == "string") navigator.clipboard.writeText(chat);
			else {
				navigator.clipboard.writeText(chat.content);
			}

			setState("copied");
			new Notice("Copied to Clipboard!");
			setTimeout(() => {
				setState("idle");
			}, 500);
		}
	};

	if (typeof chat == "string") {
		return (
			<div className="ChatCardStyled">
				<div className="UserProfile">
					<User color="#2e80f2" width="35px" height="35px" />
				</div>
				<div
					className="contentContainer"
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
					}}
				>
					<div className="content">{chat}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="BotChatCardStyled">
			<div className="UserProfile">
				{maxLen - 1 == idx ? (
					<img
						className="LoadingImg"
						width="35px"
						height="35px"
						src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"
					></img>
				) : (
					<Sparkles color="#2e80f2" />
				)}
			</div>
			<div className="contentContainer">
				<div className="content">
					<ReactMarkdown>{chat.content}</ReactMarkdown>
				</div>

				<div className="chatButtons">
					<button
						className="ChatCardExeButton"
						id="LucideIconButton"
						aria-label="Copy"
						aria-label-delay="300"
						onClick={copyToClipboard}
					>
						{state == "copied" ? (
							<Check width="15" height="15" color="#5b99ef" />
						) : (
							<Copy width="15" height="15" color="#5b99ef" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function ChatsSection() {
	const globalContext = React.useContext(ChatGlobalContext);
	const [state] = useActor(globalContext.chatService);
	const { chats } = state.context;

	return (
		<div className="ChatsContainer">
			{chats.map((chat, idx) => (
				<RenderChatCard
					idx={idx}
					key={idx}
					maxLen={chats.length}
					chat={chat}
				/>
			))}

			{state.matches("chatToBard") && <LoadingChatbot />}
		</div>
	);
}

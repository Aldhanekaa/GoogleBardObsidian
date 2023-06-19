import { Copy, Sparkles, User } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { LucideIconButton } from "../LucideIconButton";

import { ChatGlobalContext } from "src/machines/chat.context";
import { useActor } from "@xstate/react";
import { queryBardValidRes } from "bard-ai";

import ReactMarkdown from "../memoizedMarkdownReact";

const ChatsContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow-y: auto;
`;

const ChatCardStyled = styled.div`
	.content {
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
	}
	p {
		padding: 0;
		margin: 0;
	}
	border-radius: 20px;
	padding: 20px;
	display: flex;
	gap: 20px;
`;

const BotChatCardStyled = styled(ChatCardStyled)`
	background-color: var(--color-base-00);
`;

const ChatCardExeButton = styled(LucideIconButton)`
	border: 1px solid var(--color-base-30);

	background-color: var(--color-base-00) !important;
`;

const LoadingImg = styled.img`
	box-shadow: none;
	border: none;
`;
// function RenderContent(content: string, ref: HTMLElement) {
// 	return MarkdownRenderer.renderMarkdown(content, ref);
// }

function LoadingChatbot() {
	return (
		<BotChatCardStyled>
			<div>
				<LoadingImg
					width="35px"
					height="35px"
					src="https://www.gstatic.com/lamda/images/sparkle_thinking_v2_darkmode_4c6a95bde842a7825eb83.gif"
				></LoadingImg>
				{/* <img src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"></img> */}
			</div>
		</BotChatCardStyled>
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
	if (typeof chat == "string") {
		return (
			<ChatCardStyled>
				<div>
					<User color="#2e80f2" />
				</div>
				<div>
					<div className="content">{chat}</div>
				</div>
			</ChatCardStyled>
		);
	}

	return (
		<BotChatCardStyled>
			<div>
				{maxLen - 1 == idx ? (
					<LoadingImg
						width="35px"
						height="35px"
						src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"
					></LoadingImg>
				) : (
					<Sparkles color="#2e80f2" />
				)}
			</div>
			<div>
				<div className="content">
					<ReactMarkdown>{chat.content}</ReactMarkdown>
				</div>

				<div>
					<ChatCardExeButton aria-label="Copy" aria-label-delay="300">
						<Copy width="15" height="15" color="#5b99ef" />
					</ChatCardExeButton>
				</div>
			</div>
		</BotChatCardStyled>
	);
}

export default function ChatsSection() {
	const globalContext = React.useContext(ChatGlobalContext);
	const [state] = useActor(globalContext.chatService);
	const { chats } = state.context;

	return (
		<ChatsContainer>
			{chats.map((chat, idx) => (
				<RenderChatCard
					idx={idx}
					key={idx}
					maxLen={chats.length}
					chat={chat}
				/>
			))}

			{state.matches("chatToBard") && <LoadingChatbot />}
		</ChatsContainer>
	);
}

import { Send } from "lucide-react";
import * as React from "react";
import styled from "styled-components";

import { ChatGlobalContext } from "../machines/chat.context";
import { useActor } from "@xstate/react";

const CommandsAppChatExecutionContainer = styled.form`
	width: 100%;
	display: flex;
	gap: 10px;
`;
const AppChatInput = styled.textarea`
	resize: none;
	height: 100%;
	width: 100%;
	font-size: 18px;
`;
const AppChatSendButton = styled.button`
	padding-top: 25px;
	padding-bottom: 25px;
	cursor: pointer;
`;

export default function ChatInput() {
	const globalContext = React.useContext(ChatGlobalContext);
	const [state] = useActor(globalContext.chatService);

	const [input, setInput] = React.useState("");

	const onEnterKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key == "Enter" && e.shiftKey == false) {
			e.preventDefault();

			submit();

			// this.myFormRef.submit();
		}
	};

	const submit = () => {
		if (state.matches("inputting")) {
			globalContext.chatService.send({
				type: "SUBMIT",
				data: {
					input: input,
				},
			});
			setInput("");
		}
	};

	return (
		<CommandsAppChatExecutionContainer
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<AppChatInput
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
				}}
				onKeyDown={onEnterKeyPress}
				maxLength={10000}
				placeholder="Enter your prompt here.."
			></AppChatInput>
			<AppChatSendButton type="submit" value="Submit">
				<Send />
			</AppChatSendButton>
		</CommandsAppChatExecutionContainer>
	);
}

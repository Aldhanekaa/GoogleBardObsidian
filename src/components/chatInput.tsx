import { Send } from "lucide-react";
import * as React from "react";

import { ChatGlobalContext } from "../machines/chat.context";
import { useActor } from "@xstate/react";

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
		<form
			className="CommandsAppChatExecutionContainer"
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<textarea
				className="AppChatInput"
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
				}}
				onKeyDown={onEnterKeyPress}
				maxLength={10000}
				placeholder="Enter your prompt here.."
			></textarea>
			<button className="AppChatSendButton" type="submit" value="Submit">
				<Send />
			</button>
		</form>
	);
}

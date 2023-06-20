import * as React from "react";

import { useApp } from "../hooks/useApp";
import ChatsSection from "./chats";

import ChatInput from "../chatInput";
import AppCommands from "./AppCommands/index";

export default function ReactView() {
	const App = useApp();

	if (App == undefined) {
		return <p>loading</p>;
	}

	// console.log("STATTE", state);
	return (
		<div className="AppContainer">
			{/* Chats Sections */}
			<ChatsSection />

			<div className="CommandsAppContainer">
				<AppCommands />
				<ChatInput />
			</div>
		</div>
	);
}

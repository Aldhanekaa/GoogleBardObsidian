import * as React from "react";

import styled from "styled-components";

import { useApp } from "../hooks/useApp";
import ChatsSection from "./chats";

import ChatInput from "../chatInput";
import AppCommands from "./AppCommands/index";

const AppContainer = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-bottom: 20px;
	gap: 20px;
`;

const CommandsAppContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export default function ReactView() {
	const App = useApp();

	if (App == undefined) {
		return <p>loading</p>;
	}

	// console.log("STATTE", state);
	return (
		<AppContainer>
			{/* Chats Sections */}
			<ChatsSection />

			<CommandsAppContainer>
				<AppCommands />
				<ChatInput />
			</CommandsAppContainer>
		</AppContainer>
	);
}

import * as React from "react";

import styled from "styled-components";
import { MessageCircle } from "lucide-react";

import { useApp } from "../hooks/useApp";
import ChatsSection from "./chats";

import { LucideIconButton } from "../LucideIconButton";
import RefreshButton from "./execButtons/Refresh";

import ChatInput from "../chatInput";

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

const AppCommandButtonsContainer = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
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
				<AppCommandButtonsContainer>
					<RefreshButton />
					<LucideIconButton
						aria-label="New Chat"
						aria-labeldelay="300"
					>
						<MessageCircle width="15" height="15" />
					</LucideIconButton>
				</AppCommandButtonsContainer>
				<ChatInput />
			</CommandsAppContainer>
		</AppContainer>
	);
}

import * as React from "react";
import styled from "styled-components";

import { LucideIconButton } from "../../LucideIconButton";
import RefreshButton from "../AppCommands/Refresh";
import { MessageCircle } from "lucide-react";
import { ChatGlobalContext } from "src/machines/chat.context";

const AppCommandButtonsContainer = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	gap: 10px;
`;
export default function AppCommands() {
	const globalContext = React.useContext(ChatGlobalContext);

	return (
		<AppCommandButtonsContainer>
			<RefreshButton />
			<LucideIconButton
				onClick={() => {
					globalContext.chatService.send({
						type: "NEW_CHAT",
					});
				}}
				aria-label="New Chat"
				aria-labeldelay="300"
			>
				<MessageCircle width="15" height="15" />
			</LucideIconButton>
		</AppCommandButtonsContainer>
	);
}

import * as React from "react";

import RefreshButton from "../AppCommands/Refresh";
import { MessageCircle } from "lucide-react";
import { ChatGlobalContext } from "src/machines/chat.context";

export default function AppCommands() {
	const globalContext = React.useContext(ChatGlobalContext);

	return (
		<div className="AppCommandButtonsContainer">
			<RefreshButton />
			<button
				id="LucideIconButton"
				onClick={() => {
					globalContext.chatService.send({
						type: "NEW_CHAT",
					});
				}}
				aria-label="New Chat"
				aria-labeldelay="300"
			>
				<MessageCircle width="15" height="15" />
			</button>
		</div>
	);
}

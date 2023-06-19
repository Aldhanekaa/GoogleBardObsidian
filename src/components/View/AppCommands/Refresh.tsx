import * as React from "react";
import { RotateCcw } from "lucide-react";
import { LucideIconButton } from "../../LucideIconButton";
import { ChatGlobalContext } from "src/machines/chat.context";

export default function RefreshButton() {
	const GlobalContext = React.useContext(ChatGlobalContext);

	return (
		<LucideIconButton
			onClick={() => {
				GlobalContext.loadBard();
			}}
			aria-label="Refresh"
			aria-label-delay="300"
		>
			<RotateCcw width="15" height="15" />
		</LucideIconButton>
	);
}

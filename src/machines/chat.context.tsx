import { ActorRefFrom, assign } from "xstate";
import { chatMachine } from "./chat";
import * as React from "react";
import { useInterpret } from "@xstate/react";
import Chats, { StatusObjT } from "bard-ai/Chats";

interface GlobalStateFuncArgument {
	newChat: () => void;
	askBard: (ask: string) => void;
	loadBard: () => void;
	chats: Chats;
}

interface ChatGlobalStateContextType {
	chatService: ActorRefFrom<typeof chatMachine>;
	loadBard: () => void;
	status: StatusObjT;
}

export const ChatGlobalContext = React.createContext(
	{} as ChatGlobalStateContextType
);

export const ChatGlobalStateProvider = ({
	askBard,
	newChat,
	children,
	loadBard,
	chats,
}: GlobalStateFuncArgument & { children: React.ReactNode }) => {
	// const e = useApp();

	React.useEffect(() => {
		console.log("chats.status!", chats.getStatus());
	}, [chats.status]);

	const chatService = useInterpret(chatMachine, {
		context: {
			chats: [],
		},
		services: {
			chatToBard: async (ctx, event) => {
				const response = await askBard(ctx.input);
				return {
					response: response,
					ask: ctx.input,
				};
			},
		},
		actions: {
			newChat: assign((ctx, event) => {
				newChat();

				return Object.assign({}, { ...ctx, chats: [] });
			}),
		},
	});

	return (
		<ChatGlobalContext.Provider
			value={{ status: chats.status, chatService, loadBard: loadBard }}
		>
			{children}
		</ChatGlobalContext.Provider>
	);
};

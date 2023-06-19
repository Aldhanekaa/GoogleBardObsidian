import { ActorRefFrom, assign } from "xstate";
import { chatMachine } from "./chat";
import * as React from "react";
import { useInterpret } from "@xstate/react";

interface GlobalStateFuncArgument {
	newChat: () => void;
	askBard: (ask: string) => void;
	loadBard: () => void;
}

interface ChatGlobalStateContextType {
	chatService: ActorRefFrom<typeof chatMachine>;
	loadBard: () => void;
}

export const ChatGlobalContext = React.createContext(
	{} as ChatGlobalStateContextType
);

export const ChatGlobalStateProvider = ({
	askBard,
	newChat,
	children,
	loadBard,
}: GlobalStateFuncArgument & { children: React.ReactNode }) => {
	const chatService = useInterpret(chatMachine, {
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
		<ChatGlobalContext.Provider value={{ chatService, loadBard: loadBard }}>
			{children}
		</ChatGlobalContext.Provider>
	);
};

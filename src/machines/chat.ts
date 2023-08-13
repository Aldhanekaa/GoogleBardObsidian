import { IAskResponseJSON } from "bard-ai";
import { EventObject, assign, createMachine } from "xstate";

export type chatMachineContextT = {
	input: string;
	chats: Array<IAskResponseJSON | string>;
};

export const chatMachine = createMachine(
	{
		id: "light",
		initial: "inputting",

		schema: {
			context: {} as chatMachineContextT,
		},
		context: {
			input: "",
			chats: [],
		},

		states: {
			inputting: {
				on: {
					NEW_CHAT: {
						actions: "newChat",
					},
					SUBMIT: {
						actions: assign<
							chatMachineContextT,
							EventObject & {
								data: {
									input: string;
								};
							}
						>((context, event) => {
							context.input = event.data.input;
							context.chats.push(event.data.input);
							return Object.assign({}, { ...context });
						}),
						target: "chatToBard",
					},
				},
			},
			chatToBard: {
				invoke: {
					src: "chatToBard",
					onDone: {
						target: "inputting",
						actions: "saveResponseAction",
					},
					onError: {},
				},
			},
			savingResponse: {
				invoke: {
					src: "saveResponse",
					onDone: {
						target: "inputting",
					},
				},
			},
		},
	},
	{
		actions: {
			saveResponseAction: assign<
				chatMachineContextT,
				EventObject & {
					data: {
						ask: string;
						response: IAskResponseJSON;
					};
				}
			>((context, event) => {
				// console.log("event", context, event);
				const data = event.data;
				context.chats.push(data.response);
				return Object.assign(
					{},
					{
						...context,
					}
				);
			}),
		},
		services: {
			chatToBard: async (ctx, event) => {},
		},
	}
);

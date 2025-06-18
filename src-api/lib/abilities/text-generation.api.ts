import { CoreMessage, streamText } from 'ai';
import z from 'zod';

import { createAgent, createAgentExtras, isValidModel } from '../utilities';

export const textGenerationSchema = z.object({
	text: z.string(),
	secret: z.string(),
	model: z.string(),
	provider: z.string(),
	chatId: z.string().optional(),
	previousMessage: z
		.object({
			id: z.string(),
			timestamp: z.string(),
			path: z.string(),
			newBranch: z.boolean().optional(),
			rootMessage: z
				.object({
					id: z.string(),
					prompt: z.string(),
				})
				.optional(),
		})
		.optional(),
	isOpenRouter: z.boolean().optional(),
	capabilities: z
		.object({
			webSearch: z.boolean().optional(),
		})
		.optional(),
});

export const textGeneration = async (
	config: z.infer<typeof textGenerationSchema>,
	messageHistory?: CoreMessage[],
	callbacks?: {
		onChunk?: Parameters<typeof streamText>[0]['onChunk'];
		onFinish?: () => void;
		onError?: Parameters<typeof streamText>[0]['onError'];
	},
): Promise<void> => {
	if (
		!isValidModel({
			provider: config.provider,
			model: config.model,
			isOpenRouter: !!config.isOpenRouter,
			capabilities: config.capabilities,
		})
	) {
		throw new Error('Invalid model');
	}

	const model = createAgent({
		key: config.secret,
		provider: config.provider,
		model: config.model,
		isOpenRouter: !!config.isOpenRouter,
		capabilities: config.capabilities,
	});

	const extras = createAgentExtras({
		key: config.secret,
		provider: config.provider,
		model: config.model,
		isOpenRouter: !!config.isOpenRouter,
		capabilities: config.capabilities,
	});

	// TODO: Look into better ways of doing message history, the issue atm is it'll soak up tokens as messages are added to the history
	const { fullStream } = streamText({
		model,
		...extras,
		...(messageHistory?.length
			? {
					messages: [
						...messageHistory,
						{
							role: 'user',
							content: config.text,
						},
					],
				}
			: {
					prompt: config.text,
				}),
	});

	for await (const part of fullStream) {
		if (part.type === 'reasoning') {
			callbacks?.onChunk?.({ chunk: part });
		}

		if (part.type === 'text-delta') {
			callbacks?.onChunk?.({ chunk: part });
		}

		if (part.type === 'finish') {
			callbacks?.onFinish?.();
		}

		if (part.type === 'error') {
			callbacks?.onError?.({ error: part.error });
		}
	}
};

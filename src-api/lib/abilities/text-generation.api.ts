import { CoreMessage, streamText } from 'ai';
import z from 'zod';

import { createAgent, isValidModel } from '../utilities';

export const textGenerationSchema = z.object({
	text: z.string(),
	secret: z.string(),
	model: z.string(),
	provider: z.string(),
	chatId: z.string().optional(),
	isOpenRouter: z.boolean().optional(),
	capabilities: z
		.object({
			webSearch: z.boolean().optional(),
		})
		.optional(),
});

export const textGeneration = (
	config: z.infer<typeof textGenerationSchema>,
	messageHistory?: CoreMessage[],
): {
	stream: ReturnType<typeof streamText>['textStream'];
} => {
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

	const { textStream } = streamText({
		model: createAgent({
			key: config.secret,
			provider: config.provider,
			model: config.model,
			isOpenRouter: !!config.isOpenRouter,
			capabilities: config.capabilities,
		}),
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

	return {
		stream: textStream,
	};
};

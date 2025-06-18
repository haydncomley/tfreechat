import { experimental_generateImage as generateImage } from 'ai';
import z from 'zod';

import { createImageAgent, isValidModel } from '../utilities';

export const imageGenerationSchema = z.object({
	text: z.string(),
	secret: z.string(),
	model: z.string(),
	provider: z.string(),
	chatId: z.string().optional(),
	previousMessage: z
		.object({
			id: z.string(),
			timestamp: z.string(),
			path: z.string().optional(),
		})
		.optional(),
});

export const imageGeneration = async (
	config: z.infer<typeof imageGenerationSchema>,
): Promise<{
	image: Buffer;
	extension: string;
	mimeType: string;
}> => {
	if (
		!isValidModel({
			provider: config.provider,
			model: config.model,
			capabilities: {
				imageGeneration: true,
			},
		})
	) {
		throw new Error('Invalid model');
	}

	const imageResult = await generateImage({
		model: createImageAgent({
			key: config.secret,
			provider: config.provider,
			model: config.model,
		}),
		prompt: config.text,
	});

	const imageExtension = imageResult.image.mimeType.split('/')[1];
	const imageBuffer = Buffer.from(imageResult.image.base64, 'base64');

	return {
		image: imageBuffer,
		extension: imageExtension,
		mimeType: imageResult.image.mimeType,
	};
};

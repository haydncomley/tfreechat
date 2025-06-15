import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { HttpsError } from 'firebase-functions/https';
import { ZodSchema } from 'zod';

import { Model, AI_PROVIDERS } from './types';

export const isValidModel = (details: {
	provider: string;
	model: string;
	isOpenRouter?: boolean;
	capabilities?: Model['capabilities'];
}) => {
	const wantedProvider = AI_PROVIDERS.find((p) => p.id === details.provider);
	if (!wantedProvider) return false;

	const wantedModel = wantedProvider.models.find((m) => m.id === details.model);
	if (!wantedModel) return false;

	if (details.capabilities) {
		const hasCapability = Object.entries(details.capabilities).some(
			([key, value]) => {
				return (
					wantedModel.capabilities?.[
						key as keyof typeof wantedModel.capabilities
					] === value
				);
			},
		);

		if (!hasCapability) return false;
	}

	if (details.isOpenRouter && !wantedModel.openRouterId) {
		return false;
	}

	return wantedModel;
};

export const validateBody = <T extends object>(
	schema: ZodSchema<T>,
	details?: unknown,
): details is T => {
	return schema.safeParse(details).success;
};

export const createAgent = (details: {
	key: string;
	provider: string;
	model: string;
	isOpenRouter?: boolean;
	capabilities?: Model['capabilities'];
}) => {
	const model = isValidModel(details);

	if (!model) {
		throw new HttpsError('invalid-argument', 'Invalid model');
	}

	if (details.isOpenRouter && model.openRouterId) {
		return createOpenRouter({ apiKey: details.key })(model.openRouterId);
	}

	switch (details.provider) {
		case 'openai':
			return createOpenAI({ apiKey: details.key })(model.id);
		case 'anthropic':
			return createAnthropic({ apiKey: details.key })(model.id);
		case 'google':
			return createGoogleGenerativeAI({ apiKey: details.key })(model.id, {
				useSearchGrounding: details.capabilities?.webSearch ? true : undefined,
			});
		default:
			throw new HttpsError('invalid-argument', 'Invalid provider');
	}
};

export const createImageAgent = (details: {
	key: string;
	provider: string;
	model: string;
	isOpenRouter?: boolean;
}) => {
	const model = isValidModel({
		...details,
		capabilities: { imageGeneration: true },
	});

	if (!model) {
		throw new HttpsError('invalid-argument', 'Invalid model');
	}

	switch (details.provider) {
		case 'openai':
			return createOpenAI({ apiKey: details.key }).image(model.id);
		default:
			throw new HttpsError('invalid-argument', 'Invalid provider');
	}
};

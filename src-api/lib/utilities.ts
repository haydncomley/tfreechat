import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ToolSet } from 'ai';
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

	const wantedCapabilities = Object.entries(details.capabilities ?? {}).filter(
		([, value]) => value,
	);

	if (wantedCapabilities.length) {
		const hasCapability = wantedCapabilities.some(([key, value]) => {
			return (
				wantedModel.capabilities?.[
					key as keyof typeof wantedModel.capabilities
				] === value
			);
		});

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
			return createOpenAI({ apiKey: details.key }).responses(model.id);
		case 'anthropic':
			return createAnthropic({ apiKey: details.key })(model.id);
		case 'google':
			return createGoogleGenerativeAI({ apiKey: details.key })(
				model.id,
				details.capabilities?.webSearch
					? {
							useSearchGrounding: true,
						}
					: undefined,
			);
		default:
			throw new HttpsError('invalid-argument', 'Invalid provider');
	}
};

export const createAgentExtras = (details: {
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

	const extras: {
		tools?: ToolSet;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		providerOptions?: Record<string, any>;
	} = {};

	switch (details.provider) {
		case 'openai':
			if (details.capabilities?.webSearch) {
				extras.tools = {};
				extras.tools.web_search_preview = createOpenAI({
					apiKey: details.key,
				}).tools.webSearchPreview();
			}
			break;
		default:
			break;
	}

	return extras;
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

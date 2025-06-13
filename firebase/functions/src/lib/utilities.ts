import { HttpsError } from "firebase-functions/https";
import { AI_PROVIDERS } from "./constants";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Model } from "./types";

export const isValidModel = (details: { provider: string, model: string, capabilities?: Model['capabilities'] }) => {
	const wantedProvider = AI_PROVIDERS.find((p) => p.id === details.provider);
	if (!wantedProvider) return false;

	const wantedModel = wantedProvider.models.find((m) => m.id === details.model);
	if (!wantedModel) return false;

	if (details.capabilities) {
		const hasCapability = Object.entries(details.capabilities).some(([key, value]) => {
			return wantedModel.capabilities?.[key as keyof typeof wantedModel.capabilities] === value;
		});

		if (!hasCapability) return false;
	}

	return true;
};

export const createAgent = (details: { key: string, provider: string, model: string }) => {
	if (!isValidModel(details)) {
		throw new HttpsError('invalid-argument', 'Invalid model');
	}

	if (details.provider === 'openai') {
		return createOpenAI({ apiKey: details.key })(details.model);
	}

	if (details.provider === 'anthropic') {
		return createAnthropic({ apiKey: details.key })(details.model);
	}

	if (details.provider === 'google') {
		return createGoogleGenerativeAI({ apiKey: details.key })(details.model);
	}

	throw new HttpsError('invalid-argument', 'Invalid provider');
};

export const createImageAgent = (details: { key: string, provider: string, model: string }) => {
	if (!isValidModel({ ...details, capabilities: { imageGeneration: true } })) {
		throw new HttpsError('invalid-argument', 'Invalid model');
	}

	if (details.provider === 'openai') {
		return createOpenAI({ apiKey: details.key }).image(details.model);
	}

	throw new HttpsError('invalid-argument', 'Invalid provider');
};
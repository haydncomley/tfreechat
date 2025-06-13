import { HttpsError } from "firebase-functions/https";
import { AI_PROVIDERS } from "./constants";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const isValidModel = (provider: string, model: string) => {
	const wantedProvider = AI_PROVIDERS.find((p) => p.id === provider);
	if (!wantedProvider) return false;

	const wantedModel = wantedProvider.models.find((m) => m.id === model);
	if (!wantedModel) return false;

	return true;
};

export const createAgent = (key: string, provider: string, model: string) => {
	if (!isValidModel(provider, model)) {
		throw new HttpsError('invalid-argument', 'Invalid model');
	}

	if (provider === 'openai') {
		return createOpenAI({ apiKey: key })(model);
	}

	if (provider === 'anthropic') {
		return createAnthropic({ apiKey: key })(model);
	}

	throw new HttpsError('invalid-argument', 'Invalid provider');
};
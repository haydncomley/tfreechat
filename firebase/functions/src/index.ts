import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const createModel = (key: string, provider: string) => {
	if (provider === 'openai') {
		return createOpenAI({ apiKey: key });
	}
	throw new HttpsError('invalid-argument', 'Provider is required');
};

export const aiText = onCall(async (request) => {
	const { text, key, model, provider } = request.data;

	if (!text) {
		throw new HttpsError('invalid-argument', 'Text is required');
	}

	if (!key) {
		throw new HttpsError('invalid-argument', 'Key is required');
	}

	if (!model) {
		throw new HttpsError('invalid-argument', 'Model is required');
	}

	if (!provider) {
		throw new HttpsError('invalid-argument', 'Provider is required');
	}

	const aiModel = createModel(key, provider);

	const { text: result } = await generateText({
		model: aiModel(model),
		prompt: text,
	});

	return result;
});

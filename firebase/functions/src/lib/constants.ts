import { Provider } from './types';

export const AI_PROVIDERS: Provider[] = [
	{
		id: 'openai',
		label: 'OpenAI',
		models: [
			{ id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
			{ id: 'gpt-4o', label: 'GPT-4o' },
			{ id: 'o3-mini-2025-01-31', label: 'O3 Mini' },
			{ id: 'dall-e-2', label: 'Dall-E 2', capabilities: { imageGeneration: true } },
		],
	},
	{
		id: 'anthropic',
		label: 'Anthropic',
		models: [
			{ id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
			{ id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
			{ id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
		],
	},
	{
		id: 'google',
		label: 'Google',
		models: [
			{ id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
			{ id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
		],
	},
];

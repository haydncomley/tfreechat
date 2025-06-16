import { Provider } from './types';

export const AI_PROVIDERS: Provider[] = [
	{
		id: 'openai',
		label: 'OpenAI',
		models: [
			{
				id: 'gpt-3.5-turbo',
				openRouterId: 'openai/gpt-3.5-turbo',
				label: 'GPT-3.5 Turbo',
				capabilities: { webSearch: true },
			},
			{
				id: 'gpt-4o',
				openRouterId: 'openai/gpt-4o',
				label: 'GPT-4o',
				capabilities: { webSearch: true },
			},
			{
				id: 'gpt-4o-mini',
				openRouterId: 'openai/gpt-4o-mini',
				label: 'GPT-4o Mini',
				capabilities: { webSearch: true },
			},
			{ id: 'o3-mini', openRouterId: 'openai/o3-mini', label: 'O3 Mini' },
			{
				id: 'dall-e-2',
				label: 'Dall-E 2',
				capabilities: { imageGeneration: true },
			},
		],
	},
	{
		id: 'anthropic',
		label: 'Anthropic',
		models: [
			{
				id: 'claude-3-5-haiku-latest',
				openRouterId: 'anthropic/claude-3.5-haiku',
				label: 'Claude 3.5 Haiku',
			},
			{
				id: 'claude-3-5-sonnet-latest',
				openRouterId: 'anthropic/claude-3.5-sonnet',
				label: 'Claude 3.5 Sonnet',
			},
			{
				id: 'claude-3-7-sonnet-20250219',
				openRouterId: 'anthropic/claude-3.7-sonnet',
				label: 'Claude 3.7 Sonnet',
			},
		],
	},
	{
		id: 'google',
		label: 'Google',
		models: [
			{
				id: 'gemini-1.5-flash',
				openRouterId: 'google/gemini-flash-1.5',
				label: 'Gemini 1.5 Flash',
				capabilities: { webSearch: true },
			},
			{
				id: 'gemini-2.0-flash',
				openRouterId: 'google/gemini-2.0-flash-001',
				label: 'Gemini 2.0 Flash',
				capabilities: { webSearch: true },
			},
		],
	},
];

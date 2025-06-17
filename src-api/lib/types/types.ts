import { AnthropicProvider } from '@ai-sdk/anthropic';
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';
import type { OpenAIProvider } from '@ai-sdk/openai';
import { Timestamp } from 'firebase/firestore';

type OpenAiModels = Exclude<Parameters<OpenAIProvider>[0], object>;
type AnthropicModels = Exclude<Parameters<AnthropicProvider>[0], object>;
type GoogleModels = Exclude<Parameters<GoogleGenerativeAIProvider>[0], object>;

export interface Provider {
	id: 'openai' | 'anthropic' | 'google';
	label: string;
	models: Model[];
}

export interface Model {
	id: OpenAiModels | AnthropicModels | GoogleModels | (string & {});
	openRouterId?: string;
	label: string;
	capabilities?: {
		imageGeneration?: boolean;
		webSearch?: boolean;
		reasoning?: boolean;
	};
}

export interface Agent {
	secret: string;
	isOpenRouter?: boolean;
	model: string;
	provider: string;
	capabilities?: Model['capabilities'];
}

export interface Chat {
	id: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	prompt: string;
	summary?: string;
	lastMessageId?: string;
	public?: boolean;
}

export interface ChatMessage {
	id: string;
	path: string[];
	createdAt: Timestamp;
	prompt: string;
	ai: {
		model: string;
		provider: string;
	};
	summary?: string;
	reply?: ChatReply;
}

export interface ChatReply {
	id: string;
	createdAt: Timestamp;
	text?: string;
	image?: string;
	error?: string | null;
	capabilitiesUsed?: {
		webSearch?: boolean;
		imageGeneration?: boolean;
	};
}

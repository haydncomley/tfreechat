import { AnthropicProvider } from '@ai-sdk/anthropic';
import type { OpenAIProvider } from '@ai-sdk/openai';
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';
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
	label: string;
	capabilities?: {
		imageGeneration?: boolean;
	}
}

export interface Agent {
	secret: string;
	model: string;
	provider: string;
}

export interface Chat {
	id: string;
	createdAt: Timestamp;
	prompt: string;
	summary?: string;
	lastMessageId?: string;
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
}

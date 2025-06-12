import { Timestamp } from 'firebase/firestore';

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
}

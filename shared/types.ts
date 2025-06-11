import { Timestamp } from 'firebase/firestore';

export interface Chat {
	id: string;
	title: string;
	lastMessageTime: Timestamp;
	selectedMessageId?: string;
}

export interface ChatMessage {
	id: string;
	branches: string[];

	text: string;
	date: Timestamp;
	modelId: string;
	reply?: ChatReply;
}

export interface ChatReply {
	id: string;
	date: Timestamp;
	text: string;
	image?: unknown;
}

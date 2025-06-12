import { ChatMessage } from '~/types';
import { useAuth } from '../use-auth';
import { useCollectionSnapshot } from '../use-snapshot';
import { orderBy } from 'firebase/firestore';

export const useChatMessages = (chatId?: string | null) => {
	const { user } = useAuth();
	const messages = useCollectionSnapshot<ChatMessage>(
		user?.uid && chatId
			? `users/${user.uid}/chats/${chatId}/messages`
			: undefined,
		orderBy('createdAt', 'asc'),
	);

	return {
		messages: chatId ? messages : [],
	};
};

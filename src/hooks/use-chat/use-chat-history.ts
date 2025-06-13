import { orderBy } from 'firebase/firestore';
import { useQueryState } from 'nuqs';

import { Chat } from '../../../firebase/functions/src/lib/types';
import { useAuth } from '../use-auth';
import { useCollectionSnapshot } from '../use-snapshot';

export const useChatHistory = () => {
	const { user } = useAuth();
	const [currentChatId, setCurrentChatId] = useQueryState('chat');

	const chats = useCollectionSnapshot<Chat>(
		user?.uid ? `users/${user.uid}/chats` : undefined,
		orderBy('createdAt', 'desc'),
	);

	const setCurrentChat = (chat?: string | Chat | null) => {
		if (typeof chat === 'string') {
			setCurrentChatId(chat);
		} else if (chat) {
			setCurrentChatId(chat.id);
		} else {
			setCurrentChatId(null);
		}
	};

	return {
		chats,
		currentChatId,
		currentChat: chats.find((chat) => chat.id === currentChatId) ?? null,
		setCurrentChat,
	};
};

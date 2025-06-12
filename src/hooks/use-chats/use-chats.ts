import { Chat } from '~/types';
import { useAuth } from '../use-auth';
import { useCollectionSnapshot } from '../use-snapshot';
import { orderBy } from 'firebase/firestore';

export const useChats = () => {
	const { user } = useAuth();
	const chats = useCollectionSnapshot<Chat>(
		user?.uid ? `users/${user.uid}/chats` : undefined,
		orderBy('createdAt', 'desc'),
	);

	return {
		chats,
	};
};

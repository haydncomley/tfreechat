import { useMutation } from '@tanstack/react-query';
import { orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';

import { Chat } from '~/api';

import { useAuth } from '../use-auth';
import { useCollectionSnapshot, useDocSnapshot } from '../use-snapshot';

export const useChatHistory = () => {
	const { user } = useAuth();
	const { chatId: sharedChatId, userId: sharedUserId } = useParams();

	const [currentChatId, setCurrentChatId] = useQueryState('chat');
	const [branchId, setBranchId] = useQueryState('branch');
	const [viewBranchId, setViewBranchId] = useQueryState('viewBranch');

	const wantedChatId = sharedChatId ?? currentChatId;

	const { mutateAsync: deleteChat, isPending: isDeletingChat } = useMutation({
		mutationKey: ['deleteChat'],
		mutationFn: async (options: { chatId: string }) => {
			const token = await user?.getIdToken();
			const functionsUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

			const response = await fetch(`${functionsUrl}/chatDelete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ chatId: options.chatId }),
			});

			if (!response.ok) {
				throw new Error('Failed to delete chat');
			}

			return response.json();
		},
	});

	const { mutateAsync: shareChat, isPending: isSharingChat } = useMutation({
		mutationKey: ['shareChat'],
		mutationFn: async (options: { chatId: string; shouldShare: boolean }) => {
			const token = await user?.getIdToken();
			const functionsUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

			const response = await fetch(`${functionsUrl}/chatShare`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					chatId: options.chatId,
					shouldShare: options.shouldShare,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to share chat');
			}

			return response.json();
		},
	});

	const chats = useCollectionSnapshot<Chat>(
		user?.uid ? `users/${user.uid}/chats` : undefined,
		{ filters: [orderBy('createdAt', 'desc')] },
		[user?.uid],
	);

	const sharedChat = useDocSnapshot<Chat>(
		sharedChatId ? `users/${sharedUserId}/chats/${sharedChatId}` : undefined,
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
		currentChat:
			sharedChat ?? chats.find((chat) => chat.id === wantedChatId) ?? null,
		setCurrentChat,
		deleteChat,
		isDeletingChat,
		shareChat,
		isSharingChat,
		branchId,
		setBranchId,
		viewBranchId,
		setViewBranchId,
	};
};

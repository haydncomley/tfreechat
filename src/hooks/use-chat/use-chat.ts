'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderBy } from 'firebase/firestore';
import { useQueryState } from 'nuqs';

import { Agent, ChatMessage } from '~/api';

import { useAuth } from '../use-auth';
import { useCollectionSnapshot } from '../use-snapshot';

export const useChat = (id?: string | null) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const [chatId] = useQueryState('chat');
	const wantedChatId = id ?? chatId;

	const { data: responseStream } = useQuery({
		queryKey: ['responseStream'],
		queryFn: () => '',
	});

	const { data: isResponseStreaming } = useQuery({
		queryKey: ['responseStreamIsLoading'],
		queryFn: () => false,
	});

	const {
		mutateAsync: sendMessage,
		isPending: isSendingMessage,
		error,
	} = useMutation({
		mutationKey: ['sendMessage'],
		mutationFn: async (options: {
			text: string;
			ai: Agent;
			chatId?: string | null;
		}) => {
			try {
				if (!user) throw new Error('User not authenticated');
				queryClient.setQueryData(['responseStreamIsLoading'], true);

				const token = await user.getIdToken();
				const functionsUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

				const response = await fetch(`${functionsUrl}/aiText`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						text: options.text,
						...options.ai,
						chatId: chatId === null ? undefined : (chatId ?? wantedChatId),
					}),
				});

				if (!response.ok) {
					if (response.status === 401) {
						throw new Error('Authentication failed. Please sign in again.');
					}
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) throw new Error('No response body');

				let buffer = '';
				let accumulatedText = '';

				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');

					buffer = lines.pop() || '';

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);

							if (data === '[DONE]') {
								continue;
							}

							try {
								const parsed = JSON.parse(data);
								if (parsed.text) {
									accumulatedText += parsed.text;
									queryClient.setQueryData(['responseStream'], accumulatedText);
								}
							} catch (e) {
								console.error('Failed to parse SSE data:', e);
							}
						}
					}
				}

				return accumulatedText;
			} catch (err) {
				throw new Error(
					err instanceof Error ? err.message : 'An error occurred',
				);
			} finally {
				queryClient.setQueryData(['responseStreamIsLoading'], false);
			}
		},
		onMutate: () => {
			queryClient.setQueryData(['responseStream'], '');
		},
	});

	const messages = useCollectionSnapshot<ChatMessage>(
		user?.uid && wantedChatId
			? `users/${user.uid}/chats/${wantedChatId}/messages`
			: undefined,
		orderBy('createdAt', 'asc'),
	);

	return {
		sendMessage,
		isSendingMessage,
		responseStream,
		isResponseStreaming,
		messages: wantedChatId ? messages : [],
		error,
	};
};

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderBy, where } from 'firebase/firestore';

import { Agent, AI_PROVIDERS, ChatMessage } from '~/api';

import { useAuth } from '../use-auth';
import { useCollectionSnapshot } from '../use-snapshot';
import { useChatHistory } from './use-chat-history';

export const useChat = (view?: { userId: string; chatId: string } | null) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const { currentChatId, viewBranchId, currentChat } = useChatHistory();
	const wantedChatId = view?.chatId ?? currentChatId;
	const wantedUserId = view?.userId ?? user?.uid;

	const { data: prompt } = useQuery({
		queryKey: ['sendingPrompt'],
		queryFn: () => '',
	});

	const { data: responseStream } = useQuery({
		queryKey: ['responseStream'],
		queryFn: () => '',
	});

	const { data: reasoningStream } = useQuery({
		queryKey: ['reasoningStream'],
		queryFn: () => '',
	});

	const { data: isResponseStreaming } = useQuery({
		queryKey: ['responseStreamIsLoading'],
		queryFn: () => false,
	});

	const { data: isReasoningStreaming } = useQuery({
		queryKey: ['reasoningStreamIsLoading'],
		queryFn: () => false,
	});

	const getApiKey = (provider: string, model: string) => {
		const modelDetails = AI_PROVIDERS.find(
			(p) => p.id === provider,
		)?.models.find((m) => m.id === model);

		const openKey = modelDetails?.openRouterId
			? localStorage.getItem('openrouter-key')
			: null;

		return {
			secret: openKey || localStorage.getItem(`${provider}-key`),
			isOpenRouter: !!modelDetails?.openRouterId && !!openKey,
		};
	};

	const {
		mutateAsync: sendMessage,
		isPending: isSendingMessage,
		error: textError,
	} = useMutation({
		mutationKey: ['sendMessage'],
		mutationFn: async (options: {
			text: string;
			ai: Agent;
			chatId?: string | null;
			isOpenRouter?: boolean;
			previousMessage?: ChatMessage;
			isNewBranch?: boolean;
			rootMessage?: {
				id: string;
				prompt: string;
			};
			onCreate?: (details: {
				messageId: string;
				chatId: string;
				path: string[];
			}) => void;
		}) => {
			try {
				if (!user) throw new Error('User not authenticated');
				queryClient.setQueryData(['responseStreamIsLoading'], true);
				queryClient.setQueryData(['reasoningStreamIsLoading'], true);

				const token = await user.getIdToken();
				const functionsUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

				queryClient.setQueryData(['sendingPrompt'], options.text);

				const previousMessageId = options.previousMessage?.id;
				const isFirstBranchFromMessage =
					options.previousMessage &&
					options.isNewBranch &&
					options.previousMessage.path.length === 1 &&
					previousMessageId &&
					currentChat?.branches?.[previousMessageId] === undefined;

				const response = await fetch(`${functionsUrl}/aiText`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						...options.ai,
						text: options.text,
						chatId:
							currentChatId === null
								? undefined
								: (currentChatId ?? wantedChatId),
						previousMessage: options.previousMessage
							? {
									id: options.previousMessage.id,
									timestamp: new Date(
										options.previousMessage.createdAt.toMillis() + 1000,
									).toISOString(),
									path: options.previousMessage.path.at(0),
									newBranch: options.isNewBranch,
									rootMessage: isFirstBranchFromMessage
										? options.rootMessage
										: undefined,
								}
							: undefined,
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
				let accumulatedReasoning = '';
				let messageId: string | undefined = undefined;
				let chatId: string | undefined = undefined;
				let path: string[] | undefined = undefined;

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
									queryClient.setQueryData(['reasoningStreamIsLoading'], false);
								}
								if (parsed.reasoning) {
									accumulatedReasoning += parsed.reasoning;
									queryClient.setQueryData(
										['reasoningStream'],
										accumulatedReasoning,
									);
								}
								if (parsed.path) {
									path = parsed.path;
								}
								if (parsed.messageId) {
									messageId = parsed.messageId;
								}
								if (parsed.chatId) {
									chatId = parsed.chatId;
								}

								if (parsed.path && path && messageId && chatId) {
									options.onCreate?.({
										messageId,
										chatId,
										path,
									});
								}
							} catch (e) {
								console.error('Failed to parse SSE data:', e);
							}
						}
					}
				}

				return {
					messageId,
					chatId,
					path,
					accumulatedText,
					accumulatedReasoning,
				};
			} catch (err) {
				throw new Error(
					err instanceof Error ? err.message : 'An error occurred',
				);
			} finally {
				queryClient.setQueryData(['responseStreamIsLoading'], false);
				queryClient.setQueryData(['sendingPrompt'], '');
			}
		},
		onMutate: () => {
			queryClient.setQueryData(['responseStream'], '');
			queryClient.setQueryData(['reasoningStream'], '');
		},
	});

	const {
		mutateAsync: createImage,
		isPending: isCreatingImage,
		error: imageError,
	} = useMutation({
		mutationKey: ['createImage'],
		mutationFn: async (options: {
			text: string;
			ai: Agent;
			chatId?: string | null;
			isOpenRouter?: boolean;
			previousMessage?: ChatMessage;
			isNewBranch?: boolean;
			onCreate?: (details: {
				messageId: string;
				chatId: string;
				path: string[];
			}) => void;
		}) => {
			try {
				if (!user) throw new Error('User not authenticated');
				queryClient.setQueryData(['responseStreamIsLoading'], true);

				const token = await user.getIdToken();
				const functionsUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

				queryClient.setQueryData(['sendingPrompt'], options.text);
				queryClient.setQueryData(['responseStreamIsLoading'], false);

				const response = await fetch(`${functionsUrl}/aiImage`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						...options.ai,
						text: options.text,
						chatId:
							currentChatId === null
								? undefined
								: (currentChatId ?? wantedChatId),
						previousMessage: options.previousMessage
							? {
									id: options.isNewBranch
										? options.previousMessage.id
										: options.previousMessage.path.at(0),
									timestamp: new Date(
										options.previousMessage.createdAt.toMillis() + 1000,
									).toISOString(),
									path: options.isNewBranch
										? undefined
										: options.previousMessage.path.at(0),
								}
							: undefined,
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
				let messageId: string | undefined = undefined;
				let chatId: string | undefined = undefined;
				let path: string[] | undefined = undefined;

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
								if (parsed.path) {
									path = parsed.path;
								}
								if (parsed.messageId) {
									messageId = parsed.messageId;
								}
								if (parsed.chatId) {
									chatId = parsed.chatId;
								}

								if (parsed.path && path && messageId && chatId) {
									options.onCreate?.({
										messageId,
										chatId,
										path,
									});
								}
							} catch (e) {
								console.error('Failed to parse SSE data:', e);
							}
						}
					}
				}

				return {
					messageId,
					chatId,
					path,
				};
			} catch (err) {
				throw new Error(
					err instanceof Error ? err.message : 'An error occurred',
				);
			} finally {
				queryClient.setQueryData(['responseStreamIsLoading'], false);
				queryClient.setQueryData(['sendingPrompt'], '');
			}
		},
		onMutate: () => {
			queryClient.setQueryData(['responseStream'], '');
		},
	});

	const messages = useCollectionSnapshot<ChatMessage>(
		wantedUserId && wantedChatId
			? `users/${wantedUserId}/chats/${wantedChatId}/messages`
			: undefined,
		{
			filters: [
				orderBy('createdAt', 'asc'),
				...(viewBranchId
					? [where('path', 'array-contains', viewBranchId)]
					: currentChat?.lastMessageId
						? [where('path', 'array-contains', currentChat.lastMessageId)]
						: []),
			],
			retainDataBetweenQueries: !!currentChat,
		},
		[viewBranchId, currentChat?.lastMessageId, wantedUserId, wantedChatId],
	);

	// TODO: This hook could do with some refactoring to split logic out, but it works for now.
	return {
		sendMessage,
		isSendingMessage,
		createImage,
		isCreatingImage,
		isLoading: isSendingMessage || isCreatingImage,
		responseStream,
		isResponseStreaming,
		reasoningStream,
		isReasoningStreaming,
		messages: wantedChatId ? messages : [],
		error: textError ?? imageError,
		prompt,
		getApiKey,
	};
};

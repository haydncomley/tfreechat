'use client';

import { useState, useCallback } from 'react';
import { auth } from '~/utils/firebase.utils';
import { Agent } from '~/types';

export const useChat = () => {
	const [response, setResponse] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const chat = useCallback(
		async (options: { text: string; ai: Agent; chatId?: string }) => {
			setIsLoading(true);
			setError(null);
			setResponse(''); // Clear previous response

			try {
				// Get the current user's ID token
				const user = auth.currentUser;
				if (!user) {
					throw new Error('User not authenticated');
				}

				const idToken = await user.getIdToken();

				// Get the Firebase Functions URL
				const functionsUrl =
					process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
					`https://us-central1-${process.env.NEXT_PUBLIC_FB_PROJECT_ID}.cloudfunctions.net`;

				const response = await fetch(`${functionsUrl}/aiText`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${idToken}`,
					},
					body: JSON.stringify({
						text: options.text,
						...(options.chatId && { chatId: options.chatId }),
						...options.ai,
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

				if (!reader) {
					throw new Error('No response body');
				}

				let buffer = '';
				let accumulatedText = '';

				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');

					// Keep the last line in buffer if it's incomplete
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
									setResponse(accumulatedText);
								}
							} catch (e) {
								console.error('Failed to parse SSE data:', e);
							}
						}
					}
				}

				return accumulatedText;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'An error occurred';
				setError(errorMessage);
				console.error('Chat error:', err);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	return {
		chat,
		response,
		isLoading,
		error,
	};
};

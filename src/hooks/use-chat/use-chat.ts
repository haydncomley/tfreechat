'use client';

import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '~/utils/firebase.utils';

type AISettings = { key: string; model: string; provider: string };

export const useChat = () => {
	const {
		mutateAsync: chat,
		data: response,
		isPending: isLoading,
	} = useMutation({
		mutationFn: async (options: { text: string; ai: AISettings }) => {
			const aiTranscribe = httpsCallable<{ text: string } & AISettings, string>(
				functions,
				'aiText',
			);

			const { data } = await aiTranscribe({
				...options.ai,
				text: options.text,
			});

			return data;
		},
	});

	return {
		chat,
		response,
		isLoading,
	};
};

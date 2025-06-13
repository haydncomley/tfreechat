'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat, useChatHistory } from '~/hooks/use-chat';

export const ActionBar = () => {
	const { sendMessage, createImage } = useChat();
	const { currentChat } = useChatHistory();

	// State
	const [prompt, setPrompt] = useState('');
	const [apiKey, setApiKey] = useState(
		process.env.NEXT_PUBLIC_DEFAULT_KEY || '',
	);
	const [useOpenRouter, setUseOpenRouter] = useState(false);

	// Query State
	const [model, setModel] = useQueryState(
		'model',
		parseAsString.withDefault(
			process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-3.5-turbo',
		),
	);
	const [provider, setProvider] = useQueryState(
		'provider',
		parseAsString.withDefault(
			process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'openai',
		),
	);

	const actionType = useMemo(() => {
		const currentModel = AI_PROVIDERS.find(
			(p) => p.id === provider,
		)?.models.find((m) => m.id === model);

		if (currentModel?.capabilities?.imageGeneration) {
			return 'image';
		}

		return 'text';
	}, [model, provider]);

	const handleSendMessage = () => {
		switch (actionType) {
			case 'image':
				createImage({
					text: prompt,
					ai: { secret: apiKey, model, provider },
					chatId: currentChat?.id,
					isOpenRouter: useOpenRouter,
				});
				break;
			case 'text':
				sendMessage({
					text: prompt,
					ai: { secret: apiKey, model, provider },
					chatId: currentChat?.id,
					isOpenRouter: useOpenRouter,
				});
				if (currentChat?.id) setPrompt('');
				break;
		}
	};

	return (
		<div className="flex w-full border-t">
			<input
				type="hidden"
				placeholder="API Key"
				value={apiKey}
				onChange={(e) => setApiKey(e.target.value)}
			/>

			<div className="flex flex-col gap-2 border-r p-4">
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={useOpenRouter}
						onChange={(e) => setUseOpenRouter(e.target.checked)}
					/>
					Use OpenRouter
				</div>
				<select
					value={provider}
					onChange={(e) => {
						setProvider(e.target.value);
						setModel(
							AI_PROVIDERS.find((p) => p.id === e.target.value)?.models[0]
								?.id || '',
						);
					}}
				>
					{AI_PROVIDERS.map((provider) => (
						<option
							key={provider.id}
							value={provider.id}
						>
							{provider.label}
						</option>
					))}
				</select>
				<select
					value={model}
					onChange={(e) => setModel(e.target.value)}
				>
					{AI_PROVIDERS.find((p) => p.id === provider)?.models.map((model) => (
						<option
							key={model.id}
							value={model.id}
							disabled={useOpenRouter && !model.openRouterId}
						>
							{model.label}
						</option>
					))}
				</select>
			</div>

			<div className="flex grow-1 items-center gap-2 p-4">
				<textarea
					placeholder="Message..."
					className="grow-1 resize-none border p-2"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							handleSendMessage();
						}
					}}
				/>
				<button
					className="rounded-lg border p-2"
					onClick={handleSendMessage}
				>
					{`Generate ${actionType}`}
				</button>
			</div>
		</div>
	);
};

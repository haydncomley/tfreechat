'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat, useChatHistory } from '~/hooks/use-chat';

export const ActionBar = () => {
	const { sendMessage } = useChat();
	const { currentChat } = useChatHistory();

	// State
	const [prompt, setPrompt] = useState('');
	const [apiKey, setApiKey] = useState(
		process.env.NEXT_PUBLIC_DEFAULT_KEY || '',
	);

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

	const handleSendMessage = () => {
		sendMessage({
			text: prompt,
			ai: { secret: apiKey, model, provider },
			chatId: currentChat?.id,
		});
		if (currentChat?.id) setPrompt('');
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
				<select
					value={provider}
					onChange={(e) => setProvider(e.target.value)}
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
					Send
				</button>
			</div>
		</div>
	);
};

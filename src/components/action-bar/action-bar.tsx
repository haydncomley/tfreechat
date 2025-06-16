'use client';

import classNames from 'classnames';
import { ChevronsUpDown } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { ToggleButton } from '~/components';
import { useChat, useChatHistory } from '~/hooks/use-chat';

export const ActionBar = () => {
	const { sendMessage, createImage, isLoading, getApiKey } = useChat();
	const { currentChat } = useChatHistory();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// State
	const [prompt, setPrompt] = useState('');
	const [showKeyInput, setShowKeyInput] = useState(false);
	const [webSearchActive, setWebSearchActive] = useState(false);
	const [createImageActive, setCreateImageActive] = useState(false);

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

	const modelDetails = useMemo(() => {
		return AI_PROVIDERS.find((p) => p.id === provider)?.models.find(
			(m) => m.id === model,
		);
	}, [model, provider]);

	const apiKeys = useMemo(() => {
		if (typeof window === 'undefined') return {};

		const keys: Record<string, string | null> = {
			openrouter: localStorage.getItem('openrouter-key'),
		};

		AI_PROVIDERS.forEach((p) => {
			const providerKey = localStorage.getItem(`${p.id}-key`);
			keys[p.id] = providerKey;
		});

		return keys;
	}, []);

	useEffect(() => {
		if (!isLoading && prompt) {
			setPrompt('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, [prompt]);

	const handleSendMessage = () => {
		if (!prompt) return;

		const { secret, isOpenRouter } = getApiKey(provider, model);
		console.log(secret, isOpenRouter);

		if (!secret) return;

		switch (actionType) {
			case 'image':
				createImage({
					text: prompt,
					ai: { secret, isOpenRouter, model, provider },
					chatId: currentChat?.id,
				});
				break;
			case 'text':
				sendMessage({
					text: prompt,
					ai: { secret, isOpenRouter, model, provider },
					chatId: currentChat?.id,
				});
				break;
		}
	};

	return (
		<>
			<div className="bg-glass-pane flex w-full flex-col-reverse gap-3 border-t p-4 md:flex-col md:gap-2.5 md:rounded-t-2xl md:border-x md:shadow-md">
				<div
					className={classNames(
						'bg-glass flex w-full flex-col gap-2 !rounded-3xl p-3 px-4',
						{
							'opacity-50': isLoading,
						},
					)}
				>
					<textarea
						ref={textareaRef}
						className="placeholder:text-foreground/75 w-full resize-none overflow-hidden bg-transparent text-base outline-0"
						placeholder={`Ask ${modelDetails?.label ?? 'something'}...`}
						value={prompt}
						rows={1}
						onChange={(e) => setPrompt(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSendMessage();
							}
						}}
						disabled={isLoading}
					/>
				</div>

				<div className="no-scrollbar -mx-4 flex gap-2.5 overflow-auto px-4 whitespace-nowrap">
					<div className="bg-foreground text-background relative flex cursor-pointer items-center gap-2 rounded-full p-2 px-3">
						<span className="font-slab text-xs font-bold">
							{AI_PROVIDERS.find((p) => p.id === provider)?.label} -{' '}
							{modelDetails?.label}
						</span>
						<select
							className="font-slab absolute inset-0 appearance-none text-xs font-bold opacity-0 outline-0"
							onChange={(e) => {
								const [provider, model] = e.target.value.split('~');
								setProvider(provider);
								setModel(model);
							}}
						>
							{AI_PROVIDERS.map((provider) => (
								<optgroup
									key={provider.id}
									label={provider.label}
								>
									{provider.models.map((model) => (
										<option
											key={`${provider.id}~${model.id}`}
											value={`${provider.id}~${model.id}`}
										>
											{model.label}
										</option>
									))}
								</optgroup>
							))}
						</select>
						<ChevronsUpDown className="h-4 w-4" />
					</div>

					<ToggleButton
						disabled={!modelDetails?.capabilities?.webSearch}
						active={webSearchActive}
						onToggle={setWebSearchActive}
						icon="Globe"
					>
						Web Search
					</ToggleButton>
					<ToggleButton
						disabled={!modelDetails?.capabilities?.imageGeneration}
						active={
							createImageActive || modelDetails?.capabilities?.imageGeneration
						}
						onToggle={setCreateImageActive}
						icon="Image"
					>
						Create Image
					</ToggleButton>

					<div className="ml-auto">
						<ToggleButton
							active={showKeyInput}
							onToggle={setShowKeyInput}
							icon="KeyRound"
						></ToggleButton>
					</div>
				</div>
			</div>
			<dialog
				onClose={() => setShowKeyInput(false)}
				open={showKeyInput}
			>
				<div className="bg-background/50 fixed top-0 left-0 flex h-full w-full flex-col items-center justify-center">
					<div className="bg-glass text-foreground flex w-md flex-col gap-4 p-4">
						<div className="flex flex-col">
							<h4 className="font-slab text-lg font-bold">
								Bring your own key
							</h4>
							<p className="text-foreground/75 text-sm">
								API keys are stored locally on device, they are only sent to the
								provider of choice on request.
							</p>
						</div>

						<div>
							<h2 className="text-xs font-black tracking-wider uppercase">
								Open Router
							</h2>
							<input
								className="w-full outline-0"
								type="text"
								placeholder="API Key"
								defaultValue={apiKeys.openrouter ?? ''}
								onChange={(e) => {
									localStorage.setItem('openrouter-key', e.target.value);
								}}
							/>
						</div>

						{AI_PROVIDERS.map((provider) => (
							<div key={provider.id}>
								<h2 className="text-xs font-black tracking-wider uppercase">
									{provider.label}
								</h2>
								<input
									className="w-full outline-0"
									type="text"
									placeholder="API Key"
									defaultValue={apiKeys[provider.id] ?? ''}
									onChange={(e) => {
										localStorage.setItem(`${provider.id}-key`, e.target.value);
									}}
								/>
							</div>
						))}

						<div className="flex justify-end">
							<ToggleButton
								active={showKeyInput}
								onToggle={setShowKeyInput}
								icon="X"
							></ToggleButton>
						</div>
					</div>
				</div>
			</dialog>
		</>
	);
};

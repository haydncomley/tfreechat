'use client';

import classNames from 'classnames';
import { ChevronsUpDown, SendHorizonal } from 'lucide-react';
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
	const [webSearchActive] = useState(false);
	const [createImageActive, setCreateImageActive] = useState(false);

	const [currentModel, setCurrentModel] = useQueryState(
		'model',
		parseAsString.withDefault(
			process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-3.5-turbo',
		),
	);

	const [currentProvider, setCurrentProvider] = useQueryState(
		'provider',
		parseAsString.withDefault(
			process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'openai',
		),
	);

	const actionType = useMemo(() => {
		const model = AI_PROVIDERS.find(
			(p) => p.id === currentProvider,
		)?.models.find((m) => m.id === currentModel);

		if (model?.capabilities?.imageGeneration) {
			return 'image';
		}

		return 'text';
	}, [currentModel, currentProvider]);

	const modelDetails = useMemo(() => {
		return AI_PROVIDERS.find((p) => p.id === currentProvider)?.models.find(
			(m) => m.id === currentModel,
		);
	}, [currentModel, currentProvider]);

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

		const { secret, isOpenRouter } = getApiKey(currentProvider, currentModel);
		if (!secret) return;

		switch (actionType) {
			case 'image':
				createImage({
					text: prompt,
					ai: {
						secret,
						isOpenRouter,
						model: currentModel,
						provider: currentProvider,
					},
					chatId: currentChat?.id,
				});
				break;
			case 'text':
				sendMessage({
					text: prompt,
					ai: {
						secret,
						isOpenRouter,
						model: currentModel,
						provider: currentProvider,
						capabilities: {
							webSearch: !!webSearchActive,
						},
					},
					chatId: currentChat?.id,
				});
				break;
		}
	};

	return (
		<>
			<div className="bg-glass-pane flex w-full flex-col-reverse gap-3 border-t p-4 md:flex-col md:gap-2.5 md:rounded-t-2xl md:border-x md:shadow-md">
				<div className="flex w-full items-end gap-2">
					<div
						className={classNames(
							'bg-glass flex max-h-[20rem] w-full flex-col gap-2 overflow-auto !rounded-3xl transition-all duration-150',
							{
								'opacity-50': isLoading,
								'focus-within:bg-accent-foreground focus-within:!rounded-xl focus-within:text-black':
									!isLoading,
							},
						)}
					>
						<textarea
							ref={textareaRef}
							className="w-full resize-none bg-transparent p-3 px-4 text-base text-inherit outline-0 placeholder:text-inherit"
							placeholder={`Ask ${modelDetails?.label ?? 'something'}...`}
							value={prompt}
							rows={1}
							inputMode="text"
							enterKeyHint="send"
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
					<button
						className={classNames(
							'bg-foreground text-background cursor-pointer rounded-full border p-3 shadow-sm transition-all duration-75 hover:scale-110 hover:-rotate-12 hover:opacity-90 disabled:pointer-events-none disabled:scale-75 disabled:opacity-50',
						)}
						onClick={handleSendMessage}
						disabled={isLoading || prompt.length < 3}
					>
						<SendHorizonal className="h-5 w-5" />
					</button>
				</div>

				<div className="no-scrollbar -mx-4 flex gap-2.5 overflow-auto px-4 whitespace-nowrap">
					<div className="bg-foreground text-background relative flex cursor-pointer items-center gap-2 rounded-full p-2 px-3">
						<span className="font-slab text-xs font-bold">
							{AI_PROVIDERS.find((p) => p.id === currentProvider)?.label} -{' '}
							{modelDetails?.label}
						</span>
						<select
							className="font-slab absolute inset-0 appearance-none text-xs font-bold opacity-0 outline-0"
							onChange={(e) => {
								const [provider, model] = e.target.value.split('~');
								setCurrentProvider(provider);
								setCurrentModel(model);
							}}
							defaultValue={`${currentProvider}~${currentModel}`}
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
					{/* 

						TODO: I can't get the web searching to work rn, does not seem to return a stream...
						can come back to this later.
					*/}
					{/* <ToggleButton
						disabled={!modelDetails?.capabilities?.webSearch}
						active={webSearchActive}
						onToggle={setWebSearchActive}
						icon="Globe"
					>
						Web Search
					</ToggleButton> */}
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
				</div>
			</div>
		</>
	);
};

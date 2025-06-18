'use client';

import classNames from 'classnames';
import { ChevronsUpDown } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	useImperativeHandle,
	createContext,
} from 'react';

import { AI_PROVIDERS } from '~/api';
import { Button, MessageDialog, ToggleButton } from '~/components';
import { useChat, useChatHistory } from '~/hooks/use-chat';

export const ActionBarContext = createContext<ActionBarRef | null>(null);

export interface ActionBarRef {
	focusInput: () => void;
}

export const ActionBar = ({
	ref,
}: {
	ref: React.RefObject<ActionBarRef | null>;
}) => {
	const { sendMessage, createImage, isLoading, getApiKey, messages } =
		useChat();
	const {
		currentChat,
		setCurrentChat,
		currentChatId,
		branchId,
		setBranchId,
		setViewBranchId,
	} = useChatHistory();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// State
	const [prompt, setPrompt] = useState('');
	const [webSearchActive] = useState(false);
	const [createImageActive] = useState(false);
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [errorDetails, setErrorDetails] = useState<{
		title: string;
		message: string;
		solutions: string[];
	} | null>(null);

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

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, [prompt]);

	// Expose the focus method through the ref
	useImperativeHandle(ref, () => ({
		focusInput: () => {
			textareaRef.current?.focus();
		},
	}));

	const handleSendMessage = async () => {
		if (!prompt) return;

		const { secret, isOpenRouter } = getApiKey(currentProvider, currentModel);
		if (!secret) {
			setErrorDetails({
				title: 'API Key Required',
				message: `No API key found for ${AI_PROVIDERS.find((p) => p.id === currentProvider)?.label || currentProvider}. You need to add your API key to use this service.`,
				solutions: [
					'Click the key icon in the sidebar to add your API key',
					'Make sure you have a valid API key from the provider',
					'Check that the API key is correctly entered',
					'Try using a different AI provider if available',
				],
			});
			setShowErrorDialog(true);
			return;
		}

		const prevMessage = branchId
			? messages.find((m) => m.id === branchId)
			: messages.at(-1);

		// Get the index of the root message sent after the previous message
		let rootMessage:
			| {
					id: string;
					prompt: string;
			  }
			| undefined;
		if (prevMessage !== undefined) {
			const rootMessageIndex = messages.findIndex(
				(m) => m.id === prevMessage.id,
			);
			if (rootMessageIndex < messages.length - 1) {
				rootMessage = {
					id: messages[rootMessageIndex + 1].id,
					prompt: messages[rootMessageIndex + 1].prompt,
				};
			}
		}

		try {
			switch (actionType) {
				case 'image':
					await createImage({
						text: prompt,
						ai: {
							secret,
							isOpenRouter,
							model: currentModel,
							provider: currentProvider,
						},
						chatId: currentChat?.id,
						previousMessage: prevMessage,
						isNewBranch: !!branchId,
						onCreate: ({ chatId, path }) => {
							if (!currentChatId) setCurrentChat(chatId);
							if (branchId && path) setViewBranchId(path[0]);
						},
					});
					break;
				case 'text':
					await sendMessage({
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
						previousMessage: prevMessage,
						isNewBranch: !!branchId,
						rootMessage,
						onCreate: ({ chatId, path }) => {
							if (!currentChatId) setCurrentChat(chatId);
							if (branchId && path) setViewBranchId(path[0]);
						},
					});
					break;
			}
		} catch (error) {
			console.error('Error sending message:', error);

			// Handle specific error types from try-catch
			const errorMessage =
				error instanceof Error ? error.message.toLowerCase() : 'unknown error';

			if (
				errorMessage.includes('failed to fetch') ||
				errorMessage.includes('networkerror')
			) {
				setErrorDetails({
					title: 'Network Connection Failed',
					message:
						'Unable to reach the AI service. This is likely a network connectivity issue.',
					solutions: [
						'Check your internet connection',
						'Try connecting to a different network',
						'Disable VPN if you are using one',
						'Wait a moment and try again',
					],
				});
			} else if (errorMessage.includes('cors')) {
				setErrorDetails({
					title: 'Browser Security Error',
					message:
						'Your browser is blocking the request due to security policies.',
					solutions: [
						'Try refreshing the page',
						'Clear your browser cache and cookies',
						'Try using a different browser',
						'Disable browser extensions temporarily',
					],
				});
			} else {
				setErrorDetails({
					title: 'Unexpected Error',
					message:
						error instanceof Error
							? error.message
							: 'An unexpected error occurred while processing your request.',
					solutions: [
						'Try sending the message again',
						'Refresh the page and try again',
						'Check your internet connection',
						'Try using a different AI model or provider',
					],
				});
			}

			setShowErrorDialog(true);
		} finally {
			setPrompt('');
			setBranchId(null);
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 100);
		}
	};

	return (
		<>
			<div className="bg-glass-pane flex w-full flex-col rounded-t-md border border-b-0 p-4 shadow-md md:rounded-t-3xl">
				<div className="flex flex-col-reverse gap-3 md:flex-col md:gap-2.5">
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
						<Button
							variant="primary"
							size="icon"
							icon="SendHorizontal"
							onClick={handleSendMessage}
							disabled={isLoading || prompt.length < 3}
						/>
					</div>

					<div className="no-scrollbar -mx-4 flex gap-2.5 overflow-auto px-4 whitespace-nowrap">
						<div className="bg-foreground text-background relative flex cursor-pointer items-center gap-2 rounded-full p-2 px-3">
							<span className="font-slab text-xs font-bold">
								{AI_PROVIDERS.find((p) => p.id === currentProvider)?.label} •{' '}
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
							icon="Image"
						>
							Create Image
						</ToggleButton>
					</div>
				</div>

				<div className="safe-bottom" />
			</div>

			<MessageDialog
				open={showErrorDialog}
				onClose={() => setShowErrorDialog(false)}
				title={errorDetails?.title || 'Error'}
				description={errorDetails?.message}
				titleColor="error"
			>
				{errorDetails && (
					<div className="flex flex-col gap-2">
						<p className="text-foreground/60 text-xs">Suggested solutions:</p>
						<ul className="text-foreground/75 list-inside list-disc space-y-1 text-sm">
							{errorDetails.solutions.map((solution, index) => (
								<li key={index}>{solution}</li>
							))}
						</ul>
					</div>
				)}
			</MessageDialog>
		</>
	);
};

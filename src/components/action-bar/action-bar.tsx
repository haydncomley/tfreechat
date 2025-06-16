'use client';

import classNames from 'classnames';
import { ChevronsUpDown } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { Button, MessageDialog, ToggleButton } from '~/components';
import { useChat, useChatHistory } from '~/hooks/use-chat';

export const ActionBar = () => {
	const { sendMessage, createImage, isLoading, getApiKey, error } = useChat();
	const { currentChat } = useChatHistory();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// State
	const [prompt, setPrompt] = useState('');
	const [webSearchActive] = useState(false);
	const [createImageActive, setCreateImageActive] = useState(false);
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

	useEffect(() => {
		if (!isLoading && prompt) {
			setPrompt('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// Show error dialog when error occurs
	useEffect(() => {
		if (error) {
			const errorMessage = error.message.toLowerCase();

			if (
				errorMessage.includes('authentication') ||
				errorMessage.includes('unauthorized')
			) {
				setErrorDetails({
					title: 'Authentication Failed',
					message:
						'Your session has expired or you are not properly authenticated.',
					solutions: [
						'Sign out and sign back in',
						'Refresh the page and try again',
						'Check if you are still connected to the internet',
					],
				});
			} else if (
				errorMessage.includes('api key') ||
				errorMessage.includes('invalid key')
			) {
				setErrorDetails({
					title: 'Invalid API Key',
					message: 'The API key for this provider is missing or invalid.',
					solutions: [
						'Check your API key in the settings',
						'Verify the API key is correct and active',
						'Ensure the API key has sufficient credits',
						'Try using a different AI provider',
					],
				});
			} else if (
				errorMessage.includes('network') ||
				errorMessage.includes('fetch') ||
				errorMessage.includes('connection')
			) {
				setErrorDetails({
					title: 'Connection Error',
					message:
						'Unable to connect to the AI service. Please check your internet connection.',
					solutions: [
						'Check your internet connection',
						'Try refreshing the page',
						'Wait a moment and try again',
						'Check if the AI service is experiencing downtime',
					],
				});
			} else if (
				errorMessage.includes('rate limit') ||
				errorMessage.includes('quota') ||
				errorMessage.includes('limit exceeded')
			) {
				setErrorDetails({
					title: 'Rate Limit Exceeded',
					message:
						'You have exceeded the rate limit or quota for this AI service.',
					solutions: [
						'Wait a few minutes before trying again',
						'Check your API usage and limits',
						'Consider upgrading your API plan',
						'Try using a different AI provider',
					],
				});
			} else if (errorMessage.includes('timeout')) {
				setErrorDetails({
					title: 'Request Timeout',
					message: 'The request took too long to complete and timed out.',
					solutions: [
						'Try sending a shorter message',
						'Check your internet connection speed',
						'Wait a moment and try again',
						'Try using a different AI model',
					],
				});
			} else if (
				errorMessage.includes('server error') ||
				errorMessage.includes('500') ||
				errorMessage.includes('503')
			) {
				setErrorDetails({
					title: 'Server Error',
					message: 'The AI service is experiencing technical difficulties.',
					solutions: [
						'Wait a few minutes and try again',
						'Try using a different AI provider',
						'Check the service status page',
						'Contact support if the issue persists',
					],
				});
			} else {
				setErrorDetails({
					title: 'Message Failed to Send',
					message:
						error.message ||
						'An unexpected error occurred while sending your message.',
					solutions: [
						'Try sending the message again',
						'Check your internet connection',
						'Refresh the page and try again',
						'Try using a different AI model or provider',
					],
				});
			}

			setShowErrorDialog(true);
		}
	}, [error]);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, [prompt]);

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
							className="placeholder:text-foreground-secondary w-full resize-none bg-transparent p-3 px-4 text-base text-inherit outline-0"
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

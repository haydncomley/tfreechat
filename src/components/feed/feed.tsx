'use client';

import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat, useChatHistory } from '~/hooks/use-chat';

import { ToggleButton } from '../toggle-button';
import { FeedMessage } from './lib/feed-message';

export const Feed = () => {
	const { messages, responseStream, reasoningStream } = useChat();
	const { currentChatId } = useChatHistory();
	const feedRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);
	const [lastChatId, setLastChatId] = useState<string | null>(null);

	const scrollToBottom = () => {
		feedRef.current?.scrollTo({
			top: 0,
		});
	};

	useEffect(() => {
		if (!feedRef.current || !autoScroll) return;
		requestAnimationFrame(scrollToBottom);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [responseStream]);

	useEffect(() => {
		if (currentChatId !== lastChatId && messages.length > 0) {
			setLastChatId(currentChatId);
			setTimeout(() => {
				scrollToBottom();
			}, 150);
		}
	}, [currentChatId, messages.length, lastChatId]);

	return (
		<div className="relative mx-auto flex w-full grow-1 flex-col items-center overflow-hidden">
			<div
				className="relative mx-auto flex w-full grow-1 flex-col-reverse gap-4 overflow-auto px-4 py-4"
				ref={feedRef}
				onScroll={(e) => {
					// With flex-col-reverse, we're at the bottom when scrollTop is close to 0
					setAutoScroll(Math.abs(e.currentTarget.scrollTop) < 150);
				}}
			>
				{messages
					.slice()
					.reverse()
					.map((message, index) => {
						const model = AI_PROVIDERS.find(
							(p) => p.id === message.ai.provider,
						)?.models.find((m) => m.id === message.ai.model);

						return (
							<div
								key={message.id}
								className={classNames(
									'animate-message-in flex w-full origin-bottom flex-col gap-4',
								)}
								style={{
									animationFillMode: 'backwards',
									animationDelay: `${index * 0.08}s`, // Messages start after main content, oldest first
								}}
							>
								<FeedMessage
									sender="user"
									text={message.prompt}
									date={message.createdAt.toDate()}
								/>

								{message.reply ? (
									<FeedMessage
										sender="ai"
										text={
											message.reply?.image ? message.prompt : message.reply.text
										}
										image={message.reply?.image}
										date={message.reply?.createdAt?.toDate()}
										error={message.reply?.error ?? undefined}
										meta={model?.label ? [model?.label] : undefined}
									/>
								) : null}

								{index === 0 && !message.reply ? (
									<FeedMessage
										isDynamic
										text={responseStream || reasoningStream || 'Thinking...'}
										sender="ai"
										meta={
											!!responseStream
												? ['Streaming...']
												: !!reasoningStream
													? ['Reasoning...']
													: undefined
										}
									/>
								) : null}
							</div>
						);
					})}
			</div>

			<div
				className={classNames(
					'absolute right-2 bottom-2 transition-all duration-75 hover:opacity-75',
					{
						'pointer-events-none !opacity-0': autoScroll,
					},
				)}
			>
				<ToggleButton
					active
					onToggle={() => {
						feedRef.current?.scrollTo({
							top: 0,
						});
					}}
					icon="ChevronDown"
				/>
			</div>
		</div>
	);
};

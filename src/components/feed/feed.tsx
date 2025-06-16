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
	const [autoScroll, setAutoScroll] = useState(false);
	const [lastChatId, setLastChatId] = useState<string | null>(null);

	const scrollToBottom = () => {
		feedRef.current?.scrollTo({
			top: feedRef.current.scrollHeight,
		});
	};

	useEffect(() => {
		if (!feedRef.current || !autoScroll) return;
		requestAnimationFrame(scrollToBottom);
	}, [autoScroll, responseStream]);

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
				className="relative mx-auto flex w-full grow-1 flex-col gap-4 overflow-auto px-4 py-4"
				ref={feedRef}
				onScroll={(e) => {
					const scrollAmount =
						e.currentTarget.scrollHeight -
						(e.currentTarget.scrollTop + e.currentTarget.clientHeight);
					setAutoScroll(scrollAmount < 150);
				}}
			>
				{messages.map((message, index) => {
					const model = AI_PROVIDERS.find(
						(p) => p.id === message.ai.provider,
					)?.models.find((m) => m.id === message.ai.model);

					return (
						<div
							key={message.id}
							className="animate-fadeIn flex w-full flex-col gap-4"
							style={{
								animationFillMode: 'backwards',
								animationDelay: `${(messages.length - index) * 0.05}s`,
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

							{index === messages.length - 1 && !message.reply ? (
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
							top: feedRef.current.scrollHeight,
						});
					}}
					icon="ChevronDown"
				/>
			</div>
		</div>
	);
};

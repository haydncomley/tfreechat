'use client';

import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat } from '~/hooks/use-chat';

import { FeedMessage } from './lib/feed-message';

export const Feed = () => {
	const { messages, isResponseStreaming, responseStream } = useChat();
	const feedRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	useEffect(() => {
		if (!feedRef.current) return;

		const mutationObserver = new MutationObserver((mutations) => {
			mutations.forEach(() => {
				feedRef.current?.scrollTo({
					top: feedRef.current.scrollHeight,
				});
			});
		});

		mutationObserver.observe(feedRef.current, {
			childList: true,
			characterData: true,
			subtree: true,
		});

		return () => mutationObserver.disconnect();
	}, [autoScroll]);

	return (
		<div className="relative mx-auto flex w-full grow-1 flex-col items-center overflow-hidden">
			<div
				className="relative mx-auto flex w-full grow-1 flex-col gap-4 overflow-auto px-4 py-4"
				ref={feedRef}
				onScroll={(e) => {
					const scrollAmount =
						e.currentTarget.scrollHeight -
						(e.currentTarget.scrollTop + e.currentTarget.clientHeight);
					setAutoScroll(scrollAmount > 50);
				}}
			>
				{messages.map((message, index) => {
					const model = AI_PROVIDERS.find(
						(p) => p.id === message.ai.provider,
					)?.models.find((m) => m.id === message.ai.model);

					return (
						<div
							key={message.id}
							className="flex w-full flex-col gap-4"
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

							{index === messages.length - 1 &&
							isResponseStreaming &&
							!message.reply ? (
								<FeedMessage
									isDynamic
									text={responseStream || 'Thinking...'}
									sender="ai"
									meta={!!responseStream ? ['Streaming...'] : undefined}
								/>
							) : null}
						</div>
					);
				})}
			</div>

			<button
				className={classNames(
					'bg-glass absolute right-2 bottom-2 flex cursor-pointer items-center gap-2 border border-b-0 p-2 px-3 text-sm transition-all duration-75 hover:opacity-75 md:right-0',
					{
						'pointer-events-none !opacity-0': !autoScroll,
					},
				)}
				onClick={() => {
					feedRef.current?.scrollTo({
						top: feedRef.current.scrollHeight,
					});
				}}
			>
				<ChevronDown className="h-4 w-4" />
				Scroll Down
				<ChevronDown className="h-4 w-4" />
			</button>
		</div>
	);
};

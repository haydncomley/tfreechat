'use client';

import { useEffect, useRef } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat } from '~/hooks/use-chat';

import { FeedMessage } from './lib/feed-message';

export const Feed = () => {
	const { messages, isResponseStreaming, error, responseStream } = useChat();
	const feedRef = useRef<HTMLDivElement>(null);

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
	}, []);

	return (
		<div
			className="mx-auto flex w-full grow-1 flex-col gap-4 overflow-auto px-4 py-4"
			ref={feedRef}
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

			{error && <p className="text-red-500">Error: {error.message}</p>}
		</div>
	);
};

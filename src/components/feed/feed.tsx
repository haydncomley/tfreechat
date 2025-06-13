'use client';

import { AI_PROVIDERS } from '~/api';
import { useChat } from '~/hooks/use-chat';

export const Feed = () => {
	const { messages, isResponseStreaming, error, responseStream } = useChat();

	return (
		<div className="mx-auto flex w-full max-w-xl grow-1 flex-col gap-2 overflow-auto">
			{messages.map((message) => {
				const model = AI_PROVIDERS.find(
					(p) => p.id === message.ai.provider,
				)?.models.find((m) => m.id === message.ai.model);

				return (
					<div
						key={message.id}
						className="flex w-full flex-col gap-2 p-4"
					>
						<div className="flex max-w-2/3 flex-col gap-2 self-end rounded-2xl rounded-br-md bg-blue-200 p-2">
							<p>{message.prompt}</p>
						</div>
						<p className="self-end text-sm text-gray-500">
							{message.createdAt.toDate().toLocaleString()}
						</p>

						{message.reply ? (
							<>
								<div className="flex max-w-2/3 flex-col gap-2 self-start rounded-2xl rounded-bl-md bg-gray-200 p-2">
									<p>{message.reply?.text}</p>
								</div>
								<p className="self-start text-sm text-gray-500">
									{message.reply.createdAt.toDate().toLocaleString()}
									{model?.label}
								</p>
							</>
						) : null}
					</div>
				);
			})}

			{isResponseStreaming && !messages.at(-1)?.reply ? (
				<div className="flex w-full flex-col gap-2 p-4">
					<div className="flex max-w-2/3 flex-col gap-2 self-start rounded-2xl rounded-bl-md bg-gray-200 p-2">
						<p>{responseStream || 'Thinking...'}</p>
					</div>
				</div>
			) : null}

			{error && <p className="text-red-500">Error: {error.message}</p>}
		</div>
	);
};

'use client';

import classNames from 'classnames';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useAuth } from '~/hooks/use-auth';
import { useChat } from '~/hooks/use-chat';
import { useChatMessages } from '~/hooks/use-chat-messages';
import { useChats } from '~/hooks/use-chats';

export default function Home() {
	const { user, signIn, signOut } = useAuth();
	const { chat, response, isLoading, error } = useChat();
	const { chats } = useChats();

	const [chatId, setChatId] = useQueryState('chat');
	const { messages } = useChatMessages(chatId);

	const [apiKey, setApiKey] = useState(
		process.env.NEXT_PUBLIC_DEFAULT_KEY || '',
	);
	const [model, setModel] = useState(
		process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-3.5-turbo',
	);
	const [provider, setProvider] = useState(
		process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || 'openai',
	);
	const [prompt, setPrompt] = useState('');

	useEffect(() => {
		const chatHasPrompt = chats.find((chat) => chat.prompt === prompt);
		if (!chatHasPrompt) return;
		if (chatId !== chatHasPrompt.id) {
			setChatId(chatHasPrompt.id);
			setPrompt('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chats.length, prompt, chatId]);

	return (
		<div className="flex h-full w-full">
			<aside className="flex h-full w-xs flex-col border-r">
				<div className="flex grow-1 flex-col overflow-auto">
					{chats.map((chat) => (
						<div
							key={chat.id}
							className={classNames('flex cursor-pointer flex-col p-4', {
								'bg-red-400': chatId === chat.id,
							})}
							onClick={() => setChatId(chat.id)}
						>
							<p className="font-bold">{chat.summary ?? 'New Chat'}</p>
							<p className="text-sm">
								{chat.createdAt.toDate().toLocaleString()}
							</p>
						</div>
					))}

					<button
						className="rounded-lg border p-2"
						onClick={() => setChatId(null)}
					>
						New Chat
					</button>
				</div>
				<div className="border-t p-4">
					{user ? <p>Hello {user.displayName}</p> : <p>No user</p>}

					{user ? (
						<button
							className="rounded-lg border p-2"
							onClick={() => signOut()}
						>
							Sign Out
						</button>
					) : (
						<button
							className="rounded-lg border p-2"
							onClick={() => signIn()}
						>
							Sign In
						</button>
					)}
				</div>
			</aside>
			<main className="flex h-full w-full flex-col">
				<div className="mx-auto flex w-full max-w-xl grow-1 flex-col gap-2 overflow-auto">
					{messages.map((message) => (
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
									</p>
								</>
							) : null}
						</div>
					))}

					{isLoading ? (
						<div className="flex w-full flex-col gap-2 p-4">
							{prompt ? (
								<>
									<div className="flex max-w-2/3 flex-col gap-2 self-end rounded-2xl rounded-br-md bg-blue-200 p-2">
										<p>{prompt}</p>
									</div>
									<p className="self-end text-sm text-gray-500">Now</p>
								</>
							) : null}

							<div className="flex max-w-2/3 flex-col gap-2 self-start rounded-2xl rounded-bl-md bg-gray-200 p-2">
								<p>{response || 'Thinking...'}</p>
							</div>
						</div>
					) : null}

					{error && <p className="text-red-500">Error: {error}</p>}
				</div>

				<div className="flex w-full border-t">
					<input
						type="hidden"
						placeholder="API Key"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
					/>

					<div className="flex flex-col gap-2 border-r p-4">
						<input
							type="text"
							placeholder="Provider"
							value={provider}
							onChange={(e) => setProvider(e.target.value)}
						/>
						<input
							type="text"
							placeholder="Model"
							value={model}
							onChange={(e) => setModel(e.target.value)}
						/>
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
									chat({
										text: prompt,
										ai: { secret: apiKey, model, provider },
										chatId: chatId ?? undefined,
									});
									if (chatId) setPrompt('');
								}
							}}
						/>
						<button
							className="rounded-lg border p-2"
							onClick={() => {
								chat({
									text: prompt,
									ai: { secret: apiKey, model, provider },
									chatId: chatId ?? undefined,
								});
								if (chatId) setPrompt('');
							}}
						>
							Send
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}

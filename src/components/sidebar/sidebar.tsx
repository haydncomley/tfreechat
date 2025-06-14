'use client';

import classNames from 'classnames';

import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';
import { FormatDateSince, glass } from '~/utils';
import { Button } from '~/components';

export const Sidebar = () => {
	const { user, signIn, signOut } = useAuth();
	const { chats, currentChat, setCurrentChat } = useChatHistory();

	return (
		<aside className={`flex h-full w-xs flex-col ${glass()}`}>
			<div className="flex grow-1 flex-col overflow-auto p-4">
				{chats.map((chat) => (
					<div
						key={chat.id}
						className={classNames('flex cursor-pointer flex-col p-4', {
							'bg-red-400': currentChat?.id === chat.id,
						})}
						onClick={() => setCurrentChat(chat)}
					>
						<p className="font-bold">{chat.summary ?? 'New Chat'}</p>
						<p className="text-sm">
							{FormatDateSince(chat.createdAt.toDate())}
						</p>
					</div>
				))}

				<Button
					variant="secondary"
					icon="Plus"
					iconPosition="left"
					onClick={() => setCurrentChat(null)}
				>
					New Chat
				</Button>
			</div>
			<div className="p-4">
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
	);
};

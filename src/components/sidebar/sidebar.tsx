'use client';

import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';
import { FormatDateSince, glass } from '~/utils';
import { Button, ConversationItem } from '~/components';

export const Sidebar = () => {
	const { user, signIn, signOut } = useAuth();
	const { chats, currentChat, setCurrentChat } = useChatHistory();

	return (
		<aside className={`flex h-full w-xs flex-col ${glass()}`}>
			<div className="flex grow-1 flex-col gap-2 overflow-auto p-2">
				{chats.map((chat) => (
					<ConversationItem
						key={chat.id}
						content={chat.summary ?? 'New Chat'}
						time={FormatDateSince(chat.createdAt.toDate())}
						chatId={chat.id}
						selected={currentChat?.id === chat.id}
						onChatSelect={setCurrentChat}
					/>
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

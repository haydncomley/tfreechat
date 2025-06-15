'use client';

import classNames from 'classnames';
import { LogIn, LogOut, Plus, User } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';
import { FormatDateSince } from '~/utils';

export const Sidebar = () => {
	const { user, signIn, signOut } = useAuth();
	const { chats, currentChat, setCurrentChat } = useChatHistory();

	console.log(user);

	return (
		<aside className="hidden h-full w-xs shrink-0 flex-col p-4 pr-0 md:flex">
			<div className="bg-glass flex flex-col overflow-auto px-3 py-4">
				<span className="mb-2 px-4 text-xs font-black tracking-wider">
					TODAY
				</span>
				{chats.map((chat) => (
					<Link
						key={chat.id}
						href={`/?chat=${chat.id}`}
						onClick={(e) => {
							e.preventDefault();
							setCurrentChat(chat);
						}}
						className={classNames(
							'flex flex-col !rounded-lg border px-4 py-2.5',
							{
								'border-outline/0': currentChat?.id !== chat.id,
								'bg-glass': currentChat?.id === chat.id,
							},
						)}
					>
						<span>{chat.prompt}</span>
						<span className="font-slab -mt-1 text-xs opacity-75">
							{FormatDateSince(chat.createdAt.toDate())}
						</span>
					</Link>
				))}
			</div>

			<div className="flex items-center justify-center">
				<Link
					href="/"
					className="flex items-center gap-1 p-4 text-xs font-black tracking-wider"
				>
					NEW
					<Plus className="h-4 w-4" />
				</Link>
			</div>

			<div className="bg-glass mt-auto flex items-center justify-between p-2">
				<div className="flex items-center gap-2">
					<div className="bg-background-glass h-10 w-10 !rounded-full border">
						<div className="flex h-full w-full items-center justify-center">
							<User className="h-4 w-4" />
						</div>
					</div>
					<div>
						<p>{user?.displayName ?? 'Not logged in'}</p>
						{user ? (
							<p className="font-slab text-foreground/75 -mt-1 text-xs">
								{user?.email ?? 'No email'}
							</p>
						) : null}
					</div>
				</div>

				{user ? (
					<button
						className="hover:bg-background-glass cursor-pointer rounded-full border p-2"
						onClick={() => signOut()}
					>
						<LogOut className="h-4 w-4" />
					</button>
				) : (
					<button
						className="hover:bg-background-glass cursor-pointer rounded-full border p-2"
						onClick={() => signIn()}
					>
						<LogIn className="h-4 w-4" />
					</button>
				)}
			</div>
		</aside>
	);
};

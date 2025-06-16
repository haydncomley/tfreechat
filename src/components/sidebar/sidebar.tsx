'use client';

import classNames from 'classnames';
import { LogIn, LogOut, Plus, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useMemo } from 'react';

import { Chat } from '~/api';
import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';
import { FormatChatDate, FormatDateSince } from '~/utils';

export const Sidebar = () => {
	const { user, signIn, signOut } = useAuth();
	const { chats, currentChat, setCurrentChat } = useChatHistory();

	const chatsGroupedByDate = useMemo(() => {
		return chats.reduce(
			(acc, chat) => {
				const date = FormatChatDate(chat.createdAt.toDate());
				if (!acc[date]) acc[date] = [];
				acc[date].push(chat);
				return acc;
			},
			{} as Record<string, Chat[]>,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chats.map((chat) => chat.createdAt.toDate()).join(',')]);

	return (
		<aside className="hidden h-full w-xs shrink-0 flex-col p-4 pr-0 md:flex">
			<div className="bg-glass flex flex-col overflow-auto px-3 py-4">
				{Object.entries(chatsGroupedByDate).map(([date, chats]) => (
					<React.Fragment key={date}>
						<span className="mb-2 px-4 text-xs font-black tracking-wider uppercase not-first:mt-2">
							{date}
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
									'flex flex-col !rounded-lg border px-4 py-2.5 transition-all duration-75',
									{
										'border-outline/0 hover:opacity-75':
											currentChat?.id !== chat.id,
										'bg-glass': currentChat?.id === chat.id,
									},
								)}
							>
								<span>{chat.prompt}</span>
								<span className="font-slab -mt-0.5 text-xs opacity-75">
									{FormatDateSince(chat.createdAt.toDate())}
								</span>
							</Link>
						))}
					</React.Fragment>
				))}
				{!chats.length ? (
					<div className="font-slab text-bold text-center text-sm">
						No Chats
					</div>
				) : null}
			</div>

			<div className="flex items-center justify-center">
				<Link
					href="/"
					className="flex items-center gap-1 p-4 text-xs font-black tracking-wider transition-all duration-75 hover:opacity-75"
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
							<p className="font-slab text-foreground/75 -mt-0.5 text-xs">
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

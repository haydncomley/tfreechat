/* eslint-disable @next/next/no-img-element */
'use client';

import classNames from 'classnames';
import { Loader2, LogOut, Plus, User, X } from 'lucide-react';
import Link from 'next/link';
import React, { use, useEffect, useState } from 'react';
import { useMemo } from 'react';

import { AI_PROVIDERS, Chat } from '~/api';
import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';
import { useDarkMode } from '~/hooks/use-darkmode';
import { FormatChatDate, FormatDateSince } from '~/utils';

import { ActionBarContext, Button, MessageDialog, ToggleButton } from '../';
import styles from './sidebar.module.css';

export const Sidebar = () => {
	const { user, signOut, loading } = useAuth();
	const { chats, currentChat, setCurrentChat, deleteChat, isDeletingChat } =
		useChatHistory();
	const { toggleDarkMode, isDarkMode } = useDarkMode();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const actionBar = use(ActionBarContext);

	const showMenu = showMobileMenu || (!user && loading);

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

	const [showKeyInput, setShowKeyInput] = useState(false);

	const apiKeys = useMemo(() => {
		if (typeof window === 'undefined') return {};

		const keys: Record<string, string | null> = {
			openrouter: localStorage.getItem('openrouter-key'),
		};

		AI_PROVIDERS.forEach((p) => {
			const providerKey = localStorage.getItem(`${p.id}-key`);
			keys[p.id] = providerKey;
		});

		return keys;
	}, []);

	useEffect(() => {
		const hasAnyKeys = Object.values(apiKeys).some((key) => !!key);
		if (!hasAnyKeys) {
			setShowKeyInput(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(chats)]);

	console.log(user?.uid);

	return (
		<>
			{/* Mobile menu button - always visible */}
			<div className="fixed top-4 left-4 z-50 md:hidden">
				<Button
					size="icon"
					variant="primary"
					icon={showMobileMenu ? 'X' : 'Menu'}
					onClick={() => setShowMobileMenu(!showMobileMenu)}
				/>
			</div>

			<aside
				className={classNames(
					'absolute top-0 right-0 bottom-0 left-0 !z-10 flex shrink-0 flex-col p-4 pt-20 transition-all duration-200 md:relative md:!z-1 md:h-full md:w-xs md:p-4 md:pr-0',
					{
						'-translate-x-full md:translate-x-0': !showMenu,
						'translate-x-0': showMenu,
						[styles.sidebarMenuShown]: showMenu,
					},
				)}
			>
				<div
					className={classNames(
						'bg-glass flex flex-col gap-1 overflow-auto px-3 pt-4 pb-3',
						styles.sidebarChats,
					)}
				>
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
										setShowMobileMenu(false);
									}}
									className={classNames(
										'group flex items-center justify-between gap-2 !rounded-2xl border px-4 py-2.5 transition-all duration-75',
										{
											'border-outline/0 hover:opacity-75':
												currentChat?.id !== chat.id,
											'bg-foreground text-background rounded-2xl':
												currentChat?.id === chat.id,
										},
									)}
								>
									<div className="flex flex-col truncate">
										<span className="truncate whitespace-nowrap">
											{chat.prompt}
										</span>
										<span className="font-slab -mt-0.5 text-xs opacity-75">
											{FormatDateSince(chat.createdAt.toDate())}
										</span>
									</div>

									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											deleteChat({ chatId: chat.id }).then(() => {
												setCurrentChat(null);
											});
										}}
										className={classNames(
											'shrink-0 cursor-pointer transition-all duration-75 group-hover:opacity-100 hover:scale-110 hover:opacity-50',
											{
												'opacity-0': currentChat?.id !== chat.id,
											},
										)}
									>
										{isDeletingChat ? (
											<Loader2 className="h-5 w-5 animate-spin" />
										) : (
											<X className="h-5 w-5" />
										)}
									</button>
								</Link>
							))}
						</React.Fragment>
					))}
					{!chats.length ? (
						<div className="text-center text-sm font-bold">
							No chat history
							<p className="text-foreground/75 font-normal">
								Start a new chat to get started!
							</p>
						</div>
					) : null}
				</div>

				<div className="flex items-center justify-center">
					<button
						onClick={() => {
							setCurrentChat(null);
							setShowMobileMenu(false);
							// Focus the input after a short delay to ensure the context is available
							setTimeout(() => {
								actionBar?.focusInput();
							}, 100);
						}}
						className="text-foreground/75 flex cursor-pointer items-center gap-1 p-4 text-xs font-black tracking-wider transition-all duration-75 hover:opacity-75"
					>
						NEW
						<Plus className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-auto flex flex-col gap-2">
					<div className="flex justify-end gap-2">
						<ToggleButton
							active={isDarkMode}
							onToggle={() => toggleDarkMode()}
							icon={isDarkMode ? 'Moon' : 'Sun'}
						/>

						<ToggleButton
							active={showKeyInput}
							onToggle={setShowKeyInput}
							icon="KeyRound"
						></ToggleButton>
					</div>

					<div
						className={classNames(
							'bg-glass flex items-center justify-between p-2',
						)}
					>
						<div className="flex items-center gap-2">
							<div className="bg-background-glass h-10 w-10 !rounded-full border">
								<div className="flex h-full w-full items-center justify-center">
									<User className="h-4 w-4" />
									{user?.photoURL ? (
										<img
											src={user.photoURL}
											alt="Profile picture"
											className="h-full w-full rounded-full"
										/>
									) : null}
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

						<button
							className="hover:bg-background-glass cursor-pointer rounded-full border p-2"
							onClick={() => signOut()}
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>
			</aside>

			<MessageDialog
				open={showKeyInput}
				onClose={() => setShowKeyInput(false)}
				title="Bring your own key"
				description="API keys are stored within localStorage - they are only sent to the provider of choice on request."
			>
				<div>
					<h2 className="text-xs font-black tracking-wider uppercase">
						Open Router{' '}
						<span className="text-foreground/75 font-normal">- text only</span>
					</h2>
					<input
						className="w-full outline-0"
						type="text"
						placeholder="API Key"
						defaultValue={apiKeys.openrouter ?? ''}
						onChange={(e) => {
							localStorage.setItem('openrouter-key', e.target.value);
						}}
					/>
				</div>

				{AI_PROVIDERS.map((provider) => (
					<div key={provider.id}>
						<h2 className="text-xs font-black tracking-wider uppercase">
							{provider.label}
						</h2>
						<input
							className="w-full outline-0"
							type="text"
							placeholder="API Key"
							defaultValue={apiKeys[provider.id] ?? ''}
							onChange={(e) => {
								localStorage.setItem(`${provider.id}-key`, e.target.value);
							}}
						/>
					</div>
				))}
			</MessageDialog>
		</>
	);
};

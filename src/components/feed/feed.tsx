'use client';

import classNames from 'classnames';
import { SearchX } from 'lucide-react';
import Link from 'next/link';
import React, { use, useEffect, useRef, useState } from 'react';

import { AI_PROVIDERS } from '~/api';
import { useChat, useChatHistory } from '~/hooks/use-chat';

import { ActionBarContext } from '../action-bar';
import { ConversationHistory } from '../conversation-history';
import { ToggleButton } from '../toggle-button';
import { FeedMessage } from './lib/feed-message';

export const Feed = ({ view }: { view?: Parameters<typeof useChat>[0] }) => {
	const { messages, responseStream, reasoningStream } = useChat(view);
	const {
		currentChatId,
		branchId,
		setBranchId,
		viewBranchId,
		setViewBranchId,
		currentChat,
	} = useChatHistory();
	const feedRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);
	const [lastChatId, setLastChatId] = useState<string | null>(null);
	const [branchFromIndex, setBranchFromIndex] = useState<number | null>(null);
	const actionBar = use(ActionBarContext);

	// Transform real messages into conversation history format
	const conversationVertices = React.useMemo(() => {
		if (!messages || messages.length === 0 || !currentChat) return [];

		const branches = currentChat.branches ?? {};
		let nextVertex:
			| {
					branchId: string | null;
					branchMessages: {
						id: string | null;
						summary: string | undefined;
						isActive: boolean;
					}[];
			  }
			| undefined;
		const vertices = messages.map((message) => {
			const vertex = nextVertex;

			const branch = branches[message.id];
			if (branch) {
				nextVertex = {
					branchId: message.id,
					branchMessages: Object.values(branch).map((branchMessage) => {
						if (branchMessage.id) {
							return {
								id: branchMessage.id,
								summary: branchMessage.prompt,
								isActive:
									branchMessage.id === viewBranchId ||
									!!messages.find(
										(message) => message.path.at(0) === branchMessage.id,
									),
							};
						} else {
							return {
								id: message.path.at(0) ?? null,
								summary: branchMessage.prompt,
								isActive: viewBranchId === message.path.at(0),
							};
						}
					}),
				};
			} else {
				nextVertex = undefined;
			}

			if (vertex) {
				return vertex;
			} else {
				return {
					branchId: message.id,
					branchMessages: [
						{
							id: message.id,
							summary: message.prompt,
							isActive: true,
						},
					],
				};
			}
		});

		return vertices;
	}, [messages, branchId, currentChat?.lastMessageId]);

	const scrollToBottom = () => {
		feedRef.current?.scrollTo({
			top: 0,
		});
	};

	useEffect(() => {
		if (!feedRef.current || !autoScroll) return;
		requestAnimationFrame(scrollToBottom);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [responseStream]);

	useEffect(() => {
		setBranchFromIndex(null);
		setBranchId(null);
	}, [viewBranchId]);

	useEffect(() => {
		if (currentChatId !== lastChatId && messages.length > 0) {
			setLastChatId(currentChatId);
			setBranchFromIndex(null);
			setTimeout(() => {
				scrollToBottom();
			}, 150);
		}
	}, [currentChatId, messages.length, lastChatId]);

	return (
		<div className="relative mx-auto flex w-full grow-1 flex-col items-center overflow-hidden">
			{/* Conversation History - Responsive positioning */}
			<div className="absolute top-20 left-4 z-10 md:top-4 md:left-0">
				<ConversationHistory
					vertices={conversationVertices}
					onMessageClick={(messageId) => {
						setViewBranchId(messageId);
					}}
				/>
			</div>

			<div
				className={classNames(
					'no-scrollbar relative mx-auto flex w-full grow-1 flex-col-reverse gap-4 overflow-auto px-4 py-4',
					{
						'my-auto !grow-0': !!view,
					},
				)}
				ref={feedRef}
				onScroll={(e) => {
					// With flex-col-reverse, we're at the bottom when scrollTop is close to 0
					setAutoScroll(Math.abs(e.currentTarget.scrollTop) < 150);
				}}
			>
				{messages.toReversed().map((message, index) => {
					const model = AI_PROVIDERS.find(
						(p) => p.id === message.ai.provider,
					)?.models.find((m) => m.id === message.ai.model);

					return (
						<div
							key={message.id}
							className={classNames(
								'animate-message-in flex w-full origin-center flex-col gap-4 transition-all duration-150',
								{
									'scale-95 opacity-50':
										branchFromIndex && index < branchFromIndex,
								},
							)}
							style={{
								animationFillMode: 'backwards',
								animationDelay: `${index * 0.08}s`, // Messages start after main content, oldest first
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
									actions={
										!message.reply?.error && index !== 0 && !view ? (
											<ToggleButton
												active={branchId === message.id}
												onToggle={() => {
													if (branchId === message.id) {
														setBranchId(null);
														setBranchFromIndex(null);
													} else {
														setBranchId(message.id);
														setBranchFromIndex(index);
														setTimeout(() => {
															actionBar?.focusInput();
														}, 100);
													}
												}}
												icon="GitBranchPlus"
											/>
										) : null
									}
								/>
							) : null}

							{currentChat?.branches?.[message.id]?.length ? (
								<div className="flex flex-wrap gap-2">
									{Object.values(currentChat.branches[message.id]).map(
										(branch) => (
											<ToggleButton
												key={`${branch.id}-${index}`}
												active={
													branch.id
														? branch.id === viewBranchId ||
															!!messages.find(
																(message) => message.path.at(0) === branch.id,
															)
														: viewBranchId === message.path.at(0)
												}
												onToggle={() => {
													setViewBranchId(
														branch.id ?? message.path.at(0) ?? null,
													);
												}}
												icon="GitMerge"
											>
												<div className="capitalize">
													{branch.prompt?.slice(0, 10)}...
												</div>
											</ToggleButton>
										),
									)}
								</div>
							) : null}

							{index === 0 && !message.reply ? (
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

			{view && !messages.length ? (
				<div className="flex h-full w-full flex-col items-center justify-center gap-3">
					<SearchX className="h-10 w-10" />
					<p className="font-slab text-lg font-bold">There is nothing here</p>
					<p className="text-sm">
						The chat you&apos;re trying to access is either invalid or expired
					</p>
					<Link
						href="/"
						className="font-slab text-foreground font-bold underline"
					>
						Back to safety
					</Link>
				</div>
			) : null}

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
							top: 0,
						});
					}}
					icon="ChevronDown"
				/>
			</div>
		</div>
	);
};

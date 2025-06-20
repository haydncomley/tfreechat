'use client';

import classNames from 'classnames';
import { Circle, CircleCheck, GitCommitVertical, Split } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '~/hooks/use-auth';
import { useChatHistory } from '~/hooks/use-chat';

import { ToggleButton } from '../toggle-button';

export interface Message {
	id: string | null;
	summary?: string | null;
	isActive: boolean;
}

export interface ConversationHistoryProps {
	vertices: {
		branchId: string | null;
		branchMessages: Message[];
	}[];
}

export const ConversationHistory = ({ vertices }: ConversationHistoryProps) => {
	const { chatId: sharedChatId } = useParams();
	const { user } = useAuth();
	const [isExpanded, setIsExpanded] = useState(false);
	const {
		setViewBranchId,
		currentChat,
		isSharingChat,
		shareChat,
		viewBranchId,
	} = useChatHistory();

	if (!currentChat) return null;

	return (
		<div className="flex flex-col items-end gap-2">
			{!sharedChatId ? (
				<ToggleButton
					active={currentChat.public}
					icon="Share2"
					disabled={isSharingChat}
					onToggle={() => {
						let url = `${window.location.origin}/share/${user?.uid}/${currentChat.id}`;
						if (viewBranchId) {
							url += `?viewBranch=${viewBranchId}`;
						}

						if (currentChat.public) {
							window.open(url, '_blank');
						} else {
							shareChat({
								chatId: currentChat.id,
								shouldShare: true,
							}).then(() => {
								if (!currentChat.public) {
									window.open(url, '_blank');
								}
							});
						}
					}}
				/>
			) : null}

			<div className="group bg-glass no-scrollbar relative max-h-[50vh] overflow-auto !backdrop-blur-2xl transition-all duration-300 ease-out">
				{vertices.map((vertex, index) => (
					<div
						key={index}
						className={classNames('relative', {
							'mt-1':
								vertices[index]?.branchMessages.length > 1 &&
								vertices[index - 1]?.branchMessages.length > 1 &&
								isExpanded,
						})}
					>
						{vertex.branchMessages.length > 1 ? (
							<span
								className={classNames(
									'border-accent pointer-events-none absolute inset-0 border-x-2',
									{
										'bg-accent/15 z-[-1]': isExpanded,
									},
								)}
							/>
						) : null}

						<Link
							href={`#${vertex.branchMessages[0]?.id}`}
							onClick={(e) => {
								e.preventDefault();

								if (vertex.branchMessages.length > 1) {
									if (!isExpanded) setIsExpanded(true);
								} else if (vertex.branchMessages[0]?.id) {
									document
										.getElementById(vertex.branchMessages[0].id)
										?.scrollIntoView({
											behavior: 'smooth',
											block: 'end',
										});
								}
							}}
							className={classNames(
								'hover:bg-foreground/5 flex items-center justify-end gap-2 px-3 py-2',
								{
									hidden: vertex.branchMessages.length > 1 && isExpanded,
								},
							)}
						>
							{isExpanded && vertex.branchMessages.length === 1 ? (
								<span className="font-slab text-sm">
									{vertex.branchMessages[0]?.summary}
								</span>
							) : (
								vertex.branchMessages.length > 1 && (
									<span
										className={classNames('font-slab gap-2', {
											'flex text-sm': isExpanded,
											'hidden text-xs font-semibold group-hover:flex':
												!isExpanded,
										})}
									>
										{vertex.branchMessages.length}
										<span>•</span>
									</span>
								)
							)}

							{vertex.branchMessages.length > 1 ? (
								<Split className="h-4 w-4 rotate-180" />
							) : (
								<GitCommitVertical className="h-4 w-4" />
							)}
						</Link>

						{isExpanded && vertex.branchMessages.length > 1 ? (
							<div className="flex flex-col gap-1">
								{vertex.branchMessages.map((message) => (
									<Link
										href={`?chat=${currentChat.id}&viewBranch=${message.id}`}
										onClick={(e) => {
											e.preventDefault();
											if (!message.isActive) setViewBranchId(message.id);
										}}
										key={message.id}
										className={classNames(
											'hover:bg-foreground/5 flex items-center justify-end gap-2 px-3 py-2',
											{
												'text-foreground/75': !message.isActive,
												'font-semibold': message.isActive,
											},
										)}
									>
										{isExpanded ? (
											<span
												className="font-slab max-w-[10rem] truncate text-sm"
												title={message.summary ?? 'No summary'}
											>
												{message.summary}
											</span>
										) : null}

										{message.isActive ? (
											<CircleCheck className="h-4 w-4" />
										) : (
											<Circle className="h-4 w-4" />
										)}
									</Link>
								))}
							</div>
						) : null}
					</div>
				))}
			</div>

			<ToggleButton
				icon={isExpanded ? 'ChevronsDownUp' : 'ChevronsUpDown'}
				active
				onToggle={() => setIsExpanded(!isExpanded)}
			/>
		</div>
	);
};

import * as React from 'react';
import classNames from 'classnames';
import { glass } from '~/utils';
import { icons } from 'lucide-react';
import { Button } from '../button';

export interface Message {
	id: string;
	summary: string;
	isActive: boolean;
}

export interface ConversationHistoryProps
	extends React.HTMLAttributes<HTMLDivElement> {
	vertices: Message[][];
}

export const ConversationHistory = ({
	vertices,
	className,
	...props
}: ConversationHistoryProps) => {
	const [isExpanded, setIsExpanded] = React.useState(false);

	return (
		<div className="items-left flex flex-col gap-2">
			<div
				className={classNames(
					'group relative rounded-3xl p-4 shadow-2xl transition-all duration-300 ease-out',
					{
						'w-auto': isExpanded,
						'hover:w-auto': !isExpanded,
					},
					className,
					glass(),
				)}
				{...props}
			>
				<div className="relative z-10 flex flex-col items-center space-y-3">
					{vertices.map((vertex, index) => {
						const isLast = index === vertices.length - 1;
						const hasBranches = vertex.length > 1;

						return (
							<div
								key={vertex[0].id}
								className="flex w-full flex-col"
							>
								<div className="flex w-full items-center">
									{/* Main conversation dot */}
									<button
										className="relative z-10 h-4 w-4 flex-shrink-0 rounded-full border-2 border-white bg-white shadow-lg transition-all duration-300"
										title={vertex[0].summary}
										aria-label={`${vertex[0].summary}`}
									/>

									{/* Branch count - becomes part of layout on hover */}
									{hasBranches && (
										<div
											className={classNames(
												'ml-0 flex w-0 items-center gap-0.5 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:w-auto group-hover:opacity-100',
												{
													'ml-3 w-auto opacity-100': isExpanded,
												},
											)}
										>
											{/* Small dot separator */}
											<div className="mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-white/60" />
											{/* Branch icon */}
											{(() => {
												const LucideIcon = icons['Split'];
												return <LucideIcon size={16} />;
											})()}
											{/* Branch count */}
											<span className="flex-shrink-0 text-sm font-semibold">
												{vertex.length}
											</span>
										</div>
									)}

									{/* Single message - shown inline when no branches and expanded */}
									{!hasBranches && isExpanded && (
										<div className="ml-3 flex items-center">
											<div
												className={classNames(
													'truncate text-sm transition-all duration-300 ease-out',
													{
														'font-bold text-white': vertex[0].isActive,
														'font-normal text-white/80': !vertex[0].isActive,
													},
												)}
											>
												{vertex[0].summary}
											</div>
										</div>
									)}
								</div>

								{/* Multiple messages - shown below when has branches and expanded */}
								{hasBranches && (
									<div
										className={classNames(
											'overflow-hidden transition-all duration-300 ease-out',
											{
												'max-h-0 max-w-0 opacity-0': !isExpanded,
												'max-h-96 max-w-none opacity-100': isExpanded,
											},
										)}
									>
										<div className="ml-7 flex flex-col gap-2 pt-2">
											{vertex.map((message) => (
												<button
													key={message.id}
													className="group/message flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-all duration-300 hover:bg-white/10"
													onClick={() => {
														// Handle message selection
													}}
												>
													{/* Message status icon */}
													<div
														className={classNames(
															'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover/message:scale-110',
															{
																'border-green-400 bg-green-400':
																	message.isActive,
																'border-white/60 bg-transparent group-hover/message:bg-white/20':
																	!message.isActive,
															},
														)}
													>
														{message.isActive && (
															<svg
																className="h-2.5 w-2.5 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														)}
													</div>

													{/* Message text */}
													<div
														className={classNames(
															'truncate text-sm transition-all duration-300 ease-out',
															{
																'font-bold text-white': message.isActive,
																'font-normal text-white/80': !message.isActive,
															},
														)}
													>
														{message.summary}
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}

					{/* Current message dot */}
					<div className="flex w-full items-center">
						<button
							className="relative z-10 h-4 w-4 flex-shrink-0 rounded-full border-2 border-white bg-transparent transition-all duration-300 hover:bg-white/20"
							title=""
							aria-label=""
						/>
					</div>
				</div>
			</div>

			{/* Expand button */}
			<Button
				variant="secondary"
				size="icon"
				icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
				onClick={() => setIsExpanded(!isExpanded)}
				className="ml-0.25"
			/>
		</div>
	);
};

import { cva, type VariantProps } from 'class-variance-authority';
import classNames from 'classnames';
import * as React from 'react';

import { glass } from '~/utils';

export const conversationItemVariants = cva(
	classNames('rounded-2xl py-2.5 px-3 flex flex-col cursor-pointer'),
	{
		variants: {
			selected: {
				true: classNames(glass('fill')),
				false: classNames(glass('subtle', true)),
			},
		},
		defaultVariants: {
			selected: false,
		},
	},
);

export interface ConversationItemProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
		VariantProps<typeof conversationItemVariants> {
	content: string;
	time: string;
	branches?: number;
	chatId: string;
	selected?: boolean;
	onChatSelect?: (chatId: string) => void;
	ref?: React.RefObject<HTMLDivElement>;
}

export const ConversationItem = ({
	className,
	content,
	time,
	branches,
	chatId,
	selected,
	onChatSelect,
	ref,
	...props
}: ConversationItemProps) => {
	const handleClick = () => {
		onChatSelect?.(chatId);
	};

	return (
		<div
			className={classNames(conversationItemVariants({ selected, className }))}
			onClick={handleClick}
			ref={ref}
			{...props}
		>
			{/* Main content */}
			<div className="text-foreground text-md leading-relaxed font-medium">
				{content}
			</div>

			{/* Time and branches info */}
			<div className="text-foreground/60 flex items-center gap-2 text-xs">
				<span>{time}</span>
				{branches !== undefined && branches > 0 && (
					<>
						<span>•</span>
						<span>
							{branches} {branches === 1 ? 'branch' : 'branches'}
						</span>
					</>
				)}
			</div>
		</div>
	);
};

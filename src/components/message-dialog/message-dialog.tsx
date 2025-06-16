import * as React from 'react';

import { Dialog, DialogProps } from '../dialog/dialog';

export interface MessageDialogProps extends Omit<DialogProps, 'children'> {
	title: string;
	description?: string;
	titleColor?: 'default' | 'error' | 'warning' | 'success';
	children?: React.ReactNode;
}

const MessageDialog = React.forwardRef<HTMLDialogElement, MessageDialogProps>(
	({ title, description, titleColor = 'default', children, ...props }, ref) => {
		const getTitleColorClass = () => {
			switch (titleColor) {
				case 'error':
					return 'text-red-500';
				case 'warning':
					return 'text-yellow-500';
				case 'success':
					return 'text-green-500';
				default:
					return 'text-foreground';
			}
		};

		return (
			<Dialog
				ref={ref}
				{...props}
			>
				<div className="flex flex-col">
					<h4 className={`font-slab text-lg font-bold ${getTitleColorClass()}`}>
						{title}
					</h4>
					{description && (
						<p className="text-foreground/75 mt-2 text-sm">{description}</p>
					)}
				</div>

				{children}
			</Dialog>
		);
	},
);

MessageDialog.displayName = 'MessageDialog';

export { MessageDialog };

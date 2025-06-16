import * as React from 'react';

import { ToggleButton } from '~/components';
import { glass } from '~/utils';

export interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
	({ open, onClose, children }, ref) => {
		const [isAnimating, setIsAnimating] = React.useState(false);

		React.useEffect(() => {
			if (open) {
				setIsAnimating(true);
			}
		}, [open]);

		const handleClose = () => {
			setIsAnimating(false);
			// Delay the actual close to allow animation to complete
			setTimeout(() => {
				onClose();
			}, 200);
		};

		if (!open && !isAnimating) return null;

		return (
			<dialog
				ref={ref}
				onClose={handleClose}
				open={open}
				className="!z-50"
			>
				<div
					className={`bg-background/25 fixed top-0 left-0 flex h-full w-full flex-col items-center justify-center transition-all duration-200 ${
						isAnimating
							? 'opacity-100 backdrop-blur-2xl'
							: 'opacity-0 backdrop-blur-none'
					}`}
				>
					<div
						className={`bg-glass text-foreground flex w-md max-w-5/6 flex-col gap-4 p-4 transition-all duration-200 ease-out ${
							isAnimating
								? 'translate-y-0 scale-100 opacity-100'
								: 'translate-y-8 scale-95 opacity-0'
						}`}
					>
						{children}

						<div className="flex justify-end">
							<ToggleButton
								active={open}
								onToggle={handleClose}
								icon="X"
							/>
						</div>
					</div>
				</div>
			</dialog>
		);
	},
);

Dialog.displayName = 'Dialog';

export { Dialog };

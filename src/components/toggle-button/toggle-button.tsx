import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from 'classnames';
import { glass } from '~/utils';
import { icons } from 'lucide-react';
import type { IconName } from '~/components';

const toggleButtonVariants = cva(
	'px-3.5 py-2 rounded-full inline-flex justify-center items-center gap-1 overflow-hidden transition-all cursor-pointer transition-all',
	{
		variants: {
			variant: {
				default: '',
			},
			state: {
				inactive: glass('default'),
				active: cn(glass('accent'), 'text-accent-foreground'),
			},
		},
		defaultVariants: {
			variant: 'default',
			state: 'inactive',
		},
	},
);

export interface ToggleButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
		VariantProps<typeof toggleButtonVariants> {
	active?: boolean;
	onToggle?: (active: boolean) => void;
	children?: React.ReactNode;
	icon?: IconName;
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
	(
		{ className, variant, active = false, onToggle, children, icon, ...props },
		ref,
	) => {
		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			onToggle?.(!active);
		};

		return (
			<button
				aria-pressed={active}
				type="button"
				className={cn(
					toggleButtonVariants({
						variant,
						state: active ? 'active' : 'inactive',
						className,
					}),
				)}
				onClick={handleClick}
				ref={ref}
				{...props}
			>
				{icon
					? (() => {
							const LucideIcon = icons[icon];
							return <LucideIcon size={16} />;
						})()
					: null}
				{children && (
					<div className="font-roboto-slab text-center text-[12px] font-normal">
						{children}
					</div>
				)}
			</button>
		);
	},
);

ToggleButton.displayName = 'ToggleButton';

export { ToggleButton, toggleButtonVariants };

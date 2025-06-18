import { cva, type VariantProps } from 'class-variance-authority';
import classNames from 'classnames';
import { icons } from 'lucide-react';
import * as React from 'react';
import { useMemo } from 'react';

import type { IconName } from '~/components';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
	{
		variants: {
			variant: {
				primary: 'bg-foreground text-background hover:bg-accent-secondary',
				secondary: classNames('bg-accent text-accent-foreground'),
			},
			size: {
				default: 'h-[2.75rem] px-4 py-2 min-w-[2.75rem]',
				icon: 'w-[2.75rem] h-[2.75rem] min-w-[2.75rem]',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default',
		},
	},
);

type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {};

type DefaultButtonProps = BaseButtonProps & {
	size?: 'default';
	icon?: never;
	iconPosition?: 'left' | 'right';
	children: React.ReactNode;
};

type IconButtonProps = BaseButtonProps & {
	size: 'icon';
	icon: IconName;
	iconPosition?: never;
	children?: never;
};

export type ButtonProps = DefaultButtonProps | IconButtonProps;

const Button = ({
	className,
	variant,
	size,
	icon,
	iconPosition,
	children,
	...props
}: ButtonProps) => {
	const renderIcon = useMemo(() => {
		if (size === 'icon' || (iconPosition === 'left' && icon)) {
			const LucideIcon = icons[icon];
			return <LucideIcon size={16} />;
		}
		return null;
	}, [size, iconPosition, icon]);

	return (
		<button
			className={classNames(buttonVariants({ variant, size, className }))}
			{...props}
		>
			{size === 'icon' || (iconPosition === 'left' && icon)
				? (() => {
						const LucideIcon = icons[icon];
						return <LucideIcon size={16} />;
					})()
				: null}
			{children}
			{size !== 'icon' && iconPosition === 'right' && icon ? renderIcon : null}
		</button>
	);
};

export { Button, buttonVariants };

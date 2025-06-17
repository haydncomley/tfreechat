import classNames from 'classnames';
import { icons } from 'lucide-react';
import * as React from 'react';
import { useMemo } from 'react';

import type { IconName } from '~/components';

export interface ToggleButtonProps {
	active?: boolean;
	onToggle?: (active: boolean) => void;
	disabled?: boolean;
	children?: React.ReactNode;
	icon?: IconName;
}

export const ToggleButton = ({
	active = false,
	onToggle,
	children,
	icon,
	disabled = false,
}: ToggleButtonProps) => {
	const renderIcon = useMemo(() => {
		if (icon) {
			const LucideIcon = icons[icon];
			return <LucideIcon className="h-4 w-4" />;
		}
		return null;
	}, [icon]);

	return (
		<button
			aria-pressed={active}
			type="button"
			disabled={disabled}
			className={classNames(
				'bg-glass flex gap-2 rounded-full p-2 px-3 transition-all duration-75',
				{
					'cursor-pointer hover:scale-105 hover:opacity-80': onToggle,
					'!bg-foreground !text-background': active,
					'pointer-events-none opacity-50': disabled,
				},
			)}
			onClick={() => onToggle?.(!active)}
		>
			{renderIcon}
			{children && (
				<div className="font-roboto-slab font-slab text-center text-xs">
					{children}
				</div>
			)}
		</button>
	);
};

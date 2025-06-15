import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import classNames from 'classnames';
import { glass } from '~/utils';

const inputVariants = cva(
	classNames(
		glass('default'),
		'w-full h-12 px-6 py-4 rounded-full outline outline-1 outline-offset-[-1px] outline-foreground/10 flex items-center text-sm font-normal placeholder:opacity-75 placeholder:text-foreground focus:outline-offset-0 focus:outline-accent transition-all',
	),
	{
		variants: {
			variant: {
				default: '',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement>,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, variant, type = 'text', ...props }, ref) => {
		return (
			<input
				type={type}
				className={classNames(inputVariants({ variant, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);

Input.displayName = 'Input';

export { Input, inputVariants };

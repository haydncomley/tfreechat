import classNames from 'classnames';
import * as React from 'react';

import { useLoading } from '~/hooks/use-loading';

import styles from './loading-wrapper.module.css';

export interface LoadingWrapperProps {
	children: React.ReactNode;
	className?: string;
}

const LoadingWrapper = ({ children, className }: LoadingWrapperProps) => {
	const { phase, showGrid, showComponents } = useLoading();

	return (
		<div
			className={classNames(
				styles.loadingWrapper,
				{
					[styles.gridAnimating]: showGrid,
					[styles.componentsEnter]: showComponents,
				},
				className,
			)}
		>
			{children}
		</div>
	);
};

export { LoadingWrapper };

'use client';

import { useEffect, useState } from 'react';

export type LoadingPhase =
	| 'initial'
	| 'grid-animating'
	| 'components-ready'
	| 'complete';

export const useLoading = () => {
	const [phase, setPhase] = useState<LoadingPhase>('initial');
	const [isGridComplete, setIsGridComplete] = useState(false);
	const [isComponentsReady, setIsComponentsReady] = useState(false);

	useEffect(() => {
		// Start grid animation after a brief delay
		const gridTimer = setTimeout(() => {
			setPhase('grid-animating');
		}, 200);

		// Grid animation completes after 0.1 seconds
		const gridCompleteTimer = setTimeout(() => {
			setIsGridComplete(true);
			setPhase('components-ready');
		}, 100);

		// Components animate in immediately after grid is complete
		const componentsTimer = setTimeout(() => {
			setIsComponentsReady(true);
			setPhase('complete');
		}, 1200);

		return () => {
			clearTimeout(gridTimer);
			clearTimeout(gridCompleteTimer);
			clearTimeout(componentsTimer);
		};
	}, []);

	return {
		phase,
		isGridComplete,
		isComponentsReady,
		showGrid: phase !== 'initial',
		showComponents: isComponentsReady,
	};
};

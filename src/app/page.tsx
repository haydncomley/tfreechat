'use client';

import classNames from 'classnames';

import { ActionBar, Feed, LoadingWrapper, Sidebar } from '~/components';
import { useAuth } from '~/hooks/use-auth';
import { useLoading } from '~/hooks/use-loading';

import styles from './page.module.css';

export default function Home() {
	const { user } = useAuth();
	const { showGrid } = useLoading();

	return (
		<div
			className={classNames(
				'flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat',
				styles.page,
				{
					[styles.gridAnimating]: showGrid,
				},
			)}
		>
			<LoadingWrapper className="flex h-full w-full max-w-[64rem] justify-center gap-4">
				<Sidebar />
				{user ? (
					<main className="flex h-full w-full flex-col overflow-hidden transition-all duration-200 md:pr-4">
						<Feed />
						<ActionBar />
					</main>
				) : null}
			</LoadingWrapper>
		</div>
	);
}

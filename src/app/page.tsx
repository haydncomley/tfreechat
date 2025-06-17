'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ActionBar, Feed, Sidebar } from '~/components';
import { useAuth } from '~/hooks/use-auth';

import styles from './page.module.css';

export default function Home() {
	const { replace } = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (user === null) replace('/login');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return (
		<div
			className={classNames(
				'flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat',
				styles.page,
			)}
		>
			<div className="flex h-full w-full max-w-[64rem] justify-center gap-4">
				<Sidebar />
				<main className="flex h-full w-full flex-col overflow-hidden transition-all duration-200 md:pr-4">
					<Feed />
					<ActionBar />
				</main>
			</div>
		</div>
	);
}

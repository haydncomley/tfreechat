'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '~/hooks/use-auth';

import styles from '../page.module.css';

export default function Home() {
	const { replace } = useRouter();
	const { signIn, user } = useAuth();

	useEffect(() => {
		if (user) replace('/');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!!user]);

	return (
		<div
			className={classNames(
				'flex h-full w-full flex-col items-center justify-center gap-4 bg-cover bg-center bg-no-repeat',
				styles.page,
			)}
		>
			<main className="bg-glass flex w-sm max-w-5/6 flex-col items-center gap-4 p-6 pb-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-slab text-center text-3xl font-black">
						tfree.chat
					</h1>
					<p className="text-foreground/75 text-center text-sm">
						Login below in order to get started
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-2">
					<button
						className="bg-foreground text-background font-base font-slab flex cursor-pointer items-center gap-1 rounded-lg px-4 py-2 text-sm transition-all duration-75 hover:scale-105"
						onClick={() => signIn('google')}
					>
						Login with <b className="text-base">Google</b>
					</button>
					<button
						className="bg-foreground text-background font-base font-slab flex cursor-pointer items-center gap-1 rounded-lg px-4 py-2 text-sm transition-all duration-75 hover:scale-105"
						onClick={() => signIn('github')}
					>
						Login with <b className="text-base">GitHub</b>
					</button>
				</div>

				<Link
					href="https://github.com/haydncomley/tfreechat"
					target="_blank"
					className="text-foreground/75 hover:text-foreground/50 text-xs"
				>
					View Source Code
				</Link>
			</main>

			<p className="font-slab text-foreground/75 text-center text-xs">
				Authentication handled via Firebase <br />
				Tokens are only stored within localStorage
			</p>
		</div>
	);
}

'use client';

import { ActionBar, Feed, Sidebar } from '~/components';
import { useAuth } from '~/hooks/use-auth';

export default function Home() {
	const { user } = useAuth();

	return (
		<div
			className="flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: 'url(/background.png)' }}
		>
			<Sidebar />
			{user ? (
				<main className="flex h-full w-full max-w-[50rem] flex-col overflow-hidden md:pr-4">
					<Feed />
					<ActionBar />
				</main>
			) : null}
		</div>
	);
}

'use client';

import { ActionBar, Feed, Sidebar } from '~/components';

export default function Home() {
	return (
		<div className="flex h-full w-full bg-cover bg-center bg-no-repeat gap-4" style={{ backgroundImage: 'url(/background.png)' }}>
			<Sidebar />
			<main className="flex h-full w-full flex-col gap-4">
				<Feed />

				<ActionBar />
			</main>
		</div>
	);
}

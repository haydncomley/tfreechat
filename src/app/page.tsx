'use client';

import { ActionBar, Feed, Sidebar } from '~/components';

export default function Home() {
	return (
		<div
			className="flex h-full w-full gap-4 bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: 'url(/background.png)' }}
		>
			<Sidebar />
			<main className="flex h-full w-full flex-col gap-4">
				<Feed />

				<ActionBar />
			</main>
		</div>
	);
}

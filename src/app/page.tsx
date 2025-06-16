'use client';

import { ActionBar, Feed, Sidebar } from '~/components';

export default function Home() {
	return (
		<div
			className="flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: 'url(/background.png)' }}
		>
			<Sidebar />
			<main className="flex h-full w-full max-w-[50rem] flex-col overflow-hidden md:pr-4">
				<Feed />
				<ActionBar />
			</main>
		</div>
	);
}

'use client';

import { ActionBar, Feed, Sidebar } from '~/components';

export default function Home() {
	return (
		<div className="flex h-full w-full">
			<Sidebar />
			<main className="flex h-full w-full flex-col">
				<Feed />

				<ActionBar />
			</main>
		</div>
	);
}

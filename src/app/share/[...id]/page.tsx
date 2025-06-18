'use client';

import classNames from 'classnames';
import { useParams } from 'next/navigation';

import { Feed } from '~/components';

import styles from '../../page.module.css';

export default function Page() {
	const { id } = useParams();

	return (
		<div
			className={classNames(
				'relative flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat',
				styles.page,
			)}
		>
			<div className="relative flex h-full w-full max-w-[50rem] justify-center gap-4">
				<main className="flex h-full w-full flex-col overflow-hidden transition-all duration-200 md:pr-4">
					<Feed id={id ? id[0] : null} />
				</main>
			</div>
		</div>
	);
}

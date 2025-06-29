'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
	ActionBar,
	ActionBarContext,
	ActionBarRef,
	Feed,
	Sidebar,
	WelcomeScreen,
} from '~/components';
import { useAuth } from '~/hooks/use-auth';
import { useChat, useChatHistory } from '~/hooks/use-chat';

import styles from './page.module.css';

export default function Home() {
	const { replace } = useRouter();
	const { user } = useAuth();
	const { messages } = useChat();
	const { chats } = useChatHistory();
	const actionBarRef = useRef<ActionBarRef>(null);
	const [showSidebar, setShowSidebar] = useState(false);

	// Show welcome screen only when user has no chats and no messages
	const showWelcomeScreen = chats.length === 0 && messages.length === 0;

	useEffect(() => {
		if (user === null) replace('/login');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return (
		<ActionBarContext value={actionBarRef.current}>
			<div
				className={classNames(
					'relative flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat',
					styles.page,
				)}
			>
				<div className="relative flex h-full w-full max-w-[80rem] justify-center gap-4">
					<WelcomeScreen show={showWelcomeScreen && !showSidebar} />
					<Sidebar
						showMobileMenu={showSidebar}
						setShowMobileMenu={setShowSidebar}
					/>
					<main className="flex h-full w-full flex-col overflow-hidden transition-all duration-200 md:pr-4">
						<Feed />
						<ActionBar ref={actionBarRef} />
					</main>
				</div>
			</div>
		</ActionBarContext>
	);
}

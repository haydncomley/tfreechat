'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, createContext, useContext } from 'react';

import { ActionBar, Feed, Sidebar, WelcomeScreen } from '~/components';
import { ActionBarRef } from '~/components/action-bar/action-bar';
import { useAuth } from '~/hooks/use-auth';
import { useChat, useChatHistory } from '~/hooks/use-chat';

import styles from './page.module.css';

// Create context for ActionBar ref
const ActionBarContext = createContext<ActionBarRef | null>(null);

export const useActionBar = () => {
	const context = useContext(ActionBarContext);
	return context;
};

export default function Home() {
	const { replace } = useRouter();
	const { user } = useAuth();
	const { messages } = useChat();
	const { currentChatId, chats } = useChatHistory();
	const actionBarRef = useRef<ActionBarRef>(null);

	// Show welcome screen only when user has no chats and no messages
	const showWelcomeScreen = chats.length === 0 && messages.length === 0;

	useEffect(() => {
		if (user === null) replace('/login');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	return (
		<ActionBarContext.Provider value={actionBarRef.current}>
			<div
				className={classNames(
					'relative flex h-full w-full justify-center gap-4 bg-cover bg-center bg-no-repeat',
					styles.page,
				)}
			>
				<div className="relative flex h-full w-full max-w-[64rem] justify-center gap-4">
					<WelcomeScreen show={showWelcomeScreen} />
					<Sidebar />
					<main className="flex h-full w-full flex-col overflow-hidden transition-all duration-200 md:pr-4">
						<Feed />
						<ActionBar ref={actionBarRef} />
					</main>
				</div>
			</div>
		</ActionBarContext.Provider>
	);
}

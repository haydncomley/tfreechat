'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

const getCookie = (name: string): string | null => {
	if (typeof document === 'undefined') return null;
	const match = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${name}=`));
	return match ? match.split('=')[1] : null;
};

const setCookie = (name: string, value: string) => {
	document.cookie = `${name}=${value}; path=/; max-age=31536000`;
};

const updateDOMTheme = (dark: boolean) => {
	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
};

export const darkModeStore = {
	subscribe: (cb: Subscriber) => {
		subscribers.add(cb);
		return () => {
			subscribers.delete(cb);
		};
	},
	getSnapshot: () =>
		document.documentElement.getAttribute('data-theme') === 'dark',
	init: (serverDefault?: boolean) => {
		const cookie = getCookie('darkMode');
		const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const dark =
			cookie !== null ? cookie === 'true' : (serverDefault ?? prefers);
		updateDOMTheme(dark);
	},
	setDarkMode: (dark: boolean, save = true) => {
		if (save) setCookie('darkMode', String(dark));
		updateDOMTheme(dark);
		subscribers.forEach((cb) => cb());
	},
};

export const useDarkMode = (serverDefault?: boolean) => {
	// initialize on mount
	useEffect(() => {
		darkModeStore.init(serverDefault);
	}, [serverDefault]);

	// sync state
	const isDarkMode = useSyncExternalStore(
		darkModeStore.subscribe,
		darkModeStore.getSnapshot,
		() => serverDefault ?? false,
	);

	const toggleDarkMode = (override?: boolean, save = true) => {
		const next = override !== undefined ? override : !isDarkMode;
		darkModeStore.setDarkMode(next, save);
	};

	// listen to DOM attribute changes
	useEffect(() => {
		const obs = new MutationObserver((muts) => {
			if (muts.some((m) => m.attributeName === 'data-theme')) {
				subscribers.forEach((cb) => cb());
			}
		});
		obs.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});
		return () => obs.disconnect();
	}, []);

	// listen to system preference changes if no explicit cookie
	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			if (getCookie('darkMode') === null) {
				darkModeStore.setDarkMode(e.matches, false);
			}
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	return { isDarkMode, toggleDarkMode };
};

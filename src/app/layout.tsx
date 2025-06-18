import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Mono, Roboto_Slab } from 'next/font/google';
import { Suspense } from 'react';

import { Providers } from '~/components';
import { isDarkMode } from '~/utils';
import './globals.css';

const robotoFlex = Roboto_Flex({
	variable: '--font-roboto-flex',
	subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
	variable: '--font-roboto-mono',
	subsets: ['latin'],
});

const robotoSlab = Roboto_Slab({
	variable: '--font-roboto-slab',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'tfree.chat - Cloneathon 2025',
	description:
		'An open-source, bring-your-own-key, AI platform for interfacing with multiple different models.',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const darkMode = await isDarkMode();

	return (
		<html
			lang="en"
			data-theme={
				darkMode !== undefined ? (darkMode ? 'dark' : 'light') : undefined
			}
		>
			<head>
				<meta
					name="theme-color"
					content={darkMode ? '#231a1a' : '#f7d3d0'}
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
				></meta>
				<meta
					name="apple-mobile-web-app-capable"
					content="yes"
				/>
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
			</head>
			<body
				className={`${robotoFlex.variable} ${robotoMono.variable} ${robotoSlab.variable} antialiased`}
			>
				<Providers>
					<Suspense>{children}</Suspense>
				</Providers>
			</body>
		</html>
	);
}

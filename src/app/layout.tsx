import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Mono, Roboto_Slab } from 'next/font/google';
import { Suspense } from 'react';

import { Providers } from '~/components';
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
	title: 'tfreechat - Cloneathon 2025',
	description:
		'An open-source, bring-your-own-key, AI platform for interfacing with multiple different models.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
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

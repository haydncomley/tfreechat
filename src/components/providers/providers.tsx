'use client'; // Only for App Router

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const Providers = ({ children }: { children: ReactNode }) => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<NuqsAdapter>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</NuqsAdapter>
	);
};

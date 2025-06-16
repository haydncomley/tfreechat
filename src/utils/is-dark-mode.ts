'use server';

import { cookies } from 'next/headers';

export const isDarkMode = async () => {
	const darkModeCookie = (await cookies()).get('darkMode')?.value;
	if (darkModeCookie) return darkModeCookie === 'true';
	return undefined;
};

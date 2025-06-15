import { getAuth } from 'firebase-admin/auth';
import { IncomingHttpHeaders } from 'http';

export const isAuthenticated = async (headers: IncomingHttpHeaders) => {
	const authHeader = headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return;
	}

	const idToken = authHeader.split('Bearer ')[1];
	let uid: string;

	try {
		const decodedToken = await getAuth().verifyIdToken(idToken);
		uid = decodedToken.uid;
	} catch {
		return;
	}

	return { uid, token: idToken };
};

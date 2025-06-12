import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FB_MSG_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FB_APP_ID,
};

export const app =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const functions = getFunctions(app);
export const firestore = getFirestore(app, 'tfreechat');

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: "AIzaSyDunl3KyjZzHgJx3p76KtPV6IVnUan6OT8",
	authDomain: "tfreechat.firebaseapp.com",
	databaseURL: "https://tfreechat-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "tfreechat",
	storageBucket: "tfreechat.firebasestorage.app",
	messagingSenderId: "642659760259",
	appId: "1:642659760259:web:a7de9c4dc14a7aa24343b6"
  };

export const app =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
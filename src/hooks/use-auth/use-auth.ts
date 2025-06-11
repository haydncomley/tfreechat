
import { useMutation } from '@tanstack/react-query';
import { signOut as firebaseSignOut, signInWithPopup, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '~/utils/firebase.utils';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const { mutate: signIn } = useMutation({
        mutationFn: async () => {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        }
    });

    const { mutate: signOut } = useMutation({
        mutationFn: async () => {
            await firebaseSignOut(auth);
        }
    });

    return { user, loading, signIn, signOut };
}


'use client';

import { useAuth } from "~/hooks/use-auth";

export default function Home() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <main>
        {user ? <p>Hello {user.displayName}</p> : <p>No user</p>}

        {user ? (
          <button className="p-2 border rounded-lg" onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button className="p-2 border rounded-lg" onClick={() => signIn()}>Sign In</button>
        )}
      </main>
    </div>
  );
}

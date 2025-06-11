'use client';

import { useState } from "react";
import { useAuth } from "~/hooks/use-auth";
import { useChat } from "~/hooks/use-chat";

export default function Home() {
  const { user, signIn, signOut } = useAuth();
  const { chat, response, isLoading } = useChat();

  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_DEFAULT_KEY || "");
  const [model, setModel] = useState(process.env.NEXT_PUBLIC_DEFAULT_MODEL || "");
  const [provider, setProvider] = useState(process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || "");
  const [prompt, setPrompt] = useState("");

  const sendChat = async (prompt: string) => {
    const response = await chat({ text: prompt, ai: { key: apiKey, model, provider } });
    console.log(response);
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <main>
        {user ? <p>Hello {user.displayName}</p> : <p>No user</p>}

        {user ? (
          <button className="p-2 border rounded-lg" onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button className="p-2 border rounded-lg" onClick={() => signIn()}>Sign In</button>
        )}


        <div className="flex flex-col gap-2">
            <input type="text" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input type="text" placeholder="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} />

            <input type="text" placeholder="..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <button className="p-2 border rounded-lg" onClick={() => sendChat(prompt)}>Send</button>

            {isLoading && <p>Loading...</p>}
            {response && <p>{response}</p>}
        </div>
      </main>
    </div>
  );
}

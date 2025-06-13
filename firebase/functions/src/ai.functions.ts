import { HttpsError, onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import { streamText, experimental_generateImage as generateImage } from 'ai';
import { Agent, ChatMessage } from './lib/types';
import { DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { createAgent, createImageAgent } from './lib/utilities';
import { getStorage } from "firebase-admin/storage";

const app = initializeApp();
const firestore = getFirestore(app, 'tfreechat');
const storage = getStorage(app);

export const aiText = onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	
	if (req.method === 'OPTIONS') {
		res.status(204).send('');
		return;
	}

	let newMessageRef: DocumentReference | undefined = undefined;

	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ error: 'Unauthorized: No token provided' });
			return;
		}

		const idToken = authHeader.split('Bearer ')[1];
		let uid: string;
		try {
			const decodedToken = await getAuth().verifyIdToken(idToken);
			uid = decodedToken.uid;
		} catch (error) {
			res.status(401).json({ error: 'Unauthorized: Invalid token' });
			return;
		}

		const { text, secret, model, provider, chatId } = req.body as Partial<Agent & { text: string, chatId?: string, messageId?: string }>;

		if (!text) {
			throw new HttpsError('invalid-argument', 'Text is required');
		}

		if (!secret) {
			throw new HttpsError('invalid-argument', 'Secret is required');
		}

		if (!model) {
			throw new HttpsError('invalid-argument', 'Model is required');
		}

		if (!provider) {
			throw new HttpsError('invalid-argument', 'Provider is required');
		}

		let wantedChatId = chatId ?? '';
		const userRef = firestore.collection('users').doc(uid);

		if (!wantedChatId) {
			const chatRef = userRef.collection('chats').doc();
			await chatRef.set({
				id: chatRef.id,
				createdAt: FieldValue.serverTimestamp(),
				prompt: text,
			}, { merge: true });
			wantedChatId = chatRef.id;
		}

		const chatRef = userRef.collection('chats').doc(wantedChatId!);
		const messagesRef = chatRef.collection('messages');
		const messagesDoc = await messagesRef.orderBy('createdAt', 'asc').get();
		const messagesData = messagesDoc.docs.filter(doc => doc.exists).map(doc => doc.data() as ChatMessage) ?? [];

		newMessageRef = messagesRef.doc();
		await newMessageRef.set({
			id: newMessageRef.id,
			path: [...messagesData.map(message => message.id), newMessageRef.id],
			createdAt: FieldValue.serverTimestamp(),
			prompt: text,
			ai: {
				model,
				provider,
			},
		}, { merge: true });

		const messages = messagesData.map((message) => [{
			role: 'user' as const,
			content: message.prompt,
			createdAt: message.createdAt.toDate(),
		}, ...(message.reply?.text ? [{
			role: 'assistant' as const,
			content: message.reply.text,
			createdAt: message.reply.createdAt.toDate(),
		}] : [])]).flat();

		res.setHeader('Content-Type', 'text/event-stream')
		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('Connection', 'keep-alive')

		const { textStream } = streamText({
			model: createAgent({ key: secret, provider, model }),
			...(messages.length ? {
				messages: [
					...messages,
					{
						role: 'user' as const,
						content: text,
						createdAt: new Date(),
					}
				]
			} : {
				prompt: text,
			}),
		});

		let fullText = '';

		for await (const textPart of textStream) {
			fullText += textPart;
			res.write(`data: ${JSON.stringify({ text: textPart })}\n\n`);
		}

		res.write('data: [DONE]\n\n');

		await newMessageRef.update({
			reply: {
				id: newMessageRef.id,
				createdAt: FieldValue.serverTimestamp(),
				text: fullText,
			},
		});

		res.end()
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Error streaming response' })

		if (newMessageRef) {
			await newMessageRef.update({
				'reply.error': 'Error getting response',
			});
		}
	}
});

export const aiImage = onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	
	if (req.method === 'OPTIONS') {
		res.status(204).send('');
		return;
	}

	let newMessageRef: DocumentReference | undefined = undefined;

	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ error: 'Unauthorized: No token provided' });
			return;
		}

		const idToken = authHeader.split('Bearer ')[1];
		let uid: string;
		try {
			const decodedToken = await getAuth().verifyIdToken(idToken);
			uid = decodedToken.uid;
		} catch (error) {
			res.status(401).json({ error: 'Unauthorized: Invalid token' });
			return;
		}

		const { text, secret, model, provider, chatId } = req.body as Partial<Agent & { text: string, chatId?: string, messageId?: string }>;

		if (!text) {
			throw new HttpsError('invalid-argument', 'Text is required');
		}

		if (!secret) {
			throw new HttpsError('invalid-argument', 'Secret is required');
		}

		if (!model) {
			throw new HttpsError('invalid-argument', 'Model is required');
		}

		if (!provider) {
			throw new HttpsError('invalid-argument', 'Provider is required');
		}

		let wantedChatId = chatId ?? '';
		const userRef = firestore.collection('users').doc(uid);

		if (!wantedChatId) {
			const chatRef = userRef.collection('chats').doc();
			await chatRef.set({
				id: chatRef.id,
				createdAt: FieldValue.serverTimestamp(),
				prompt: text,
			}, { merge: true });
			wantedChatId = chatRef.id;
		}

		const chatRef = userRef.collection('chats').doc(wantedChatId!);
		const messagesRef = chatRef.collection('messages');
		const messagesDoc = await messagesRef.orderBy('createdAt', 'asc').get();
		const messagesData = messagesDoc.docs.filter(doc => doc.exists).map(doc => doc.data() as ChatMessage) ?? [];

		newMessageRef = messagesRef.doc();
		await newMessageRef.set({
			id: newMessageRef.id,
			path: [...messagesData.map(message => message.id), newMessageRef.id],
			createdAt: FieldValue.serverTimestamp(),
			prompt: text,
			ai: {
				model,
				provider,
			},
			reply: {
				id: newMessageRef.id,
				createdAt: FieldValue.serverTimestamp(),
				image: '',
			},
		}, { merge: true });

		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('Connection', 'keep-alive')

		const imageResult = await generateImage({
			model: createImageAgent({ key: secret, provider, model }),
			prompt: text,
		});

		const bucket = storage.bucket();
		const file = bucket.file(`${uid}/${newMessageRef.id}.${imageResult.image.mimeType.split('/')[1]}`);
		await file.save(Buffer.from(imageResult.image.base64, 'base64'), {
			metadata: {
				contentType: imageResult.image.mimeType,
			},
			public: true,
		});

		await newMessageRef.update({
			'reply.image': file.publicUrl()
		});

		res.status(200).json({ image: imageResult.image.base64 })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Error generating image' })

		if (newMessageRef) {
			await newMessageRef.update({
				'reply.error': 'Error generating image',
			});
		}
	}
});
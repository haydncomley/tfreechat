import { initializeApp } from 'firebase-admin/app';
import {
	DocumentReference,
	FieldValue,
	getFirestore,
} from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onRequest } from 'firebase-functions/v2/https';
import z from 'zod';

import { isAuthenticated } from './utilities';
import {
	imageGeneration,
	imageGenerationSchema,
} from '../../abilities/image-generation.api';
import {
	textGeneration,
	textGenerationSchema,
} from '../../abilities/text-generation.api';
import { ChatMessage } from '../../types';
import { validateBody } from '../../utilities';

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

	const user = await isAuthenticated(req.headers);

	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	if (!validateBody(textGenerationSchema, req.body)) {
		res.status(400).json({ error: 'Invalid body' });
		return;
	}

	const { uid } = user;
	let chatId: string | undefined = undefined;
	let messageId: string | undefined = undefined;

	try {
		chatId = req.body.chatId ?? '';
		const userRef = firestore.collection('users').doc(uid);

		if (!chatId) {
			const chatRef = userRef.collection('chats').doc();
			await chatRef.set(
				{
					id: chatRef.id,
					createdAt: FieldValue.serverTimestamp(),
					updatedAt: FieldValue.serverTimestamp(),
					prompt: req.body.text,
				},
				{ merge: true },
			);
			chatId = chatRef.id;
		}

		const chatRef = userRef.collection('chats').doc(chatId);
		const messagesRef = chatRef.collection('messages');
		const messagesDoc = await messagesRef.orderBy('createdAt', 'asc').get();
		const messagesData =
			messagesDoc.docs
				.filter((doc) => doc.exists)
				.map((doc) => doc.data() as ChatMessage) ?? [];

		const newMessageRef = messagesRef.doc();
		messageId = newMessageRef.id;
		await newMessageRef.set({
			id: newMessageRef.id,
			path: [...messagesData.map((message) => message.id), newMessageRef.id],
			createdAt: FieldValue.serverTimestamp(),
			prompt: req.body.text,
			ai: {
				model: req.body.model,
				provider: req.body.provider,
			},
		});

		const messages = messagesData
			.map((message) => [
				{
					role: 'user' as const,
					content: message.prompt,
					createdAt: message.createdAt.toDate(),
				},
				...(message.reply?.text
					? [
							{
								role: 'assistant' as const,
								content: message.reply.text,
								createdAt: message.reply.createdAt.toDate(),
							},
						]
					: []),
			])
			.flat();

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		let fullText = '';

		await textGeneration(
			{
				...req.body,
				chatId,
			},
			messages,
			{
				onChunk: async ({ chunk: part }) => {
					if (part.type === 'text-delta') {
						fullText += part.textDelta;
						res.write(`data: ${JSON.stringify({ text: part.textDelta })}\n\n`);
					}

					if (part.type === 'reasoning') {
						res.write(
							`data: ${JSON.stringify({ reasoning: part.textDelta })}\n\n`,
						);
					}
				},
				onFinish: async () => {
					await newMessageRef.update({
						updatedAt: FieldValue.serverTimestamp(),
						reply: {
							id: newMessageRef.id,
							createdAt: FieldValue.serverTimestamp(),
							text: fullText,
							capabilitiesUsed: {
								webSearch: !!req.body.capabilities?.webSearch,
							},
						},
					});
				},
				onError: async (error) => {
					console.error('Error streaming response', error);
					await newMessageRef.update({
						'reply.error': 'Something went wrong...',
					});
				},
			},
		);

		res.write('data: [DONE]\n\n');
		res.end();
	} catch (err) {
		console.error(err);
		if (messageId && chatId) {
			const messageRef = firestore
				.collection('users')
				.doc(uid)
				.collection('chats')
				.doc(chatId)
				.collection('messages')
				.doc(messageId);

			await messageRef.update({
				updatedAt: FieldValue.serverTimestamp(),
				'reply.error': 'Error streaming response',
			});
		}

		res.status(500).json({ error: 'Error streaming response' });
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

	const user = await isAuthenticated(req.headers);

	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	if (!validateBody(imageGenerationSchema, req.body)) {
		res.status(400).json({ error: 'Invalid body' });
		return;
	}

	const { uid } = user;
	let chatId: string | undefined = undefined;
	let messageId: string | undefined = undefined;

	try {
		chatId = req.body.chatId ?? '';
		const userRef = firestore.collection('users').doc(uid);

		if (!chatId) {
			const chatRef = userRef.collection('chats').doc();
			await chatRef.set(
				{
					id: chatRef.id,
					createdAt: FieldValue.serverTimestamp(),
					updatedAt: FieldValue.serverTimestamp(),
					prompt: req.body.text,
				},
				{ merge: true },
			);
			chatId = chatRef.id;
		}

		const chatRef = userRef.collection('chats').doc(chatId);
		const messagesRef = chatRef.collection('messages');
		const messagesDoc = await messagesRef.orderBy('createdAt', 'asc').get();
		const messagesData =
			messagesDoc.docs
				.filter((doc) => doc.exists)
				.map((doc) => doc.data() as ChatMessage) ?? [];

		newMessageRef = messagesRef.doc();
		messageId = newMessageRef.id;
		await newMessageRef.set({
			id: newMessageRef.id,
			path: [...messagesData.map((message) => message.id), newMessageRef.id],
			createdAt: FieldValue.serverTimestamp(),
			prompt: req.body.text,
			ai: {
				model: req.body.model,
				provider: req.body.provider,
			},
			reply: {
				id: newMessageRef.id,
				createdAt: FieldValue.serverTimestamp(),
				image: '',
			},
		});

		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		const { image, extension, mimeType } = await imageGeneration({
			...req.body,
			chatId,
		});

		const bucket = storage.bucket();
		const file = bucket.file(`${uid}/${newMessageRef.id}.${extension}`);
		await file.save(image, {
			metadata: {
				contentType: mimeType,
			},
			public: true,
		});

		await newMessageRef.update({
			updatedAt: FieldValue.serverTimestamp(),
			'reply.image': file.publicUrl(),
		});

		res.status(200);
	} catch (err) {
		console.error(err);

		if (messageId && chatId) {
			const messageRef = firestore
				.collection('users')
				.doc(uid)
				.collection('chats')
				.doc(chatId)
				.collection('messages')
				.doc(messageId);

			await messageRef.update({
				updatedAt: FieldValue.serverTimestamp(),
				'reply.error': 'Error generating image',
			});
		}

		res.status(500).json({ error: 'Error generating image' });
	}
});

export const chatDelete = onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (req.method === 'OPTIONS') {
		res.status(204).send('');
		return;
	}

	const user = await isAuthenticated(req.headers);

	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	const { uid } = user;

	if (!validateBody(z.object({ chatId: z.string() }), req.body)) {
		res.status(400).json({ error: 'Invalid body' });
		return;
	}

	const chatRef = firestore
		.collection('users')
		.doc(uid)
		.collection('chats')
		.doc(req.body.chatId);
	await chatRef.delete();

	res.status(200).json({ message: 'Chat deleted' });
});

export const chatShare = onRequest(async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (req.method === 'OPTIONS') {
		res.status(204).send('');
		return;
	}

	const user = await isAuthenticated(req.headers);

	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	const { uid } = user;

	if (
		!validateBody(
			z.object({ chatId: z.string(), shouldShare: z.boolean() }),
			req.body,
		)
	) {
		res.status(400).json({ error: 'Invalid body' });
		return;
	}

	const chatRef = firestore
		.collection('users')
		.doc(uid)
		.collection('chats')
		.doc(req.body.chatId);
	const chatData = await chatRef.get();

	if (!chatData.exists) {
		res.status(404).json({ error: 'Chat not found' });
		return;
	}

	await chatRef.update({
		public: req.body.shouldShare,
	});

	res.status(200).json({ message: 'Chat shared' });
});

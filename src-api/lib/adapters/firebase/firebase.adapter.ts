import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
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
		let messageHistory: ChatMessage[] = [];
		const batch = firestore.batch();

		const chatRef = chatId
			? userRef.collection('chats').doc(chatId)
			: userRef.collection('chats').doc();
		const messagesRef = chatRef.collection('messages');
		const newMessageRef = messagesRef.doc();

		if (!chatId) {
			batch.set(chatRef, {
				id: chatRef.id,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp(),
				prompt: req.body.text,
			});
			chatId = chatRef.id;
		}

		if (req.body.previousMessage) {
			const messagesDoc = await messagesRef
				.where('path', 'array-contains', req.body.previousMessage.id)
				.where(
					'createdAt',
					'<=',
					Timestamp.fromDate(new Date(req.body.previousMessage.timestamp)),
				)
				.orderBy('createdAt', 'asc')
				.get();
			messageHistory =
				messagesDoc.docs
					.filter((doc) => doc.exists)
					.map((doc) => doc.data() as ChatMessage) ?? [];
			if (!req.body.previousMessage.path) {
				messageHistory.forEach((message) => {
					batch.update(messagesRef.doc(message.id), {
						path: [...(message.path ?? []), newMessageRef.id],
					});
				});

				batch.update(chatRef, {
					branches: {
						[req.body.previousMessage.id]: FieldValue.arrayUnion({
							id: newMessageRef.id,
							prompt: req.body.text.slice(0, 25),
						}),
					},
				});
			}
		}

		const newMessagePath = !req.body.previousMessage?.path
			? [newMessageRef.id]
			: (messageHistory.at(-1)?.path ?? [newMessageRef.id]);

		batch.update(chatRef, {
			lastMessageId: newMessagePath.at(-1),
		});

		messageId = newMessageRef.id;
		batch.set(newMessageRef, {
			id: newMessageRef.id,
			path: newMessagePath,
			createdAt: FieldValue.serverTimestamp(),
			prompt: req.body.text,
			ai: {
				model: req.body.model,
				provider: req.body.provider,
			},
		});

		const batchPromise = batch.commit();

		const messages = messageHistory
			.slice(-5)
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

		res.write(
			`data: ${JSON.stringify({ path: newMessagePath, messageId, chatId })}\n\n`,
		);

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
					await batchPromise;
					await newMessageRef.update({
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
					await batchPromise;
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
		let messageHistory: ChatMessage[] = [];
		const batch = firestore.batch();

		const chatRef = chatId
			? userRef.collection('chats').doc(chatId)
			: userRef.collection('chats').doc();
		const messagesRef = chatRef.collection('messages');
		const newMessageRef = messagesRef.doc();

		if (!chatId) {
			batch.set(chatRef, {
				id: chatRef.id,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp(),
				prompt: req.body.text,
				lastMessageId: newMessageRef.id,
			});
			chatId = chatRef.id;
		}

		if (req.body.previousMessage) {
			const messagesDoc = await messagesRef
				.where('path', 'array-contains', req.body.previousMessage.id)
				.where(
					'createdAt',
					'<=',
					Timestamp.fromDate(new Date(req.body.previousMessage.timestamp)),
				)
				.orderBy('createdAt', 'asc')
				.get();
			messageHistory =
				messagesDoc.docs
					.filter((doc) => doc.exists)
					.map((doc) => doc.data() as ChatMessage) ?? [];
			if (!req.body.previousMessage.path) {
				messageHistory.forEach((message) => {
					batch.update(messagesRef.doc(message.id), {
						path: [...(message.path ?? []), newMessageRef.id],
					});
				});
			}
		}

		const newMessagePath = [
			...(messageHistory.at(-1)?.path
				? !req.body.previousMessage?.path
					? []
					: messageHistory.at(-1)!.path
				: [newMessageRef.id]),
			...(messageHistory.length && !req.body.previousMessage?.path
				? [newMessageRef.id]
				: []),
		];

		messageId = newMessageRef.id;
		batch.set(newMessageRef, {
			id: newMessageRef.id,
			path: newMessagePath,
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

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		await batch.commit();

		res.write(
			`data: ${JSON.stringify({ path: newMessagePath, messageId, chatId })}\n\n`,
		);

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
			'reply.image': file.publicUrl(),
		});

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

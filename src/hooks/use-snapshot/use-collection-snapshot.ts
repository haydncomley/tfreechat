'use client';

import type { QueryConstraint } from 'firebase/firestore';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useState, useEffect, DependencyList } from 'react';

import { firestore } from '~/utils/firebase.utils';

const listeners = new Map();

export const useCollectionSnapshot = <T>(
	path?: string,
	settings?: {
		filters: QueryConstraint[];
		retainDataBetweenQueries?: boolean;
	},
	deps?: DependencyList,
) => {
	const [data, setData] = useState(() => {
		const entry = listeners.get(path);
		return entry ? entry.data : [];
	});

	useEffect(() => {
		if (!path) return;
		let entry = listeners.get(path);

		if (!entry) {
			const q = query(
				collection(firestore, path),
				...(settings?.filters ?? []),
			);
			const unsub = onSnapshot(q, (snap) => {
				const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				const e = listeners.get(path);
				e.data = docs;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				e.subscribers.forEach((fn: any) => fn(docs));
			});
			entry = { data: [], subscribers: new Set(), unsub };
			listeners.set(path, entry);
		}

		entry.subscribers.add(setData);
		if (!settings?.retainDataBetweenQueries) setData(entry.data);

		return () => {
			entry.subscribers.delete(setData);
			if (entry.subscribers.size === 0) {
				entry.unsub();
				listeners.delete(path);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path, ...(deps || []), settings?.retainDataBetweenQueries]);

	return data as T[];
};

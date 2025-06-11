import type { QueryConstraint } from 'firebase/firestore';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { firestore } from '~/utils/firebase.utils';

const listeners = new Map();

export const useCollectionSnapshot = <T>(
	path?: string,
	...queryConstraints: QueryConstraint[]
) => {
	const [data, setData] = useState(() => {
		const entry = listeners.get(path);
		return entry ? entry.data : [];
	});

	useEffect(() => {
		if (!path) return;
		let entry = listeners.get(path);

		if (!entry) {
			const q = query(collection(firestore, path), ...queryConstraints);
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
		setData(entry.data);

		return () => {
			entry.subscribers.delete(setData);
			if (entry.subscribers.size === 0) {
				entry.unsub();
				listeners.delete(path);
			}
		};
	}, [path, queryConstraints]);

	return data as T[];
};

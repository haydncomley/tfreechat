export const FormatDateSince = (date: Date) => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diff / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays <= 0) {
		if (diffInHours <= 0) {
			if (diffInMinutes <= 0) {
				return 'Just now';
			}
			return `${diffInMinutes} minutes ago`;
		}
		return `${diffInHours} hours ago`;
	}

	if (diffInDays === 1) {
		return 'Yesterday';
	}

	return `${diffInDays} days ago`;
};

export const FormatChatDate = (date: Date) => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diff / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays <= 0) {
		return 'Today';
	}

	if (diffInDays <= 1) {
		return 'Yesterday';
	}

	if (diffInDays <= 7) {
		return 'Last week';
	}

	if (diffInDays <= 28) {
		return 'Last month';
	}

	return date.toLocaleDateString('en-US', { month: 'long' });
};

export const FormatDateSince = (date: Date) => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diff / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays === 0) {
		if (diffInHours === 0) {
			if (diffInMinutes === 0) {
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

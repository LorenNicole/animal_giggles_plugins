window.giggleThisStorage = (function () {

	const CAPTION_LS_KEY = 'ag_giggle_this_submissions';

	function getLocalDayString(date = new Date()) {
		return date.toDateString();
	}

	function cleanupOldEntries(storage) {

		if (!storage || !storage.byImage) {
			return { byImage: {} };
		}

		const today = new Date();

		Object.keys(storage.byImage).forEach(function (imageKey) {

			const entries = Array.isArray(storage.byImage[imageKey])
				? storage.byImage[imageKey]
				: [];

			const cleaned = entries.filter(function (entry) {

				if (!entry || !entry.day) {
					return false;
				}

				const entryDate = new Date(entry.day);
				const diffDays =
					(today - entryDate) / (1000 * 60 * 60 * 24);

				// keep today + yesterday
				return diffDays < 2;
			});

			if (cleaned.length) {
				storage.byImage[imageKey] = cleaned;
			} else {
				delete storage.byImage[imageKey];
			}
		});

		return storage;
	}

	function readStorage() {

		try {

			const raw =
				localStorage.getItem(CAPTION_LS_KEY);

			if (!raw) {
				return { byImage: {} };
			}

			const parsed = JSON.parse(raw);

			if (
				parsed &&
				typeof parsed === 'object' &&
				parsed.byImage
			) {
				return cleanupOldEntries(parsed);
			}

			return { byImage: {} };

		} catch (error) {

			return { byImage: {} };
		}
	}

	function writeStorage(data) {

		try {

			localStorage.setItem(
				CAPTION_LS_KEY,
				JSON.stringify(data)
			);

		} catch (error) {

			console.warn(
				'Could not save caption storage.',
				error
			);
		}
	}

	function canSubmitCaption(imageId) {

		if (!imageId) {
			return false;
		}

		const key = String(imageId);

		const storage = readStorage();

		const entries = Array.isArray(storage.byImage[key])
			? storage.byImage[key]
			: [];

		const today = getLocalDayString();

		return !entries.some(function (entry) {
			return entry.day === today;
		});
	}

	function recordCaptionSubmission(imageId) {

		const key = String(imageId);

		const storage = readStorage();

		if (!Array.isArray(storage.byImage[key])) {
			storage.byImage[key] = [];
		}

		storage.byImage[key].push({
			day: getLocalDayString()
		});

		writeStorage(
			cleanupOldEntries(storage)
		);
	}

	return {
		canSubmitCaption,
		recordCaptionSubmission
	};

})();
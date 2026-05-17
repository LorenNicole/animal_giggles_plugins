(function () {
	function getStarText(buttonElement) {
		const icon = buttonElement.querySelector('.ag-rating-star-icon');

		if (icon && icon.textContent.trim()) {
			return icon.textContent.trim();
		}

		return '★';
	}

	function createLayer() {
		const layer = document.createElement('div');
		layer.className = 'ag-rating-duplicate-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function runRatingDuplicate(buttonElement) {
		if (!buttonElement) {
			return;
		}

		const layer = createLayer();
		const starText = getStarText(buttonElement);

		const colors = [
			'#FFD700',
			'#FF6B6B',
			'#4D96FF',
			'#6BCB77',
			'#C77DFF',
			'#FFB347',
			'#FFFFFF',
			'#FF4FD8'
		];

		const createdStars = [];
		const totalDuration = 5000;
		const funnelDuration = 5000;
		const starCount = 85;
		const intervalDelay = totalDuration / starCount;

		const funnelX = window.innerWidth / 2;
		const funnelY = window.innerHeight / 2;

		let createdCount = 0;

		const intervalId = setInterval(function () {
			if (createdCount >= starCount) {
				clearInterval(intervalId);
				startFunnel();
				return;
			}

			const star = document.createElement('span');
			star.className = 'ag-rating-duplicate-star';
			star.textContent = starText;

			const left = Math.random() * window.innerWidth;
			const top = Math.random() * window.innerHeight;
			const size = 18 + Math.random() * 64;
			const color = colors[Math.floor(Math.random() * colors.length)];

			const startRotate = (Math.random() * 120 - 60) + 'deg';
			const midRotate = (Math.random() * 180 - 90) + 'deg';
			const endRotate = (Math.random() * 240 - 120) + 'deg';

			star.style.setProperty('--ag-duplicate-left', left + 'px');
			star.style.setProperty('--ag-duplicate-top', top + 'px');
			star.style.setProperty('--ag-duplicate-size', size + 'px');
			star.style.setProperty('--ag-duplicate-color', color);
			star.style.setProperty('--ag-duplicate-start-rotate', startRotate);
			star.style.setProperty('--ag-duplicate-mid-rotate', midRotate);
			star.style.setProperty('--ag-duplicate-end-rotate', endRotate);

			star.dataset.left = String(left);
			star.dataset.top = String(top);

			layer.appendChild(star);
			createdStars.push(star);

			createdCount++;
		}, intervalDelay);

		function startFunnel() {
			createdStars.forEach(function (star) {
				const left = Number(star.dataset.left || 0);
				const top = Number(star.dataset.top || 0);

				const deltaX = funnelX - left;
				const deltaY = funnelY - top;

				const spinDirection = Math.random() > 0.5 ? 1 : -1;
				const spinAmount = spinDirection * (720 + Math.random() * 2160);

				star.style.setProperty('--ag-funnel-x', deltaX + 'px');
				star.style.setProperty('--ag-funnel-y', deltaY + 'px');
				star.style.setProperty('--ag-funnel-spin-half', (spinAmount * 0.5) + 'deg');
				star.style.setProperty('--ag-funnel-spin-full', spinAmount + 'deg');

				star.classList.add('is-funneling');
			});

			setTimeout(function () {
				layer.remove();
			}, funnelDuration + 200);
		}
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'rating-duplicate',
		run: runRatingDuplicate
	});
})();
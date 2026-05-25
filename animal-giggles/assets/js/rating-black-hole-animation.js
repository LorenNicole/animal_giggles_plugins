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
		layer.className = 'ag-black-hole-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function runBlackHoleCollapse(buttonElement) {
		if (!buttonElement) {
			return;
		}

		const rect = buttonElement.getBoundingClientRect();

		if (!rect.width || !rect.height) {
			return;
		}

		const layer = createLayer();
		const starText = getStarText(buttonElement);

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const core = document.createElement('div');
		core.className = 'ag-black-hole-core';
		core.style.setProperty('--ag-black-hole-x', centerX + 'px');
		core.style.setProperty('--ag-black-hole-y', centerY + 'px');
		layer.appendChild(core);

		const colors = [
			'#FFD700',
			'#FFFFFF',
			'#FF6B6B',
			'#4D96FF',
			'#C77DFF',
			'#6BCB77',
			'#FFB347'
		];

		const starCount = 120;

		for (let i = 0; i < starCount; i++) {
			const star = document.createElement('span');
			star.className = 'ag-black-hole-star';
			star.textContent = starText;

			const startX = Math.random() * window.innerWidth;
			const startY = Math.random() * window.innerHeight;

			const dx = centerX - startX;
			const dy = centerY - startY;

			const orbitX = (Math.random() * 260 - 130) + 'px';
			const orbitY = (Math.random() * 260 - 130) + 'px';

			const size = 14 + Math.random() * 58;
			const color = colors[Math.floor(Math.random() * colors.length)];
			const duration = 2300 + Math.random() * 2400;
			const delay = Math.random() * 500;

			const spinDirection = Math.random() > 0.5 ? 1 : -1;
			const spin = spinDirection * (720 + Math.random() * 2520);

			star.style.setProperty('--ag-start-x', startX + 'px');
			star.style.setProperty('--ag-start-y', startY + 'px');
			star.style.setProperty('--ag-hole-dx', dx + 'px');
			star.style.setProperty('--ag-hole-dy', dy + 'px');
			star.style.setProperty('--ag-orbit-x', orbitX);
			star.style.setProperty('--ag-orbit-y', orbitY);
			star.style.setProperty('--ag-star-size', size + 'px');
			star.style.setProperty('--ag-star-color', color);
			star.style.setProperty('--ag-collapse-duration', duration + 'ms');
			star.style.setProperty('--ag-collapse-delay', delay + 'ms');
			star.style.setProperty('--ag-spin-half', (spin * 0.45) + 'deg');
			star.style.setProperty('--ag-spin-full', spin + 'deg');
			star.style.setProperty('--ag-spin-final', (spin * 1.35) + 'deg');

			layer.appendChild(star);
		}

		setTimeout(function () {
			layer.remove();
		}, 5600);
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'black-hole-collapse',
		allowMobile: true,
		allowDesktop: true,
		run: runBlackHoleCollapse
	});
})();
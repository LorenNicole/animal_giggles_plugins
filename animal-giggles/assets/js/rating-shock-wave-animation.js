(function () {

	function createLayer() {
		const layer = document.createElement('div');
		layer.className = 'ag-shockwave-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function createRing(layer, centerX, centerY, size, duration, color) {
		const ring = document.createElement('div');

		ring.className = 'ag-shockwave-ring';

		ring.style.left = centerX + 'px';
		ring.style.top = centerY + 'px';

		ring.style.width = size + 'px';
		ring.style.height = size + 'px';

		ring.style.borderColor = color;

		ring.style.setProperty('--ag-ring-duration', duration + 'ms');

		layer.appendChild(ring);
	}

	function createParticles(layer, centerX, centerY) {

		const colors = [
			'#FFD700',
			'#FF6B6B',
			'#4D96FF',
			'#6BCB77',
			'#C77DFF',
			'#FFFFFF'
		];

		const particleCount = 140;
		const maxDistance = Math.hypot(window.innerWidth, window.innerHeight);

		for (let i = 0; i < particleCount; i++) {

			const particle = document.createElement('span');

			particle.className = 'ag-shockwave-particle';

			const angle = Math.random() * Math.PI * 2;

			const distance = maxDistance * (0.25 + Math.random() * 0.85);

			const endX = Math.cos(angle) * distance;
			const endY = Math.sin(angle) * distance;

			const size = 3 + Math.random() * 10;

			let duration;

			const speedRoll = Math.random();

			if (speedRoll < 0.2) {
				duration = 500 + Math.random() * 400;
			} else if (speedRoll < 0.65) {
				duration = 1200 + Math.random() * 900;
			} else {
				duration = 2200 + Math.random() * 1600;
			}

			particle.style.left = centerX + 'px';
			particle.style.top = centerY + 'px';

			particle.style.width = size + 'px';
			particle.style.height = size + 'px';

			particle.style.background =
				colors[Math.floor(Math.random() * colors.length)];

			particle.style.setProperty('--ag-shockwave-x', endX + 'px');
			particle.style.setProperty('--ag-shockwave-y', endY + 'px');

			particle.style.setProperty('--ag-particle-duration', duration + 'ms');

			layer.appendChild(particle);
		}
	}

	function runShockwave(buttonElement) {

		if (!buttonElement) {
			return;
		}

		const rect = buttonElement.getBoundingClientRect();

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const layer = createLayer();

		createRing(layer, centerX, centerY, 120, 700, 'rgba(255,255,255,0.9)');
		createRing(layer, centerX, centerY, 220, 1100, 'rgba(255,215,0,0.8)');
		createRing(layer, centerX, centerY, 340, 1500, 'rgba(77,150,255,0.7)');

		createParticles(layer, centerX, centerY);

		setTimeout(function () {
			layer.remove();
		}, 4200);
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'shockwave',
		run: runShockwave
	});

})();
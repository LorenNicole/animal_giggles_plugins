(function () {

	function createLayer() {
		const layer = document.createElement('div');
		layer.className = 'ag-shockwave-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function createRing(layer, centerX, centerY, index) {
		const ring = document.createElement('div');

		const colors = [
			'rgba(255, 215, 0, 0.95)',
			'rgba(255, 107, 107, 0.9)',
			'rgba(77, 150, 255, 0.9)',
			'rgba(107, 203, 119, 0.9)',
			'rgba(199, 125, 255, 0.9)',
			'rgba(255, 255, 255, 0.9)',
			'rgba(255, 79, 216, 0.9)'
		];

		const viewportDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
		const size = 80 + index * 36;
		const duration = 1800 + index * 95;
		const delay = index * 80;
		const thickness = 2 + Math.random() * 8;
		const glowSize = 8 + Math.random() * 24;
		const endScale = (viewportDiagonal / size) * (1.1 + Math.random() * 0.35);
		const color = colors[index % colors.length];

		ring.className = 'ag-shockwave-ring';

		ring.style.setProperty('--ag-ring-left', centerX + 'px');
		ring.style.setProperty('--ag-ring-top', centerY + 'px');
		ring.style.setProperty('--ag-ring-size', size + 'px');
		ring.style.setProperty('--ag-ring-duration', duration + 'ms');
		ring.style.setProperty('--ag-ring-delay', delay + 'ms');
		ring.style.setProperty('--ag-ring-thickness', thickness + 'px');
		ring.style.setProperty('--ag-ring-glow-size', glowSize + 'px');
		ring.style.setProperty('--ag-ring-color', color);
		ring.style.setProperty('--ag-ring-end-scale', endScale);

		layer.appendChild(ring);
	}

	function runShockwave(buttonElement) {
		if (!buttonElement) {
			return;
		}

		const rect = buttonElement.getBoundingClientRect();

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const layer = createLayer();
		const ringCount = 20;

		for (let i = 0; i < ringCount; i++) {
			createRing(layer, centerX, centerY, i);
		}

		setTimeout(function () {
			layer.remove();
		}, 6200);
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'shockwave',
		allowMobile: true,
		allowDesktop: true,
		run: runShockwave
	});

})();
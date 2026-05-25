(function () {
	function createLayer() {
		const layer = document.createElement('div');
		layer.className = 'ag-animal-stampede-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function runAnimalStampede(buttonElement) {
		const layer = createLayer();

		const animals = [
			'🐶',
			'🐱',
			'🦝',
			'🐿️',
			'🦀',
			'🦆',
			'🐸',
			'🐵',
			'🦄',
			'🐔',
			'🐧',
			'🦙',
			'🐻',
			'🦜',
			'🐢'
		];

		const flippedAnimals = {
			'🦄': true,
			'🐔': true,
			'🦜': true,
			'🦙': true,
            '🐢': true,
            '🦙': true,
            '🐿️': true,
            '🦆': true,
		};

		const totalAnimals = 70;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		for (let i = 0; i < totalAnimals; i++) {
			const animal = document.createElement('div');
			animal.className = 'ag-animal-stampede-animal';

			const selectedAnimal = animals[Math.floor(Math.random() * animals.length)];
			animal.textContent = selectedAnimal;

			const size = 28 + Math.random() * 72;
			const top = Math.random() * viewportHeight;
			const duration = 1800 + Math.random() * 4000;
			const delay = Math.random() * 2200;
			const bounceHeight = 10 + Math.random() * 55;
			const scale = 0.7 + Math.random() * 1.6;
			const rotate = (Math.random() * 28 - 14) + 'deg';
			const runDistance = viewportWidth + 400;
			const direction = flippedAnimals[selectedAnimal] ? -1 : 1;

			animal.style.top = top + 'px';
			animal.style.fontSize = size + 'px';
			animal.style.animationDuration = duration + 'ms';
			animal.style.animationDelay = delay + 'ms';

			animal.style.setProperty('--ag-run-distance', runDistance + 'px');
			animal.style.setProperty('--ag-bounce-height', bounceHeight + 'px');
			animal.style.setProperty('--ag-animal-scale', scale);
			animal.style.setProperty('--ag-rotate-small', rotate);
			animal.style.setProperty('--ag-direction', direction);

			layer.appendChild(animal);
		}

		setTimeout(function () {
			layer.remove();
		}, 7000);
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'animal-stampede',
		allowMobile: true,
		allowDesktop: true,
		run: runAnimalStampede
	});
})();
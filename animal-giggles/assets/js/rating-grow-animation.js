(function () {
	function getStarColor(buttonElement) {

		if (
			buttonElement.classList.contains('is-selected') ||
			buttonElement.classList.contains('is-hovered')
		) {
			return '#FFD700';
		}
	
		const icon = buttonElement.querySelector('.ag-rating-star-icon');
		const target = icon || buttonElement;
		const styles = window.getComputedStyle(target);
	
		const color = styles.color;
	
		if (!color || color === 'rgb(0, 0, 0)' || color === 'rgba(0, 0, 0, 0)') {
			return '#FFD700';
		}
	
		return color;
	}

	function getStarText(buttonElement) {
		const icon = buttonElement.querySelector('.ag-rating-star-icon');

		if (icon && icon.textContent.trim()) {
			return icon.textContent.trim();
		}

		return '★';
	}

	function runRatingGrow(buttonElement) {
		if (!buttonElement) {
			return;
		}

		const rect = buttonElement.getBoundingClientRect();

		if (!rect.width || !rect.height) {
			return;
		}

		const layer = document.createElement('div');
		layer.className = 'ag-rating-grow-layer';

		const star = document.createElement('span');
		star.className = 'ag-rating-grow-star';
		star.textContent = getStarText(buttonElement);

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const startSize = Math.max(rect.width, rect.height, 24);

		star.style.setProperty('--ag-grow-left', centerX + 'px');
		star.style.setProperty('--ag-grow-top', centerY + 'px');
		star.style.setProperty('--ag-grow-start-size', startSize + 'px');
		star.style.setProperty('--ag-grow-color', getStarColor(buttonElement));

		layer.appendChild(star);
		document.body.appendChild(layer);

		setTimeout(function () {
			layer.remove();
		}, 10200);
	}

	window.AnimalGigglesRatingAnimations.register({
		name: 'rating-grow',
		allowMobile: true,
		allowDesktop: true,
		run: runRatingGrow
	});
})();
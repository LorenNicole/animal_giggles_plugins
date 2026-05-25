(function () {
	function createExplosionLayer() {
		const layer = document.createElement('div');
		layer.className = 'ag-rating-explosion-layer';
		document.body.appendChild(layer);
		return layer;
	}

	function getParticleColor(buttonElement) {
		const icon = buttonElement.querySelector('.ag-rating-star-icon');
		const target = icon || buttonElement;
		const styles = window.getComputedStyle(target);

		return styles.color || 'gold';
	}

	function runExplodeAnimation(buttonElement) {
		if (!buttonElement) {
			return;
		}

		const rect = buttonElement.getBoundingClientRect();

		if (!rect.width || !rect.height) {
			return;
		}

		const layer = createExplosionLayer();
		const particleColor = getParticleColor(buttonElement);

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const particleCount = 2220;
		const maxDistance = Math.hypot(window.innerWidth, window.innerHeight) * 1.4;

		const colors = [
            '#FFD700',
            '#FF6B6B',
            '#4D96FF',
            '#6BCB77',
            '#FFB347',
            '#C77DFF',
            '#FFFFFF'
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.className = 'ag-rating-explosion-particle';
        
            const startX = rect.left + Math.random() * rect.width;
            const startY = rect.top + Math.random() * rect.height;
        
            const angle =
                Math.atan2(startY - centerY, startX - centerX) +
                ((Math.random() - 0.5) * 1.8);
        
            const distance = maxDistance * (0.65 + Math.random() * 0.75);
        
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
        
            const size = 2 + Math.random() * 10;
            const duration = 15000 + Math.random() * 1800;          
            
            const delay = Math.random() * 90;
            const spinDegrees = Math.random() > 0.35
                ? (Math.random() * 1440 - 720)
                : 0;
        
            const color = colors[Math.floor(Math.random() * colors.length)];
        
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = color;
            particle.style.animationDuration = duration + 'ms';
            particle.style.animationDelay = delay + 'ms';
        
            particle.style.setProperty('--ag-explode-x', endX + 'px');
            particle.style.setProperty('--ag-explode-y', endY + 'px');
            particle.style.setProperty('--ag-explode-rotate', spinDegrees + 'deg');
        
            layer.appendChild(particle);
        }

		setTimeout(function () {
			layer.remove();
		}, 3000);
	}

	window.AnimalGigglesRatingAnimations = window.AnimalGigglesRatingAnimations || {
		animations: [],
		register: function (animation) {
			this.animations.push(animation);
		}
	};

	window.AnimalGigglesRatingAnimations.register({
		name: 'explode',
        allowMobile: true,
        allowDesktop: true,
		run: runExplodeAnimation
	});
})();

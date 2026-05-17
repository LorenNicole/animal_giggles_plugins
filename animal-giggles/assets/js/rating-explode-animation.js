/*const button =
    document.getElementById('explodeBtn');

button.addEventListener(
    'click',
    explodeButton
);

function explodeButton() {

    const rect =
        button.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    const particleCount = 1200;

    const colors = [
        '#ffffff',
        '#3b82f6',
        '#60a5fa',
        '#8b5cf6',
        '#c084fc',
        '#ec4899',
        '#f472b6',
        '#22d3ee',
        '#facc15'
    ];

    button.style.visibility = 'hidden';

    for (let i = 0; i < particleCount; i++) {

        createParticle(
            rect,
            centerX,
            centerY,
            colors
        );
    }

    //button.style.visibility = 'visible';
}

function createParticle(
    rect,
    centerX,
    centerY,
    colors
) {

    const particle =
        document.createElement('div');

    particle.className = 'particle';

    // RANDOM START POSITION
    const startX =
        rect.left +
        Math.random() * rect.width;

    const startY =
        rect.top +
        Math.random() * rect.height;

    particle.style.left =
        startX + 'px';

    particle.style.top =
        startY + 'px';

    // RANDOM SIZE
    const size =
        Math.random() * 10 + 2;

    particle.style.width =
        size + 'px';

    particle.style.height =
        size + 'px';

    // RANDOM COLORS
    particle.style.background =
        colors[
        Math.floor(
            Math.random() * colors.length
        )
        ];

    // RANDOM SHAPES
    particle.style.borderRadius =
        Math.random() > 0.7
            ? '50%'
            : '2px';

    // OPTIONAL GLOW
    if (Math.random() > 0.7) {

        particle.style.boxShadow =
            `0 0 ${size * 2}px currentColor`;
    }

    document.body.appendChild(
        particle
    );

    // RANDOM TRAJECTORY
    const angle =
        Math.random() * Math.PI * 2;

    // DIFFERENT DISTANCES
    const distance =
        Math.random() *
        window.innerWidth * 1.8 +
        150;

    const destinationX =
        Math.cos(angle) * distance;

    const destinationY =
        Math.sin(angle) * distance;

    // DIFFERENT SPEEDS
    //const duration =
    //    Math.random() * 2500 + 600;
    const duration =
        Math.random() * 5000 + 2000

    // RANDOM ROTATION
    const rotation =
        (Math.random() - 0.5) *
        3000;

    // RANDOM CURVE
    const curveX =
        (Math.random() - 0.5) * 600;

    const curveY =
        (Math.random() - 0.5) * 600;

    // RANDOM SCALE
    const endScale =
        Math.random() * 0.5;

    particle.animate(
        [

            {
                transform:
                    `
                    translate(0px,0px)
                    rotate(0deg)
                    scale(1)
                    `,
                opacity: 1
            },

            {
                transform:
                    `
                    translate(
                        ${curveX}px,
                        ${curveY}px
                    )
                    rotate(${rotation * 0.3}deg)
                    scale(1.3)
                    `,
                opacity: 1,
                offset: 0.35
            },

            {
                transform:
                    `
                    translate(
                        ${destinationX}px,
                        ${destinationY}px
                    )
                    rotate(${rotation}deg)
                    scale(${endScale})
                    `,
                opacity: 0
            }
        ],

        {
            duration: duration,

            easing:
                'cubic-bezier(.12,.74,.11,1)',

            fill: 'forwards'
        }
    );

    // CLEANUP
    setTimeout(() => {

        particle.remove();

    }, duration + 100);
}*/

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
		run: runExplodeAnimation
	});
})();

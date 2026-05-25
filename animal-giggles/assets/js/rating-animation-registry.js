
	/*
		Set to:
		- null = random
		- 'explode'
		- 'shockwave'
		- 'rating-grow'
		- 'rating-duplicate'
		- 'animal-stampede'
		- 'black-hole-collapse'
	*/



(function () {
	const animations = [];
	const forcedAnimationName = null;

	window.AnimalGigglesDevice = {
		isPhone: window.matchMedia('(max-width: 767px)').matches,
		type: window.matchMedia('(max-width: 767px)').matches
			? 'phone'
			: 'larger'
	};

	window.addEventListener('resize', function () {
		window.AnimalGigglesDevice.isPhone =
			window.matchMedia('(max-width: 767px)').matches;

		window.AnimalGigglesDevice.type =
			window.AnimalGigglesDevice.isPhone ? 'phone' : 'larger';
	});

	window.AnimalGigglesRatingAnimations = {
		register: function (animation) {
			animations.push(animation);
		},

		getAllowedAnimations: function () {
			const isPhone = window.AnimalGigglesDevice.isPhone;

			return animations.filter(function (animation) {
				if (isPhone) {
					return animation.allowMobile === true;
				}

				return animation.allowDesktop === true;
			});
		},

		runRandom: function (buttonElement) {
			const allowedAnimations = this.getAllowedAnimations();

			if (!allowedAnimations.length) {
				return;
			}

			if (forcedAnimationName) {

				const forcedAnimation = allowedAnimations.find(
					function (animation) {
						return animation.name === forcedAnimationName;
					}
				);
			
				if (forcedAnimation) {
					forcedAnimation.run(buttonElement);
					return;
				}
			}
			
			const randomIndex = Math.floor(
				Math.random() * allowedAnimations.length
			);
			
			allowedAnimations[randomIndex].run(buttonElement);
		}
	};
})();

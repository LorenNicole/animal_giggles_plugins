window.AnimalGigglesRatingAnimations = window.AnimalGigglesRatingAnimations || {
	animations: [],

	register: function (animation) {
		if (!animation || typeof animation.run !== 'function') {
			return;
		}

		this.animations.push(animation);
	},

	getRandom: function () {
		if (!this.animations.length) {
			return null;
		}

		return this.animations[Math.floor(Math.random() * this.animations.length)];
	},

	runRandom: function (buttonElement) {
		const animation = this.getRandom();

		if (!animation) {
			return;
		}

		animation.run(buttonElement);
	}
};
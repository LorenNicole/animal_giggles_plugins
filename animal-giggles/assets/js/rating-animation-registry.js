window.AnimalGigglesRatingAnimations = window.AnimalGigglesRatingAnimations || {
	animations: [],

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
	forcedAnimation: null,

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

		return this.animations[
			Math.floor(Math.random() * this.animations.length)
		];
	},

	getByName: function (name) {
		return this.animations.find(function (animation) {
			return animation.name === name;
		}) || null;
	},

	runRandom: function (buttonElement) {

		let animation = null;

		if (this.forcedAnimation) {
			animation = this.getByName(this.forcedAnimation);
		}

		if (!animation) {
			animation = this.getRandom();
		}

		if (!animation) {
			return;
		}

		animation.run(buttonElement);
	}
};

/*window.AnimalGigglesRatingAnimations = window.AnimalGigglesRatingAnimations || {
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
};*/
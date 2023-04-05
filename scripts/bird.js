class Bird {
	constructor(brain) {
		// position
		this.x = 200;
		this.y = height / 2;
		// size of bird
		this.r = 12; // radius

		this.brain = brain;
		this.brain.score = 0;
		this.birdImage = new Image();
		this.birdImage.src = "img/bird.png";

		// physics
		this.gravity = 0.8;
		this.lift = -12;
		this.velocity = 0;
		// score is how many frames it's been alive
		this.score = 0;
	}

	draw() {
		ctx.drawImage(this.birdImage, this.x, this.y, this.r * 2, this.r * 2);
	}

	// jump or not jump!
	act(pipes) {
		let inputs = [0, 0, 0, 0, 0];
		if (Array.isArray(pipes) && pipes.length) {
			const closest = pipes[0]; // closest pipe is always first

			inputs[0] = map(closest.x, this.x, width, 0, 1); // x position of closest pipe
			inputs[1] = map(closest.top, 0, height, 0, 1); // top of closest pipe opening
			inputs[2] = map(closest.bottom, 0, height, 0, 1); // bottom of closest pipe opening
			inputs[3] = map(this.y, 0, height, 0, 1); // bird's y position
			inputs[4] = map(this.velocity, -5, 5, 0, 1); // bird's y velocity
		}

		let action = this.brain.activate(inputs); // Get the outputs from the network
		if (action[1] > action[0]) this.jump();
	}

	jump() {
		this.velocity += this.lift;
	}

	// bird dies when hits edges of screen
	offscreen() {
		this.y > height || this.y < 0;
	}

	// update velocity, gravity, etc.
	update() {
		this.velocity += this.gravity;
		this.y += this.velocity;
		this.brain.score++; // increase brain's score for each frame
	}
}

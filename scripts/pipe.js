class Pipe {
	constructor() {
		const clearing = 150; // How big is the empty space
		let clearing_midpoint = random(clearing, height - clearing);

		this.top_img = new Image();
		this.top_img.src = "img/pipe_top.png";

		this.bottom_img = new Image();
		this.bottom_img.src = "img/pipe_bottom.png";

		// top and bottom of pipe
		this.top = clearing_midpoint - clearing / 2;
		this.bottom = height - (clearing_midpoint + clearing / 2);

		this.x = width; // starts at the right edge of the screen
		this.width = 80; // width of pipe
		// how fast
		this.speed = 6;
	}

	// pipe hit a bird?
	hits(bird) {
		if (bird.y - bird.r < this.top || bird.y + bird.r > height - this.bottom) {
			if (bird.x > this.x && bird.x < this.x + this.width) {
				return true;
			}
		}
		return false;
	}

	// draw the pipe
	show() {
		ctx.drawImage(this.top_img, this.x, 0, this.width, this.top); // Depends on ctx, which is declared outside this scope
		ctx.drawImage(this.bottom_img, this.x, height - this.bottom, this.width, this.bottom);
	}

	// update the pipe
	update() {
		this.x -= this.speed;
	}

	// has it moved offscreen?
	isVisible() {
		return this.x > -this.width;
	}
}

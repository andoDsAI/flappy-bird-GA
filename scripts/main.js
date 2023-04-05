let { Neat, Network, architect, methods } = carrot;

// helper functions
let max = function (array, parameter) {
	let max = null;
	for (let i = 0; i < array.length; i++) {
		const current = array[i].brain[parameter];
		if (current > max) {
			max = current;
			best = array[i];
		}
	}
	return best;
};

// drawing elements
var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

bg = new Image();
bg.src = "img/background.png";

// interface elements
let speedSlider;
let speedSpan;

// bindings
let bindings = {
	population_size: 200,
	mutation_rate: 0.9,
	mutation_amount: 2,
	elitism: 5,
	pipe_spacing: 75, // How often to add a pipe to the game
	champion: { brain: { score: -Infinity } }, // best score
	average: 0,
};

const neat = new Neat(5, 2, {
	population_size: bindings.population_size,
	elitism: bindings.elitism,
	mutation_rate: bindings.mutation_rate,
	mutation_amount: bindings.mutation_amount,
	mutation: methods.mutation.FFW,
	equal: false,
});

neat.generation = 1;
const populate = (population) => population.map((brain) => new Bird(brain));

// internal variables
let activeBirds = [];
let dead = []; // All dead birds in a population
let pipes = [];
let counter = 0; // A frame counter to determine when to add a pipe
const scoreHistory = []; // per generation history of total & average score

// create an environment for the background of the game
function setup() {
	let canvas = createCanvas(900, 512);
	canvas.parent("canvas");
	// access the interface elements
	speedSlider = select("#speedSlider");
	speedSpan = select("#speed");
	activeBirds = populate(neat.population);
}

async function draw() {
	ctx.drawImage(bg, 0, 0, width, height);

	// should we speed up cycles per frame
	let cycles = speedSlider.value();
	speedSpan.html(cycles);

	// how many times to advance the game
	for (let n = 0; n < cycles && activeBirds && activeBirds.length; n++) {
		pipes = pipes.filter((pipe) => {
			pipe.update();
			return pipe.isVisible();
		});

		activeBirds = activeBirds.filter((bird) => {
			bird.act(pipes);
			bird.update();

			if (pipes.length && (pipes[0].hits(bird) || bird.offscreen())) {
				dead.push(bird.brain);
				return false;
			}

			return true;
		});

		// add a new pipe every so often
		if (counter % bindings.pipe_spacing == 0) pipes.push(new Pipe());
		counter++;
	}

	// update best bird
	const best = max(activeBirds, "score");
	if (best.brain.score > bindings.champion.brain.score) {
		bindings.champion = best;
		console.log(
			bindings.champion.brain.activate([
				Math.random(),
				Math.random(),
				Math.random(),
				Math.random(),
				Math.random(),
			])
		);
	}

	// draw pipes
	for (let i = 0; i < pipes.length; i++) pipes[i].show();

	// draw birds
	for (let i = 0; i < activeBirds.length; i++) activeBirds[i].draw();

	// if we're out of birds go to the next generation
	if (activeBirds.length == 0) {
		// calculate generation performance
		const total = neat.population.reduce((sum, brain) => sum + brain.score, 0);
		const average = total / neat.population.length;
		scoreHistory.push({ generation: neat.generation, average, total });

		bindings.average = average;

		neat.population = dead;
		// check for population resize
		if (bindings.population_size !== neat.population.length) {
			neat.population = neat.resize(bindings.population_size).map(function (genome) {
				genome.score = genome.score ? genome.score : 0; // add scores for the new population members
				return genome;
			});
		}
		neat.elitism = Number(bindings.elitism); // Avoid implicit type coercion, adjust elitism before evolve
		activeBirds = populate(await neat.evolve());

		// reset
		dead = [];
		pipes = [];
		counter = 0;
	}

	this.ctx.fillStyle = "white";
	this.ctx.font = "20px Oswald, sans-serif";

	this.ctx.fillText("Generation: " + neat.generation, 10, 25);
	this.ctx.fillText("Population: " + activeBirds.length + "/" + bindings.population_size, 10, 50);
	this.ctx.fillText("High Score: " + bindings.champion.brain.score, 10, 75);
}

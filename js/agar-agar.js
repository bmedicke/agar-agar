var log = function() {
    console.log.apply(console, arguments);
};

var canvas,
    context,
    game;

function initialize() {
    
    canvas = document.getElementById("canvas");
    
    // canvas.width = window.innerWidth - 20;
    // canvas.height = window.innerHeight - 20;
    
    canvas.width = 800;
    canvas.height = 600;
    
    context = canvas.getContext("experimental-webgl");
	
	context.setupDefaultShader();
    
    context.viewport(0, 0, 800, 600);
    
    //context.translate(.1, 0);
    context.drawRect(0, 0, .1, .1);
    
    context.pushMatrix();
        context.rotate(Math.PI / 4);
        context.drawRect(-0.3, 0.3, .5, .7);
    context.popMatrix();
    
    // game = new Game();
    
};

function run() {
    requestAnimationFrame(run, canvas);
    
    // game.update();
    // game.draw(context);
};

window.onload = function() {   
     
    initialize();
    // run();

};

/* agar-agar inheritance test */

var Particle = function(size) {
    this.size = size;
};

Particle.prototype.draw = function() {
    log("particle");
};

Particle.prototype.muh = function() {
    log(this.size);
};

var Obstacle = function(size, speed) {
    
    Particle.call(this, size);
    
    this.speed = speed;

};

Obstacle.prototype = new Particle;

Obstacle.prototype.draw = function() {
    
    Particle.prototype.draw.call(this);
    
    log("obstacle");
};

var particle = new Particle(5);
var obstacle = new Obstacle(3, 7);
var obstacle2 = new Obstacle(4, 8);


var log = function() {
    console.log.apply(console, arguments);
};

var canvas,
    context,
    game;

function initialize() {
    
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    
    context = canvas.getContext("experimental-webgl");
    
    // game = new Game();
    
};

function run() {
    requestAnimationFrame(run, canvas);
    
    // game.update();
    // game.draw(context);
};

window.onload = function() {   
     
    initialize();
    run();

};

/* agar-agar inheritance test */

var Particle = function(size) {
    log(1);
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


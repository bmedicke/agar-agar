var log = function() {
    console.log.apply(console, arguments);
};

var canvas,
    gl,
    game;

function initialize() {
    
    canvas = document.getElementById("canvas");
    
    // canvas.width = window.innerWidth - 20;
    // canvas.height = window.innerHeight - 20;
    
    canvas.width = 800;
    canvas.height = 600;
    
    gl = canvas.getContext("experimental-webgl");
	
	gl.setupDefaultShader();
    
    gl.viewport(0, 0, 800, 600);
	
	gl.enableAlpha();
    
    //gl.translate(.1, 0);
	gl.fill();
	gl.setColor(1, 0, 0, .8);
    gl.drawRect(0, 0, .3, .5);
	gl.noFill();
	
	gl.setColor(0, 0, 1, 0.5);
	gl.drawRect(-0.3, 0.3, .5, .5);
	
	gl.setColor(0, 0, 0, 1);
	gl.drawLine(-1, 1, 1, -1);
	
	gl.setColor(0, 1, 0, .2);
	gl.drawLine(-.5, -.5, .5, .5);
    
    gl.pushMatrix();
    
        gl.rotate(Math.PI / 4);
        gl.setColor(0, 0, 1, 0.5);
    	gl.drawRect(-0.3, 0.3, .5, .5);
        
    gl.popMatrix();
    
	gl.noFill();
	gl.setColor(0, 1, 0, 1);
	gl.drawCircle(0, 0, .1);
	gl.noFill();
	
	gl.disableAlpha();
	
    // game = new Game();
    
};

function run() {
    requestAnimationFrame(run, canvas);
    
    // game.update();
    // game.draw(gl);
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


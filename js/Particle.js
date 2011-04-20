var Particle = function(position) {

	Entity.call(this, position);
	
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

Particle.prototype.mass = 500000;
Particle.prototype.radius = 0.3;

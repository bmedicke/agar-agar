var Particle = function(position) {

	Entity.call(this, position);
	
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

Particle.prototype.mass = 500000;
Particle.prototype.entityRadius = 0.1;
Particle.prototype.separationRadius = 0.3;

Particle.prototype.draw = function(gl) {

    Entity.prototype.draw.call(this, gl);

    gl.setColor(0, 1, 0, 1);
    gl.noFill();
    gl.drawCircle(this.position.x, this.position.y, this.separationRadius);

};

var Particle = function(position) {

	Entity.call(this, position);
	
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

Particle.prototype.mass = 500000;
Particle.prototype.entityRadius = 0.1;
Particle.prototype.separationRadius = 0.3;
Particle.prototype.cohesionRadius = 2;

Particle.prototype.draw = function(gl) {

    Entity.prototype.draw.call(this, gl);
    
    // gl.noFill();

    // gl.setColor(0, 1, 0, 1);    
    // gl.drawCircle(this.position.x, this.position.y, this.separationRadius);
    
    // gl.setColor(0, 0, 1, 1);
    // gl.drawCircle(this.position.x, this.position.y, this.cohesionRadius);

};

Particle.prototype.boundaryCheck = function(vectorfield) {
    
    if (this.position.x <= .1) {
        
        this.applyForce(new Vector(1, 0, 0));
        
    } else if (this.position.x >= vectorfield.cols - .1) {
        
        this.applyForce(new Vector(-1, 0, 0));
        
    } else if (this.position.y <= .1) {
        
        this.applyForce(new Vector(0, 1, 0));
        
    } else if (this.position.y >= vectorfield.rows - .1) {
        
        this.applyForce(new Vector(0, -1, 0));
        
    }
    
};

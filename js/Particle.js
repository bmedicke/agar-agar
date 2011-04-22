var Particle = function(position) {

    Entity.call(this, position);
    
    this.reproductionPotency = false;
    Particle.prototype.count++;

    this.resetReproduction(500 * (Particle.prototype.count % 20));
    
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

Particle.prototype.mass = 100000;
Particle.prototype.entityRadius = 0.15;
Particle.prototype.separationRadius = 0.3;
Particle.prototype.cohesionRadius = 2;

Particle.prototype.reproductionRadius = .5;
Particle.prototype.reproductionWaitTime = 10000;
Particle.prototype.reproductionVelocity = 0.001

Particle.prototype.count = 0;
Particle.prototype.maxCount = 100;

Particle.prototype.cohesionRadius = 2;

Particle.prototype.draw = function(gl) {

    Entity.prototype.draw.call(this, gl);
    
    // if (this.reproductionPotency) {
    //     
    //     gl.noFill();
    //     gl.drawCircle(this.position.x, this.position.y, this.reproductionRadius);
    //     gl.fill();
    //     
    // }
    
    // gl.setColor(0, 0, 1, 1);
    // gl.drawCircle(this.position.x, this.position.y, this.cohesionRadius);

};

Particle.prototype.resetReproduction = function(time) {
    
    time = time || this.reproductionWaitTime;
    this.reproductionPotency = false;
    
    var self = this;
    
    setTimeout(function() {
        
        self.reproductionPotency = true;
        
    }, time);
    
};

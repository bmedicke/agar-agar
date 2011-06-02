var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
	
	this.spikyfied = false;
	this.puke = false;
	
	this.infectionTimer = 0;
	this.spikyTimer = 0;
	this.pukeTimer = 0;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 30;

Cytoplast.prototype.infectionTime = 3000;
Cytoplast.prototype.spikyTime = 2000;
Cytoplast.prototype.pukeTime = 1000;

Cytoplast.prototype.update = function(dt) {

	this.infectionTimer = this.infectionTimer - dt <= 0 ? 0 : this.infectionTimer - dt;
	
	this.pukeTimer = this.pukeTimer - dt <= 0 ? 0 : this.pukeTimer - dt;

	switch(this.spikyfied) {
	
		case true:
			this.spikyTimer -= dt;
			
			if(this.spikyTimer <= 0) {
			
				this.spikyfied = false;
				this.dockedParticles = [];
			
			}
			
			break;
		
		case false:
			if(this.isFull()) {
			
				this.spikyfied = true;
						
				this.spikyTimer = Cytoplast.prototype.spikyTime;
			
			} else if(this.infectionTimer <= 0 && this.dockedParticles.length > 0
					  && this.pukeTimer <= 0) {
	
				// note: setting the variable false again is done in controller
				this.puke = true;
				this.pukeTimer = Cytoplast.prototype.pukeTime;
			
			}
			
			break;
	
	}
	
	if(this.pukeTimer > 0) {

		this.force.set(0, 0, 0);

	}
	
	var positionChange = Entity.prototype.update.call(this, dt);
	
	for (var i = 0; i < this.dockedParticles.length; i++) {
		
		this.dockedParticles[i].position.addSelf(positionChange);
	
	}
	
};

Cytoplast.prototype.draw = function(gl) {
    
    gl.fill();
    gl.enableAlpha();
    
    if(!this.spikyfied) {

		gl.setColor(0.9, 1.0, .9, Math.sqrt(this.dockedParticles.length / this.maxFill));
		Entity.prototype.draw.call(this, gl);

	} else {
	
		// TODO: implement proper spiky drawing
		gl.setColor(1.0, 0.0, 0.0, .7);
		Entity.prototype.draw.call(this, gl);
	
	}
    
    
    gl.disableAlpha();
    gl.noFill();
    
    
    gl.setColor(.7, .7, .5, 1);
    Entity.prototype.draw.call(this, gl);
    
    Particle.drawEnqueue(this.dockedParticles);

};

Cytoplast.prototype.isFull = function() {

    return (this.dockedParticles.length >= this.maxFill);

};

Cytoplast.prototype.dockParticle = function(particlePosition) {

	if(this.dockedParticles.length == 0) {
	
		this.infectionTimer = Cytoplast.prototype.infectionTime;
	
	}
    
    var particle = new Particle(particlePosition.getCopy()),
        target = new Vector(1, 0, 0);
    
    target.rotate2DSelf(Math.random() * Math.PI * 2);
    target.mulSelf(Math.random() * (this.entityRadius - 2 * particle.entityRadius));
    target.addSelf(this.position);
    
    Animator.animate(
        particle.position, 
        {"x" : target.x, "y" : target.y}, 
        target.sub(particlePosition).norm() * Cytoplast.prototype.infectionTime
    );
    
    Animator.animate(
        particle.position, 
        {"z" : 0.3}, 
        Cytoplast.prototype.infectionTime
    );
    
    this.dockedParticles.push(particle);
    
    delete target;
    
};

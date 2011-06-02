var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
	
	this.spikeState = false;
	this.puke = false;
	this.puking = false;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.spikeMass = 80000;

Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 30;

Cytoplast.prototype.infectionTime = 3000;
Cytoplast.prototype.spikeTime = 5000;
Cytoplast.prototype.pukeTime = 1000;

Cytoplast.prototype.update = function(dt) {

	if(this.puking) {

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
    
    if(!this.spikeState) {

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

Cytoplast.prototype.checkPuke = function() {

	if(!this.spikeState) {
	
		this.puke = true;
		this.puking = true;
		
		Animator.animate(
			this,
			0,
			Cytoplast.prototype.pukeTime,
			function() {
				this.puking = false;
			}
		);
		
	}

}

Cytoplast.prototype.spikify = function() {

	this.spikeState = true;
	this.mass = Cytoplast.prototype.spikeMass;
	
	Animator.animate(
		this,
		0,
		Cytoplast.prototype.spikeTime,
		function() {
			this.deSpikify();
		}
	);

}

Cytoplast.prototype.deSpikify = function() {
	
	this.spikeState = false;
	this.mass = Cytoplast.prototype.mass;
	this.dockedParticles = [];
	
}

Cytoplast.prototype.dockParticle = function(particlePosition) {

	if(this.dockedParticles.length == 0) {
		
		Animator.animate(
			this,
			0,
			Cytoplast.prototype.infectionTime,
			Cytoplast.prototype.checkPuke
		);
	
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
	
	if(this.isFull()) {
	
		this.spikify();
		
	}
    
    delete target;
    
};

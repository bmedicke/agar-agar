var Cytoplast = function(position) {

    Entity.call(this, position);
	
	this.fsm = new StateMachine( this );
	
	this.initialize();
	
	this.gutParticles = [];
	
	this.createGutParticles();

};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

extend( Cytoplast.prototype, {

	mass : 300000,
	
    moveSpeed : 0.3,

    entityRadius : 2,
	
	gutParticleCount : 30,
	
	separationRadius : 0.5,
	
	cohesionRadius : 2,
	
	particleSpeed : 0.05,
	
	pushForce : 10,
	
	maxFill : 15,
	
    initialize : function() {

        this.fsm.init([
            { name : 'healthy', draw : this.drawHealthy, update : function(fsm) { console.log("update healthy"); } },
            { name : 'incubated',   draw : this.drawIncubated,   exit : function(fsm) { console.log("exit incubated"); } },
            { name : 'contaminated',  draw : this.drawContaminated,  enter : function(fsm) { console.log("enter contaminated"); } }
        ],[
            { name : "attack", from : 'healthy', to: 'incubated' },
            { name : "outbreak", from : 'incubated', to: 'contaminated' },
            { name : "cure", from : '*', to: 'healthy' }
        ]);
        
        this.fsm.changeState( 'healthy' );
        
    },
    
    update : function(dt) {
        
		var positionChange = Entity.prototype.update.call(this, dt);
		
		this.updateGutParticles(dt, positionChange);
		
        this.fsm.update(dt);
        
    },
    
    draw : function(gl) {
	
		Particle.drawEnqueue(this.gutParticles);
        
		gl.bindShader(gl.defaultShader);
		gl.noFill();
		gl.drawCircle(this.position.x, this.position.y, this.entityRadius);
        // this.fsm.draw(gl);
        
    },
    
    drawHealthy : function(fsm, gl) {
                        
        // gl.bindShader(gl.defaultShader);
        // gl.setColor(0, 1, 0, 0.7);
        
		// Entity.prototype.draw.call(this, gl);
    },

    drawIncubated : function(fsm, gl) {
                        
        // gl.bindShader(gl.defaultShader);
        // gl.setColor(1, 0, 0, 1);
        
        // Entity.prototype.draw.call(this, gl);
    },
    
    drawContaminated : function(fsm, gl) {
                        
        // gl.bindShader(gl.defaultShader);
        // gl.setColor(0, 0, 1, 0.5);
        
        // Entity.prototype.draw.call(this, gl);
    },
	
	createGutParticles : function() {

		for(var i = 0; i < this.gutParticleCount; i++) {
			
			this.gutParticles.push(
				new Particle(
					new Vector(rand(0, this.entityRadius / 2), 0, 0).rotate2DSelf(rand(0, 360)).addSelf(this.position)
				)
			);
		
		}
	
	},
	
	// TODO: DRY -> Controller.js has similar function for particles
	updateGutParticles : function(dt, positionChange) {
	
		var particleDistances = Particle.getParticleDistances(this.gutParticles),
            particleCount = this.gutParticles.length;
	
		for(var i = 0; i < particleCount; i++) {
		
			this.gutParticles[i].position.addSelf(positionChange);
			
			var particle = this.gutParticles[i];

            Particle.applySwarmBehaviour(
				particleDistances[i],
				this.gutParticles,
				particle,
				particleCount,
				this.separationRadius,
				this.cohesionRadius
			);
			
			this.approachCenter(particle, this.particleSpeed);
			
			this.checkDistance(particle);

            particle.update(dt);
		
		}
		
	},
	
	approachCenter : function(particle, force) {

		var toCenter = this.position.sub(particle.position).normalizeSelf();
		particle.applyForce(toCenter.mulSelf(force));
	
	},
	
	checkDistance : function(particle) {
	
		if(particle.position.sub(this.position).norm() >= this.entityRadius - particle.entityRadius) {
		
			this.approachCenter(particle, this.pushForce);
		
		}
	
	}
    
});
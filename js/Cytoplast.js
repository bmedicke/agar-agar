var Cytoplast = function(position) {

    Entity.call(this, position);
	
	this.fsm = new StateMachine( this );
	
	this.initialize();
	
	this.gutParticles = [];
	
	this.dockedParticles = [];
	
	this.createGutParticles();
	
	this.growth = 0.5;
	
	this.growthTween = null;

};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

extend( Cytoplast.prototype, {

	mass : 300000,
	
    moveSpeed : 0.3,
	
	minRadius : 1,
	maxRadius : 3,
	
	entityRadius : 2,
	
	gutParticleCount : 30,
	gutParticleSpeed : 0.05,
	gutParticleAlpha : 0.3,
	
	pushForce : 10,
	
	pukeForce : 25,
	
	separationRadius : 0.5,
	cohesionRadius : 2,
	
	minFill : 1,
	maxFill : 60,
	
	spikeFill : 10,
	
	incubationTime : 5000,
	
	color : [0.99, 0.92, 0.5, 0.15],
	
	corpusTextureSize : 1.1,
	spikeTextureSize : 1.9,
	
    initialize : function() {

        this.fsm.init([
            { name : 'healthy', enter : this.enterHealthy },
            { name : 'fertilized', enter : this.enterFertilized },
			{ name : 'puking', enter : this.enterPuking },
            { name : 'spikified', enter : this.enterSpikified, draw : this.drawSpikified, exit : this.exitSpikified }
        ],[
            { name : "spikify", from : 'fertilized', to : 'spikified' },
            { name : "cure", from : 'fertilized', to : 'puking', callback : this.onCure }
        ]);
        
        this.fsm.changeState( 'healthy' );
        
    },
	
	enterHealthy : function(fsm) {
	
		console.log("enter healthy");
		
		this.dockedParticles = [];
	
	},
	
	enterSpikified : function(fsm) {
	
		console.log("enter spikified");
		
		this.mass /= 5;
	
	},
	
	exitSpikified : function(fsm) {
	
		this.mass *= 5;
	
	},
    
    update : function(dt) {
        
		var positionChange = Entity.prototype.update.call(this, dt);
		
		this.updateGutParticles(dt, positionChange);
		
		this.updateDockedParticles(dt, positionChange);
		
        this.fsm.update(dt);
        
    },
    
    draw : function(gl) {
	
		Particle.drawEnqueue(this.gutParticles);
		Particle.drawEnqueue(this.dockedParticles);
        
		this.fsm.draw(gl);
		
		this.drawTexture(gl, this.corpusTextureSize, Cytoplast.corpusTexture);
        
    },
	
	drawTexture : function(gl, textureSize, texture) {
		
		var size = 2 * textureSize * this.entityRadius;
		
		gl.bindShader(gl.textureShader);

		gl.passColor(this.color);

		gl.pushMatrix();
		
		gl.translate(this.position.x, this.position.y);
		
		gl.scale(size, size);   
		gl.passMatrix();
		
		gl.passTexture(texture);
		gl.drawQuadTexture();
		
		gl.popMatrix();
	
	},
    
    drawSpikified : function(fsm, gl) {
                        
        this.drawTexture(gl, this.spikeTextureSize, Cytoplast.spikeTexture);
		
    },
	
	createGutParticles : function() {

		for(var i = 0; i < this.gutParticleCount; i++) {
			
			this.gutParticles.push(
				new Particle(
					new Vector(rand(0, this.entityRadius / 2), 0, 0).rotate2DSelf(rand(0, 360)).addSelf(this.position)
				)
			);
			
			this.gutParticles[i].alpha = this.gutParticleAlpha;
		
		}
	
	},
	
	updateSize : function() {
	
		if(this.growthTween) {
		
			this.growthTween.stop();
		
		}
		
		var growth = clamp( this.gutParticles.length / this.maxFill, 0, 1);
		
		this.growthTween = new TWEEN.Tween( this );
        
		this.growthTween.easing(TWEEN.Easing.Back.EaseIn);
		
        this.growthTween.to( {'growth' : growth}, 1000 );
        
        this.growthTween.onUpdate( function() {
            
            this.entityRadius = map( this.growth, 0, 1, this.minRadius, this.maxRadius );
            
        });
        
        this.growthTween.onComplete( function() {
            
            this.growthTween = null;
            
        });
        
        this.growthTween.start();
	
	},
	
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
			
			this.approachCenter(particle, this.gutParticleSpeed);
			
			this.checkDistance(particle);

            particle.update(dt);
		
		}
		
	},
	
	updateDockedParticles : function(dt, positionChange) {
	
		for(var i = 0; i < this.dockedParticles.length; i++) {
		
			this.dockedParticles[i].position.addSelf(positionChange);
		
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
	
	},
	
	loseParticle : function() {
		
		this.updateSize();
		
		return this.gutParticles.splice(rand(0, this.gutParticles.length), 1)[0].position;
	
	},
	
	dockParticle : function(position) {
	
		if(!this.fsm.hasState('spikified')) {
		
			if(this.fsm.hasState('healthy')) {
			
				this.fsm.changeState('fertilized');
			
			}
			
			this.dockedParticles.push(new Particle(position));
			
			if(this.dockedParticles.length >= this.spikeFill) {
			
				this.fsm.changeState('spikified');
			
			}
		
			return true;
		}
		
		return false;
	
	},
	
	enterFertilized : function() {
	
		log("entered fertilized");
	
		var self = this;
		
		setTimeout( function() {
		
			self.dockedParticles.length >= this.spikeFill ? self.fsm.spikify() : self.fsm.cure();
		
		}, this.incubationTime);
	
	},
	
	enterPuking : function() {
	
		game.controller.particles = game.controller.particles.concat(this.dockedParticles);
		
		this.dockedParticles = [];
		
		game.vectorfield.addForcefield(new Forcefield(
			this.position.clone(),
			this.entityRadius * 2,
			this.pukeForce,
			false,
			Math.PI
		));
	
	}
    
});

Cytoplast.initialize = function(gl) {

    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");
    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");

};
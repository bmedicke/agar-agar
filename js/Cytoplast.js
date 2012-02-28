var Cytoplast = function(position) {

    Entity.call(this, position);
	
	this.fsm = new StateMachine( this );
	
	this.initialize();
	
	this.gutParticles = [];
	
	this.dockedParticles = [];
	
	this.createGutParticles();
	
	this.growth = 0.5;
	
	this.spikeSize = this.corpusTextureSize;
	
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
	pukeTime: 1250,
	
	separationRadius : 0.5,
	cohesionRadius : 2,
	
	minFill : 1,
	maxFill : 60,
	
	spikeFill : 10,
	spikeTime : 10000,
	
	incubationTime : 5000,
	
	color : [0.99, 0.92, 0.5, 0.15],
	
	corpusTextureSize : 1.1,
	spikeTextureSize : 1.9,
	
    initialize : function() {

        this.fsm.init([
            { name : 'healthy', enter : this.enterHealthy , update : this.updateHealthy },
            { name : 'fertilized', enter : this.enterFertilized, update : this.updateHealthy },
			{ name : 'puking', enter : this.enterPuking, update : this.collideWithParticles },
            { name : 'spikified', enter : this.enterSpikified, update : this.updateSpikified, draw : this.drawSpikified, exit : this.exitSpikified }
        ],[
            { name : "fertilize", from : 'healthy', to : 'fertilized' },
			{ name : "spikify", from : 'fertilized', to : 'spikified' },
            { name : "puke", from : 'fertilized', to : 'puking' },
			{ name : "recover", from : '*', to : 'healthy' }
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
		
		game.controller.addPoints("cytoFull");
		
		for(var i = 0; i < this.dockedParticles.length; i++) {
		
			this.dockedParticles[i].alpha = this.gutParticleAlpha;
			this.gutParticles.push(this.dockedParticles[i]);
		
		}
		
		this.dockedParticles = [];
		
		this.updateSize();
		
		
		var spikeOutTween = new TWEEN.Tween( this );
		
		spikeOutTween.easing(TWEEN.Easing.Back.EaseIn);
		
		spikeOutTween.delay(this.spikeTime - 1000 * 2);
		
        spikeOutTween.to( {'spikeSize' : this.corpusTextureSize}, 1000 );
		
		spikeOutTween.onComplete(function() {
		
			fsm.recover();
		
		});
		
		
		var spikeInTween = new TWEEN.Tween( this );
		
		spikeInTween.easing(TWEEN.Easing.Back.EaseOut);
		
        spikeInTween.to( {'spikeSize' : this.spikeTextureSize}, 1000 );
        
		spikeInTween.chain(spikeOutTween);
		
		spikeInTween.start();
	
	},
	
	exitSpikified : function(fsm) {
	
		this.mass *= 5;
	
	},
    
    update : function(dt) {
		
		this.fsm.update(dt);
		
		this.collideWithLeukocytes();

		this.checkBoundary(game.vectorfield);

		var positionChange = Entity.prototype.update.call(this, dt);
		
		this.updateGutParticles(dt, positionChange);
		
		this.updateDockedParticles(dt, positionChange);
        
    },
	
	updateHealthy : function(dt) {
	
		this.updateMovement(dt);
		
		this.collectParticles(dt);
	
	},
	
	updateSpikified : function(dt) {
	
		this.updateMovement(dt);
		
		this.collideWithParticles(dt);
	
	},
	
	updateMovement : function(dt) {
	
		var forceVector = game.vectorfield.getVector(this.position),
			offsetVector = new Vector(this.entityRadius);
		
		for (var i = 0; i < 6; i++) {
			
			forceVector.addSelf(game.vectorfield.getVector(
				this.position.add(offsetVector.rotate2DSelf(Math.PI / 3))
			));
			
		}

		this.applyForce(forceVector.divSelf(7));
	
	},
	
	collideWithParticles : function(dt) {
	
		var fieldParticles = game.controller.particles;
		
		for( var j = 0; j < fieldParticles.length; j++) {

			this.collision(fieldParticles[j]);

		}
	
	},
	
	collideWithLeukocytes : function() {
	
		var leukocytes = game.controller.leukocytes;
		
		for(var i = 0; i < leukocytes.length; i++) {
		
			if (this.checkCollision( leukocytes[i] )) {
            
				if (this.fsm.hasState('spikified')) {
				
					game.controller.addPoints("leukoDeath");
					leukocytes.splice(i, 1);
				
				} else if (this.gutParticles.length > 0 && leukocytes[i].isActive) {

					leukocytes[i].eatParticle( this.loseParticle(), 300, this.gutParticleAlpha );
				
				}
			
			}
		
		}
	
	},
	
	collectParticles : function(dt) {
	
		fieldParticles = game.controller.particles;
		
		for( var j = 0; j < fieldParticles.length; j++) {

			if (this.checkCollision(fieldParticles[j])) {

				this.fsm.fertilize();
				
				this.dockedParticles.push(new Particle(fieldParticles[j].position));
				
				if(this.dockedParticles.length >= this.spikeFill) {
				
					this.fsm.spikify();
				
				}
				
				game.controller.addPoints("cytoInfect");
				
				fieldParticles[j].alive = false;
				fieldParticles.splice(j, 1);

			}

		}
	
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
                        
        this.drawTexture(gl, this.spikeSize, Cytoplast.spikeTexture);
		
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
		
        this.growthTween.to( {'growth' : growth}, 500 );
        
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
	
	enterFertilized : function(fsm) {
	
		log("entered fertilized");
	
		var self = this;
		
		Timer.setTimeout( function() {
		
			self.dockedParticles.length >= self.spikeFill ? self.fsm.spikify() : self.fsm.puke();
		
		}, this.incubationTime);
	
	},
	
	enterPuking : function(fsm) {
	
		game.controller.particles = game.controller.particles.concat(this.dockedParticles);
		
		this.dockedParticles = [];
		
		var repulsionForcefield = new Forcefield(
				this.position.clone(),
				this.entityRadius * 2,
				this.pukeForce,
				false,
				Math.PI
			),
			tweenShrink = new TWEEN.Tween( this ),
			tweenRepulse = new TWEEN.Tween( this );
			
		tweenShrink.to({ entityRadius : this.entityRadius * 0.85 }, 300);
		tweenRepulse.to({ entityRadius : this.entityRadius }, 150);
		
		tweenShrink.chain(tweenRepulse);
		
		tweenRepulse.easing(TWEEN.Easing.Bounce.EaseOut);
		
		tweenShrink.onComplete( function() {
		
			game.vectorfield.addForcefield(repulsionForcefield);
		
		});
			
		tweenShrink.start();
		
		Timer.setTimeout(function() {
		
			fsm.recover();
		
		}, this.pukeTime);
	
	}
    
});

Cytoplast.initialize = function(gl) {

    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");
    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");

};
var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;

    this.particles = [];
    this.leukocytes = [];
    this.devourers = [];

    this.cytoplast = null;

    this.points = 0;
    this.multiplierPoints = 0;
    this.multiplier = 1;
    this.multiplierCooldown = 1;
    this.multiplierCooldownAnimation = null;
    
    this.vector = new Vector();

};

Controller.prototype = {

	separationRadius : 0.3,
	
	cohesionRadius : 2,
    
    cooldownTime : 30000,

    pointValues : {

        cytoInfect : 10,
        leukoDeath : 50,
        cytoFull : 250,
        devourerDeath : 1000

    },

    update : function(dt) {
	
        this.updateDevourers(dt);

        this.updateCytoplast(dt);
		
		this.updateLeukocytes(dt);

        this.updateParticles(dt);
        
        if (this.multiplier > 1) {
            
            Menu.updateCooldown(this.multiplierCooldown);
            
        }

    },

    draw : function(gl) {

        if (this.cytoplast) {

            this.cytoplast.draw(gl);

        }

        if (this.leukocytes.length) {
            
            Leukocyte.draw(gl, this.leukocytes);
            
        }
        
        Particle.drawEnqueue(this.particles);
        Particle.draw(gl);
        
        if (this.devourers.length) {
            
            Devourer.draw(gl, this.devourers); 
            
        }

    },

    searchAndKill : function(leukocyte) {
        
        var nearest = this.cytoplast.position.clone().subSelf(leukocyte.position),
            current = this.vector.copy( nearest );
    
        for (var j = 0; j < this.particles.length; j++) {
    
            var particle = this.particles[j];
            
            current.copy(particle.position).subSelf(leukocyte.position);
        
            if (current.normSquared() < nearest.normSquared()) {
        
                nearest.copy(current);
        
            }
        
            if (leukocyte.checkCollision(particle)) {
                
                leukocyte.eatParticle(particle.position, 150);
                
                this.particles.splice(j, 1);
                particle.alive = false;
                j--;
                
                return;
                
            }
        
        }
        
        leukocyte.orientation.copy(nearest);
        
    },

    updateLeukocytes : function(dt) {

        for (var i = 0; i < this.leukocytes.length; i++) {

            var leukocyte = this.leukocytes[i];

            if (leukocyte.isActive) {

                this.searchAndKill(leukocyte);

            }

            this.cytoplast.collision( leukocyte );

            for (var j = 0; j < i; j++) {

                leukocyte.collision(this.leukocytes[j]);

            }

            leukocyte.applyForce(
                this.vectorfield.getVector(leukocyte.position)
            );

            leukocyte.checkBoundary(this.vectorfield);

            leukocyte.update(dt);

        }

    },

    applyDevourerTarget : function(devourer) {

        if(this.cytoplast) {

            devourer.applyForce(this.cytoplast.position.sub(devourer.position).normalizeSelf().mulSelf(devourer.moveSpeed));

        }

    },

    updateDevourers : function(dt) {

        for (var i = 0; i < this.devourers.length; i++) {

            var devourer = this.devourers[i];
            
            for (var j = 0; j < this.particles.length; j++) {
                
                if (devourer.checkCollision(this.particles[j])) {
                    
                    devourer.grow( 0.03 );
                    
                    Devourer.leukoKillSound.play();
                    this.particles[j].alive = false;
                    this.particles.splice(j, 1);
                    j--;
                    
                }
                
            }
            
            for (var j = 0; j < this.leukocytes.length; j++) {
                
                if (devourer.checkCollision(this.leukocytes[j])) {
                    
                    devourer.grow( 0.15 );
                    
                    this.leukocytes.splice(j, 1);
                    j--;
                    
                    this.addPoints("leukoDeath");
                    
                }
                
            }

            for (var j = 0; j < i; j++) {

                devourer.collision(this.devourers[j]);

            }

            this.applyDevourerTarget(devourer);

            devourer.checkBoundary(this.vectorfield);

            devourer.update(dt);

            if (this.cytoplast) {

                if (devourer.checkCollision(this.cytoplast)) {

                    if(this.cytoplast.fsm.hasState('spikified')) {

                        this.addPoints("devourerDeath");
                        this.increaseMultiplier();

                        this.devourers.splice(i, 1);
                        i--;

                        break;

                    } else {
                        
                        game.lose();
                        
                    }

                }

            }

        }

    },

    updateParticles : function(dt) {

        var particleDistances = Particle.getParticleDistances(this.particles),
            particleCount = this.particles.length,
            i, neighborCount, maxNeighborCount = 0, swarmParticle;

        for (i = 0; i < particleCount; i++) {

            var particle = this.particles[i];

            particle.applyForce(
                this.vectorfield.getVector(particle.position)
            );

            neighborCount = Particle.applySwarmBehaviour(
				particleDistances[i],
				this.particles,
				particle,
				particleCount,
				this.separationRadius,
				this.cohesionRadius
			);

            particle.checkBoundary(this.vectorfield);

            particle.update(dt);

            if (neighborCount > maxNeighborCount) {

                maxNeighborCount = neighborCount;
                swarmParticle = particle;

            }

        }

        Interface.showSwarm( swarmParticle );
		
    },

    updateCytoplast : function(dt) {
	
		this.cytoplast.update(dt);

    },

    reset : function() {

        this.particles = [];
        this.leukocytes = [];
        this.devourers = [];

        this.cytoplast = null;

        this.points = 0;
        this.multiplierPoints = 0;

        this.resetMultiplier();

    },

    getRandomOutsidePosition : function() {

        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            radiusVector = midPoint.rotate2D(rand(0, Math.PI * 2));

        if (Math.abs(radiusVector.y) > midPoint.y) {

            radiusVector.mulSelf(midPoint.y / Math.abs(radiusVector.y) + 0.1);

        } else {

            radiusVector.mulSelf(midPoint.x / Math.abs(radiusVector.x) + 0.1);

        }

        return midPoint.addSelf(radiusVector);

    },

    getRectPositionForAngle : function( x, y, width, height, angle ) {

        var midPoint = new Vector( width / 2, height / 2, 0 ),
            radiusVector = new Vector( 1, 0, 0 ).rotate2D( angle ),
            scaleX = Math.abs( midPoint.x / radiusVector.x ),
            scaleY = Math.abs( midPoint.y / radiusVector.y );
        
        if ( !scaleX || scaleX === Infinity ) {
            
            radiusVector.mulSelf( scaleY );
            
        } else if ( !scaleY || scaleY === Infinity ) {
            
            radiusVector.mulSelf( scaleX );

        } else if ( Math.abs( 1 - scaleX ) < Math.abs( 1 - scaleY ) ) {

            radiusVector.mulSelf( scaleX );

        } else {

            radiusVector.mulSelf( scaleY );

        }

        midPoint.x += x;
        midPoint.y += y;

        return midPoint.addSelf( radiusVector );

    },

    getRandomInsidePosition : function() {

        var pos = new Vector(),
            entropyRadius = Entropyfier.prototype.entropyRadius,
            devourerRadius = Devourer.prototype.forceRadius;
        
        do {
            
            var minDistance = Infinity;
            
            pos.x = rand( entropyRadius, this.vectorfield.cols - entropyRadius);
            pos.y = rand( entropyRadius, this.vectorfield.rows - entropyRadius);
            
            for (var i = 0; i < this.devourers.length; i++ ) {
                
                var dist = this.devourers[i].position.sub(pos).norm();
                
                if (dist < minDistance) {
                    
                    minDistance = dist;
                    
                }
                
            }
            
            for (var i = 0; i < game.entropyfiers.length; i++ ) {
                
                var dist = game.entropyfiers[i].position.sub(pos).norm();
                
                if (dist < minDistance) {
                    
                    minDistance = dist;
                    
                }
                
            }
            
        } while ( minDistance < devourerRadius + entropyRadius );

        return pos;

    },

    addInitialParticles : function(amount) {

        for (var i = 0; i < amount; i++) {

            this.particles.push( new Particle( new Vector(
                Math.random() * this.vectorfield.cols,
                Math.random() * this.vectorfield.rows
            )));

        }

    },
    
    addParticle : function() {
        
        this.particles.push( new Particle( new Vector(
            Math.random() * this.vectorfield.cols,
            Math.random() * this.vectorfield.rows
        )).fadeIn( 1000 ) );

    },

    addParticlesAt : function(amount, position, radius) {

        var offset = new Vector(radius, 0, 0);

        for (var i = 0; i < amount; i++) {

            offset.rotate2DSelf( rand(0, Math.PI * 2) );
            this.particles.push( new Particle( position.add(offset) ).fadeIn( 500 ) );

        }

    },

    addLeukocytes : function(amount) {

        var width = this.vectorfield.cols,
            height = this.vectorfield.rows;

        for (var i = 0; i < amount; i++) {

            var angle = rand( 0, Math.PI * 2 );

            this.leukocytes.push( new Leukocyte( 
                this.getRectPositionForAngle( -2, -2, width + 4, height + 4, angle )
            ));

        }

    },

    addDevourers : function(amount) {
        
        var width = this.vectorfield.cols,
            height = this.vectorfield.rows;

        for (var i = 0; i < amount; i++) {

            var angle = rand( 0, Math.PI * 2 );

            this.devourers.push( new Devourer( 
                this.getRectPositionForAngle( -10, -10, width + 20, height + 20, angle )
            ));

            Interface.addAlertSign( 
                this.getRectPositionForAngle( 2, 2, width - 4.5, height - 4.5, angle ),
                5000,
                angle
            );

        }

    },

    addPoints : function(pointKey) {

        if (this.multiplier > 1) {
            
            this.multiplierPoints += this.pointValues[pointKey];
            Menu.updateMultiplierPoints(this.multiplierPoints);
            
        } else {
            
            this.points += this.pointValues[pointKey];
            Menu.updatePoints(this.points);
            
        }

    },

    increaseMultiplier : function() {
        
        this.multiplierCooldown = 1;
        
        if (this.multiplierCooldownAnimation) {
            
            this.multiplierCooldownAnimation.stop();
            
        }
        
        this.multiplierCooldownAnimation = Animator.animate({
            object: this,
            values: {"multiplierCooldown" : 0},
            duration: Controller.prototype.cooldownTime,
            callback: this.resetMultiplier
        });
        
        this.multiplier++;
        Menu.updateMultiplier(this.multiplier);
        
    },
    
    resetMultiplier : function() {
        
        this.points += this.multiplierPoints * this.multiplier;
        this.multiplier = 1;
        this.multiplierPoints = 0;
        
        Menu.updatePoints(this.points);
        Menu.updateMultiplier(this.multiplier);
        
        if (this.multiplierCooldownAnimation) {
            
            this.multiplierCooldownAnimation.stop();
            this.multiplierCooldownAnimation = null;
            
        }
        
    }

};

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

    separationFactor : 10,

    cohesionFactor : .5,
    
    cooldownTime : 30000,

    pointValues : {

        particleSpawn : 1,
        cytoInfect : 10,
        leukoDeath : 50,
        cytoFull : 250,
        devourerDeath : 1000

    },

    update : function(dt) {

        this.updateLeukocytes(dt);

        this.updateDevourers(dt);

        this.updateCytoplast(dt);

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
        
        var nearest = new Vector(Infinity, Infinity, 0),
            current = this.vector;
    
        for (var j = 0; j < this.particles.length; j++) {
    
            var particle = this.particles[j];
            
            current.copy(particle.position).subSelf(leukocyte.position);
        
            if (current.normSquared() < nearest.normSquared()) {
        
                nearest.copy(current);
        
            }
        
            if (leukocyte.checkCollision(particle)) {
                
                leukocyte.eatParticle(particle.position);
                
                this.particles.splice(j, 1);
                j--;
                
                return;
                
            }
        
        }
        
        leukocyte.orientation.copy(nearest);
        
    },

    updateLeukocytes : function(dt) {

        for (var i = 0; i < this.leukocytes.length; i++) {

            var leukocyte = this.leukocytes[i];

            if (this.particles.length && leukocyte.isActive) {

                this.searchAndKill(leukocyte);

            }


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
                    
                    this.particles.splice(j, 1);
                    j--;
                    
                }
                
            }
            
            for (var j = 0; j < this.leukocytes.length; j++) {
                
                if (devourer.checkCollision(this.leukocytes[j])) {
                    
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

                    if(this.cytoplast.spikeState) {

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

        var particleDistances = this.getParticleDistances(),
            particleCount = this.particles.length,
            i, neighborCount, maxNeighborCount = 0, swarmParticle;

        for (i = 0; i < particleCount; i++) {

            var particle = this.particles[i];

            particle.applyForce(
                this.vectorfield.getVector(particle.position)
            );

            neighborCount = this.applySwarmBehaviour(particleDistances[i], particle, particleCount);

            particle.checkBoundary(this.vectorfield);

            particle.update(dt);

            if (neighborCount > maxNeighborCount) {

                maxNeighborCount = neighborCount;
                swarmParticle = particle;

            }

        }

        if (swarmParticle) {

            Interface.swarmSize = swarmParticle.checkSwarm();
            Interface.swarmParticle = swarmParticle;

        }


    },

    applySwarmBehaviour : function(distances, particle, particleCount) {

        var separationCenter = new Vector(),
            separationCount = 0,
            cohesionCenter = new Vector(),
            cohesionCount = 0;

        particle.neighbors = [];

        for (var j = 0; j < particleCount; j++) {

            if (typeof distances[j] === 'undefined') {

                continue;

            }

            if (distances[j] < particle.separationRadius * particle.separationRadius) {

                separationCenter.addSelf(this.particles[j].position);
                separationCount++;

            } else if (distances[j] < particle.cohesionRadius * particle.cohesionRadius) {

                cohesionCenter.addSelf(this.particles[j].position);
                cohesionCount++;

                particle.neighbors.push( this.particles[j] );

            }

        }


        if (cohesionCount) {

            cohesionCenter.divSelf(cohesionCount).subSelf(particle.position);

            cohesionCenter.mulSelf((1 / particle.cohesionRadius * cohesionCenter.norm()) * this.cohesionFactor);

        }

        if (separationCount) {

            separationCenter.divSelf(separationCount).subSelf(particle.position);

            separationCenter.mulSelf((1 / particle.separationRadius * separationCenter.norm() - 1) * this.separationFactor);

        }

        particle.applyForce(separationCenter.addSelf(cohesionCenter));

        return particle.neighbors.length;

    },

    getParticleDistances : function() {

        var distances = [];

        for (var i = 0; i < this.particles.length; i++) {

            distances[i] = [];
            var particle = this.particles[i];

            for (var j = 0; j < i; j++) {

                distances[i][j] = distances[j][i] = (particle.position.sub(this.particles[j].position)).normSquared();

            }

        }

        return distances;

    },

    updateCytoplast : function(dt) {

        var cytoplast = this.cytoplast,
            particles = this.particles;

        if (cytoplast) {

            for( var j = 0; j < particles.length; j++) {

                if (cytoplast.checkCollision(particles[j]) &&
                   !cytoplast.isFull() && !cytoplast.puking) {

                    cytoplast.dockParticle(particles[j].position);
                    particles.splice(j, 1);

                    this.addPoints("cytoInfect");

                    if (cytoplast.isFull()) {

                        this.addPoints("cytoFull");

                    }

                }

            }

            for (var j = 0; j < this.leukocytes.length; j++) {

                if (this.cytoplast.collision(this.leukocytes[j]) && cytoplast.spikeState) {
                
                    this.addPoints("leukoDeath");
                    this.leukocytes.splice(j, 1);
                
                }

            }
            
            var forceVector = this.vectorfield.getVector(cytoplast.position),
                offsetVector = new Vector(Cytoplast.prototype.entityRadius);
            
            for (var i = 0; i < 6; i++) {
                
                forceVector.addSelf(this.vectorfield.getVector(
                    cytoplast.position.add(offsetVector.rotate2DSelf(Math.PI / 3))
                ));
                
            }

            cytoplast.applyForce(forceVector.divSelf(7));

            cytoplast.checkBoundary(this.vectorfield);

            cytoplast.update(dt);

        }

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

        return new Vector(this.vectorfield.cols * Math.random(), this.vectorfield.rows * Math.random());

    },

    addInitialParticles : function(amount) {

        for (var i = 0; i < amount; i++) {

            this.particles.push(new Particle(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows),
                1.0)
            );

        }

    },
    
    addParticle : function() {
        
        var particle = new Particle(new Vector(
            Math.random() * this.vectorfield.cols,
            Math.random() * this.vectorfield.rows,
            0.0
        ), 0.0);
        
        var tween = new TWEEN.Tween(particle);
        
        tween.to( {alpha : 1.0}, 1000);
        tween.start();

        this.particles.push(particle);
        this.addPoints("particleSpawn");

    },

    addParticlesAt : function(amount, position, radius) {

        var offset = new Vector(position.x + radius, position.y, 0);
        offset.subSelf(position);

        for (var i = 0; i < amount; i++) {

            offset.rotate2DSelf(rand(0, Math.PI * 2));
            var particle = new Particle(position.add(offset), 0.5);
            
            Animator.animate({
                object: particle,
                values: {"alpha" : 1.0},
                duration: 500
            });

            this.particles.push(particle);

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

            // Interface.addAlertSign( 
            //     this.getRectPositionForAngle( 2, 2, width - 4.5, height - 4.5, angle ), 
            //     angle
            // );

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

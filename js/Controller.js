var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;

    this.particles = [];
    this.cytoplasts = [];
    this.leukocytes = [];
    this.devourers = [];

    this.points = 0;
    this.multiplierPoints = 0;
    this.multiplier = 1;
    this.multiplierCooldown = 1;
    this.multiplierCooldownAnimation = null;

    this.devourerForcefield = new Forcefield(
        new Vector(),
        Devourer.prototype.forceRadius,
        Devourer.prototype.force,
        false,
        0.0
    );

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

        this.updateCytoplasts(dt);

        this.updateParticles(dt);
        
        if (this.multiplier > 1) {
            
            Menu.updateCooldown(this.multiplierCooldown);
            
        }

    },

    draw : function(gl) {

        this.drawEntities(gl, this.cytoplasts);        

        if (this.leukocytes.length) {
            
            Leukocyte.draw(gl, this.leukocytes);
            
        }               
        
        Particle.drawEnqueue(this.particles);
        Particle.draw(gl);
        
        if (this.devourers.length) {
            
            Devourer.draw(gl, this.devourers); 
            
        }

    },

    drawEntities: function(gl, entities) {

        for (var i = entities.length - 1; i >= 0; i--) {

           entities[i].draw(gl);

        }

    },

    killAndSearch : function(leukocyte) {
        
        nearest = new Vector(Infinity, Infinity, 0);
    
        for (var j = 0; j < this.particles.length; j++) {
    
            var particle = this.particles[j],
                current = (particle.position.sub(leukocyte.position));
        
            if (current.normSquared() < nearest.normSquared()) {
        
                nearest = current;
        
            }
        
            if (leukocyte.checkCollision(particle)) {
                    
                leukocyte.eatParticle(particle.position);
                
                this.particles.splice(j, 1);
                j--;
                
                return;
                    
            }
        
        }
            
        leukocyte.orientation = nearest;
        
        leukocyte.applyForce(nearest.normalize().mulSelf(leukocyte.moveSpeed));
        
    },

    updateLeukocytes : function(dt) {

        for (var i = 0; i < this.leukocytes.length; i++) {

            var leukocyte = this.leukocytes[i];

            if (this.particles.length && leukocyte.isActive) {

                this.killAndSearch(leukocyte);

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

        if(this.cytoplasts.length > 0) {

            devourer.applyForce(this.cytoplasts[0].position.sub(devourer.position).normalizeSelf().mulSelf(devourer.moveSpeed));

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

            for(var j = 0; j < this.cytoplasts.length; j++) {

                var cytoplast = this.cytoplasts[j];

                if (devourer.checkCollision(cytoplast)) {

                    if(cytoplast.spikeState) {

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
            particleCount = this.particles.length;

        for (var i = 0; i < particleCount; i++) {

            var particle = this.particles[i];

            particle.applyForce(
                this.vectorfield.getVector(particle.position)
            );

            this.applySwarmBehaviour(particleDistances[i], particle, particleCount);

            particle.checkBoundary(this.vectorfield);

            particle.update(dt);

        }

    },

    applySwarmBehaviour : function(distances, particle, particleCount) {

        var separationCenter = new Vector(),
            separationCount = 0,
            cohesionCenter = new Vector(),
            cohesionCount = 0;

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

            }

        }


        if(cohesionCount) {

            cohesionCenter.divSelf(cohesionCount).subSelf(particle.position);

            cohesionCenter.mulSelf((1 / particle.cohesionRadius * cohesionCenter.norm()) * this.cohesionFactor);

        }

        if (separationCount) {

            separationCenter.divSelf(separationCount).subSelf(particle.position);

            separationCenter.mulSelf((1 / particle.separationRadius * separationCenter.norm() - 1) * this.separationFactor);

        }

        particle.applyForce(separationCenter.addSelf(cohesionCenter));

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

    updateCytoplasts : function(dt) {

        for(var i = 0; i < this.cytoplasts.length; i++) {

            var cytoplast = this.cytoplasts[i];

            for(var j = 0; j < this.particles.length; j++) {

                if(cytoplast.checkCollision(this.particles[j]) &&
                   !cytoplast.isFull() && !cytoplast.puking) {

                    cytoplast.dockParticle(this.particles[j].position);
                    this.particles.splice(j, 1);

                    this.addPoints("cytoInfect");

                    if(cytoplast.isFull()) {

                        this.addPoints("cytoFull");

                    }

                }

            }

            for(var j = 0; j < this.leukocytes.length; j++) {

                if(cytoplast.collision(this.leukocytes[j]) && cytoplast.spikeState) {
                
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

    applyDevourerVortices : function(dt) {

        for (var i = 0; i < this.devourers.length; i++) {

            this.devourerForcefield.position = this.devourerForcefield.point = this.devourers[i].position;
            this.devourerForcefield.angle = -this.devourers[i].speed * 0.5;
            this.vectorfield.applyForcefield(dt, this.devourerForcefield);

        }

    },

    reset : function() {

        this.particles = [];
        this.cytoplasts = [];
        this.leukocytes = [];
        this.devourers = [];

        this.points = 0;
        this.multiplierPoints = 0;

        this.resetMultiplier();

    },

    getRandomOutsidePosition : function() {

        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            radiusVector = midPoint.rotate2D(Math.random() * Math.PI * 2);

        if (Math.abs(radiusVector.y) > midPoint.y) {

            radiusVector.mulSelf(midPoint.y / Math.abs(radiusVector.y) + 0.1);

        } else {

            radiusVector.mulSelf(midPoint.x / Math.abs(radiusVector.x) + 0.1);

        }

        return midPoint.addSelf(radiusVector);

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
        ), 0.5)
        
        Animator.animate({
            object: particle,
            values: {"alpha" : 1.0},
            duration: 500
        });

        this.particles.push(particle);
        this.addPoints("particleSpawn");

    },

    addParticlesAt : function(amount, position, radius) {

        var offset = new Vector(position.x + radius, position.y, 0);
        offset.subSelf(position);

        for (var i = 0; i < amount; i++) {

            offset.rotate2DSelf(Math.random() * Math.PI * 2);
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

        for (var i = 0; i < amount; i++) {

            this.leukocytes.push(new Leukocyte(this.getRandomOutsidePosition()));

        }

    },

    addCytoplasts : function(amount) {

        for (var i = 0; i < amount; i++) {

            this.cytoplasts.push(new Cytoplast(this.getRandomOutsidePosition()));

        }

    },

    addDevourers : function(amount) {

        for(var i = 0; i < amount; i++) {

            this.devourers.push(new Devourer(this.getRandomOutsidePosition()));

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

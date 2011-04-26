var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.cytoplasts = [];
    this.leukocytes = [];    
    this.devourers = [];
    this.entropyfiers = [];

};

Controller.prototype = {

    separationFactor : 10,
    
    cohesionFactor : .5,

    update : function(dt) {
    
        this.updateEntropyfiers(dt);
                
        this.updateLeukocytes(dt);
        
        this.updateDevourers(dt);
    
        this.updateCytoplasts(dt);
        
        this.updateParticles(dt);
    },
    
    draw : function(gl) {
    
        for (var i = this.entropyfiers.length - 1; i >= 0; i--) {
            
            this.entropyfiers[i].draw(gl);
        
        }
        
        this.drawEntities(gl, this.cytoplasts);
        
        this.drawEntities(gl, this.devourers);
        
        gl.setColor(.5, .5, .5, 1);
        
        this.drawEntities(gl, this.particles);
        
        this.drawEntities(gl, this.leukocytes);

    },
    
    drawEntities: function(gl, entities) {
        
        for (var i = 0; i < entities.length; i++) {
        
           entities[i].draw(gl);
        
        }
        
    },
    
    updateEntropyfiers : function(dt) {
    
        for(var i = 0; i < this.entropyfiers.length; i++) {
        
            var entropyfier = this.entropyfiers[i];
            
            if (entropyfier.timer > entropyfier.chargeTime) {
            
                this.vectorfield.applyForceField(
                    dt,
                    Entropyfier.prototype.force,
                    entropyfier.forceRadius,
                    entropyfier.position,
                    false,
                    Math.PI
                );

            }
            
            entropyfier.update(dt);
            
            if (entropyfier.timer > entropyfier.chargeTime + Entropyfier.prototype.forceTime) {
            
                delete this.entropyfiers.splice(i, 1)[0].destroy();
            
            }
        
        }
    
    },
    
    collision : function(entity1, entity2) {
    
        var vector = entity1.position.sub(entity2.position);
        
        if (vector.normSquared() < (entity1.entityRadius + entity2.entityRadius) *
           (entity1.entityRadius + entity2.entityRadius)) {
            
            entity1.applyForce(vector.normalize().mulSelf(entity1.moveSpeed));
            entity2.applyForce(vector.normalize().mulSelf(entity2.moveSpeed * -1));
        
        }
        
        delete vector;
    
    },
    
    killAndSearch : function(leukocyte) {
        
        nearest = new Vector(Infinity, Infinity, 0);            
    
        for (var j = 0; j < this.particles.length; j++) {
    
            var particle = this.particles[j],
                current = (particle.position.sub(leukocyte.position));
        
            if (current.normSquared() < nearest.normSquared()) {
        
                nearest = current;
        
            }
        
            if (current.normSquared() < leukocyte.entityRadius * leukocyte.entityRadius) {
        
                leukocyte.eatParticle(particle.position);
                delete this.particles.splice(j, 1)[0].destroy();
                return;
        
            }
        
        }
        
        delete leukocyte.orientation;
        leukocyte.orientation = nearest;
        
        leukocyte.applyForce(nearest.normalizeSelf().mulSelf(leukocyte.moveSpeed));
        
    },
    
    updateLeukocytes : function(dt) {
        
        for (var i = 0; i < this.leukocytes.length; i++) {
            
            var leukocyte = this.leukocytes[i];
            
            if (this.particles.length && leukocyte.isActive) {
                
                this.killAndSearch(leukocyte);
                
            }
            
            
            for (var j = 0; j < i; j++) {
            
                this.collision(leukocyte, this.leukocytes[j]);
            
            }
            
            leukocyte.applyForce(
                this.vectorfield.getVector(leukocyte.position)
            );
            
            leukocyte.boundaryCheck(this.vectorfield);
            
            leukocyte.update(dt);
            
        }
        
    },
    
    devourerCollision : function(devourer, entities) {
        
        for (var j = 0; j < entities.length; j++) {
            
            var entity = entities[j];
            
            var distance = entity.position.sub(devourer.position).normSquared();
            
            if (distance < devourer.entityRadius * devourer.entityRadius) {
                
                delete entities.splice(j, 1)[0].destroy();
                
            }
            
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
            
            this.devourerCollision(devourer, this.particles);
            this.devourerCollision(devourer, this.leukocytes);
            
            for(var j = 0; j < i; j++) {
            
                this.collision(devourer, this.devourers[j]);
                
            }
            
            for(var j = 0; j < this.cytoplasts.length; j++) {
            
                var cytoplast = this.cytoplasts[j];
            
                if(cytoplast.position.sub(devourer.position).normSquared() <
                   (cytoplast.entityRadius + devourer.entityRadius) * (cytoplast.entityRadius + devourer.entityRadius)) {
                   
                    delete this.cytoplasts.splice(j, 1)[0].destroy();
                
                }
            
            }
            
            this.applyDevourerTarget(devourer);
            
            devourer.boundaryCheck(this.vectorfield);
            
            devourer.update(dt);
            
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
            
            this.applySwarmBehaviourAndReproduction(particleDistances[i], particle, particleCount);
            
            particle.boundaryCheck(this.vectorfield);
            
            particle.update(dt);
            
            delete particleDistances[i];
        
        }
        
        delete particleDistances;
        
    },
    
    applySwarmBehaviourAndReproduction : function(distances, particle, particleCount) {
    
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
                
                if (particleCount <= particle.maxCount &&
                    particle.reproductionPotency && 
                    this.particles[j].reproductionPotency && 
                    distances[j] < particle.reproductionRadius * particle.reproductionRadius) {
                    
                    for (var k = 0; k < particleCount; k++) {
                        
                        if (this.particles[k].reproductionPotency &&
                            j != k &&
                            typeof distances[k] !== 'undefined' &&
                            this.particles[j].position.sub(this.particles[k].position).normSquared() < 
                                particle.reproductionRadius * particle.reproductionRadius &&
                            particle.velocity.add(this.particles[j].velocity).add(this.particles[k].velocity).norm() < 
                                particle.reproductionVelocity) {
                           
                            var averagePosition = particle.position.add(this.particles[j].position.add(this.particles[k].position)).divSelf(3);
                            
                            this.particles.push(new Particle(averagePosition));
                            
                            particle.resetReproduction();
                            this.particles[j].resetReproduction();
                            this.particles[k].resetReproduction();
                            
                            break;
                            
                        }
                        
                    }
                    
                }
                
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
        
        delete cohesionCenter;
        delete separationCenter;
    
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
            
                if(this.particles[j].position.sub(cytoplast.position).normSquared() <
                   cytoplast.entityRadius * cytoplast.entityRadius) {
                
                    delete this.particles.splice(j, 1)[0].destroy();
                    cytoplast.currentFill++;
                
                }
                
                if(cytoplast.currentFill >= cytoplast.maxFill) {
                
                    //do stuff
                    log("cytoplast full");
                
                }
            
            }
            
            for(var j = 0; j < this.leukocytes.length; j++) {
            
                this.collision(cytoplast, this.leukocytes[j]);
            
            }
            
            var forceVector = this.vectorfield.getVector(cytoplast.position);
            var offset = Cytoplast.prototype.entityRadius;
            
            forceVector.addSelf(this.vectorfield.getVector(
                new Vector(cytoplast.position.x - offset, cytoplast.position.y))
            );
            forceVector.addSelf(this.vectorfield.getVector(
                new Vector(cytoplast.position.x, cytoplast.position.y + offset))
            );
            forceVector.addSelf(this.vectorfield.getVector(
                new Vector(cytoplast.position.x + offset, cytoplast.position.y))
            );
            forceVector.addSelf(this.vectorfield.getVector(
                new Vector(cytoplast.position.x, cytoplast.position.y - offset))
            );
            
            cytoplast.applyForce(forceVector.divSelf(5));
            
            cytoplast.boundaryCheck(this.vectorfield);
            
            cytoplast.update(dt);
        
        }
    
    },

    applyDevourerVortices : function(dt) {
        
        for (var i = 0; i < this.devourers.length; i++) {
            
            this.vectorfield.applyForceField(
                dt,
                Devourer.prototype.force,
                Devourer.prototype.forceRadius,
                this.devourers[i].position, 
                false,
                Devourer.prototype.forceAngle
            );
            
        }
        
    },
    
    reset : function() {
        
        delete this.particles;
        delete this.cytoplats;
        delete this.leukocytes;
        delete this.devourers;
        
        this.particles = [];
        this.cytoplasts = [];
        this.leukocytes = [];    
        this.devourers = [];
    
    },
    
    addElement : function(type, position) {
            
        switch(type) {
        
            case "Particle":
                this.particles.push(new Particle(position));
                break;
                
            case "Devourer":
                this.devourers.push(new Devourer(position));
                break;
                
            case "Cytoplast":
                this.cytoplasts.push(new Cytoplast(position));
                break;
                
            case "Leukocyte":
                addLeukocytes(1);
                break;
                
            case "Entropyfier":
                addEntropyfiers(1);
                break;
                
        }
    
    },
    
    addParticles : function(amount) {
    
        for (var i = 0; i < amount; i++) {
        
            this.particles.push(new Particle(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows))
            );
            // this.particles.push(new Particle(
                // new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 1))
            // );
            
        }
    
    },
    
    addLeukocytes : function(amount) {
    
        for (var i = 0; i < amount; i++) {
        
            var radiusVector = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0);
            radiusVector.addSelf(radiusVector.rotate2D(Math.random() * Math.PI * 2));
        
            this.leukocytes.push(new Leukocyte(radiusVector));
            
        }
    
    },
    
    addCytoplasts : function(amount) {
    
        for (var i = 0; i < amount; i++) {
        
            this.cytoplasts.push(new Cytoplast(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows)
            ));
            
        }
        
    },
        
    addDevourers : function(amount) {
        
        for(var i = 0; i < amount; i++) {
            
            this.devourers.push(new Devourer(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows))
                );
            
        }
        
    },
    
    addEntropyfiers : function(amount) {
    
        for (var i = 0; i < amount; i++) {
        
            var extraBubble = Math.random() > .5 ? true : false;
            
            var center = new Vector(Math.random() * this.vectorfield.cols,
                                    Math.random() * this.vectorfield.rows);

            var radius = Entropyfier.prototype.entropyRadius * (Math.random() * .3 + .7);
            var time = Entropyfier.prototype.entropyTime * (Math.random() * .3 + .7);
            
            this.entropyfiers.push(new Entropyfier(new Vector(center.x, center.y), time, radius));
            
            center.addSelf(center.sub(new Vector(center.x + radius, center.y)).rotate2DSelf(Math.random() * Math.PI * 2));
            
            this.entropyfiers.push(new Entropyfier(new Vector(center.x, center.y), time * 1.07, radius / 2));
            
            
            if(extraBubble) {
                
                center.addSelf(center.sub(new Vector(center.x + radius / 2, center.y)).rotate2DSelf(Math.random() * Math.PI * 2));
                
                this.entropyfiers.push(new Entropyfier(new Vector(center.x, center.y), time * 1.11, radius / 3));
            
            }
            
            
        }
    
    }
    
};

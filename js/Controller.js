var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.cytoplasts = [];
    this.leukocytes = [];    
    this.devourers = [];

};

Controller.prototype = {

    separationFactor : 7,
    
    cohesionFactor : .5,

    update : function(dt) {
                
        this.updateLeukocytes(dt);
        
        this.updateDevourers(dt);
    
        this.updateCytoplasts(dt);
        
        this.updateParticles(dt);
    },
    
    draw : function(gl) {
        
        gl.setColor(1, 1, 0.6, 1);
        
        for (var i = 0; i < this.cytoplasts.length; i++) {
        
           this.cytoplasts[i].draw(gl);
        
        }
        
        for (var i = 0; i < this.devourers.length; i++) {
        
           this.devourers[i].draw(gl);
        
        }
        
        gl.setColor(1, 0, 0, 1);
    
        for (var i = 0; i < this.particles.length; i++) {
        
           this.particles[i].draw(gl);
        
        }
        
        for (var i = 0; i < this.leukocytes.length; i++) {
        
           this.leukocytes[i].draw(gl);
        
        }

    },
    
    collision : function(entity1, entity2) {
    
        var vector = entity1.position.sub(entity2.position);
        
        if (vector.normSquared() < (entity1.entityRadius + entity2.entityRadius) *
           (entity1.entityRadius + entity2.entityRadius)) {
            
            entity1.applyForce(vector.normalize().mulSelf(entity1.moveSpeed));
            entity2.applyForce(vector.normalize().mulSelf(entity2.moveSpeed * -1));
        
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
        
            if (current.normSquared() < leukocyte.entityRadius * leukocyte.entityRadius) {
        
                this.particles.splice(j, 1);
        
            }
        
        }
        
        return nearest;
        
    },
    
    updateLeukocytes : function(dt) {
        
        for (var i = 0; i < this.leukocytes.length; i++) {
            
            var leukocyte = this.leukocytes[i],
                nearest = this.killAndSearch(leukocyte);                
            
            for (var j = 0; j < i; j++) {
            
                this.collision(leukocyte, this.leukocytes[j]);
            
            }
            
            leukocyte.applyForce(
                this.vectorfield.getVector(leukocyte.position)
            );
            
                        
            if (this.particles.length > 0) {
            
                leukocyte.orientation = nearest;
                leukocyte.applyForce(nearest.normalizeSelf().mulSelf(leukocyte.moveSpeed));

            }
            
            leukocyte.boundaryCheck(this.vectorfield);
            
            leukocyte.update(dt);
            
        }
        
    },
    
    devourerCollision : function(devourer, entities) {
        
        for (var j = 0; j < entities.length; j++) {
            
            var entity = entities[j];
            
            var distance = entity.position.sub(devourer.position).normSquared();
            
            if (distance < devourer.entityRadius * devourer.entityRadius) {
                
                entities.splice(j, 1);
                
            }
            
        }
    
    },
    
    applyDevourerTarget : function(devourer) {
        
        devourer.applyForce(this.cytoplasts[0].position.sub(devourer.position).normalizeSelf());
    
    },
    
    updateDevourers : function(dt) {
        
        for (var i = 0; i < this.devourers.length; i++) {
        
            var devourer = this.devourers[i];
            
            this.devourerCollision(devourer, this.particles);
            this.devourerCollision(devourer, this.leukocytes);
            
            this.applyDevourerTarget(devourer);
            
            this.devourers[i].update(dt);
            
        }
        
    },
    
    updateParticles : function(dt) {
        
        var particleDistances = this.getParticleDistances();
        
        for (var i = 0; i < this.particles.length; i++) {
            
            var particle = this.particles[i];
            
            particle.applyForce(
                this.vectorfield.getVector(particle.position)
            );
            
            
            this.applySwarmBehaviour(particleDistances[i], particle);
            
            particle.boundaryCheck(this.vectorfield);
            
            particle.update(dt);
        
        }
        
    },
    
    applySwarmBehaviour : function(distances, particle) {
    
        var separationCenter = new Vector(),
            separationCount = 0,
            cohesionCenter = new Vector(),
            cohesionCount = 0;
    
        for (var j = 0; j < this.particles.length; j++) {
                
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
    
    },

    applyDevourerVortices : function(dt) {
        
        for (var i = 0; i < this.devourers.length; i++) {
            
            this.vectorfield.applyForceField(
                dt,
                Devourer.prototype.forceRadius,
                this.devourers[i].position, 
                true,
                0, 
                - Math.PI / 4
            );
            
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
        
    }
    
};

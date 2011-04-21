var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.leukocytes = [];
    this.cytoplasts = [];

};

Controller.prototype = {

    separationFactor : 7,
    
    cohesionFactor : .5,

    update : function(dt) {
                
        for (var i = 0; i < this.leukocytes.length; i++) {
            
            var leukocyte = this.leukocytes[i],
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
        
        this.updateCytoplast(dt);
        
        this.updateParticles(dt);
    
    },
    
    draw : function(gl) {
        
        gl.setColor(1, 1, 0.6, 1);
        
        for (var i = 0; i < this.cytoplasts.length; i++) {
        
           this.cytoplasts[i].draw(gl);
        
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
    
    updateParticles: function(dt) {
        
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
    
    updateCytoplast : function(dt) {
        
        for (var i = 0; i < this.particles.length; i++) {
            
            
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
    
    }
    
};

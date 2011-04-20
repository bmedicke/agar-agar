var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.neutralizers = [];    
    // this.blackholes = [];

};

Controller.prototype = {

    separationFactor : 7,
    
    cohesionFactor : .5,

    update : function(dt) {
    
        var distances = this.getParticleDistances();

        for (var i = 0; i < this.particles.length; i++) {
            
            var particle = this.particles[i];
            
            
            particle.applyForce(
                this.vectorfield.getVector(particle.position)
            );
            
            
            this.calculateSwarmBehaviour(distances[i], particle);
            
            particle.boundaryCheck(this.vectorfield);
            
            particle.update(dt);
            
        }    
    
    },
    
    draw : function(gl) {
        
        gl.setColor(1, 0, 0, 1);
    
        for(var i = 0; i < this.particles.length; i++) {
        
           this.particles[i].draw(gl);
        
        }

    },
    
    calculateSwarmBehaviour : function(distances, particle) {
    
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
    
    addParticles : function(amount) {
    
        for(var i = 0; i < amount; i++) {
            this.particles.push(new Particle(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows))
            );
        }
    
    }
    
};

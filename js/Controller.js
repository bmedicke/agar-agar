var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.neutralizers = [];    
    // this.blackholes = [];

};

Controller.prototype = {

    update : function(dt) {
    
        var distances = [];
        
        for (var i = 0; i < this.particles.length; i++) {
        
            distances[i] = [];
            var particle = this.particles[i];
            
            for (var j = 0; j < i; j++) {
            
                distances[i][j] = distances[j][i] = (particle.position.sub(this.particles[j].position)).normSquared();
            
            }
        
        }
        
        
        for (var i = 0; i < this.particles.length; i++) {
            
            var particle = this.particles[i],
                separationCenter = new Vector(),
                separationCount = 0;
            
            particle.applyForce(this.vectorfield.getVector(particle.position));
            
            
            for (var j = 0; j < this.particles.length; j++) {
            
                if (j === i) {
                
                    continue;
                    
                }
                    
                if (distances[i][j] < particle.separationRadius * particle.separationRadius) {
                
                    separationCenter.addSelf(this.particles[j].position);
                    separationCount++;
                
                }
            
            }
            
            
            if (separationCount) {
                
                separationCenter.divSelf(separationCount).subSelf(particle.position);
                
                separationCenter.mulSelf(1 / particle.separationRadius * separationCenter.norm() - 1);
                
                particle.applyForce(separationCenter);
                
            }
            
            
            this.particles[i].update(dt);
            
        }    
    
    },
    
    draw : function(gl) {
    
        for(var i = 0; i < this.particles.length; i++) {
        
           this.particles[i].draw(gl);
        
        }

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

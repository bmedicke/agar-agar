var Controller = function(vectorfield) {

    this.vectorfield = vectorfield;
    
    this.particles = [];
    this.neutralizers = [];    
    // this.blackholes = [];

};

Controller.prototype = {

    addParticles : function(amount) {
    
        for(var i = 0; i < amount; i++) {
            this.particles.push(new Particle(
                new Vector(Math.random() * this.vectorfield.cols,
                           Math.random() * this.vectorfield.rows))
            );
        }
    
    },
    
    update : function(dt) {
    
    for(var i = 0; i < this.particles.length; i++) {
    
        this.particles[i].applyForce(
            this.vectorfield.getVector(this.particles[i].position)
        );
        
        this.particles[i].update(dt);
    
    }
    
    },
    
    draw : function(gl) {
    
        for(var i = 0; i < this.particles.length; i++) {
        
           this.particles[i].draw(gl);
        
        }

    }
    
};

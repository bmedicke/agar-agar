var Generator = function() {
    
    this.level = {};

};

Generator.prototype = {

    particleCount : 200,
    devourerCount : 1,
    cytoplastCount : 1,
    
    reset : function() {
        
        this.level = {
            particles : [],
            cytoplasts : [],
            devourers : [],

            leukoRate : 0,
            leukoAmount : 0
        };
        
    },
    
    generate : function(width, height) {
        
        this.reset();
        
        //TODO: make this dependent from level of difficulty
        this.level.leukoRate = 50000;
        this.level.leukoAmount = 10;
    
        for(var i = 0; i < this.particleCount; i++) {
        
            this.level.particles.push(Math.random() * width);
            this.level.particles.push(Math.random() * height);
        
        }
        
        for(var i = 0; i < this.devourerCount; i++) {
        
            this.level.devourers.push(Math.random() * width);
            this.level.devourers.push(Math.random() * height);
        
        }
        
        for(var i = 0; i < this.cytoplastCount; i++) {
        
            this.level.cytoplasts.push(Math.random() * width);
            this.level.cytoplasts.push(Math.random() * height);
        
        }
        
        return this.level;
    
    },
    
    buildLevel : function(controller) {
    
        for(var i = 0; i < this.level.particles.length; i += 2) {
            
            controller.addElement("Particle", new Vector(this.level.particles[i], this.level.particles[i+1]));
        
        }
        
        for(var i = 0; i < this.level.devourers.length; i += 2) {
        
            controller.addElement("Devourer", new Vector(this.level.devourers[i], this.level.devourers[i+1]));
        
        }
        
        for(var i = 0; i < this.level.cytoplasts.length; i += 2) {
        
            controller.addElement("Cytoplast", new Vector(this.level.cytoplasts[i], this.level.cytoplasts[i+1]));
        
        }
    
    }

};
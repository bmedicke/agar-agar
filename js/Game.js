var Game = function(width, height) {
    
    this.vectorfield = new Vectorfield(width, height);    
    this.inputHandler = new InputHandler(this.vectorfield);
    this.controller = new Controller(this.vectorfield);
    
    this.stardust = new Stardust(this.vectorfield);
    
    this.isPaused = false;
    
    this.drawVectorfield = true;
    this.drawStardust = true;
    
    this.leukoTime = 0;
    this.devourerTime = 0;
    this.entropyTime = 0;
    
};

Game.prototype = {
    
    particleCount : 20,
    
    leukoRate : 5000,
    leukoAmount : 1,
    leukoCap : 15,
    
    entropyRate : 10000,
    entropyAmount : 1,
    
    devourerRate : 30000,
    

    initialize : function(gl) {
        
        Particle.initialize(gl);
        Leukocyte.initialize(gl);
    
        this.initLevel();
        this.vectorfield.initialize();
        this.stardust.initialize(gl);
        
        gl.bindShader(gl.defaultShader);
    
    },
    
    update : function(dt) {

        this.vectorfield.update(dt);
        this.controller.applyDevourerVortices(dt);
        this.inputHandler.update(dt);
        this.controller.update(dt);
        
        if (this.drawStardust) {
            
            this.stardust.update(dt);
            
        }
        
        this.updateLevel(dt);
        
    },
    
    draw : function(gl) {
        
        
        if (this.drawStardust) {
            
            this.stardust.draw(gl);
            
        }
        
        this.controller.draw(gl);
        
        if (this.drawVectorfield) {
            
            this.vectorfield.draw(gl);
            
        }
        
        this.inputHandler.draw(gl);
        
    },
    
    pause : function() {
        
        this.isPaused = !this.isPaused;
        
    },
    
    initLevel : function() {
        
        this.leukoTime = 0;
        this.devourerTime = 0;
        this.entropyTime = 0;
    
        this.controller.reset();
        this.vectorfield.reset();
        
        this.controller.addParticles(this.particleCount);
        
        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            randomPosition = this.controller.getRandomOutsidePosition().subSelf(midPoint).mulSelf(.5);
        
        this.controller.devourers.push(new Devourer(midPoint.add(randomPosition)));
        this.controller.cytoplasts.push(new Cytoplast(midPoint.add(randomPosition.mulSelf(-1))));
        
        delete midPoint, randomPosition;
        
    },
    
    updateLevel : function(dt) {
        
        this.leukoTime += dt;
        this.entropyTime += dt;
        this.devourerTime += dt;
    
        if( this.leukoTime > this.leukoRate &&
            this.controller.leukocytes.length < this.leukoCap) {

            this.controller.addLeukocytes(this.leukoAmount);
            
            this.leukoTime -= this.leukoRate;
        
        }
        
        if( this.entropyTime > this.entropyRate) {
        
            this.controller.addEntropyfiers(this.entropyAmount);
            
            this.entropyTime -= this.entropyRate;
        
        }
        
        if( this.devourerTime > this.devourerRate) {
        
            this.controller.addDevourers(1);
            
            this.devourerTime -= this.devourerRate;
        
        }
        
    }
};
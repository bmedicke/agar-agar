var Game = function() {
    
    this.vectorfield = new Vectorfield();    
    this.inputHandler = new InputHandler(this.vectorfield);
    this.controller = new Controller(this.vectorfield);
    
    this.stardust = new Stardust(this.vectorfield);
    
    this.state = "init";
    
    this.drawVectorfield = true;
    this.drawStardust = true;
    
    this.leukoTime = 0;
    this.particleTime = 0;
    this.devourerTime = 0;
    this.entropyTime = 0;
    
};

Game.prototype = {
    
    particleCount : 20,
    
    leukoRate : 2500,
    leukoAmount : 1,
    leukoCap : Leukocyte.prototype.absolutMaxCount,
    
    particleRate : 1500,
    
    entropyRate : 5000,
    entropyAmount : 1,
    
    devourerRate : 60000,
    

    initialize : function(gl) {
        
        Particle.initialize(gl);
        Leukocyte.initialize(gl);
        Devourer.initialize(gl);
		Cytoplast.initialize(gl);
        
        Glow.initialize(gl);
        
        this.initLevel();
        
        this.vectorfield.initialize(gl);
        this.inputHandler.initialize();
        this.stardust.initialize(gl);
        
        gl.bindShader(gl.defaultShader);
    
    },
    
    update : function(dt) {
        
        Animator.update(dt);

        this.vectorfield.update(dt);
        this.controller.applyDevourerVortices(dt);
        this.inputHandler.update(dt);
        
        if (this.drawStardust) {
            
            this.stardust.update(dt);
            
        }
        
        if (this.state === "run") {
            
            this.controller.update(dt);
            this.updateLevel(dt);
            
        }
        
    },
    
    draw : function(gl) {
        
        
        if (this.drawStardust) {
            
            this.stardust.draw(gl);
            
        }
        
        Glow.draw(gl, this.controller.devourers, Devourer.prototype.glowRadius);
        Glow.draw(gl, this.controller.leukocytes, Leukocyte.prototype.glowRadius);
        
        if (this.drawVectorfield) {
            
            this.vectorfield.draw(gl);
            
        }

        this.controller.draw(gl);
        this.inputHandler.draw(gl);
        
    },
    
    initLevel : function() {
        
        this.resetLevel();
        
        this.controller.addInitialParticles(this.particleCount);
        
        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            randomPosition = this.controller.getRandomOutsidePosition().subSelf(midPoint).mulSelf(.5);
        
        this.controller.devourers.push(new Devourer(midPoint.add(randomPosition)));
        this.controller.cytoplasts.push(new Cytoplast(midPoint.add(randomPosition.mulSelf(-1))));
        
        this.state = "run";
        
    },
    
    resetLevel : function() {
        
        Animator.reset();
        
        this.leukoTime = 0;
        this.particleTime = 0;
        this.devourerTime = 0;
        this.entropyTime = 0;
    
        this.controller.reset();
        this.vectorfield.reset();
        
        this.state = "init";
        
    },
    
    updateLevel : function(dt) {
        
        this.leukoTime += dt;
        this.entropyTime += dt;
        this.devourerTime += dt;
        this.particleTime += dt;
    
        if( this.leukoTime > this.leukoRate &&
            this.controller.leukocytes.length < this.leukoCap) {

            this.controller.addLeukocytes(this.leukoAmount);
            
            this.leukoTime -= this.leukoRate;
        
        }
        
        
        // FIXME: count particles in Cytoplast
        if( this.particleTime > this.particleRate &&
            this.controller.particles.length < Particle.prototype.maxCount) {

            this.controller.addParticle();
            
            this.particleTime -= this.particleRate;
        
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
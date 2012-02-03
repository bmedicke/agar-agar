var Game = function() {
    
    this.vectorfield = new Vectorfield();    
    this.inputHandler = new InputHandler(this.vectorfield);
    this.controller = new Controller(this.vectorfield);
    
    this.stardust = new Stardust(this.vectorfield);
    
    this.state = "init";
    
    this.drawVectorfield = true;
    this.drawStardust = true;
    
    this.leukoInterval = null;
    this.particleInterval = null;
    this.devourerInterval = null;
    this.entropyInterval = null;
    
    this.entropyfiers = [];
    
};

Game.prototype = {
    
    particleCount : 20,
    
    leukoRate : 5000,
    leukoAmount : 1,
    leukoCap : Leukocyte.prototype.absolutMaxCount,
    
    particleRate : 1500,
    
    entropyRate : 6000,
    entropyAmount : 1,
    
    devourerRate : 20000,

    initialize : function(gl) {
        
        Particle.initialize(gl);
        Leukocyte.initialize(gl);
        
        Devourer.initialize(gl);
        Cytoplast.initialize(gl);
        
        Entropyfier.initialize(gl);
        Glow.initialize(gl);
        Interface.initialize(gl);
        
        this.initLevel();
        
        this.vectorfield.initialize(gl);
        this.inputHandler.initialize();
        this.stardust.initialize(gl);
        
        gl.bindShader(gl.defaultShader);
    
    },
    
    update : function(dt) {
        
        Timer.update(dt);
        Animator.update(dt);
        TWEEN.update();
        
        this.vectorfield.update(dt);
        Devourer.applyVortices(dt, this.controller.devourers);
        this.inputHandler.update(dt);
        
        Entropyfier.update(dt, this.entropyfiers);
        
        if (this.drawStardust) {
            
            this.stardust.update(dt);
            
        }
        
        if (this.state === "run") {
            
            this.controller.update(dt);
            
        }
        
    },
    
    draw : function(gl) {
        
        Entropyfier.draw(gl, this.entropyfiers);
        
        if (this.drawStardust) {
            
            this.stardust.draw(gl);
            
        }
        
        Glow.draw(gl, this.controller.devourers, Devourer.prototype.glowRadius);
        // Glow.draw(gl, this.controller.leukocytes, Leukocyte.prototype.glowRadius);
        
        if (this.drawVectorfield) {
            
            this.vectorfield.draw(gl);
            
        }
        
        this.controller.draw(gl);
        
        Interface.draw(gl);
        
    },
    
    initLevel : function() {
        
        this.resetLevel();
        
        this.controller.addInitialParticles(this.particleCount);
        
        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            randomPosition = this.controller.getRandomOutsidePosition().subSelf(midPoint).mulSelf(.5);
        
        this.controller.devourers.push(new Devourer(midPoint.add(randomPosition)));
        this.controller.cytoplast = new Cytoplast(midPoint.add(randomPosition.mulSelf(-1)));
        
        this.controller.addLeukocytes(3);
        
        this.initIntervals();
        
        this.state = "run";
        
    },
    
    initIntervals : function() {
        
        this.entropyInterval = Timer.setInterval(function() {
            
            Entropyfier.add(game.entropyAmount, game.entropyfiers);
            
        }, this.entropyRate);
        
        
        this.devourerInterval = Timer.setInterval(function() {
            
            game.controller.addDevourers(1);
            
        }, this.devourerRate);
        
        
        // FIXME: count particles in Cytoplast
        this.particleInterval = Timer.setInterval(function() {
            
            if (game.controller.particles.length < Particle.prototype.maxCount) {
            
                game.controller.addParticle();
                
            }
            
        }, this.particleRate);
        
        
        this.leukoInterval = Timer.setInterval(function() {
            
            if (game.controller.leukocytes.length < game.leukoCap) {
            
                game.controller.addLeukocytes(game.leukoAmount);
                
            }
            
        }, this.leukoRate);
        
    },
    
    resetLevel : function() {
        
        Timer.reset();
        Animator.reset();
        
        this.entropyfiers = [];
        
        this.controller.reset();
        this.vectorfield.reset();
        
        this.state = "init";
        
    },
    
    lose : function() {
        
        this.controller.resetMultiplier();
        Menu.showLoserScreen(this.controller.points);
        
        game.state = "over";
        
    }

};
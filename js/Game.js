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
    
    entropyRate : 3000,
    entropyAmount : 1,
    
    devourerRate : 20000,

    initialize : function(gl) {
        
        Particle.initialize(gl);
        Leukocyte.initialize(gl);
        
        Devourer.initialize(gl);
        Cytoplast.initialize(gl);
        
        Entropyfier.initialize(gl);
        Glow.initialize(gl);
        
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
        
        this.updateEntropyfiers(dt);
        
        if (this.drawStardust) {
            
            this.stardust.update(dt);
            
        }
        
        if (this.state === "run") {
            
            this.controller.update(dt);
            
        }
        
    },
    
    draw : function(gl) {
        
        this.drawEntropyfiers(gl);
        
        if (this.drawStardust) {
            
            this.stardust.draw(gl);
            
        }
        
        Glow.draw(gl, this.controller.devourers, Devourer.prototype.glowRadius);
        // Glow.draw(gl, this.controller.leukocytes, Leukocyte.prototype.glowRadius);
        
        if (this.drawVectorfield) {
            
            this.vectorfield.draw(gl);
            
        }
        
        this.controller.draw(gl);
        
    },
    
    initLevel : function() {
        
        this.resetLevel();
        
        this.controller.addInitialParticles(this.particleCount);
        
        var midPoint = new Vector(this.vectorfield.cols / 2, this.vectorfield.rows / 2, 0),
            randomPosition = this.controller.getRandomOutsidePosition().subSelf(midPoint).mulSelf(.5);
        
        this.controller.devourers.push(new Devourer(midPoint.add(randomPosition)));
        this.controller.cytoplast = new Cytoplast(midPoint.add(randomPosition.mulSelf(-1)));
        
        this.initIntervals();
        
        this.state = "run";
        
    },
    
    initIntervals : function() {
        
        this.entropyInterval = Timer.setInterval(function() {
            
            game.addEntropyfiers(game.entropyAmount);
            
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
        
    },
    
    updateEntropyfiers : function(dt) {
        
        for (var i = 0; i < this.entropyfiers.length; i++) {
            
            this.entropyfiers[i].update(dt);
            
        }
        
    },
    
    drawEntropyfiers : function(gl) {
        
        for (var i = 0; i < this.entropyfiers.length; i++) {
            
            if (this.entropyfiers[i].burst) {
                
                this.entropyfiers.splice(i, 1);
                i--;
                
            } else {
                
                this.entropyfiers[i].draw(gl);
                
            }
            
        }
        
    },
    
    addEntropyfiers : function(amount) {

        for (var i = 0; i < amount; i++) {

            var center = new Vector(Math.random() * this.vectorfield.cols,
                                    Math.random() * this.vectorfield.rows);

            var radius = Entropyfier.prototype.entropyRadius * (Math.random() * .5 + .5),
                time = Entropyfier.prototype.entropyTime * (Math.random() * .3 + .7);

            this.entropyfiers.unshift(new Entropyfier(center.clone(), time, radius));

            // center.addSelf(new Vector(1, 0).rotate2DSelf(Math.random() * Math.PI * 2).mulSelf(radius + Math.random()));
            // 
            // this.entropyfiers.unshift(new Entropyfier(center.clone(), time * 1.07, Math.random() * radius / 2));
            // 
            // 
            // if (Math.random() > .5) {
            // 
            //     center.addSelf(new Vector(1, 0).rotate2DSelf(Math.random() * Math.PI * 2).mulSelf(radius * 0.5 + Math.random()));
            // 
            //     this.entropyfiers.unshift(new Entropyfier(center.clone(), time * 1.11, Math.random() * radius / 3));
            // 
            // }

        }

    },
    
    burstEntropyfier: function(entropyfier) {
        
        this.vectorfield.addForcefield(new Forcefield(
            entropyfier.position,
            entropyfier.forceRadius,
            Entropyfier.prototype.force,
            false,
            Math.PI
        ));
        
        entropyfier.burst = true;
        
    }

};
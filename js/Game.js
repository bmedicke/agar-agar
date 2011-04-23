var Game = function(width, height) {
    
    this.vectorfield = new Vectorfield(width, height);    
    this.inputHandler = new InputHandler(this.vectorfield);
	this.controller = new Controller(this.vectorfield);
	
	this.stardust = new Stardust(this.vectorfield);
    this.generator = new Generator();
    // this.fader = new Fader();
    
    this.isPaused = false;
    this.leukoTime = 0;
    this.entropyTime = 0;
    
};

Game.prototype = {

    initialize : function(gl) {
    
        this.resetLevel(true);
        this.stardust.initialize(gl);
    
    },
    
    update : function(dt) {

        // if (this.fader.isActive()) {
        //     
        //     this.fader.update(dt);
        //     
        // } else {
        //     
            this.vectorfield.update(dt);
            this.controller.applyDevourerVortices(dt);
            this.inputHandler.update(dt);
            this.controller.update(dt);
            
            this.stardust.update(dt);
            
            this.leukoTime += dt;
            this.entropyTime += dt;
        
            if( this.leukoTime > this.generator.level.leukoRate &&
                this.controller.leukocytes.length < this.generator.level.leukoCap) {

                this.controller.addLeukocytes(this.generator.level.leukoAmount);
                
                this.leukoTime = 0;
            
            }
            
            if(this.entropyTime > this.generator.level.entropyRate) {
            
                this.controller.addEntropyfiers(this.generator.level.entropyAmount);
                
                this.entropyTime = 0;
            
            }
        //     
        // }
        
    },
    
    draw : function(gl) {
        
        // if (this.fader.isActive()) {
        //     
        //     this.fader.draw(gl);
        //     
        // } else {
        //     
            this.stardust.draw(gl);
            this.controller.draw(gl);
            // this.vectorfield.draw(gl);
            this.inputHandler.draw(gl);
        //     
        // }
        
    },
    
    pause : function() {
        
        this.isPaused = !this.isPaused;
        
    },
    
    resetLevel : function(generateNewLevel) {
    
        this.controller.reset();
        this.vectorfield.reset();
        
        if (generateNewLevel) {
            
             this.generator.generate(this.vectorfield.cols, this.vectorfield.rows);
            
        }
        
        this.generator.buildLevel(this.controller);
    
    }
    
};
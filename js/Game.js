var Game = function(width, height) {
    
    this.vectorfield = new Vectorfield(width, height);    
    this.inputHandler = new InputHandler(this.vectorfield);
	this.controller = new Controller(this.vectorfield);
    
    this.controller.addParticles(1);
    
    // this.generator = new Generator();
    // this.fader = new Fader();
    
    this.isPaused = false;
    
};

Game.prototype = {
    
    update : function(dt) {
        
        // if (this.fader.isActive()) {
        //     
        //     this.fader.update(dt);
        //     
        // } else {
        //     
            this.vectorfield.update(dt);
            this.controller.update(dt);
        //     this.inputHandler.update(dt);
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
            this.vectorfield.draw(gl);
            this.controller.draw(gl);
        //     this.inputHandler.draw(gl);
        //     
        // }
        
    },
    
    pause : function() {
        
        this.isPaused = !this.isPaused;
        
    }
    
};
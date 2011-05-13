var InputHandler = function(vectorfield) {
    
    this.vectorfield = vectorfield;

    this.state = null;
    
    this.touching = false;
    this.touchStarted = false;
    
    this.clickTimeoutID = null;
    this.clickTime = 250;
    
    this.oldTouchPosition = new Vector();
    this.touchPosition = new Vector();
    
    this.mouse = new Vector();
    
    this.forcefield = new Forcefield(
        new Vector(), 
        InputHandler.prototype.forceRadius,
        InputHandler.prototype.force,
        true
    );

};

InputHandler.prototype = {
    
    force : 0.01,
    
    forceRadius : 4,
    
    initialize : function() {
        
        var self = this;

        document.getElementById("canvas").onmousedown = function(event) {
            self.onMouseDown(event);
        };

        document.body.onmousemove = function(event) {
            self.onMouseMove(event);
        };

        document.body.onmouseup = function(event) {
            self.onMouseUp(event);
        };

        document.onkeydown = function(event) {
            self.onKeyDown(event);
        };

        document.onkeyup = function(event) {
            self.onKeyUp(event);
        };
        
    },
    
    update : function(dt) {
        
        if (this.touching) {
            
            if (this.touchStarted) {
                
                this.forcefield.position = this.forcefield.point = this.touchPosition;
                this.vectorfield.applyForcefield(dt, this.forcefield);
                
            } else {
                
                var vector = this.touchPosition.sub(this.oldTouchPosition).normalizeSelf().mulSelf(this.forceRadius / 2);
                
                do {
                    
                    this.forcefield.position = this.oldTouchPosition
                    this.forcefield.point = this.oldTouchPosition.add(vector);
                    
                    this.vectorfield.applyForcefield(dt, this.forcefield);
                    
                } while (this.oldTouchPosition.addSelf(vector.mul(.25)).sub(this.touchPosition).normSquared() > vector.mul(.25).normSquared());
                
            }
            
            this.oldTouchPosition.copy(this.touchPosition);
            
        }
    },
    
    draw : function(gl) {
        
        
        
    },
    
    onMouseDown : function(event) {
        
        this.setMousePosition(event);
        
        this.touchStart();
        
        this.state = "down";
        
    },
    
    onMouseMove : function(event) {
        
        this.setMousePosition(event);
        
        this.touchPosition.copy(this.mouse);
        this.touchStarted = false;
        
    },
    
    onMouseUp : function(event) {
        
        this.setMousePosition(event);
        
        this.state = "up";
        
        this.touchStop();
        
    },
    
    onKeyDown : function(event) {
        
        if (event.keyCode === 32) {
            
            if (!this.touching) {
                
                this.touchStart();
            
            }
            
        }
        
    },
    
    onKeyUp : function(event) {
        
        if (event.keyCode === 32) {
            
            this.touchStop();
            
        } else if (event.keyCode == 82 || event.keyCode == 78) {
            
            Menu.startNewGame();
            
        } else if (event.keyCode == 86) {
            
            game.drawVectorfield = !game.drawVectorfield;
            
        } else if (event.keyCode == 79) {

            game.drawStardust = !game.drawStardust;

        } else if (event.keyCode === 27) {

            Menu.toggle();

        }
    },
    
    setMousePosition : function(event) {
        
        var coords = getRelativeCoordinates(event, canvas);
        this.mouse.set(coords.x / this.vectorfield.cellSize, coords.y / this.vectorfield.cellSize, 0);
        
    },
    
    touchStart : function() {
        
        this.touching = this.touchStarted = true;
        
        this.touchPosition.copy(this.mouse);
        this.oldTouchPosition.copy(this.mouse);
        
    },
    
    touchStop : function() {
        
        this.touching = false;
        
        this.touchPosition.copy(this.mouse);
        
    }

};
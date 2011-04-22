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

    var self = this;

    document.body.onmousedown = function(event) {
        self.onMouseDown(event);
    };
    
    document.body.onmousemove = function(event) {
        self.onMouseMove(event);
    };
    
    document.body.onmouseup = function(event) {
        self.onMouseUp(event);
    };
    
    document.body.onkeydown = function(event) {
        self.onKeyDown(event);
    };
    
    document.body.onkeyup = function(event) {
        self.onKeyUp(event);
    };

};

InputHandler.prototype = {
    
    force : 0.01,
    
    forceRadius : 4,
    
    update : function(dt) {
        
        if (this.touching) {
            
            if (this.touchStarted) {
                
                this.vectorfield.applyForceField(
                    dt, 
                    InputHandler.prototype.force,
                    InputHandler.prototype.forceRadius, 
                    this.touchPosition, 
                    true
                );
                
            } else {
                
                var vector = this.touchPosition.sub(this.oldTouchPosition).normalizeSelf().mulSelf(this.forceRadius / 2);
                
                do {
                    
                    this.vectorfield.applyForceField(
                        dt, 
                        InputHandler.prototype.force,
                        InputHandler.prototype.forceRadius,
                        this.oldTouchPosition, 
                        true,
                        0,
                        this.oldTouchPosition.add(vector)
                    );
                    
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
        
        // var self = this;
        // 
        // this.clickTimeoutID = setTimeout(function() {
        //     
        //     self.onClickTimeout();
        //     
        // }, this.clickTime);
        
    },
    
    onMouseMove : function(event) {
        
        this.setMousePosition(event);
        
        // if (this.state === "down") {
        //     
        //     this.state = "drag";
        //     
        // }
        
        this.touchPosition.copy(this.mouse);
        this.touchStarted = false;
        
    },
    
    onMouseUp : function(event) {
        
        this.setMousePosition(event);
        
        this.state = "up";
        
        // if (this.clickTimeoutID) {
        //     
        //     clearTimeout(this.clickTimeoutID);
        //     this.clickTimeoutID = null;
        //     
        // }
        
        this.touchStop();
        
    },
    
    onClickTimeout : function() {
        
        if (this.state !== "down") {
            
            return;
            
        }
        
        this.state = "drag";
        
    },
    
    onKeyDown : function(event) {
        
        if (event.keyCode === 32) {
            
            if (!this.touching) {
                
                this.touchStart();
            
            }
            
        } else if (event.keyCode === 27) {
            
            game.pause();
            
        }
        
    },
    
    onKeyUp : function(event) {
        
        if (event.keyCode === 32) {
            
            this.touchStop();
            
        } else if (event.keyCode == 82) {
            
            game.resetLevel();
            
        } else if (event.keyCode == 78) {

            game.resetLevel(true);

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
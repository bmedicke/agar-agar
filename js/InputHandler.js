var InputHandler = function(vectorfield) {
    
    this.vectorfield = vectorfield;

    this.state = null;
    
    this.clickTimeoutID = null;
    this.clickTime = 250;
    
    this.touches = {};
    this.touchID = 0;
    
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

};

InputHandler.prototype = {
    
    update : function(dt) {
        
        
        
    },
    
    draw : function(gl) {
        
        
        
    },
    
    onMouseDown : function(event) {
        
        this.setMousePosition(event);
        
        this.state = "down";
        
        var self = this;
        
        this.clickTimeoutID = setTimeout(function() {
            
            self.onClickTimeout();
            
        }, this.clickTime);
        
        //this.vectorfield.applyForceField(this.mouse);
        
    },
    
    onMouseMove : function(event) {
        
        this.setMousePosition(event);
        
        if (this.state === "down") {
            
            this.state = "drag";
            
        }
        
    },
    
    onMouseUp : function(event) {
        
        this.setMousePosition(event);
        
        this.state = "up";
        
        if (this.clickTimeoutID) {
            
            clearTimeout(this.clickTimeoutID);
            this.clickTimeoutID = null;
            
        }
        
        this.vectorfield.applyForceField(this.mouse);
        
    },
    
    onClickTimeout : function() {
        
        if (this.state !== "down") {
            
            return;
            
        }
        
        this.state = "drag";
        
    },
    
    onKeyDown : function(event) {
        
        if (event.keyCode === 32) {
            
            
            
        } else if (event.keyCode === 27) {
            
            game.pause();
            
        }
        
    },
    
    setMousePosition : function(event) {
        
        var coords = getRelativeCoordinates(event, canvas);
        this.mouse.set(coords.x / this.vectorfield.cellSize, coords.y / this.vectorfield.cellSize, 0);
        
    }
    
  // onMouseDown: function(event) {
  //   var coordinates = getRelativeCoordinates(event, $("editor"));
  // 
  //   var myEvent = new Event("mouseDown");
  //       myEvent.parameter = event;
  //       myEvent.mouseX = coordinates.x;
  //       myEvent.mouseY = coordinates.y;
  // 
  //   this.dispatchEvent(myEvent);
  // 
  //   this.state = {type: "down", x: coordinates.x, y: coordinates.y};
  // 
  //   var myScope = this;
  //   
  //   this.clickTimeoutID = setTimeout(
  //     
  //     function(coordinates, event) {
  //       myScope.onClickTimeout(coordinates, event);
  //     },
  //      
  //     this.clickTime, coordinates, event
  //   );
  // }, 
  // 
  // onMouseUp: function(event) {
  //   
  //   if (this.clickTimeoutID) {
  //     clearTimeout(this.clickTimeoutID);
  //     this.clickTimeoutID = null;
  //   }
  // 
  //   var type;
  // 
  //   if (this.state.type === "drag") {
  //     
  //     type = "stopDrag";
  //     
  //   } else if (this.state.type === "down") {
  //     
  //     type = "click";
  //     
  //   }
  // 
  //   var coordinates = getRelativeCoordinates(event, $("editor"));
  // 
  //   var myEvent = new Event(type);
  //       myEvent.parameter = event;
  //       myEvent.mouseX = coordinates.x;
  //       myEvent.mouseY = coordinates.y;
  // 
  //   this.state.type = "up";
  // 
  //   this.dispatchEvent(myEvent);
  // },
  // 
  // onMouseMove: function(event) {
  //   
  //   var coordinates = getRelativeCoordinates(event, $("editor"));
  //   
  //   var myEvent = new Event("mouseMove");
  //       myEvent.parameter = event;
  //       myEvent.mouseX = coordinates.x;
  //       myEvent.mouseY = coordinates.y;
  // 
  //   this.dispatchEvent(myEvent);
  // 
  //   if (this.state.type !== "up") {
  //     
  //     myEvent.type = "drag";
  //     this.dispatchEvent(myEvent);
  //     
  //   }
  // 
  //   if (this.state.type === "down") {
  //     var distance = (function(oldX, oldY, newX, newY) {
  //       
  //       var x = newX - oldX;
  //       var y = newY - oldY;
  // 
  //       return Math.sqrt(x * x + y * y);
  //     }(this.state.x, this.state.y, coordinates.x, coordinates.y));
  // 
  //     if (distance > 5) {
  //       
  //       this.onClickTimeout({x: this.state.x, y: this.state.y});
  // 
  //     }
  //   }
  // },
  // 
  // onClickTimeout: function(coordinates, event) {
  // 
  //   if (this.state.type !== "down") {
  //     return;
  //   }
  // 
  //   this.clickTimeoutID = null;
  // 
  //   this.state.type = "drag";
  // 
  //   var myEvent = new Event("startDrag");
  //       myEvent.parameter = event;
  //       myEvent.mouseX = coordinates.x;
  //       myEvent.mouseY = coordinates.y;
  // 
  //   this.dispatchEvent(myEvent);
  // }

};
var InputHandler = function(vectorfield) {
    
    this.vectorfield = vectorfield;
    
    // startDrag, stopDrag, click, mouseDown, mouseUp, mouseMove

    this.state = {type: "unknown"};
    this.latestEvent = null;
    
    this.clickTimeout = null;
    this.clickTime = 250; // in milliseconds;
    

    var self = this;

    document.body.onmousedown = function(event) {
        self.onMouseDown(event);
    };
    // 
    // document.body.onmouseup = function(event) {
    //     self.onMouseUp(event);
    // };
    // 
    // document.body.onmousemove = function(event) {
    //     self.onMouseMove(event);
    // };
    
    document.body.onkeydown = function(event) {
        self.onKeyDown(event);
    };

};

InputHandler.prototype = {
    
    onKeyDown : function(event) {
        
        if(event.keyCode === 27) {
            
            game.pause();
            
        }
        
    },
    
    onMouseDown: function(event) {
        
        var mouse = getRelativeCoordinates(event, canvas);
        
        this.vectorfield.applyForceField(new Vector(mouse.x, mouse.y, 0));
        
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
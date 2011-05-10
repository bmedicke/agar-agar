var Entity = function(position) {
    
    this.position = position;
    this.force = new Vector();
    this.velocity = new Vector();
    this.orientation = new Vector(1, 0, 0);
    
};

Entity.prototype = {
    
    mass : 1,
    
    entityRadius : 0.1,
    
    dampCoefficient : 0.001,
    
    update : function(dt) {
        
        var acceleration = this.force.div(this.mass);
        
    	this.force.set(0, 0, 0);

    	this.velocity.addSelf(acceleration.mul(dt));
        
        var positionChange = this.velocity.mul(dt).addSelf(acceleration.mulSelf(0.5 * dt * dt));
    	this.position.addSelf(positionChange);
        
        this.velocity.mulSelf(1 - this.dampCoefficient * dt);
        
        delete acceleration;
        
        return positionChange;
        
    },
    
    draw : function(gl) {

        gl.drawCircle(this.position.x, this.position.y, this.entityRadius);

    },
    
    destroy : function() {
        
        delete this.position;
        delete this.force;
        delete this.velocity;
        delete this.orientation;
        
        return this;
        
    },
    
    applyForce : function(force) {
        
        this.force.addSelf(force);
        
    },
    
    boundaryCheck : function(vectorfield) {
    
        if (this.position.x - this.entityRadius < 0) {
            
            this.applyForce(new Vector(1, 0, 0));
            
        } else if (this.position.x + this.entityRadius > vectorfield.cols - vectorfield.boundaryOffset.x) {
            
            this.applyForce(new Vector(-1, 0, 0));
            
        } else if (this.position.y - this.entityRadius < 0) {

            this.applyForce(new Vector(0, 1, 0));
            
        } else if (this.position.y + this.entityRadius > vectorfield.rows - vectorfield.boundaryOffset.y) {
            
            this.applyForce(new Vector(0, -1, 0));
            
        }
    }
        
};
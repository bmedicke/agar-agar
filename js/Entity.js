var Entity = function(position) {
    
    this.position = position;
    this.force = new Vector();
    this.velocity = new Vector();
    this.orientation = new Vector();
    
};

Entity.prototype = {
    
    mass : 1,
    
    entityRadius : 0.1,
    
    dampCoefficient : 0.001,
    
    update : function(dt) {
        
        var acceleration = this.force.div(this.mass);
        
    	this.force.set(0, 0, 0);

    	this.velocity.addSelf(acceleration.mul(dt));
    	this.position.addSelf(this.velocity.mul(dt)).addSelf(acceleration.mul(0.5 * dt * dt));
        
        this.velocity.mulSelf(1 - this.dampCoefficient * dt);
        
    },
    
    draw : function(gl) {

        gl.fill();
        gl.drawCircle(this.position.x, this.position.y, this.entityRadius);

    },
    
    applyForce : function(force) {
        
        this.force.addSelf(force);
        
    },
    
    boundaryCheck : function(vectorfield) {
    
        if (this.position.x <= .1) {
            
            this.applyForce(new Vector(1, 0, 0));
            
        } else if (this.position.x >= vectorfield.cols - .1) {
            
            this.applyForce(new Vector(-1, 0, 0));
            
        } else if (this.position.y <= .1) {

            this.applyForce(new Vector(0, 1, 0));
            
        } else if (this.position.y >= vectorfield.rows - .1) {
            
            this.applyForce(new Vector(0, -1, 0));
            
        }
    }
        
};
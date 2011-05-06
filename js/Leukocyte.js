var Leukocyte = function(position) {

	Entity.call(this, position);
	
	this.isActive = true;
	this.activeTimer = 0;
	
};

Leukocyte.prototype = new Entity();
Leukocyte.prototype.constructor = Entity;

Leukocyte.prototype.mass = 300000;
Leukocyte.prototype.moveSpeed = .3;

Leukocyte.prototype.entityRadius = .5;
Leukocyte.prototype.circleResolution = 16;

Leukocyte.prototype.eatTime = 1000;

Leukocyte.initialize = function(gl) {

    this.shader = gl.loadShader("leukocyte-vertex-shader", "leukocyte-fragment-shader");
    
    this.circleBuffer = gl.createCircleBuffer(
        Leukocyte.prototype.entityRadius * 0.5, 
        Leukocyte.prototype.circleResolution
    );
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    this.shader.particleUniformLocation = gl.getUniformLocation(this.shader, "particlePosition");
    
    gl.bindShader(gl.defaultShader);
    
};

Leukocyte.prototype.draw = function(gl) {
    
    gl.pushMatrix();
    
        gl.translate(this.position.x, this.position.y);
        var angle = this.orientation.angle();
        
        gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        if (!this.isActive) {
            
            gl.setColor(.5, .5, .5, 1);
            gl.drawCircle(0, 0, Particle.prototype.entityRadius);
            
        }
        
        gl.setColor(.5, .8, .8, 1);
        gl.drawCircle(0, 0, this.entityRadius);
        
        gl.setColor(.6, .6, .6, 1);
        
        gl.rotate(Math.PI / 4);
        gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
        gl.rotate(-Math.PI / 2);
        gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
    gl.popMatrix();
    
    // gl.setColor(1.0, 0.0, 0.0, 1.0);
    //     gl.drawCircle(this.position.x, this.position.y, this.entityRadius);
    //     
    //     gl.bindShader(Leukocyte.shader);
    //     
    //     gl.pushMatrix();
    //     
    //         gl.translate(this.position.x, this.position.y);
    //         gl.updateMatrix();
    //         
    //         //var point = this.orientation.normalize().mul(this.entityRadius);
    //         //var point = this.particlePosition.sub(this.position);
    //         
    //         gl.uniform2f(
    //             Leukocyte.shader.particleUniformLocation, 
    //             this.orientation.x,
    //             this.orientation.y
    //         );
    //         
    //         gl.passVertices(gl.LINE_LOOP, Leukocyte.circleBuffer);
    //     
    //     gl.popMatrix();
    //     
    //     gl.bindShader(gl.defaultShader);

};

Leukocyte.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    if (!this.isActive) {
        
        this.activeTimer -= dt;

        if (this.activeTimer < 0) {
            
            this.isActive = true;
            
        }
        
    }
    
};

Leukocyte.prototype.eatParticle = function(particlePosition) {
    
    this.isActive = false;
    this.activeTimer = Leukocyte.prototype.eatTime;
    
};

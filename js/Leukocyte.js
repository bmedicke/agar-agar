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
        Leukocyte.prototype.entityRadius * 0.8, 
        Leukocyte.prototype.circleResolution
    );
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    this.shader.particleVectorUniformLocation = gl.getUniformLocation(this.shader, "particleVector");
    
    gl.uniform1f(
        gl.getUniformLocation(this.shader, "radius"),
        Leukocyte.prototype.entityRadius
    );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer);
    
};

Leukocyte.prototype.draw = function(gl) {
    
    // gl.pushMatrix();
    
        // gl.translate(this.position.x, this.position.y);
        // var angle = this.orientation.angle();
        
        // gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        // if (!this.isActive) {
            
            // gl.setColor(.5, .5, .5, 1);
            // gl.drawCircle(0, 0, Particle.prototype.entityRadius);
            
        // }
        
        // gl.setColor(.5, .8, .8, 1);
        // gl.drawCircle(0, 0, this.entityRadius);
        
        // gl.setColor(.6, .6, .6, 1);
        
        // gl.rotate(Math.PI / 4);
        // gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
        // gl.rotate(-Math.PI / 2);
        // gl.drawCircle(this.entityRadius / 2, 0, this.entityRadius / 4);
        
    // gl.popMatrix();
    
    
    gl.bindShader(Leukocyte.shader);
    
    gl.pushMatrix();
        
        gl.translate(this.position.x, this.position.y);
        gl.updateMatrix();

        gl.uniform2f(
            Leukocyte.shader.particleVectorUniformLocation, 
            this.orientation.x,
            this.orientation.y
        );
        
        gl.passVertices(gl.LINE_LOOP, Leukocyte.circleBuffer);
    
    gl.popMatrix();
    
    gl.bindShader(gl.defaultShader);

};

Leukocyte.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    if (!this.isActive) {
    
        this.orientation.mulSelf(this.activeTimer / Leukocyte.prototype.eatTime);
        
        this.activeTimer -= dt;

        if (this.activeTimer < 0) {
            
            this.isActive = true;
            
        }
        
    }
    
};

Leukocyte.prototype.eatParticle = function() {
    
    this.isActive = false;
    
    this.activeTimer = Leukocyte.prototype.eatTime;
    
    this.orientation.normalizeSelf().mulSelf(Leukocyte.prototype.entityRadius);
    
};

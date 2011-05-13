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

Leukocyte.prototype.eatTime = 300;

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
        
    // gl.drawCircle(this.position.x, this.position.y, this.entityRadius);
    // 
    // if (!this.isActive) {
    // 
    //     this.deadParticle.position = this.position.add(this.orientation);
    //     this.deadParticle.draw(gl);
    // 
    // }

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
        
        if (!this.isActive) {
    
            this.deadParticle.position = this.position.add(this.orientation);
            Particle.draw(gl, [this.deadParticle]);
        
        }
    
    gl.popMatrix();

};

Leukocyte.prototype.eatParticle = function(particlePosition) {
    
    this.isActive = false;
    
    this.orientation = particlePosition.sub(this.position);
    this.deadParticle = new Particle(this.orientation);
    
    var self = this;
    
    Animator.animate(
        this.orientation, 
        {"x" : 0, "y" : 0}, 
        Leukocyte.prototype.eatTime * 0.5,
        
        function() {
            
            Animator.animate(
                self.orientation, 
                {"z" : 0.7}, 
                Leukocyte.prototype.eatTime * 0.5,
                function() {
                    self.isActive = true;
                }
            );
            
        }
        
    );
    
};

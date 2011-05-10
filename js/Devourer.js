var Devourer = function(position) {

	Entity.call(this, position);
	
};

Devourer.prototype = new Entity();
Devourer.prototype.constructor = Entity;

Devourer.prototype.mass = 2000000;
Devourer.prototype.moveSpeed = 0.5;

Devourer.prototype.entityRadius = 2.0;
Devourer.prototype.circleResolution = 16;

Devourer.prototype.force = 0.1;
Devourer.prototype.forceRadius = 8.0;
Devourer.prototype.forceAngle = - Math.PI / 6;

Devourer.prototype.rotateSpeed = 0.0005;


Devourer.initialize = function(gl) {
    
    
    this.circleBuffer = gl.createCircleBuffer(
        Devourer.prototype.entityRadius, 
        Devourer.prototype.circleResolution
    );
    
    this.shader = gl.loadShader("devourer-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    
    this.shader.innerRadiusUniformLocation = gl.getUniformLocation(this.shader, "innerRadius");
    this.shader.outerRadiusUniformLocation = gl.getUniformLocation(this.shader, "outerRadius");
    
    gl.bindShader(gl.defaultShader);
    
};

Devourer.prototype.draw = function(gl) {
    
    // gl.pushMatrix();
    //     
    //     gl.translate(this.position.x, this.position.y);
    //     
    //     gl.setColor(.5, .5, .7, 1);
    //     
    //     gl.drawCircle(0, 0, this.entityRadius);
    //     
    //     var angle = this.orientation.angle();
    //     gl.rotate(this.orientation.y < 0 ? -angle : angle);
    //     
    //     gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
    //     
    //     gl.rotate(Math.PI * 2 / 3);
    //     gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
    //     
    //     gl.rotate(Math.PI * 2 / 3);
    //     gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
    //     
    // gl.popMatrix();


    // gl.fill();
    // gl.setColor(0.0, 1.0, 0.0, 1.0);
    // gl.drawCircle(this.position.x, this.position.y, this.forceRadius);
    // gl.setColor(0.0, 0.0, 1.0, 1.0);
    // gl.drawCircle(this.position.x, this.position.y, this.entityRadius);
    // gl.noFill();
    
    gl.bindShader(Devourer.shader);
        
    gl.pushMatrix();
        
            gl.translate(this.position.x, this.position.y);
            gl.updateMatrix();
            
            gl.uniform1f(
                Devourer.shader.innerRadiusUniformLocation,
                this.entityRadius
            );
            
            gl.uniform1f(
                Devourer.shader.outerRadiusUniformLocation,
                this.forceRadius
            );
            
            gl.enableAlpha();
            gl.passVertices(gl.TRIANGLE_FAN, Devourer.circleBuffer);
            gl.disableAlpha();
        
        gl.popMatrix();
        
    gl.bindShader(gl.defaultShader);

};

Devourer.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    // this.orientation.rotate2DSelf(this.rotateSpeed * dt);
    
};
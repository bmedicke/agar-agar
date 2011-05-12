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
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = null;

    this.shader = gl.loadShader("devourer-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    var self = this;
    
    this.texture = gl.loadTexture("textures/tentacles.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.texture);
        
    });
    
    gl.uniform1f(
        gl.getUniformLocation(this.shader, "size"), 
        game.vectorfield.cellSize * 4 * Devourer.prototype.entityRadius
    );
    
};

Devourer.draw = function(gl, devourers) {
    
    if (devourers.length === this.vertexBuffer.vertexCount) {

        for (i = 0; i < devourers.length; i++) {
            
            this.vertexArray[i * 3] = devourers[i].position.x;
            this.vertexArray[i * 3 + 1] = devourers[i].position.y;

        }
        
    } else {
        
        var devourerPositions = [];

        for (i = 0; i < devourers.length; i++) {

            devourerPositions.push(devourers[i].position.x, devourers[i].position.y, 1.0);

        }
        
        this.vertexArray = new Float32Array(devourerPositions);
        this.vertexBuffer.vertexCount = devourers.length;
        
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    
    gl.bindShader(this.shader);
    gl.enableAlpha();
    
    gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    gl.disableAlpha();
    gl.bindShader(gl.defaultShader);

};

Devourer.prototype.draw = function(gl) {
    
    gl.pushMatrix();
        
        gl.translate(this.position.x, this.position.y);
        
        gl.setColor(.5, .5, .7, 1);
        
        gl.drawCircle(0, 0, this.entityRadius);
        
        var angle = this.orientation.angle();
        gl.rotate(this.orientation.y < 0 ? -angle : angle);
        
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
    gl.popMatrix();

};

Devourer.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    this.orientation.rotate2DSelf(this.rotateSpeed * dt);
    
};
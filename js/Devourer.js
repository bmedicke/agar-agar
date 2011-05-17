var Devourer = function(position) {

	Entity.call(this, position);
	
	this.rotation = 0;
	this.speed = 0.0;
	
    this.animateSpeed(true);
	
};

Devourer.prototype = new Entity();
Devourer.prototype.constructor = Entity;

Devourer.prototype.mass = 2000000;
Devourer.prototype.moveSpeed = 0.5;

Devourer.prototype.entityRadius = 2.0;
Devourer.prototype.circleResolution = 16;

Devourer.prototype.force = 0.1;
Devourer.prototype.forceRadius = 8.0;

Devourer.prototype.rotateSpeed = 0.0001;

Devourer.prototype.textureSizeFactor = 2;

Devourer.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 4;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = null;

    this.shader = gl.loadShader("devourer-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    var self = this;
    
    this.texture = gl.loadTexture("textures/tentaclesAlpha.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.texture);
        
    });
    
    gl.uniform1f(
        gl.getUniformLocation(this.shader, "size"), 
        game.vectorfield.cellSize * 2 * Devourer.prototype.textureSizeFactor * Devourer.prototype.entityRadius
    );
    
};

Devourer.draw = function(gl, devourers) {
    
    // for (var i = 0; i < devourers.length; i++) {
    //     
    //     devourers[i].draw(gl);
    //     
    // }
    
    if (devourers.length === this.vertexBuffer.vertexCount) {
    
        for (i = 0; i < devourers.length; i++) {
            
            this.vertexArray[i * 4] = devourers[i].position.x;
            this.vertexArray[i * 4 + 1] = devourers[i].position.y;
            this.vertexArray[i * 4 + 2] = devourers[i].rotation;
            this.vertexArray[i * 4 + 3] = devourers[i].speed;
    
        }
        
    } else {
        
        var devourerPositions = [];
    
        for (i = 0; i < devourers.length; i++) {
    
            devourerPositions.push(
                devourers[i].position.x,
                devourers[i].position.y,
                devourers[i].rotation,
                devourers[i].speed
            );
    
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
        
        gl.rotate(this.rotation);
        
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
        gl.rotate(Math.PI * 2 / 3);
        gl.drawCircle(this.entityRadius / 3 * 2, 0, this.entityRadius / 4);
        
    gl.popMatrix();

};

Devourer.prototype.update = function(dt) {
    
    Entity.prototype.update.call(this, dt);
    
    this.rotation += this.rotateSpeed * dt * this.speed * 10.0;
    
};

Devourer.prototype.animateSpeed = function(clockwise) {
    
    var self = this;
    
    Animator.animate(
        this, 
        {"speed" : (clockwise ? -1.0 : 1.0)}, 
        3000,
        function() {
            
            Animator.animate(
                self, 
                {"speed" : (clockwise ? -1.0 : 1.0)}, 
                5000,
                function() {
                    self.animateSpeed(!clockwise);
                }
            );
            
        }
    );
    
};
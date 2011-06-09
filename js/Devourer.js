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

Devourer.prototype.force = 3.0;
Devourer.prototype.forceRadius = 8.0;

Devourer.prototype.rotateSpeed = 0.0005;

Devourer.prototype.textureSizeFactor = 2;
Devourer.prototype.glowRadius = 4.0;

Devourer.initialize = function(gl) {

    this.shader = gl.loadShader("devourer-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.positionAttribLocation = gl.getAttribLocation(this.shader, "position");
    this.shader.textureCoordAttribLocation = gl.getAttribLocation(this.shader, "textureCoord");
    
    this.shader.speedUniformLocation = gl.getUniformLocation(this.shader, "speed");
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "position"));
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "textureCoord"));
    
    var self = this;
    
    this.tentacleTexture = gl.loadTexture("textures/devourerTentacles.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.tentacleTexture, gl.getUniformLocation( self.shader, "tentacleTexture" ));
        
    });
    
    this.corpusTexture = gl.loadTexture("textures/devourerCorpus2.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.corpusTexture, gl.getUniformLocation( self.shader, "corpusTexture" ));
        
    });
    
};

Devourer.draw = function(gl, devourers) {
    
    // for (var i = 0; i < devourers.length; i++) {
    //     
    //     devourers[i].draw(gl);
    //     
    // }
    
    gl.bindShader(this.shader);
    
    var size = Devourer.prototype.textureSizeFactor * Devourer.prototype.entityRadius * 2;
    
    for (var i = 0; i < devourers.length; i++) {
        
        gl.pushMatrix();
        
        gl.uniform1f(
            this.shader.speedUniformLocation, 
            devourers[i].speed
        );
        
        gl.translate(devourers[i].position.x, devourers[i].position.y);
        gl.scale(size, size);
        gl.rotate(devourers[i].rotation);
        
        gl.passMatrix();
        gl.drawQuadTexture();
        
        gl.popMatrix();
    
    }

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
    
    this.rotation += this.rotateSpeed * dt * this.speed;
    
};

Devourer.prototype.animateSpeed = function(clockwise) {
    
    var self = this;
    
    Animator.animate({
        object: this, 
        values: {"speed" : (clockwise ? -1.0 : 1.0)}, 
        duration: 3000,
        // easing: "easeIn",
        callback: function() {
            
            Animator.animate({
                object: self, 
                values: {"speed" : (clockwise ? -1.0 : 1.0)}, 
                duration: 5000,
                // easing: "easeOut",
                callback: function() {
                    self.animateSpeed(!clockwise);
                }
            });
            
        }
    });
    
};
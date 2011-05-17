var Particle = function(position) {

    Entity.call(this, position);
    
    this.reproductionPotency = false;
    Particle.prototype.count++;

    this.resetReproduction(500 * (Particle.prototype.count % 20));
    
};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

Particle.prototype.mass = 100000;
Particle.prototype.entityRadius = 0.15;
Particle.prototype.separationRadius = 0.3;
Particle.prototype.cohesionRadius = 2;

Particle.prototype.reproductionRadius = .5;
Particle.prototype.reproductionWaitTime = 10000;
Particle.prototype.reproductionVelocity = 0.001

Particle.prototype.count = 0;
Particle.prototype.maxCount = 150;

Particle.prototype.absolutMaxCount = 250;

Particle.prototype.textureSizeFactor = 2;

Particle.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = new Float32Array(Particle.prototype.absolutMaxCount * this.vertexBuffer.itemSize);

    this.shader = gl.loadShader("particle-vertex-shader", "particle-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    var self = this;
    
    this.texture = gl.loadTexture("textures/particle.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.texture);
        
    });
    
    gl.uniform1f(
        gl.getUniformLocation(this.shader, "size"), 
        game.vectorfield.cellSize * 2 * Particle.prototype.textureSizeFactor * Particle.prototype.entityRadius
    );
    
};

Particle.draw = function(gl) {
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    
    gl.bindShader(this.shader);
    gl.enableAlpha();
    
    gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    gl.disableAlpha();
    gl.bindShader(gl.defaultShader);
    
    this.vertexBuffer.vertexCount = 0;

};

Particle.drawEnqueue = function(particles) {
    
    // for (var i = 0; i < particles.length; i++) {
    //     
    //     particles[i].draw(gl);
    //     
    // }
    
    for (i = 0; i < particles.length; i++) {
        
        var index = (this.vertexBuffer.vertexCount + i) * 3;
        
        this.vertexArray[index] = particles[i].position.x;
        this.vertexArray[index + 1] = particles[i].position.y;
        this.vertexArray[index + 2] = particles[i].position.z;
        
    }
    
    this.vertexBuffer.vertexCount += particles.length;
    
};

Particle.prototype.resetReproduction = function(time) {
    
    time = time || this.reproductionWaitTime;
    this.reproductionPotency = false;
    
    var self = this;
    
    setTimeout(function() {
        
        self.reproductionPotency = true;
        
    }, time);
    
};

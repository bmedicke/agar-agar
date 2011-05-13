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

Particle.prototype.cohesionRadius = 2;

Particle.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = null;

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
        game.vectorfield.cellSize * 4 * Particle.prototype.entityRadius
    );
    
};

Particle.draw = function(gl, particles) {
    
    // for (var i = 0; i < particles.length; i++) {
    //     
    //     particles[i].draw(gl);
    //     
    // }
    
    if (particles.length === this.vertexBuffer.vertexCount) {
    
        for (i = 0; i < particles.length; i++) {
            
            this.vertexArray[i * 3] = particles[i].position.x;
            this.vertexArray[i * 3 + 1] = particles[i].position.y;
            this.vertexArray[i * 3 + 2] = particles[i].position.z;
    
        }
        
    } else {
        
        var particlePositions = [];
    
        for (i = 0; i < particles.length; i++) {
    
            particlePositions.push(
                particles[i].position.x,
                particles[i].position.y,
                particles[i].position.z
            );
    
        }
        
        this.vertexArray = new Float32Array(particlePositions);
        this.vertexBuffer.vertexCount = particles.length;
        
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    
    gl.bindShader(this.shader);
    gl.enableAlpha();
    
    gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    gl.disableAlpha();
    gl.bindShader(gl.defaultShader);

};

Particle.prototype.resetReproduction = function(time) {
    
    time = time || this.reproductionWaitTime;
    this.reproductionPotency = false;
    
    var self = this;
    
    setTimeout(function() {
        
        self.reproductionPotency = true;
        
    }, time);
    
};

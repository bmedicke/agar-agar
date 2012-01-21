var Particle = function(position, alpha) {

    Entity.call(this, position);
    
    this.alpha = alpha || 1.0;

};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

extend(Particle.prototype, {

    mass : 100000,
    entityRadius : 0.15,
    separationRadius : 0.3,
    cohesionRadius : 2,

    count : 0,
    maxCount : 150,

    absolutMaxCount : 250,

    textureSizeFactor : 4

});

Particle.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 4;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = new Float32Array(Particle.prototype.absolutMaxCount * this.vertexBuffer.itemSize);

    this.shader = gl.loadShader("particle-vertex-shader", "particle-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.positionAttribLocation = gl.getAttribLocation(this.shader, "position");
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    var self = this;
    
    this.texture = gl.loadTexture("textures/particle.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.texture, gl.getUniformLocation( self.shader, "texture" ));
        
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
    
    gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    this.vertexBuffer.vertexCount = 0;

};

Particle.drawEnqueue = function(particles) {
    
    // for (var i = 0; i < particles.length; i++) {
    //     
    //     particles[i].draw(gl);
    //     
    // }
    
    for (var i = 0; i < particles.length; i++) {
        
        var index = (this.vertexBuffer.vertexCount + i) * 4;
        
        this.vertexArray[index] = particles[i].position.x;
        this.vertexArray[index + 1] = particles[i].position.y;
        this.vertexArray[index + 2] = particles[i].alpha;
        this.vertexArray[index + 3] = particles[i].age * 0.001;
        
    }
    
    this.vertexBuffer.vertexCount += particles.length;
    
};

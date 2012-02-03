var Particle = function(position, alpha) {

    Entity.call(this, position);
    
    this.alpha = typeof alpha === 'number' ? alpha : 1.0;
    
    this.index = Particle.prototype.count++;
    
    this.alive = true;

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

    textureSizeFactor : 4,
    count : 0,

    checkSwarm : function( indices ) {

        var i;

        indices = indices || [];

        if (indices.indexOf(this.index) === -1) {

            indices.push( this.index );

            for (i = 0; i < this.neighbors.length; i++) {

                this.neighbors[i].checkSwarm( indices );

            }

        }

        return indices.length;

    }

});

Particle.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 4;
    this.vertexBuffer.vertexCount = 0;
    
    this.vertexArray = new Float32Array(Particle.prototype.absolutMaxCount * this.vertexBuffer.itemSize);

    var shader = gl.loadShader("particle-vertex-shader", "particle-fragment-shader");
    
    gl.bindShader(shader);
    
    shader.positionAttribLocation = gl.getAttribLocation(shader, "position");
    gl.enableVertexAttribArray(shader.positionAttribLocation);
    
    shader.matrixUniformLocation = gl.getUniformLocation(shader, "matrix");
    gl.passMatrix();
    
    gl.uniform1f(
        gl.getUniformLocation(shader, "size"), 
        game.vectorfield.cellSize * 2 * Particle.prototype.textureSizeFactor * Particle.prototype.entityRadius
    );
    
    var texture = gl.loadTexture("textures/particle.png", function(gl) {
        
        gl.bindShader(shader);
        gl.passTexture(texture, gl.getUniformLocation(shader, "texture"));
        
    });
    
    this.shader = shader;
    this.texture = texture;
    
};

Particle.draw = function(gl) {
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    
    gl.bindShader(this.shader);
    
    gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    this.vertexBuffer.vertexCount = 0;

};

Particle.drawEnqueue = function(particles) {
    
    for (var i = 0; i < particles.length; i++) {
        
        var index = (this.vertexBuffer.vertexCount + i) * 4;
        
        this.vertexArray[index] = particles[i].position.x;
        this.vertexArray[index + 1] = particles[i].position.y;
        this.vertexArray[index + 2] = particles[i].alpha;
        this.vertexArray[index + 3] = particles[i].age * 0.001;
        
    }
    
    this.vertexBuffer.vertexCount += particles.length;
    
};

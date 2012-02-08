var Particle = function( position ) {

    Entity.call(this, position);
    
    this.alpha = 1.0;
    this.alive = true;
    
    this.index = Particle.prototype.count++;

};

Particle.prototype = new Entity();
Particle.prototype.constructor = Entity;

extend(Particle.prototype, {

    mass : 100000,
    entityRadius : 0.15,
	
    separationFactor : 10,
    cohesionFactor : .5,

    count : 0,
    maxCount : 150,

    absolutMaxCount : 250,

    textureSizeFactor : 4,
    count : 0,

    fadeIn : function( duration ) {
        
        this.alpha = 0.0;
        
        var tween = new TWEEN.Tween(this);
        
        tween.to( {alpha : 1.0}, duration);
        tween.start();
        
        return this;
        
    },

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

Particle.getParticleDistances = function(particles) {

	var distances = [];

	for (var i = 0; i < particles.length; i++) {

		distances[i] = [];
		var particle = particles[i];

		for (var j = 0; j < i; j++) {

			distances[i][j] = distances[j][i] = (particle.position.sub(particles[j].position)).normSquared();

		}

	}

	return distances;

};

Particle.applySwarmBehaviour = function(distances, particles, particle, particleCount, separationRadius, cohesionRadius) {

	var separationCenter = new Vector(),
		separationCount = 0,
		cohesionCenter = new Vector(),
		cohesionCount = 0;

	particle.neighbors = [];

	for (var j = 0; j < particleCount; j++) {

		if (typeof distances[j] === 'undefined') {

			continue;

		}

		if (distances[j] < separationRadius * separationRadius) {

			separationCenter.addSelf( particles[j].position );
			separationCount++;

		} else if (distances[j] < cohesionRadius * cohesionRadius) {

			cohesionCenter.addSelf( particles[j].position );
			cohesionCount++;

			particle.neighbors.push( particles[j] );

		}

	}


	if (cohesionCount) {

		cohesionCenter.divSelf(cohesionCount).subSelf(particle.position);

		cohesionCenter.mulSelf((1 / cohesionRadius * cohesionCenter.norm()) * particle.cohesionFactor);

	}

	if (separationCount) {

		separationCenter.divSelf(separationCount).subSelf(particle.position);

		separationCenter.mulSelf((1 / separationRadius * separationCenter.norm() - 1) * particle.separationFactor);

	}

	particle.applyForce(separationCenter.addSelf(cohesionCenter));

	return particle.neighbors.length;

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

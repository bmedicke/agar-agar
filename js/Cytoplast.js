var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
	
	this.spikeState = false;
	this.puke = false;
	this.puking = false;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.spikeMass = 80000;

Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 10;

Cytoplast.prototype.infectionTime = 3000;
Cytoplast.prototype.spikeTime = 5000;
Cytoplast.prototype.pukeTime = 1000;

Cytoplast.prototype.corpusTextureSize = 0.7;
Cytoplast.prototype.spikeTextureSize = 1.0;

Cytoplast.initialize = function(gl) {
	
	this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 2;
    this.vertexBuffer.vertexCount = 1;
	
	this.vertexArray = new Float32Array([0, 0]);

    this.shader = gl.loadShader("cytoplast-vertex-shader", "cytoplast-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");

    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");
	
};

Cytoplast.prototype.update = function(dt) {

	if(this.puking) {

		this.force.set(0, 0, 0);

	}
	
	var positionChange = Entity.prototype.update.call(this, dt);
	
	for (var i = 0; i < this.dockedParticles.length; i++) {
		
		this.dockedParticles[i].position.addSelf(positionChange);
	
	}
	
};

Cytoplast.prototype.draw = function(gl) {

	Cytoplast.vertexArray[0] = this.position.x;
	Cytoplast.vertexArray[1] = this.position.y;

	gl.bindBuffer(gl.ARRAY_BUFFER, Cytoplast.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Cytoplast.vertexArray, gl.STATIC_DRAW);
    
    gl.bindShader(Cytoplast.shader);
	
	gl.passTexture(Cytoplast.corpusTexture);
	
	gl.uniform1f(
        gl.getUniformLocation(Cytoplast.shader, "size"), 
        game.vectorfield.cellSize * 2 * Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.entityRadius
    );
	
    gl.enableAlpha();
    
    gl.passVertices(gl.POINTS, Cytoplast.vertexBuffer);    

	if(this.spikeState) {
		
		gl.passTexture(Cytoplast.spikeTexture);
	
		gl.uniform1f(
			gl.getUniformLocation(Cytoplast.shader, "size"), 
			game.vectorfield.cellSize * 2 * Cytoplast.prototype.spikeTextureSize * Cytoplast.prototype.entityRadius
		);
		
		gl.passVertices(gl.POINTS, Cytoplast.vertexBuffer);

	}
	
	gl.disableAlpha();
    gl.bindShader(gl.defaultShader);
	
	gl.setColor(1.0, 0.0, 0.0, 1);
    Entity.prototype.draw.call(this, gl);
    
    Particle.drawEnqueue(this.dockedParticles);

};

// Cytoplast.drawAll = function(gl, cytoplasts) {

	// if (cytoplasts.length === this.vertexBuffer.vertexCount) {
    
        // for (i = 0; i < cytoplasts.length; i++) {
            
            // this.vertexArray[i * 4] = cytoplasts[i].position.x;
            // this.vertexArray[i * 4 + 1] = cytoplasts[i].position.y;
    
        // }
        
    // } else {
        
        // var devourerPositions = [];
    
        // for (i = 0; i < cytoplasts.length; i++) {
    
            // devourerPositions.push(
                // cytoplasts[i].position.x,
                // cytoplasts[i].position.y
            // );
    
        // }
        
        // this.vertexArray = new Float32Array(devourerPositions);
        // this.vertexBuffer.vertexCount = cytoplasts.length;
        
    // }
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    
    // gl.bindShader(this.shader);
    // gl.enableAlpha();
    
    // gl.passVertices(gl.POINTS, this.vertexBuffer);
    
    // gl.disableAlpha();
    // gl.bindShader(gl.defaultShader);

// };

// Cytoplast.prototype.draw = function(gl) {

	// if(this.spikeState) {
		
		// var spikeVertexArray = new Float32Array([this.position.x, this.position.y]);
		
		// gl.bindBuffer(gl.ARRAY_BUFFER, Cytoplast.spikeBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, spikeVertexArray, gl.STATIC_DRAW);
	
		// gl.bindShader(Cytoplast.spikeShader);
		// gl.enableAlpha();
		
		// gl.passVertices(gl.POINTS, Cytoplast.spikeBuffer);
		
		// gl.disableAlpha();
		// gl.bindShader(gl.defaultShader);
	// }       
	
	// gl.setColor(1.0, 0.0, 0.0, 1);
    // Entity.prototype.draw.call(this, gl);
    
    // Particle.drawEnqueue(this.dockedParticles);

// };

// cytoplast.prototype.draw = function(gl) {
    
    // gl.fill();
    // gl.enablealpha();
    
    // if(!this.spikestate) {

		// gl.setcolor(0.9, 1.0, .9, math.sqrt(this.dockedparticles.length / this.maxfill));
		// entity.prototype.draw.call(this, gl);

	// } else {
	
		// // todo: implement proper spiky drawing
		// gl.setcolor(1.0, 0.0, 0.0, .7);
		// entity.prototype.draw.call(this, gl);
	
	// }
    
    
    // gl.disablealpha();
    // gl.nofill();
    
    
    // gl.setcolor(.7, .7, .5, 1);
    // entity.prototype.draw.call(this, gl);
    
    // particle.drawenqueue(this.dockedparticles);

// };

Cytoplast.prototype.isFull = function() {

    return (this.dockedParticles.length >= this.maxFill);

};

Cytoplast.prototype.checkPuke = function() {

	if(!this.spikeState) {
	
		this.puke = true;
		this.puking = true;
		
		Animator.animate(
			this,
			0,
			Cytoplast.prototype.pukeTime,
			function() {
				this.puking = false;
			}
		);
		
	}

}

Cytoplast.prototype.spikify = function() {

	this.spikeState = true;
	this.mass = Cytoplast.prototype.spikeMass;
	
	Animator.animate(
		this,
		0,
		Cytoplast.prototype.spikeTime,
		function() {
			this.deSpikify();
		}
	);

}

Cytoplast.prototype.deSpikify = function() {
	
	this.spikeState = false;
	this.mass = Cytoplast.prototype.mass;
	this.dockedParticles = [];
	
}

Cytoplast.prototype.dockParticle = function(particlePosition) {

	if(this.dockedParticles.length == 0) {
		
		Animator.animate(
			this,
			0,
			Cytoplast.prototype.infectionTime,
			Cytoplast.prototype.checkPuke
		);
	
	}
    
    var particle = new Particle(particlePosition.getCopy()),
        target = new Vector(1, 0, 0);
    
    target.rotate2DSelf(Math.random() * Math.PI * 2);
    target.mulSelf(Math.random() * (this.entityRadius - 2 * particle.entityRadius));
    target.addSelf(this.position);
    
    Animator.animate(
        particle.position, 
        {"x" : target.x, "y" : target.y}, 
        target.sub(particlePosition).norm() * Cytoplast.prototype.infectionTime
    );
    
    Animator.animate(
        particle.position, 
        {"z" : 0.3}, 
        Cytoplast.prototype.infectionTime
    );
    
    this.dockedParticles.push(particle);
	
	if(this.isFull()) {
	
		this.spikify();
		
	}
    
    delete target;
    
};

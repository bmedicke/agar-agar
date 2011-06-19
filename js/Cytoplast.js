var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
    
    this.color = {
        r : 0.99,
        g : 0.92,
        b : 0.5,
        a : 0
    };
    
    this.spikeState = false;
    this.puking = false;
    
    this.spikeTimer = 0;
    this.squeezing = false;
    
    this.rotation = 0;
    this.rotateSpeed = Cytoplast.prototype.defaultRotateSpeed;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.spikeMass = 80000;
Cytoplast.prototype.pukeForce = 25;
Cytoplast.prototype.defaultAlpha = 0.2;

Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 15;

Cytoplast.prototype.infectionTime = 3000;
Cytoplast.prototype.spikeTime = 10000;
Cytoplast.prototype.pukeTime = 1000;
Cytoplast.prototype.dockTime = 1000;

Cytoplast.prototype.corpusTextureSize = 1.1;
Cytoplast.prototype.spikeTextureSize = 1.9;

Cytoplast.prototype.squeezeTime = 350;
Cytoplast.prototype.inflateTime = 175;
Cytoplast.prototype.squeezeFactor = 0.8;

Cytoplast.prototype.defaultRotateSpeed = 0.0002;
Cytoplast.prototype.spikeRotateSpeed = 0.0006;

Cytoplast.initialize = function(gl) {

    this.shader = gl.loadShader("cytoplast-vertex-shader", "cytoplast-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.positionAttribLocation = gl.getAttribLocation(this.shader, "position");
    this.shader.textureCoordAttribLocation = gl.getAttribLocation(this.shader, "textureCoord");
    
    this.shader.colorUniformLocation = gl.getUniformLocation(this.shader, "color");
    this.textureUniformLocation = gl.getUniformLocation(this.shader, "texture");
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "position"));
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "textureCoord"));
    
    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");
    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");

};

Cytoplast.prototype.update = function(dt) {

    if(this.puking) {

        this.force.set(0, 0, 0);

    }
    
    var rotateStep = this.rotateSpeed * dt;
    
    this.rotation += rotateStep;
    
    this.rotateDockedParticles(rotateStep);
    
    var positionChange = Entity.prototype.update.call(this, dt);
    
    for (var i = 0; i < this.dockedParticles.length; i++) {
        
        this.dockedParticles[i].position.addSelf(positionChange);
    
    }
    
};

Cytoplast.prototype.draw = function(gl) {

    gl.pushMatrix();
    
    gl.translate(this.position.x, this.position.y);
    
    var size;    
    
    gl.bindShader(Cytoplast.shader);
    
    if(this.spikeState) {
    
        gl.uniform4f(
            Cytoplast.shader.colorUniformLocation,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        );
        
        gl.pushMatrix();
        
        size = 2 * this.spikeTextureSize * Cytoplast.prototype.entityRadius;
        
        gl.scale(size, size);
        gl.rotate(this.rotation);

        gl.passMatrix();

        gl.passTexture(Cytoplast.spikeTexture, Cytoplast.textureUniformLocation);
        gl.drawQuadTexture();
        
        gl.popMatrix();
        
        // this.color.a = Math.cos((this.spikeTimer / Cytoplast.prototype.spikeTime * Math.PI * 0.5) * (((Cytoplast.prototype.spikeTime - this.spikeTimer) / Cytoplast.prototype.spikeTime) * 25)) * 0.5 + 0.5;
        var timeRatio = 1 - (this.spikeTimer / Cytoplast.prototype.spikeTime);
        this.color.a = Math.cos(timeRatio * Math.PI * 2 * timeRatio * timeRatio * 20) * -0.1 + 0.3;

    }
    
    gl.uniform4f(
        Cytoplast.shader.colorUniformLocation,
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a
    );
    
    size = 2 * this.corpusTextureSize * Cytoplast.prototype.entityRadius;
    
    gl.scale(size, size);
    gl.rotate(this.rotation);
    
    gl.passMatrix();
    
    gl.passTexture(Cytoplast.corpusTexture, Cytoplast.textureUniformLocation);
    gl.drawQuadTexture();
    
    this.color.a = Cytoplast.prototype.defaultAlpha;
    
    gl.bindShader(gl.defaultShader);
    
    gl.popMatrix();
    
    Particle.drawEnqueue(this.dockedParticles);

};

Cytoplast.prototype.rotateDockedParticles = function(angle) {

    var targetVector = new Vector(),
        rotatedTargetVector = new Vector();
    
    for(var i = 0; i < this.dockedParticles.length; i++) {
    
        targetVector = this.dockedParticles[i].position.sub(this.position);
        
        rotatedTargetVector = targetVector.rotate2D(angle);
        
        rotatedTargetVector.subSelf(targetVector);
        
        this.dockedParticles[i].position.addSelf(rotatedTargetVector);
    
    }

};

Cytoplast.prototype.isFull = function() {

    return (this.dockedParticles.length >= this.maxFill);

};

Cytoplast.prototype.puke = function(addNewParticles) {

    this.puking = true;    
    
    Animator.animate({
        
        object: this,
        duration: Cytoplast.prototype.inflateTime / 2,
        callback: function() {
        
            if(addNewParticles) {
            
                game.controller.addParticlesAt(this.dockedParticles.length, this.position, Cytoplast.prototype.entityRadius / 2);
                
                this.dockedParticles = [];
            
            }
        
            game.vectorfield.addForcefield(new Forcefield(
                this.position.clone(),
                this.entityRadius * 2,
                Cytoplast.prototype.pukeForce,
                false,
                Math.PI
            ));
        
        }
       
    });
    
    Animator.animate({       
        
        object: this,
        duration: Cytoplast.prototype.inflateTime / 2 + Cytoplast.prototype.pukeTime,
        callback: function() {
        
            this.puking = false;
        
        }
       
    });

};

Cytoplast.prototype.checkPuke = function() {

    if(!this.spikeState) {
    
        this.puking = true;

        this.squeeze();
        
        Animator.animate({
            object: this,
            duration: Cytoplast.prototype.squeezeTime,
            callback: function() {
            
                this.puke(true);
            
            }
        });
        
    }

}

Cytoplast.prototype.spikify = function() {

    this.spikeTextureSize = Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor;
    
    this.squeeze();
    
    Animator.animate({
        object: this,
        duration: Cytoplast.prototype.squeezeTime,
        callback: function() {
        
            if(!this.spikeState) {

                this.spikeState = true;
                
                this.mass = Cytoplast.prototype.spikeMass;
                this.spikeTimer = Cytoplast.prototype.spikeTime;
                this.rotateSpeed = Cytoplast.prototype.spikeRotateSpeed;
                this.puke(false);
                
                Animator.animate({
                    object: this,
                    values: {"spikeTextureSize" : Cytoplast.prototype.spikeTextureSize},
                    duration: Cytoplast.prototype.inflateTime,
                    callback: Cytoplast.prototype.deSpikify
                });
            
            }
        
        }
    });

}

Cytoplast.prototype.deSpikify = function() {

    Animator.animate({
        object: this,
        values: {"spikeTimer" : 0},
        duration: Cytoplast.prototype.spikeTime,
        callback: function() {
        
            Animator.animate({
                object: this,
                values: {"spikeTextureSize" : Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor},
                duration: Cytoplast.prototype.squeezeTime,
                callback: function() {
                
                    this.spikeState = false;
                    this.mass = Cytoplast.prototype.mass;
                    this.dockedParticles = [];
                    this.rotateSpeed = Cytoplast.prototype.defaultRotateSpeed;
                
                }
            });
        
        }
    });
    
}

Cytoplast.prototype.squeeze = function() {

    if(!this.squeezing) {

        this.squeezing = true;
        
        Animator.animate({
            object: this,
            values: {"corpusTextureSize" : Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor},
            duration: Cytoplast.prototype.squeezeTime,
            callback: Cytoplast.prototype.inflate
        });

    }
    
};

Cytoplast.prototype.inflate = function() {
    
    Animator.animate({
        object: this,
        values: {"corpusTextureSize" : Cytoplast.prototype.corpusTextureSize},
        duration: Cytoplast.prototype.inflateTime,
        callback: function() {
        
            this.squeezing = false;
        
        }
    });

};

Cytoplast.prototype.accelerateParticle = function(particle) {

    var target = new Vector(1, 0, 0);
    
    target.rotate2DSelf(Math.random() * Math.PI * 2);
    target.mulSelf(Math.random() * (this.entityRadius - 2 * particle.entityRadius));
    target.addSelf(this.position);
    
    Animator.animate({
        object: particle.position, 
        values: {"x" : target.x, "y" : target.y}, 
        duration: Cytoplast.prototype.dockTime * 0.5,
        easing: "easeOut"
    });
    
    if(this.isFull() && !this.spikeState && !this.puking) {
    
        this.spikify();
        
    }

};

Cytoplast.prototype.dockParticle = function(particlePosition) {

    if(this.dockedParticles.length == 0) {
        
        Animator.animate({
            object: this,
            duration: Cytoplast.prototype.infectionTime,
            callback: Cytoplast.prototype.checkPuke
        });
    
    }
    
    var particle = new Particle(particlePosition.clone()),
        target = particle.position.sub(this.position);
        
    target.normalizeSelf();
    target.mulSelf(Cytoplast.prototype.entityRadius);
    target.addSelf(this.position);
    
    this.dockedParticles.push(particle);
    
    var self = this;
    
    Animator.animate({
        object: particle.position, 
        values: {"x" : target.x, "y" : target.y}, 
        duration: Cytoplast.prototype.dockTime,
        callback: function() {
            self.accelerateParticle(particle);
        }
    });
    
    Animator.animate({
        object: particle, 
        values: {"alpha" : 0.3}, 
        duration: Cytoplast.prototype.infectionTime
    });
    
};

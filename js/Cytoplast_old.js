var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
    
    this.color = [0.99, 0.92, 0.5, 0.15];
    
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

    var size;
    
    gl.bindShader(gl.textureShader);

    gl.passColor(this.color);

    gl.pushMatrix();
    
    gl.translate(this.position.x, this.position.y);
    gl.rotate(this.rotation);

    if (this.spikeState) {
        
        size = 2 * this.spikeTextureSize * Cytoplast.prototype.entityRadius;
        
        gl.pushMatrix();
        
        gl.scale(size, size);
        gl.passMatrix();
        
        gl.passTexture(Cytoplast.spikeTexture);
        gl.drawQuadTexture();
        
        gl.popMatrix();
        
        var color = this.color.concat(),
            timeRatio = (1 - (this.spikeTimer / Cytoplast.prototype.spikeTime)) * 5;
        
        color[3] = Math.sin(timeRatio * timeRatio * timeRatio) * color[3] + color[3] / 2;
        
        gl.passColor(color);
    
    }

    size = 2 * this.corpusTextureSize * Cytoplast.prototype.entityRadius;
    
    gl.scale(size, size);   
    
    gl.passMatrix();
    
    gl.passTexture(Cytoplast.corpusTexture);
    gl.drawQuadTexture();
    
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

Cytoplast.initialize = function(gl) {

    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");
    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");

};

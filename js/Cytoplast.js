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
    this.rotateSpeed = this.defaultRotateSpeed;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

extend(Cytoplast.prototype, {

    mass : 800000,
    spikeMass : 80000,
    pukeForce : 25,
    defaultAlpha : 0.2,

    entityRadius : 2,
    moveSpeed : 0,
    maxFill : 15,

    infectionTime : 3000,
    spikeTime : 10000,
    pukeTime : 1000,
    dockTime : 1000,

    corpusTextureSize : 1.1,
    spikeTextureSize : 1.9,

    squeezeTime : 350,
    inflateTime : 175,
    squeezeFactor : 0.8,

    defaultRotateSpeed : 0.0002,
    spikeRotateSpeed : 0.0006,

    update : function(dt) {

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

    },

    draw : function(gl) {

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
        
            size = 2 * this.spikeTextureSize * this.entityRadius;
        
            gl.scale(size, size);
            gl.rotate(this.rotation);

            gl.passMatrix();

            gl.passTexture(Cytoplast.spikeTexture, Cytoplast.textureUniformLocation);
            gl.drawQuadTexture();
        
            gl.popMatrix();
        
            // this.color.a = Math.cos((this.spikeTimer / this.spikeTime * Math.PI * 0.5) * (((this.spikeTime - this.spikeTimer) / this.spikeTime) * 25)) * 0.5 + 0.5;
            var timeRatio = 1 - (this.spikeTimer / this.spikeTime);
            this.color.a = Math.cos(timeRatio * Math.PI * 2 * timeRatio * timeRatio * 20) * -0.1 + 0.3;

        }
    
        gl.uniform4f(
            Cytoplast.shader.colorUniformLocation,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        );
    
        size = 2 * this.corpusTextureSize * this.entityRadius;
    
        gl.scale(size, size);
        gl.rotate(this.rotation);
    
        gl.passMatrix();
    
        gl.passTexture(Cytoplast.corpusTexture, Cytoplast.textureUniformLocation);
        gl.drawQuadTexture();
    
        this.color.a = this.defaultAlpha;
    
        gl.bindShader(gl.defaultShader);
    
        gl.popMatrix();
    
        Particle.drawEnqueue(this.dockedParticles);

    },

    rotateDockedParticles : function(angle) {

        var targetVector = new Vector(),
            rotatedTargetVector = new Vector();
    
        for(var i = 0; i < this.dockedParticles.length; i++) {
    
            targetVector = this.dockedParticles[i].position.sub(this.position);
        
            rotatedTargetVector = targetVector.rotate2D(angle);
        
            rotatedTargetVector.subSelf(targetVector);
        
            this.dockedParticles[i].position.addSelf(rotatedTargetVector);
    
        }

    },

    isFull : function() {

        return (this.dockedParticles.length >= this.maxFill);

    },

    puke : function(addNewParticles) {

        this.puking = true;    
    
        Animator.animate({
        
            object: this,
            duration: this.inflateTime / 2,
            callback: function() {
        
                if(addNewParticles) {
            
                    game.controller.addParticlesAt(this.dockedParticles.length, this.position, this.entityRadius / 2);
                
                    this.dockedParticles = [];
            
                }
        
                game.vectorfield.addForcefield(new Forcefield(
                    this.position.clone(),
                    this.entityRadius * 2,
                    this.pukeForce,
                    false,
                    Math.PI
                ));
        
            }
       
        });
    
        Animator.animate({       
        
            object: this,
            duration: this.inflateTime / 2 + this.pukeTime,
            callback: function() {
        
                this.puking = false;
        
            }
       
        });

    },

    checkPuke : function() {

        if(!this.spikeState) {
    
            this.puking = true;

            this.squeeze();
        
            Animator.animate({
                object: this,
                duration: this.squeezeTime,
                callback: function() {
            
                    this.puke(true);
            
                }
            });
        
        }

    },

    spikify : function() {

        this.spikeTextureSize = this.corpusTextureSize * this.squeezeFactor;
    
        this.squeeze();
    
        Animator.animate({
            object: this,
            duration: this.squeezeTime,
            callback: function() {
        
                if(!this.spikeState) {

                    this.spikeState = true;
                
                    this.mass = this.spikeMass;
                    this.spikeTimer = this.spikeTime;
                    this.rotateSpeed = this.spikeRotateSpeed;
                    this.puke(false);
                
                    Animator.animate({
                        object: this,
                        values: {"spikeTextureSize" : this.spikeTextureSize},
                        duration: this.inflateTime,
                        callback: this.deSpikify
                    });
            
                }
        
            }
        });

    },

    deSpikify : function() {

        Animator.animate({
            object: this,
            values: {"spikeTimer" : 0},
            duration: this.spikeTime,
            callback: function() {
        
                Animator.animate({
                    object: this,
                    values: {"spikeTextureSize" : this.corpusTextureSize * this.squeezeFactor},
                    duration: this.squeezeTime,
                    callback: function() {
                
                        this.spikeState = false;
                        this.mass = this.mass;
                        this.dockedParticles = [];
                        this.rotateSpeed = this.defaultRotateSpeed;
                
                    }
                });
        
            }
        });
    
    },

    squeeze : function() {

        if(!this.squeezing) {

            this.squeezing = true;
        
            Animator.animate({
                object: this,
                values: {"corpusTextureSize" : this.corpusTextureSize * this.squeezeFactor},
                duration: this.squeezeTime,
                callback: this.inflate
            });

        }
    
    },

    inflate : function() {
    
        Animator.animate({
            object: this,
            values: {"corpusTextureSize" : this.corpusTextureSize},
            duration: this.inflateTime,
            callback: function() {
        
                this.squeezing = false;
        
            }
        });

    },

    accelerateParticle : function(particle) {

        var target = new Vector(1, 0, 0);
    
        target.rotate2DSelf(Math.random() * Math.PI * 2);
        target.mulSelf(Math.random() * (this.entityRadius - 2 * particle.entityRadius));
        target.addSelf(this.position);
    
        Animator.animate({
            object: particle.position, 
            values: {"x" : target.x, "y" : target.y}, 
            duration: this.dockTime * 0.5,
            easing: "easeOut"
        });
    
        if(this.isFull() && !this.spikeState && !this.puking) {
    
            this.spikify();
        
        }

    },

    dockParticle : function(particlePosition) {

        if(this.dockedParticles.length == 0) {
        
            Animator.animate({
                object: this,
                duration: this.infectionTime,
                callback: this.checkPuke
            });
    
        }
    
        var particle = new Particle(particlePosition.clone()),
            target = particle.position.sub(this.position);
        
        target.normalizeSelf();
        target.mulSelf(this.entityRadius);
        target.addSelf(this.position);
    
        this.dockedParticles.push(particle);
    
        var self = this;
    
        Animator.animate({
            object: particle.position, 
            values: {"x" : target.x, "y" : target.y}, 
            duration: this.dockTime,
            callback: function() {
                self.accelerateParticle(particle);
            }
        });
    
        Animator.animate({
            object: particle, 
            values: {"alpha" : 0.3}, 
            duration: this.infectionTime
        });

    }
    
});

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

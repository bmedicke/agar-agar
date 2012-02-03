var Devourer = function( position ) {

    Entity.call(this, position);
    
    this.rotation = 0;
    this.speed = 0.0;
    
    this.growth = 0.0;
    
    this.animateSpeed(true);
    this.clockwise = randBool();
    
    this.growthTween = null;
    
};

Devourer.prototype = new Entity();
Devourer.prototype.constructor = Entity;

extend(Devourer.prototype, {

    mass : 2000000,

    moveSpeed : 0.8,
    minSpeed : 0.4,
    maxSpeed : 0.8,

    entityRadius : 0.6,
    minRadius : 0.6,
    maxRadius : 1.0,

    forceValue : 3.0,
    minForceValue : 3.0,
    maxForceValue : 6.0,

    forceRadius : 6.0,
    minForceRadius : 6.0,
    maxForceRadius : 8.0,

    rotateSpeed : 0.0005,

    textureSizeFactor : 8.0,
    glowRadius : 4.0,

    update : function(dt) {
    
        Entity.prototype.update.call(this, dt);
    
        this.rotation += this.rotateSpeed * dt * (this.clockwise ? 1 : -1);
    
    },

    animateSpeed : function(clockwise) {
    
        var tween = new TWEEN.Tween(this);
        
        tween.to( { speed : (clockwise ? -1.0 : 1.0) }, 3000 );
        
        tween.onComplete( function() {
            
            this.animateSpeed(!clockwise);
            
        });
        
        tween.easing(TWEEN.Easing.Quadratic.EaseInOut);
        
        tween.start();
    
    },
    
    eatEntity : function( percent ) {
        
        var growth = clamp( this.growth + percent, 0, 1);
        
        if ( this.growthTween ) {
            
            this.growthTween.stop();
            
        }
        
        this.growthTween = new TWEEN.Tween( this );
        
        this.growthTween.to( {'growth' : growth}, 1000 );
        
        this.growthTween.onUpdate( function() {
            
            this.entityRadius = map( this.growth, 0, 1, this.minRadius, this.maxRadius );
            this.moveSpeed = map( 1 - this.growth, 0, 1, this.minSpeed, this.maxSpeed );
        
            this.forceRadius = map( this.growth, 0, 1, this.minForceRadius, this.maxForceRadius );
            this.forceValue = map( this.growth, 0, 1, this.minForceValue, this.maxForceValue );
            
        });
        
        this.growthTween.onComplete( function() {
            
            this.growthTween = null;
            
        });
        
        this.growthTween.start();
        
    }

});

Devourer.initialize = function(gl) {

    var shader = gl.loadShader("texture-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(shader);
    
    shader.positionAttribLocation = gl.getAttribLocation(shader, "position");
    shader.textureCoordAttribLocation = gl.getAttribLocation(shader, "textureCoord");
    
    shader.speedUniformLocation = gl.getUniformLocation(shader, "speed");
    shader.sizeUniformLocation = gl.getUniformLocation(shader, "size");
    shader.matrixUniformLocation = gl.getUniformLocation(shader, "matrix");
    
    gl.enableVertexAttribArray(shader.positionAttribLocation);
    gl.enableVertexAttribArray(shader.textureCoordAttribLocation);
    
    var self = this;
    
    this.tentacleTexture = gl.loadTexture("textures/devourerTentacles.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.tentacleTexture, gl.getUniformLocation( self.shader, "tentacleTexture" ));
        
    });
    
    this.corpusTexture = gl.loadTexture("textures/devourerCorpus2.png", function(gl) {
        
        gl.bindShader(self.shader);
        gl.passTexture(self.corpusTexture, gl.getUniformLocation( self.shader, "corpusTexture" ));
        
    });
    
    this.shader = shader;


    this.forcefield = new Forcefield(
        null,
        Devourer.prototype.forceRadius,
        Devourer.prototype.force,
        false,
        0.0
    );

};

Devourer.draw = function(gl, devourers) {
    
    gl.bindShader(this.shader);
    
    for (var i = 0; i < devourers.length; i++) {
        
        var devourer = devourers[i],
            size = devourer.textureSizeFactor;
        
        gl.uniform1f(
            this.shader.speedUniformLocation, 
            devourer.speed
        );
        
        gl.uniform1f(
            this.shader.sizeUniformLocation, 
            devourer.entityRadius
        );
        
        gl.pushMatrix();
        
        gl.translate(devourer.position.x, devourer.position.y);
        
        gl.scale(size, size);
        gl.rotate(devourer.rotation);
        
        gl.passMatrix();
        gl.drawQuadTexture();
        
        gl.popMatrix();
    
    }

};

Devourer.applyVortices = function(dt, entities) {

    var forcefield = this.forcefield;

    for (var i = 0; i < entities.length; i++) {

        forcefield.position = forcefield.point = entities[i].position;
        forcefield.angle = (entities[i].speed + 1) * (entities[i].clockwise ? -0.5 : 0.5);

        forcefield.force = entities[i].forceValue;
        forcefield.radius = entities[i].forceRadius;

        game.vectorfield.applyForcefield(dt, forcefield);

    }

};
var Devourer = function(position) {

    Entity.call(this, position);
    
    this.rotation = 0;
    this.speed = 0.0;
    
    this.animateSpeed(true);
    this.clockwise = randBool();
    
};

Devourer.prototype = new Entity();
Devourer.prototype.constructor = Entity;

extend(Devourer.prototype, {

    mass : 2000000,
    moveSpeed : 0.5,

    entityRadius : 2.0,
    circleResolution : 16,

    force : 3.0,
    forceRadius : 8.0,

    rotateSpeed : 0.0005,

    textureSizeFactor : 2,
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
    
    }

});

Devourer.initialize = function(gl) {

    var shader = gl.loadShader("texture-vertex-shader", "devourer-fragment-shader");
    
    gl.bindShader(shader);
    
    shader.positionAttribLocation = gl.getAttribLocation(shader, "position");
    shader.textureCoordAttribLocation = gl.getAttribLocation(shader, "textureCoord");
    
    shader.speedUniformLocation = gl.getUniformLocation(shader, "speed");
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
    
    var size = Devourer.prototype.textureSizeFactor * Devourer.prototype.entityRadius * 2;
    
    for (var i = 0; i < devourers.length; i++) {
        
        gl.uniform1f(
            this.shader.speedUniformLocation, 
            devourers[i].speed
        );
        
        gl.pushMatrix();
        
        gl.translate(devourers[i].position.x, devourers[i].position.y);
        
        gl.scale(size, size);
        gl.rotate(devourers[i].rotation);
        
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

        game.vectorfield.applyForcefield(dt, forcefield);

    }

};
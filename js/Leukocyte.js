var Leukocyte = function(position) {

    Entity.call(this, position);
    
    this.isActive = true;
    this.angle = rand(-1, 1) * Math.PI;

};

Leukocyte.prototype = new Entity();
Leukocyte.prototype.constructor = Entity;

extend(Leukocyte.prototype, {

    mass : 300000,
    moveSpeed : 0.3,

    entityRadius : 1.0,

    eatTime : 300,

    absolutMaxCount : 30,
    textureSizeFactor : 2.0,

    update : function(dt) {
    
        this.angle = checkAngle(this.angle);
    
        this.angle += checkAngle(this.orientation.angle() - this.angle) * 0.1;
    
        // TODO: remove vector created at normalize
        this.applyForce(this.orientation.normalize().mulSelf(this.moveSpeed));
    
        Entity.prototype.update.call(this, dt);
    
    },

    eatParticle : function(particlePosition) {
        
        var orient = this.orientation;
    
        this.isActive = false;
    
        orient.copy(particlePosition).subSelf(this.position);
        this.deadParticle = new Particle(particlePosition.copy(orient));
    
        var self = this,
            tween = new TWEEN.Tween(orient);
    
        tween.to( {x : orient.x * 0.0000001, y : orient.y * 0.0000001}, this.eatTime * 0.5);
    
        tween.onComplete( function() {
    
            tween = new TWEEN.Tween(self.deadParticle);
    
            tween.to( {alpha : 0.7}, self.eatTime * 0.5);
    
            tween.onComplete( function() {
                
                self.isActive = true;
                
            })
            
            tween.start();
    
        });
        
        tween.start();

    }
    
});

Leukocyte.initialize = function(gl) {
    
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 2;
    
    this.vertexArray = new Float32Array(Leukocyte.prototype.absolutMaxCount * this.vertexBuffer.itemSize);
    
    this.paramsBuffer = gl.createBuffer();
    this.paramsBuffer.itemSize = 4;
    
    this.paramsArray = new Float32Array(Leukocyte.prototype.absolutMaxCount * this.paramsBuffer.itemSize);
    
    this.indexBuffer = gl.createBuffer();
    this.indexBuffer.itemSize = 1;
    
    var length = Leukocyte.prototype.absolutMaxCount * this.indexBuffer.itemSize,
        indexArray = [];
    
    for (var i = 0; i < length; i++) {
        
        indexArray.push(i);
        
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    var shader = gl.loadShader("leukocyte-vertex-shader", "leukocyte-fragment-shader");
    
    gl.bindShader(shader);
    
    shader.matrixUniformLocation = gl.getUniformLocation(shader, "matrix");
    gl.passMatrix();
    
    gl.uniform1f(
        gl.getUniformLocation(shader, "size"), 
        game.vectorfield.cellSize * 2 * Leukocyte.prototype.textureSizeFactor * Leukocyte.prototype.entityRadius
    );
    
    gl.uniform1f(
        gl.getUniformLocation(shader, "radius"),
        Leukocyte.prototype.entityRadius
    );
    
    this.positionAttribLocation = gl.getAttribLocation(shader, "position");
    this.paramsAttribLocation = gl.getAttribLocation(shader, "params");
    
    gl.enableVertexAttribArray(this.positionAttribLocation);
    gl.enableVertexAttribArray(this.paramsAttribLocation);
    
    var texture = gl.loadTexture("textures/leukocyte2.png", function(gl) {
        
        gl.bindShader(shader);
        gl.passTexture(texture, gl.getUniformLocation(shader, "texture"));
        
    });
    
    this.shader = shader;
    this.texture = texture;
    
};

Leukocyte.draw = function(gl, leukocytes) {
    
    var vertexArray = this.vertexArray,
        paramsArray = this.paramsArray;
    
    for (var i = 0; i < leukocytes.length; i++) {
        
        var leukocyte = leukocytes[i],
            pos = leukocyte.position,
            orient = leukocyte.orientation;
        
        vertexArray[i * 2] = pos.x;
        vertexArray[i * 2 + 1] = pos.y;
        
        paramsArray[i * 4] = orient.norm();
        paramsArray[i * 4 + 1] = orient.angle();
        paramsArray[i * 4 + 2] = leukocyte.angle;
        paramsArray[i * 4 + 3] = leukocyte.age * 0.001;
        
        if (!leukocyte.isActive) {
        
            leukocyte.deadParticle.position.copy(pos).addSelf(orient);
            Particle.drawEnqueue([leukocyte.deadParticle]);
        
        }
        
    }
    
    gl.bindShader(this.shader);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(this.positionAttribLocation, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.paramsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, paramsArray, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(this.paramsAttribLocation, this.paramsBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.POINTS, leukocytes.length, gl.UNSIGNED_SHORT, 0);

};

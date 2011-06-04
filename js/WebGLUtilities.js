
WebGLRenderingContext.prototype.matrix = new Matrix();
WebGLRenderingContext.prototype.matrixStack = [];
WebGLRenderingContext.prototype.matrixChanged = false;


WebGLRenderingContext.prototype.pushMatrix = function() {
    
    var m = this.matrix.getCopy();
    
    this.matrixStack.push(m);
    
};

WebGLRenderingContext.prototype.popMatrix = function() {
    
    if (this.matrixStack.length) {
        
        delete this.matrix.destroy();
        this.matrix = this.matrixStack.pop();
        
        this.matrixChanged = true;
        
    }
    
};

WebGLRenderingContext.prototype.updateMatrix = function() {
    
    if (this.matrixChanged) {
        
        this.matrixChanged = false;
        
        this.passMatrix();
        
    }
    
};

WebGLRenderingContext.prototype.rotate = function(phi) {
    
    this.matrix.rotate2DSelf(phi);
    
    this.matrixChanged = true;
    
};

WebGLRenderingContext.prototype.scale = function(x, y) {
    
    this.matrix.scale2DSelf(x, y);
    
    this.matrixChanged = true;
    
};

WebGLRenderingContext.prototype.translate = function(x, y) {
    
    this.matrix.translate2DSelf(x, y);
    
    this.matrixChanged = true;
    
};

WebGLRenderingContext.prototype.setColor = function(r, g, b, a) {
    
    this.passColor([ r, g, b, a ]);

};

WebGLRenderingContext.prototype.enableAlpha = function() {

    this.enable(this.BLEND);
    this.blendFunc(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA);
    
};

WebGLRenderingContext.prototype.disableAlpha = function() {

    this.disable(this.BLEND);
    
};

WebGLRenderingContext.prototype.isFilled = true;

WebGLRenderingContext.prototype.fill = function() {
    
    this.isFilled = true;

};

WebGLRenderingContext.prototype.noFill = function() {
    
    this.isFilled = false;

};

WebGLRenderingContext.prototype.drawRect = function(x, y, width, height) {
    
    this.pushMatrix();
    
    this.translate(x, y);
    this.scale(width, height);

    
    this.updateMatrix();

    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.passVertices(drawMode, this.rectBuffer);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.drawLine = function(x1, y1, x2, y2) {
    
    this.lineArray.set([
        x1, y1, 1.0,
        x2, y2, 1.0
    ]);
    
    this.bindBuffer(this.ARRAY_BUFFER, this.lineBuffer);
    // this.bufferSubData(this.ARRAY_BUFFER, 0, this.lineArray);
    this.bufferData(this.ARRAY_BUFFER, this.lineArray, this.STATIC_DRAW);
    
    this.updateMatrix();
    this.passVertices(this.LINE_STRIP, this.lineBuffer);
    
};

WebGLRenderingContext.prototype.drawCircle = function(x, y, radius) {
    
    this.pushMatrix();
    
    this.translate(x, y);
    this.scale(radius, radius);

    this.updateMatrix();
    
    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.passVertices(drawMode, this.circleBuffer);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.initUtilityBuffers = function() {

    this.lineBuffer = this.createBuffer();
    this.lineBuffer.itemSize = 3;
    this.lineBuffer.vertexCount = 2;
    
    this.lineArray = new Float32Array(6);
    
    // this.bindBuffer(this.ARRAY_BUFFER, this.lineBuffer);
    // this.bufferData(this.ARRAY_BUFFER, this.lineArray.byteLength, this.STATIC_DRAW);
    
    
    var rectVertices = [
        0, 0, 1,
        1, 0, 1,
        1, 1, 1,
        0, 1, 1
    ];
    
    this.rectBuffer = this.createBuffer();
    this.rectBuffer.itemSize = 3;
    this.rectBuffer.vertexCount = 4;
    
    this.bindBuffer(this.ARRAY_BUFFER, this.rectBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(rectVertices), this.STATIC_DRAW);
    
    
    this.circleBuffer = this.createCircleBuffer(1, 24);
    
    
    var texCoords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    
    this.quadTextureCoordsBuffer = this.createBuffer();
    this.quadTextureCoordsBuffer.itemSize = 2;
    this.quadTextureCoordsBuffer.vertexCount = 4;
    
    this.bindBuffer(this.ARRAY_BUFFER, this.quadTextureCoordsBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(texCoords), this.STATIC_DRAW);
    
    
    this.quadIndexBuffer = this.createBuffer();
    this.quadIndexBuffer.itemSize = 1;
    this.quadIndexBuffer.vertexCount = 4;
    
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
    this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 3]), this.STATIC_DRAW);
    
};

WebGLRenderingContext.prototype.createCircleBuffer = function(radius, resolution) {
    
    var vertex = new Vector(radius, 0, 1),
        circleVertices = [];
        
    for (var i = 0; i < resolution; i++) {
    
        circleVertices.push(vertex.x, vertex.y, vertex.z);
        
        vertex.rotate2DSelf((Math.PI * 2) / resolution);
    
    }
    
    var circleBuffer = this.createBuffer();
    
    circleBuffer.itemSize = 3;
    circleBuffer.vertexCount = resolution;
    
    this.bindBuffer(this.ARRAY_BUFFER, circleBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(circleVertices), this.STATIC_DRAW);
    
    return circleBuffer;
    
};

WebGLRenderingContext.prototype.setupDefaultShader = function() {
    
    this.defaultShader = this.loadShader("vertex-shader", "fragment-shader");
    
    this.bindShader(this.defaultShader);
    
    this.defaultShader.colorUniformLocation = this.getUniformLocation(this.defaultShader, "color");
    this.defaultShader.matrixUniformLocation = this.getUniformLocation(this.defaultShader, "matrix");
    
    var positionAttribLocation = 0;
    this.enableVertexAttribArray(positionAttribLocation);
    
    this.passMatrix();
    this.passColor([0, 0, 0, 1.0]);
    
};

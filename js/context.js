
WebGLRenderingContext.prototype.matrix = new Matrix();
WebGLRenderingContext.prototype.matrixStack = [];
WebGLRenderingContext.prototype.matrixChanged = false;


WebGLRenderingContext.prototype.pushMatrix = function() {
    
    var m = (new Matrix()).copy(this.matrix);
    
    this.matrixStack.push(m);
    
};

WebGLRenderingContext.prototype.popMatrix = function() {
    
    if (this.matrixStack.length) {
        
        this.matrix = this.matrixStack.pop();
        
        this.matrixChanged = true;
        
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
    
    this.defaultShader.passColor(gl, [ r, g, b, a ]);

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

    this.defaultShader.passVertices(this, this.rectBuffer);

    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.drawArrays(drawMode, 0, 4);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.drawLine = function(x1, y1, x2, y2) {
    
    this.lineArray.set([
        x1, y1, 1.0,
        x2, y2, 1.0
    ]);
    
    // this.lineArray[0] = x1;
    // this.lineArray[1] = y1;
    // this.lineArray[3] = x2;
    // this.lineArray[4] = y2;
    
    this.bindBuffer(this.ARRAY_BUFFER, this.lineBuffer);
    // this.bufferSubData(this.ARRAY_BUFFER, 0, this.lineArray);
    this.bufferData(this.ARRAY_BUFFER, this.lineArray, this.STATIC_DRAW);
    
    this.defaultShader.passVertices(this, this.lineBuffer);

    this.drawArrays(this.LINE_STRIP, 0, 2);
    
};

WebGLRenderingContext.prototype.drawCircle = function(x, y, radius) {
    
    this.pushMatrix();
    
    this.translate(x, y);
    this.scale(radius, radius);

    this.defaultShader.passVertices(this, this.circleBuffer);
    
    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.drawArrays(drawMode, 0, this.circleResolution);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.initBuffers = function() {

    this.lineBuffer = this.createBuffer();
    this.lineBuffer.itemSize = 3;
    
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
    
    this.bindBuffer(this.ARRAY_BUFFER, this.rectBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(rectVertices), this.STATIC_DRAW);
    
    
    this.circleResolution = 24;
    
    var vertex = new Vector(1, 0, 1),
        circleVertices = [];
        
    for (var i = 0; i < this.circleResolution; i++) {
    
        circleVertices.push(vertex.x, vertex.y, vertex.z);
        
        vertex.rotate2DSelf((Math.PI * 2) / this.circleResolution);
    
    }
    
    this.circleBuffer = this.createBuffer();
    this.circleBuffer.itemSize = 3;
    
    this.bindBuffer(this.ARRAY_BUFFER, this.circleBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(circleVertices), this.STATIC_DRAW);
    
};

WebGLRenderingContext.prototype.setupDefaultShader = function() {
    
    this.defaultShader = new Shader(this, "vertex-shader", "fragment-shader");
    
    this.setColor(0, 0, 0, 1.0);
    
};

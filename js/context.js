
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
    
    this.uniform4fv(
        this.colorUniformLocation, 
        new Float32Array([ r, g, b, a ])
    );

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

    this.bindBuffer(this.ARRAY_BUFFER, this.rectBuffer);
    this.passVerticesToShader(this.defaultShader);

    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.drawArrays(drawMode, 0, 4);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.drawLine = function(x1, y1, x2, y2) {

    var vertices = [
        x1, y1, 1,
        x2, y2, 1
    ];
    
    this.bindBuffer(this.ARRAY_BUFFER, this.vertexBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(vertices), this.STATIC_DRAW);
    
    this.passVerticesToShader(this.defaultShader);

    this.drawArrays(this.LINE_STRIP, 0, 2);
    
};

WebGLRenderingContext.prototype.drawCircle = function(x, y, radius) {
    
    this.pushMatrix();
    
    this.translate(x, y);
    this.scale(radius, radius);

    this.bindBuffer(this.ARRAY_BUFFER, this.circleBuffer);
    this.passVerticesToShader(this.defaultShader);
    
    var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
    this.drawArrays(drawMode, 0, this.circleResolution);
    
    this.popMatrix();
    
};

WebGLRenderingContext.prototype.initBuffers = function() {

    this.vertexBuffer = this.createBuffer();
    
    
    var rectVertices = [
        0, 0, 1,
        1, 0, 1,
        1, 1, 1,
        0, 1, 1
    ];
    
    this.rectBuffer = this.createBuffer();
        
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
    
    this.bindBuffer(this.ARRAY_BUFFER, this.circleBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(circleVertices), this.STATIC_DRAW);
    
    var positionAttribLocation = 0;
    this.enableVertexAttribArray(positionAttribLocation);
    
};

WebGLRenderingContext.prototype.setupDefaultShader = function() {

    var vertexShader = this.loadShader("vertex-shader"),
        fragmentShader = this.loadShader("fragment-shader");
    
    this.defaultShader = this.linkShaderProgram(vertexShader, fragmentShader);
    
    this.useProgram(this.defaultShader);
    
    this.matrixUniformLocation = this.getUniformLocation(this.defaultShader, "matrix");
    this.colorUniformLocation = this.getUniformLocation(this.defaultShader, "color");
    
    this.setColor(0, 0, 0, 1.0);
    
};

WebGLRenderingContext.prototype.loadShader = function(id) {
    
    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    var shaderSource = "",
        textNodeType = 3,
        currentChild = shaderScript.firstChild;

    while (currentChild) {
        
        if (currentChild.nodeType == textNodeType) {
            
            shaderSource += currentChild.textContent;
            
        }
        
        currentChild = currentChild.nextSibling;
    }


    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {

        shader = this.createShader(this.FRAGMENT_SHADER);

    } else if (shaderScript.type == "x-shader/x-vertex") {

        shader = this.createShader(this.VERTEX_SHADER);

    } else {

        return null;

    }


    this.shaderSource(shader, shaderSource);

    this.compileShader(shader);

    if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
        
        log("An error occurred compiling the shaders: " + this.getShaderInfoLog(shader));
        return null;
        
    }

    return shader;

};

WebGLRenderingContext.prototype.linkShaderProgram = function(vertexShader, fragmentShader) {

    var shaderProgram = this.createProgram();

    this.attachShader(shaderProgram, vertexShader);
    this.attachShader(shaderProgram, fragmentShader);
    
    this.linkProgram(shaderProgram);


    if (!this.getProgramParameter(shaderProgram, this.LINK_STATUS)) {

        log("Unable to initialize the shader program.");

    }
    
    return shaderProgram;
    
};

WebGLRenderingContext.prototype.passVerticesToShader = function(shader) {
    
    var positionAttribLocation = 0;
    this.vertexAttribPointer(positionAttribLocation, 3, this.FLOAT, false, 0, 0);
    
    this.passMatrixToShader(this.defaultShader);
    
};


WebGLRenderingContext.prototype.passMatrixToShader = function(shader) {
    
    if (this.matrixChanged) {

        this.matrixChanged = false;

        this.uniformMatrix4fv(
            this.matrixUniformLocation, 
            false, 
            new Float32Array(this.matrix.transpose().flatten4D())
        );
    
    }
    
};

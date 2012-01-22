var WebGLUtilities = function() {

    this.matrix = new Matrix();
    this.matrixStack = [];
    this.matrixChanged = false;


    this.pushMatrix = function() {
    
        var m = this.matrix.clone();
    
        this.matrixStack.push(m);
    
    };

    this.popMatrix = function() {
    
        if (this.matrixStack.length) {
        
            this.matrix = this.matrixStack.pop();
        
            this.matrixChanged = true;
        
        }
    
    };

    this.updateMatrix = function() {
    
        if (this.matrixChanged) {
        
            this.matrixChanged = false;
        
            this.passMatrix();
        
        }
    
    };

    this.rotate = function(phi) {
    
        this.matrix.rotate2DSelf(phi);
    
        this.matrixChanged = true;
    
    };

    this.scale = function(x, y) {
    
        this.matrix.scale2DSelf(x, y);
    
        this.matrixChanged = true;
    
    };

    this.translate = function(x, y) {
    
        this.matrix.translate2DSelf(x, y);
    
        this.matrixChanged = true;
    
    };

    this.setColor = function(r, g, b, a) {
    
        this.passColor([ r, g, b, a ]);

    };

    this.enableAlpha = function() {

        this.enable(this.BLEND);
        this.blendFunc(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA);

    };

    this.disableAlpha = function() {

        this.disable(this.BLEND);
    
    };

    this.isFilled = true;

    this.fill = function() {
    
        this.isFilled = true;

    };

    this.noFill = function() {
    
        this.isFilled = false;

    };

    this.drawRect = function(x, y, width, height) {
    
        this.pushMatrix();
    
        this.translate(x, y);
        this.scale(width, height);

    
        this.updateMatrix();

        var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
        this.passVertices(drawMode, this.rectBuffer);
    
        this.popMatrix();
    
    };

    this.drawLine = function(x1, y1, x2, y2) {
    
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

    this.drawCircle = function(x, y, radius) {
    
        this.pushMatrix();
    
        this.translate(x, y);
        this.scale(radius, radius);

        this.updateMatrix();
    
        var drawMode = this.isFilled ? this.TRIANGLE_FAN : this.LINE_LOOP;
        this.passVertices(drawMode, this.circleBuffer);
    
        this.popMatrix();
    
    };

    this.initUtilityBuffers = function() {

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
    
    
        this.quadVertexBuffer = gl.createBuffer();
        this.quadVertexBuffer.itemSize = 2;
        this.quadVertexBuffer.vertexCount = 4;
    
        var vertexArray = new Float32Array([
            -0.5, -0.5,
            0.5, -0.5,
            0.5, 0.5,
            -0.5, 0.5
        ]);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    
    
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

    this.createCircleBuffer = function(radius, resolution) {
    
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

    this.setupDefaultShader = function() {
    
        var shader = this.loadShader("vertex-shader", "fragment-shader");
    
        this.bindShader(shader);
    
        shader.colorUniformLocation = this.getUniformLocation(shader, "color");
        shader.matrixUniformLocation = this.getUniformLocation(shader, "matrix");
    
        shader.positionAttribLocation = this.getAttribLocation(shader, "position");
        this.enableVertexAttribArray(shader.positionAttribLocation);
    
        this.passMatrix();
        this.passColor([0, 0, 0, 1.0]);

        this.defaultShader = shader;
    
    };

    this.setupTextureShader = function() {
    
        var shader = this.loadShader("texture-vertex-shader", "texture-fragment-shader");
    
        this.bindShader(shader);
    
        shader.colorUniformLocation = this.getUniformLocation(shader, "color");
        shader.matrixUniformLocation = this.getUniformLocation(shader, "matrix");
        shader.textureUniformLocation = this.getUniformLocation(shader, "texture");
    
        shader.positionAttribLocation = this.getAttribLocation(shader, "position");
        this.enableVertexAttribArray(shader.positionAttribLocation);
        
        shader.textureCoordAttribLocation = this.getAttribLocation(shader, "textureCoord");
        this.enableVertexAttribArray(shader.textureCoordAttribLocation);
    
        this.passMatrix();
        this.passColor([0, 0, 0, 0]);

        this.textureShader = shader;
    
    };

};

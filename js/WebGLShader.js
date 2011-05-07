WebGLRenderingContext.prototype.loadShader = function(vertexShaderID, fragmentShaderID) {
    
    var vertexShader = this.loadShaderScript(vertexShaderID),
        fragmentShader = this.loadShaderScript(fragmentShaderID);

    return this.linkShaderProgramm(vertexShader, fragmentShader);
    
};

WebGLRenderingContext.prototype.loadShaderScript = function(shaderScriptID) {
    
    var shaderScript = document.getElementById(shaderScriptID);

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

        log("shader compile ERROR: " + this.getShaderInfoLog(shader));
        return null;

    }

    return shader;
        
};
    
WebGLRenderingContext.prototype.linkShaderProgramm = function(vertexShader, fragmentShader) {
    
    var shaderProgram = this.createProgram();

    this.attachShader(shaderProgram, vertexShader);
    this.attachShader(shaderProgram, fragmentShader);

    this.linkProgram(shaderProgram);


    if (!this.getProgramParameter(shaderProgram, this.LINK_STATUS)) {

        log("Unable to initialize the shader program.");

    }

    return shaderProgram;
    
};

WebGLRenderingContext.prototype.activeShader = null;

WebGLRenderingContext.prototype.bindShader = function(shader) {
    
    this.useProgram(shader);
    this.activeShader = shader;
    
};

WebGLRenderingContext.prototype.passMatrix = function() {
    
    this.uniformMatrix4fv(
        this.activeShader.matrixUniformLocation, 
        false, 
        new Float32Array(this.matrix.flatten4D())
    );

};

WebGLRenderingContext.prototype.passColor = function(color) {
    
    this.uniform4fv(
        this.activeShader.colorUniformLocation, 
        new Float32Array(color)
    );

};

WebGLRenderingContext.prototype.passVertices = function(drawMode, buffer) {
    
    this.bindBuffer(this.ARRAY_BUFFER, buffer);

    var positionAttribLocation = 0;
    this.vertexAttribPointer(positionAttribLocation, buffer.itemSize, this.FLOAT, false, 0, 0);
    
    this.drawArrays(drawMode, 0, buffer.vertexCount);
    
};

WebGLRenderingContext.prototype.passTexture = function(texture) {
    
    this.activeTexture( this.TEXTURE0 );
    this.bindTexture( this.TEXTURE_2D, texture );
    this.uniform1i( this.getUniformLocation( this.activeShader, "texture" ), 0 );
    
};
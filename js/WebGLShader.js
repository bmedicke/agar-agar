WebGLRenderingContext.prototype.loadShader = function(vertexShaderID, fragmentShaderID) {
    
    var vertexShader = this.loadShaderScript(vertexShaderID),
        fragmentShader = this.loadShaderScript(fragmentShaderID);

    return this.linkShaderProgramm(vertexShader, fragmentShader);
    
};

WebGLRenderingContext.prototype.loadShaderScript = function(shaderScriptID) {
    
    var shaderScript = document.getElementById(shaderScriptID),
        shader;

    if (shaderScript.type === "x-shader/x-fragment") {

        shader = gl.createShader(gl.FRAGMENT_SHADER);

    } else if (shaderScript.type === "x-shader/x-vertex") {

        shader = gl.createShader(gl.VERTEX_SHADER);

    } else {

        return null;

    }


    gl.shaderSource(shader, shaderScript.text);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.log("shader " + gl.getShaderInfoLog(shader));
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
    
    this.activeTexture( this["TEXTURE" + texture.ID] );
    this.bindTexture( this.TEXTURE_2D, texture );
    this.uniform1i( this.getUniformLocation( this.activeShader, "texture" ), texture.ID );
    
};
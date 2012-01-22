var WebGLShader = function() {

    this.loadShader = function(vertexShaderID, fragmentShaderID) {
    
        var vertexShader = this.loadShaderScript(vertexShaderID),
            fragmentShader = this.loadShaderScript(fragmentShaderID);

        return this.linkShaderProgramm(vertexShader, fragmentShader);
    
    };

    this.loadShaderScript = function(shaderScriptID) {
    
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
    
    this.linkShaderProgramm = function(vertexShader, fragmentShader) {
    
        var shaderProgram = this.createProgram();

        this.attachShader(shaderProgram, vertexShader);
        this.attachShader(shaderProgram, fragmentShader);

        this.linkProgram(shaderProgram);


        if (!this.getProgramParameter(shaderProgram, this.LINK_STATUS)) {

            log("Unable to initialize the shader program.");

        }

        return shaderProgram;
    
    };

    this.activeShader = null;

    this.bindShader = function(shader) {
    
        this.useProgram(shader);
        this.activeShader = shader;
    
    };

    this.passMatrix = function() {
    
        this.uniformMatrix4fv(
            this.activeShader.matrixUniformLocation, 
            false, 
            new Float32Array(this.matrix.flatten4D())
        );

    };

    this.passColor = function(color) {
    
        this.uniform4fv(
            this.activeShader.colorUniformLocation, 
            new Float32Array(color)
        );

    };

    this.passVertices = function(drawMode, buffer) {
    
        this.bindBuffer(this.ARRAY_BUFFER, buffer);
        this.vertexAttribPointer(this.activeShader.positionAttribLocation, buffer.itemSize, this.FLOAT, false, 0, 0);
    
        this.drawArrays(drawMode, 0, buffer.vertexCount);
    
    };

    this.passTexture = function(texture, uniformLocation) {
    
        this.activeTexture( this["TEXTURE" + texture.ID] );
        this.bindTexture( this.TEXTURE_2D, texture );
        this.uniform1i( uniformLocation || this.activeShader.textureUniformLocation, texture.ID );
    
    };

    this.drawQuadTexture = function() {
    
        this.bindBuffer(this.ARRAY_BUFFER, this.quadVertexBuffer);
        this.vertexAttribPointer(this.activeShader.positionAttribLocation, this.quadVertexBuffer.itemSize, this.FLOAT, false, 0, 0);

        this.bindBuffer(this.ARRAY_BUFFER, this.quadTextureCoordsBuffer);
        this.vertexAttribPointer(this.activeShader.textureCoordAttribLocation, this.quadTextureCoordsBuffer.itemSize, this.FLOAT, false, 0, 0);

        this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
        this.drawElements(this.TRIANGLE_FAN, this.quadIndexBuffer.vertexCount, this.UNSIGNED_SHORT, 0);
    
    };

};
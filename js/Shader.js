var Shader = function(gl, vertexShaderID, fragmentShaderID) {
    
    var vertexShader = this.loadShader(gl, vertexShaderID),
        fragmentShader = this.loadShader(gl, fragmentShaderID);

    this.shaderProgramm = this.linkProgramm(gl, vertexShader, fragmentShader);

    this.bind(gl);

    this.matrixUniformLocation = gl.getUniformLocation(this.shaderProgramm, "matrix");
    this.colorUniformLocation = gl.getUniformLocation(this.shaderProgramm, "color");
    
    var positionAttribLocation = 0;
    gl.enableVertexAttribArray(positionAttribLocation);
    
};

Shader.prototype = {
    
    loadShader : function(gl, shaderID) {
        
        var shaderScript = document.getElementById(shaderID);

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

            shader = gl.createShader(gl.FRAGMENT_SHADER);

        } else if (shaderScript.type == "x-shader/x-vertex") {

            shader = gl.createShader(gl.VERTEX_SHADER);

        } else {

            return null;

        }


        gl.shaderSource(shader, shaderSource);

        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            log("shader compile ERROR: " + gl.getShaderInfoLog(shader));
            return null;

        }

        return shader;
        
    },
    
    linkProgramm : function(gl, vertexShader, fragmentShader) {
        
        var shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        gl.linkProgram(shaderProgram);


        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {

            log("Unable to initialize the shader program.");

        }

        return shaderProgram;
        
    },
    
    bind : function(gl) {
        
        gl.useProgram(this.shaderProgramm);
        
    },
    
    passMatrix : function(gl) {

        if (gl.matrixChanged) {

            gl.matrixChanged = false;

            gl.uniformMatrix4fv(
                this.matrixUniformLocation, 
                false, 
                new Float32Array(gl.matrix.transpose().flatten4D())
            );

        }

    },
    
    passColor : function(gl, color) {

        gl.uniform4fv(
            this.colorUniformLocation, 
            new Float32Array(color)
        );

    },
    
    passVertices : function(gl, buffer) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        var positionAttribLocation = 0;
        gl.vertexAttribPointer(positionAttribLocation, buffer.itemSize, gl.FLOAT, false, 0, 0);

        this.passMatrix(gl);
        
    }
    
};
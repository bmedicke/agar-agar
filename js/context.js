WebGLRenderingContext.prototype.loadShader = function(id) {
    
    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var shaderSource = "",
        textNodeType = 3,
        currentChild = shaderScript.firstChild;

    while(currentChild) {
        
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

WebGLRenderingContext.prototype.setupDefaultShader = function() {

	var vertexShader = this.loadShader("vertex-shader");
	var fragmentShader = this.loadShader("fragment-shader");
	
	this.defaultShader = this.linkShaderProgram(vertexShader, fragmentShader);
	
	this.useProgram(this.defaultShader);
	
};

/*WebGLRenderingContext.prototype.setColor = function(r, g, b, a) {

	var colors = [
        1.0, 0, 0, 1.0,
        0, 0, 0, 1.0,
        0, 0, 0, 1.0,
        0, 0, 0, 1.0
    ];

    colorBuffer = this.createBuffer();
    
    this.bindBuffer(this.ARRAY_BUFFER, colorBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(colors), this.STATIC_DRAW);

};*/

WebGLRenderingContext.prototype.drawRect = function(x, y, width, height) {
    
    var vertexBuffer = this.createBuffer();

    this.bindBuffer(this.ARRAY_BUFFER, vertexBuffer);

    var vertices = [
        x, y, 0,
        x + width, y, 0,
        x, y + height, 0,
        x + width, y + height, 0
    ];

    this.bufferData(this.ARRAY_BUFFER, new Float32Array(vertices), this.STATIC_DRAW);
	
	var vertexPositionAttribute = this.getAttribLocation(this.defaultShader, "position");
    this.enableVertexAttribArray(vertexPositionAttribute);
    
    this.vertexAttribPointer(vertexPositionAttribute, 3, this.FLOAT, false, 0, 0);
	
	var colors = [
        1.0, 0, 0, 1.0
    ];

    var colorUniform = this.getUniformLocation(this.defaultShader, "color");
    this.uniform4fv(colorUniform, new Float32Array(colors));

	
    var matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    var mUniform = this.getUniformLocation(this.defaultShader, "matrix");
    this.uniformMatrix4fv(mUniform, false, new Float32Array(matrix));


    this.drawArrays(this.TRIANGLE_STRIP, 0, 4);
    
};
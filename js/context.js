
var vertexShaderScript = [

    "attribute vec3 position;",
    "attribute vec4 color;",

    "uniform mat4 matrix;",

    "varying vec4 vColor;",

    "void main(void) {",
    
        "gl_Position = matrix * vec4(position, 1.0);",
        
        "vColor = color;",
        
        //"vColor = vec4(position, 1.0) * 0.5 + vec4(0.5, 0.5, 0.5, 0.5);",
        
    "}"
  
].join("\n");


var fragmentShaderScript = [

    "#ifdef GL_ES",
        "precision highp float;",
    "#endif",

    "varying vec4 vColor;",

    "void main(void) {",
    
        "gl_FragColor = vColor;",
        
    "}"
    
].join("\n");




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
    
    var colors = [
        1.0, 0, 0, 1.0,
        0, 0, 0, 1.0,
        0, 0, 0, 1.0,
        0, 0, 0, 1.0
    ];

    colorBuffer = this.createBuffer();
    
    this.bindBuffer(this.ARRAY_BUFFER, colorBuffer);
    this.bufferData(this.ARRAY_BUFFER, new Float32Array(colors), this.STATIC_DRAW);
    
    var vertexShader = this.createShader(this.VERTEX_SHADER);
    this.shaderSource(vertexShader, vertexShaderScript);
    this.compileShader(vertexShader);
    
    if (!this.getShaderParameter(vertexShader, this.COMPILE_STATUS)) {
          
        log("An error occurred compiling the shaders: " + this.getShaderInfoLog(vertexShader));
        return null;

    }


    var fragmentShader = this.createShader(this.FRAGMENT_SHADER);
    this.shaderSource(fragmentShader, fragmentShaderScript);
    this.compileShader(fragmentShader);
    
    if (!this.getShaderParameter(fragmentShader, this.COMPILE_STATUS)) {
        
        log("An error occurred compiling the shaders: " + this.getShaderInfoLog(fragmentShader));
        return null;
        
    }


    var shaderProgram = this.createProgram();

    this.attachShader(shaderProgram, vertexShader);
    this.attachShader(shaderProgram, fragmentShader);

    this.linkProgram(shaderProgram);


    if (!this.getProgramParameter(shaderProgram, this.LINK_STATUS)) {
  
        alert("Unable to initialize the shader program.");

    }

    this.useProgram(shaderProgram);

    var vertexPositionAttribute = this.getAttribLocation(shaderProgram, "position");
    this.enableVertexAttribArray(vertexPositionAttribute);

    var vertexColorAttribute = this.getAttribLocation(shaderProgram, "color");
    this.enableVertexAttribArray(vertexColorAttribute);
    
    
    this.bindBuffer(this.ARRAY_BUFFER, vertexBuffer);
    this.vertexAttribPointer(vertexPositionAttribute, 3, this.FLOAT, false, 0, 0);

    this.bindBuffer(this.ARRAY_BUFFER, colorBuffer);
    this.vertexAttribPointer(vertexColorAttribute, 4, this.FLOAT, false, 0, 0);


    var matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    var mUniform = this.getUniformLocation(shaderProgram, "matrix");
    this.uniformMatrix4fv(mUniform, false, new Float32Array(matrix));


    this.drawArrays(this.TRIANGLE_STRIP, 0, 4);
    
};
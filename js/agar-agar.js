var canvas,
    gl,
    game,
    time;

function initialize() {
    
    time = (new Date()).getTime();
    
    canvas = document.getElementById("canvas");
    
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    game = new Game(width, height);
    
    
    var cellSize = game.vectorfield.cellSize;
    
    canvas.width = width = game.vectorfield.cols * cellSize;
    canvas.height = height = game.vectorfield.rows * cellSize;
    
    
    gl = canvas.getContext("experimental-webgl");
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0, 0, width, height);
    // gl.enable(gl.DEPTH_TEST);
    
    gl.translate(-1, 1);
    gl.scale(1 / (width / 2) * cellSize, -1 / (height / 2) * cellSize);

    gl.setupDefaultShader();    
    gl.initBuffers();
    
};

function run() {

    requestAnimationFrame(run, canvas);
    
    var t = (new Date()).getTime();
    var dt = t-time;
    time = t;
    
    if (!game.isPaused) {
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        
        gl.setColor(1, 0, 0, 1);
        gl.drawRect(0, 0, 1, 1);
        
        game.update(dt);
        game.draw(gl);

    }
    
};

window.onload = function() {   
    
    initialize();
    run();

};

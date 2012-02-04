var canvas,
    gl,
    game,
    time,
    oddFrame;

function initialize() {
    
    canvas = document.getElementById("canvas");
    
    var cellSize = game.vectorfield.initSize(window.innerWidth, window.innerHeight);
    
    canvas.width = game.vectorfield.cols * cellSize;
    canvas.height = game.vectorfield.rows * cellSize;
    
    gl = canvas.getContext("experimental-webgl");
    
    WebGLShader.call(gl);
    WebGLTexture.call(gl);
    WebGLUtilities.call(gl);
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.enable(gl.DEPTH_TEST);
    
    gl.translate(-1, 1);
    gl.scale(1 / (canvas.width / 2) * cellSize, -1 / (canvas.height / 2) * cellSize);
    
    gl.lineWidth(2.0);
    gl.fill();
    gl.enableAlpha();

    gl.setupDefaultShader();  
    gl.setupTextureShader();
    gl.initUtilityBuffers();
    
    game.initialize(gl);
    
    time = (new Date()).getTime();
    
    initSound();
    
};

function initSound() {
    
    Leukocyte.eatSound = {play : function() {}};
    Devourer.leukoKillSound = {play : function() {}};
    
    // disable debug mode after development/testing..
    soundManager.debugMode = false;
    
    // Sound Manager 2
    soundManager.onready(function(){
        
        var bgSound = soundManager.createSound({
            id: 'bgSound',
            url: 'sounds/background.ogg',
            volume: 10
        });
        
        Leukocyte.eatSound = soundManager.createSound({
            id: 'leukocyte_eatSound',
            url: 'sounds/leukocyte_eat.ogg',
            volume: 25
        });
        
        Devourer.leukoKillSound = soundManager.createSound({
            id: 'leukocyte_dead',
            url: 'sounds/leukocyte_dead.ogg',
            volume: 50
        });
          
        function loopSound(sound) {
            sound.play({
                onfinish: function() {
                    loopSound(sound);
                }
            });
        }
        
        loopSound(bgSound);
        
        Menu.toggleSound();
        
    });
    
}

function run() {

    requestAnimationFrame(run, canvas);
    
    oddFrame = !oddFrame;
    
    var dt;
    
    if (oddFrame) {
        
        var t = (new Date()).getTime();
        
        dt = t - time;
        dt = dt > 30 ? 30 : dt;
        
        time = t;
        
    }
    
    if (game.state === "init" || game.state === "run") {
        
        if (oddFrame) {
            
            game.update(dt);
            
        } else {
            
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            game.draw(gl);
            
        }
        
    }
    
};

window.onload = function() {
    
    game = new Game();
    
    oddFrame = true;
    
    Menu.initialize();
    
    if (!window.WebGLRenderingContext) {
        
        game.state = "pause";
        
        Menu.showErrorScreen();
        return;
        
    }
    
    initialize();
    
    run();

};

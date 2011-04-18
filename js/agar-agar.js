var c = console;

var canvas,
    context,
    game;

function initialize() {
    
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
    
    context = canvas.getContext("experimental-webgl");
    
    // game = new Game();
    
};

function run() {
    requestAnimationFrame(run, canvas);
    
    // game.update();
    // game.draw(context);
};

window.onload = function() {   
     
    initialize();
    run();

};
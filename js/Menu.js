var Menu = {
    
    menuOpen : false,
    musicOn : true,
    
    hideInfo : function(){
        
        $("#newgame").hide();
        $("#instructions").hide();
        $("#versions").hide();
        $("#about").hide();
        $("#feedback").hide();
        $("#donate").hide();
        $("#loser").hide();
        $("#error").hide();
        
    },

    toggle : function(){
        
        if(game.state === "init") {
            
            return;
            
        } else if (game.state === "over") {
            
            game.state = "pause";
            this.startNewGame();
            return;
            
        }

        $("#menu").slideToggle("fast");

        if(this.menuOpen){
            document.getElementById("playpause").style.backgroundImage = "url(images/pause.png)";
            document.getElementById("playpause").style.removeProperty("opacity");

            $("#overlay").fadeTo("slow", 0.0, function() {
                $("#overlay").hide();
            });

            game.state = "run";
            this.hideInfo();
			
			soundManager.pauseAll();
			soundManager.resume("bgSound");
        }
        else{
            document.getElementById("playpause").style.backgroundImage = "url(images/play.png)";
            document.getElementById("playpause").style.opacity = "0.4";

            $("#overlay").show();
            $("#overlay").fadeTo("slow", 0.7);

            game.state = "pause";
			
			soundManager.resumeAll();
        }

        this.menuOpen = !this.menuOpen;

    },
    
    open : function() {
        
        if (!this.menuOpen) {
            
            this.toggle();
            
        }
        
    },
    
    close : function() {
        
        if (this.menuOpen) {
            
            this.toggle();
            
        }
        
    },
    
    initialize : function() {

        document.getElementById("playpause").onselectstart = function() {return false;};
        document.getElementById("stopmusic").onselectstart = function() {return false;};
        document.getElementById("points").onselectstart = function() {return false;};
        document.getElementById("multiplier").onselectstart = function() {return false;};

        if (navigator.appVersion.indexOf("Mac") !== -1){
        
            document.getElementById("playpause").style.paddingTop = "5px";
            document.getElementById("stopmusic").style.paddingTop = "5px";
        
        }
        
        $("#points").mousedown(function(event) {
            game.inputHandler.onMouseDown(event);
        });
        
        $("#multiplier").mousedown(function(event) {
            game.inputHandler.onMouseDown(event);
        });
        
        $("#playpause").click(function () {
            Menu.toggle();
        });
        
        $("#stopmusic").click( this.toggleSound );  
        
        $("#newg").click(function() { 
            Menu.hideInfo();
            $("#newgame").show();
        });

        $("#inst").click(function() { 
            Menu.hideInfo();
            $("#instructions").show();
        });

        $("#vers").click(function() { 
            Menu.hideInfo();
            $("#versions").show();
        });

        $("#abou").click(function() { 
            Menu.hideInfo();
            $("#about").show();
        });

        $("#feed").click(function() { 
            Menu.hideInfo();
            $("#feedback").show();
        });

        $("#dona").click(function() { 
            Menu.hideInfo();
            $("#donate").show();
        });

        $("#startnewgame").click(function() {
            Menu.startNewGame();
        });
        
        $("#tryagain").click(function() {
            Menu.startNewGame();
        });
        
        $("#overlay").click(function() {
            Menu.close();
        });
        
        $(".close").click(function () {
            Menu.close();
        });
        
    },
    
    updatePoints : function(points) {
        
        $("#pointvalue").text(points);
        
    },
    
    updateMultiplierPoints : function(points) {
        
        $("#multiplierpoints").text(points);
        
    },
    
    updateMultiplier : function(multiplier) {
        
        $("#multipliervalue").text('x' + multiplier);
        
        if (multiplier > 1) {
            
            $("#multiplier").show();
            this.updateCooldown(1);
            
        } else {
            
            $("#multiplier").hide();
            $("#multiplierpoints").text("0");
            
        }
        
    },
    
    updateCooldown : function(multiplierCooldown) {
        
        $("#multipliercooldown").width(multiplierCooldown * 100 + "%");
        
    },
    
    startNewGame : function() {
        
        this.close();
        this.hideInfo();
        
        game.resetLevel();

        setTimeout(function() {
            game.initLevel();
        }, 1000);
        
    },
    
    showLoserScreen : function(points) {
        
        this.open();
        $("#loser").show();
        $("#score").text(points);
        
        $("#twitterlink").attr( "href", "https://twitter.com/?status=" + 
                                "I%20just%20scored%20" + points + 
                                "%20points%20%40AgarAgarGame%20http%3A%2F%2Fagaragargame.com%2F");
        
    },
    
    showErrorScreen : function() {
        
        this.open();
        $("#error").show();
        
    },
    
    toggleSound : function () {
            
        if (Menu.musicOn){
            
            soundManager.mute();
            $("#stopmusic").css("background-image", "url(images/sound_off.png)");
            
        } else{
            
            soundManager.unmute();
            $("#stopmusic").css("background-image", "url(images/sound_on.png)");
            
        }

        Menu.musicOn = !Menu.musicOn;

    }
};
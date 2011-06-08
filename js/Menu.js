var Menu = {
    
    menuOpen : false,
    musicOn : true,
    
    hideInfo : function(){
        
        $("#newgame").hide();
        $("#instructions").hide();
        $("#versions").hide();
        $("#about").hide();
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
        }
        else{
            document.getElementById("playpause").style.backgroundImage = "url(images/play.png)";
            document.getElementById("playpause").style.opacity = "0.4";

            $("#overlay").show();
            $("#overlay").fadeTo("slow", 0.7);

            game.state = "pause";
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

        if (navigator.appVersion.indexOf("Mac")!=-1){
            document.getElementById("playpause").style.paddingTop = "5px";
            document.getElementById("stopmusic").style.paddingTop = "5px";
        }

        $("#playpause").click(function () {
            Menu.toggle();
        });

        $("#stopmusic").click(function () {

            if(Menu.musicOn){
                document.getElementById("stopmusic").style.backgroundImage = "url(images/sound_off.png)";
            }
            else{
                document.getElementById("stopmusic").style.backgroundImage = "url(images/sound_on.png)";
            }

            Menu.musicOn = !Menu.musicOn;
        });  

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

        $("#dona").click(function() { 
            Menu.hideInfo();
            $("#donate").show();
        });

        $("#startnewgame").click(function() {
            Menu.startNewGame();
        });
        
        $("#overlay").click(function() {
            Menu.close();
        });
    },
    
    updatePoints : function(points) {
        
        $("#pointvalue").text(points);
        
        $("#twitterlink").attr( "href", "https://twitter.com/?status=" + 
                                "I%20just%20scored%20" + points + 
                                "%20points%20in%20%40AgarAgarGame.%20http%3A%2F%2Fagaragargame.com%2F");
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
        
    },
    
    showErrorScreen : function() {
        
        this.open();
        $("#error").show();
        
    }
};
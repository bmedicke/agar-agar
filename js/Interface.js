var AlertSign = function( pos, duration, arrowAngle ) {
    
    this.pos = pos;
    
    this.hasArrow = typeof arrowAngle === 'number';
    
    arrowAngle += Math.PI / 2;
    this.arrowAngle = arrowAngle;
    
    arrowAngle = ( arrowAngle / ( Math.PI / 2 ) ) % 1 ;
    
    if ( arrowAngle > 0.5 ) {
        
        arrowAngle = 1.0 - arrowAngle;
        
    }
    
    this.arrowDistance = 1.8 + arrowAngle * 0.8;
    
    this.size = 0;
    
    var tweenIn = new TWEEN.Tween( this ),
        tweenOut = new TWEEN.Tween( this );
    
    tweenIn.to( {size : 1}, 500 );
    
    tweenOut.to( {size : 0}, 500 );
    tweenOut.delay( duration );
    
    tweenIn.easing( TWEEN.Easing.Back.EaseOut );
    tweenOut.easing( TWEEN.Easing.Back.EaseIn );
    
    tweenIn.chain( tweenOut );
    tweenOut.onComplete( this.remove );
    
    tweenIn.start();
    
    this.tweenIn = tweenIn;
    this.tweenOut = tweenOut;
    
};

extend( AlertSign.prototype, {
    
    draw : function(gl) {
    
        gl.pushMatrix();
    
        gl.translate( this.pos.x, this.pos.y );
        gl.scale( this.size, this.size );
        
        if ( this.hasArrow ) {
        
            gl.pushMatrix();
        
            gl.scale( 0.7, 0.7 );
            gl.rotate( this.arrowAngle );
            gl.translate( 0, -this.arrowDistance );
        
            gl.passMatrix();
        
            gl.passTexture(Interface.arrowTexture);
            gl.drawQuadTexture();
        
            gl.popMatrix();
            
        }
    
        gl.scale( 1.5, 1.5 );
        gl.passMatrix();
    
        gl.passTexture(Interface.alertTexture);
        gl.drawQuadTexture();
    
        gl.popMatrix();
    
    },
    
    remove : function( deleteTweens ) {
        
        if ( deleteTweens ) {
            
            this.tweenIn.stop();
            this.tweenOut.stop();
        
        }
        
        Interface.alertSigns.splice( Interface.alertSigns.indexOf( this ), 1 );
        
    }
    
});

var Interface = {

    swarmParticle : null,
    swarmTimeout : null,
    swarmSign : null,
    
    alertTextureSize : 1.5,
    arrowTextureSize : 0.7,
    
    alertSigns : [],

    initialize : function( gl ) {
    
        this.alertTexture = gl.loadTexture("textures/alert.png");
        this.arrowTexture = gl.loadTexture("textures/arrow.png");
    
    },
    
    draw : function( gl ) {
        
        var i;
        
        gl.bindShader(gl.textureShader);
        
        for (i = 0; i < this.alertSigns.length; i++) {
            
            this.alertSigns[i].draw( gl );
            
        }
        
        
        if (this.swarmParticle) {
            
            if (this.swarmParticle.alive) {
            
                gl.bindShader(gl.defaultShader);
            
                gl.setColor(0.5, 0.5, 1.0, 0.5);
                gl.noFill();
                gl.drawCircle(this.swarmParticle.position.x, this.swarmParticle.position.y, 2);
                gl.fill();
            
            } else {
                
                this.hideSwarm();
                
            }
            
        }
        
    },
    
    addAlertSign : function( pos, duration, arrowAngle ) {
        
        var alertSign = new AlertSign( pos, duration, arrowAngle )
        
        this.alertSigns.push( alertSign );
        
        return alertSign;
        
    },
    
    showSwarm : function( swarmParticle ) {
    
        if ( !this.swarmParticle && swarmParticle ) {
            
            var swarmSize = swarmParticle.checkSwarm();
            
            if ( swarmSize >= Cytoplast.prototype.maxFill ) {
                
                this.swarmParticle = swarmParticle;
                
                this.swarmSign = this.addAlertSign( swarmParticle.position, 2000 );
                
                this.swarmTimeout = Timer.setTimeout( function() {
                    
                    Interface.swarmParticle = null;
                    
                }, 10000);
                
            }
            
        }
    
    },
    
    hideSwarm : function() {
        
        this.swarmParticle = null;
        
        if ( this.swarmSign ) {
        
            this.swarmSign.remove( true );
        
        }
        
        if ( this.swarmTimeout ) {
            
            this.swarmTimeout.stop();
            
        }
        
    },
    
    reset : function() {
        
        this.hideSwarm();
        this.alertSigns = [];
        
    }
    
};
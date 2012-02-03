var AlertSign = function( pos, arrowAngle ) {
    
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
    tweenOut.delay( 5000 );
    
    tweenIn.easing( TWEEN.Easing.Back.EaseOut );
    tweenOut.easing( TWEEN.Easing.Back.EaseIn );
    
    tweenOut.onComplete( function() {

        Interface.alertSigns.splice( Interface.alertSigns.indexOf( this ), 1 );

    });

    tweenIn.chain( tweenOut );
    
    tweenIn.start();
    
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
    
    }
    
});

var Interface = {

    swarmParticle : null,
    swarmSize : 0,
    
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
            
            gl.bindShader(gl.defaultShader);
            
            gl.setColor(0.5, 0.5, 1.0, 0.5);
            
            gl.drawCircle(this.swarmParticle.position.x, this.swarmParticle.position.y, this.swarmSize / 2);
            
            this.swarmParticle = null;
            
        }
        
    },
    
    addAlertSign : function( pos, arrowAngle ) {
        
        this.alertSigns.push( new AlertSign( pos, arrowAngle ) );
        
    }
    
};
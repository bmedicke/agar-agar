var State = function( params ) {
    
    params = params || {};
    
    this.name = params.name || 'none';
    
    this.enter = params.enter || function( fsm ) {};
    this.update = params.update || function( fsm, dt ) {};
    this.draw = params.draw || function( fsm, gl ) {};
    this.exit = params.exit || function( fsm ) {};
    
};

var Transition = function( params ) {
    
    params = params || {};
    
    this.name = params.name || 'none';
    this.from = params.from || 'none';
    this.to = params.to || 'none';
    
};

var StateMachine = function( scope ) {
    
    this.scope = scope;
    
    this.currentState = new State();
    
    this.states = {};
    this.transitions = {};
    
}

StateMachine.prototype = {
    
    init : function( states, transitions ) {
        
        var i;
        
        states = states ? states instanceof Array ? states : [states] : [];
        transitions = transitions ? transitions instanceof Array ? transitions : [transitions] : [];
        
        for ( i = 0; i < states.length; i++ ) {
            
            this.addState( new State( states[i] ) );
            
        }
        
        for ( i = 0; i < transitions.length; i++ ) {
            
            this.addTransition( new Transition( transitions[i] ) );
            
        }
        
    },
    
    update : function( dt ) {
        
        this.currentState.update.call(this.scope, this, dt);
        
    },
    
    draw : function( gl ) {
        
        this.currentState.draw.call(this.scope, this, gl);
        
    },
    
    addState : function( state ) {
        
        this.states[state.name] = state;
        
    },
    
    addTransition : function( transition ) {
        
        var self = this;
        
        this.transitions[transition.name] = transition;
        
        this[transition.name] = function() {
            
            if ( self.currentState.name !== transition.to &&
                ( self.currentState.name === transition.from || transition.from === '*' ) ) {
                
                self.changeState( transition.to );
                
                return true;
                
            }
            
            return false;
            
        }
        
    },
    
    changeState : function( name ) {
        
        this.currentState.exit.call(this.scope, this);
        
        this.currentState = this.states[name];
        
        this.currentState.enter.call(this.scope, this);
        
    },
    
    hasState : function( name ) {
        
        return this.currentState.name === name;
        
    }
    
};


// example

var Blob = {
    
    init : function() {
        
        this.fsm = new StateMachine( this );
        
        this.fsm.init([
            { name : 'green', draw : this.drawGreen, update : function(fsm) { console.log("update green"); } },
            { name : 'red',   draw : this.drawRed,   exit : function(fsm) { console.log("exit red"); } },
            { name : 'blue',  draw : this.drawBlue,  enter : function(fsm) { console.log("enter blue"); } }
        ],[
            { name : "heat", from : 'green', to: 'red' },
            { name : "cool", from : 'red', to: 'blue' },
            { name : "grow", from : '*', to: 'green' }
        ]);
        
        this.fsm.changeState( 'green' );
        
    },
    
    update : function(dt) {
        
        this.fsm.update(dt);
        
    },
    
    draw : function(gl) {
        
        this.fsm.draw(gl);
        
    },
    
    drawGreen : function(fsm, gl) {
                        
        gl.bindShader(gl.defaultShader);
        gl.setColor(0, 1, 0, 0.7);
        
        this.drawBlob(gl);
    },

    drawRed : function(fsm, gl) {
                        
        gl.bindShader(gl.defaultShader);
        gl.setColor(1, 0, 0, 1);
        
        this.drawBlob(gl);
    },
    
    drawBlue : function(fsm, gl) {
                        
        gl.bindShader(gl.defaultShader);
        gl.setColor(0, 0, 1, 0.5);
        
        this.drawBlob(gl);
    },
    
    drawBlob : function(gl) {
        
        gl.drawCircle(10, 10, 5);
        
    }
    
};

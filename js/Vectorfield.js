var Vectorfield = function(width, height) {
    
    if (width < height) {
        
        this.cols = this.minCellsPerDimension;
        this.cellSize = width / this.minCellsPerDimension;
        this.rows = Math.floor(height / this.cellSize);
        
    } else {
        
        this.rows = this.minCellsPerDimension;
        this.cellSize = height / this.minCellsPerDimension;
        this.cols = Math.floor(width / this.cellSize);
        
    }
    
    this.vectors = {};
    
};

Vectorfield.prototype = {
    
    minCellsPerDimension : 30,
    
    update : function(dt) {
        
        
        
    },
    
    draw : function(gl) {
        
        //gl.enableAlpha();
        //gl.setColor(0.7, 0.7, 0.7, 0.5);
        gl.setColor(0, 0, 0, 1.0);
        
        for (var i = 1; i < this.cols; i++) {
            
            gl.drawLine(
                i - this.cols / 2, 
                this.rows / 2,
                i - this.cols / 2,
                - this.rows / 2
            );
            
        }
        
        for (var i = 1; i < this.rows; i++) {
            
            gl.drawLine(
                - this.cols / 2, 
                i - this.rows / 2,
                this.cols / 2,
                i - this.rows / 2
            );
            
        }
        
        //gl.disableAlpha();
        
    }
    
};
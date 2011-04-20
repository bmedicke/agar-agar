var Vectorfield = function(width, height) {
    
    this.cellSize = Math.sqrt(width * height / this.numberOfCells);
    this.cols = Math.floor(width / this.cellSize);
    this.rows = Math.floor(height / this.cellSize);
    
    this.vectors = {};
    
};

Vectorfield.prototype = {
    
    numberOfCells : 1000,
    
    maxForce : 1,
    
    forceRadius : 5,
    
    dampCoefficient : 0.001,
    
    update : function(dt) {
        
        for (var cellID in this.vectors) {
            
            if (this.vectors.hasOwnProperty(cellID)) {
                
                this.vectors[cellID].mulSelf(1 - this.dampCoefficient * dt);
                
                if (this.vectors[cellID].normSquared() < 0.01) {
                
                    delete this.vectors[cellID];
                
                }
                
            }
        }
        
    },
    
    draw : function(gl) {
        
        gl.setColor(0.8, 0.8, 0.8, 1.0);
        
        for (var i = 1; i < this.cols; i++) {
            
            gl.drawLine(i, 0, i, this.rows);
            
        }
        
        for (var i = 1; i < this.rows; i++) {
            
            gl.drawLine(0, i, this.cols, i);
            
        }
        
        gl.setColor(0.8, 0.4, 0.4, 1.0);
        
        var cell = new Vector();
        
        for (var cellID in this.vectors) {
            
            if (this.vectors.hasOwnProperty(cellID)) {
                
                cell.set(cellID % this.cols + .5, Math.floor(cellID / this.cols) + .5, 0);
            
                gl.drawLine(
                    cell.x, cell.y,
                    cell.x + this.vectors[cellID].x, cell.y + this.vectors[cellID].y
                );
                
            }
        }
        
    },
    
    getCell : function(position) {
        
        return {x: Math.floor(position.x), y: Math.floor(position.y)};
        
    },
    
    getCellID : function(position) {
        
        return Math.floor(position.y) * this.cols + Math.floor(position.x);
        
    },
    
    getVector : function(position) {
        
        return this.vectors[this.getCellID(position)] || new Vector();
        
    },
    
    setVector : function(cellID, vector) {
        
        this.vectors[cellID] = (this.vectors[cellID] || new Vector()).addSelf(vector).clamp(this.maxForce);
        
    },
    
    applyForceField : function(position) {
        
        var cell = this.getCell(position),
            left = cell.x - this.forceRadius,
            right = cell.x + this.forceRadius,
            top = cell.y - this.forceRadius,
            bottom = cell.y + this.forceRadius,
            cellVector = new Vector();
            
                    
        if (right > this.cols) right = this.cols;
        else if (left < 0) left = 0;
        
        if (bottom > this.rows) bottom = this.rows;
        else if (top < 0) top = 0;
        
        for (var i = left; i < right; i++) {
            
            for (var j = top; j < bottom; j++) {
                
                cellVector.set(i + .5, j + .5, 0);
                
                cellVector.subSelf(position);
                
                if (cellVector.normSquared() < this.forceRadius * this.forceRadius) {
                    
                    this.setVector(
                        i + j * this.cols, 
                        cellVector.mulSelf(-1).divSelf(cellVector.normSquared())
                    );
                    
                }
                
            }
            
        }
        
    }
    
};

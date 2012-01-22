var WebGLTexture = function() {

    this.textureCount = 0;

    this.loadTexture = function(imagePath, callback) {
    
        var texture = this.createTexture();
        texture.image = new Image();
    
        texture.ID = this.textureCount++;
    
        var self = this;
    
        texture.image.onload = function () {
        
            self.textureImageLoaded(texture);
            
            if (callback) {
        
                callback(self);
    
            }
        
        }
    
        texture.image.src = imagePath;
    
        return texture;
    
    };

    this.textureImageLoaded = function(texture) {
    
        this.activeTexture(this["TEXTURE" + texture.ID]);
        this.bindTexture( this.TEXTURE_2D, texture );

        this.pixelStorei( this.UNPACK_FLIP_Y_WEBGL, true );
        this.texImage2D( this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, texture.image );    
    
        this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR_MIPMAP_LINEAR );
        this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_LINEAR );	
    
        this.texParameteri( this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE );
        this.texParameteri( this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE );
    
        this.generateMipmap( this.TEXTURE_2D );

        this.bindTexture( this.TEXTURE_2D, null );
    
    };

};
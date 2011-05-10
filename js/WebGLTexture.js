WebGLRenderingContext.prototype.textureCount = 0;

WebGLRenderingContext.prototype.loadTexture = function(imagePath, callback) {
    
    var texture = this.createTexture();
    texture.image = new Image();
    
    texture.ID = this.textureCount++;
    
    var self = this;
    
    texture.image.onload = function () {
        
        self.textureImageLoaded(texture, callback);
        
    }
    
    missingResourceCount++;
    texture.image.src = imagePath;
    
    return texture;
    
};

WebGLRenderingContext.prototype.textureImageLoaded = function(texture, callback) {
    
    this.activeTexture(this["TEXTURE" + texture.ID]);
    this.bindTexture( this.TEXTURE_2D, texture );

    this.pixelStorei( this.UNPACK_FLIP_Y_WEBGL, true );
    this.texImage2D( this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, texture.image );

    this.generateMipmap( this.TEXTURE_2D );
    
    this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR_MIPMAP_LINEAR );
    this.texParameteri( this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_LINEAR );
    
    this.bindTexture( this.TEXTURE_2D, null );
    
    if (callback) {
        
        callback(this);
    
    }
    
    missingResourceCount--;
    start();
    
};
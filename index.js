/*
 * tessel-digole12864
 *
 * Tessel driver for 128x64 OLED serial display from Digole
 * http://www.digole.com/index.php?productID=540
 *
 */

var tessel = require('tessel');
var async = require('async');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Debug flag
var DEBUG  = true

// Screen is 128 by 64 bits.
var LCD_WIDTH = 128
var LCD_HEIGHT = 64

function Digole12864 (hardware, cb){
  var self = this;
  self.hardware = hardware;

  self.uart = new hardware.UART({
    baudrate: 9600
  });

  self._lcdWrite = function(data, cb){
    var self = this;
    self.uart.write(new Buffer(data,'utf8'));
    if(cb)
      cb();
  };

  async.series([
    function(callback){
      // Clear the display
      if(DEBUG) console.log('Digole12864: init clear');
      self._lcdWrite('CL\n', callback);
    },
    function(callback){
      // Display welcome message
      if(DEBUG) console.log('Digole12864: init message');
      self._lcdWrite('TTReady...\n', callback);
    }
  ],
  function(err, results){
    if(DEBUG) console.log('Digole12864: init ready');
    // Emit the ready event when everything is set up
    //   self.emit('ready');
    // NOTE: Needed to wrap this within a setImmediate call, not sure why?
    setImmediate(function emitReady() {
        self.emit('ready');
    });

    if(err)
        console.log('Digole12864: init err '+err.message);
    if(cb)
       cb(null,self);
  });
};

// Inherit event emission
util.inherits(Digole12864, EventEmitter);

// Define the API

/*---- Text Methods ----*/

//Digole12864.**setFont**(f,[callback(err)]) - Set text font (f: 0/6/10/18/51/120/123)

Digole12864.prototype.setFont = function(f, cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(f, 0);
    self._lcdWrite('SF'+buf.toString()+'\n',cb);
}

//Digole12864.**setColour**(f,[callback(err)]) - Set colour (r/g/b: 0-63 *Note, not 0-255)
Digole12864.prototype.setColour = function (r, g, b, cb){
    var self = this;
    var buf = new Buffer(3);
    buf.writeUInt8(r, 0);
    buf.writeUInt8(g, 1);
    buf.writeUInt8(b, 2);
  if(DEBUG) console.log("Write colour: (" + r + ", " + g + ", " + b + ")");
  self._lcdWrite('ESC'+buf.toString());
  if(cb)
    cb();
};

//Digole12864.**character**(c,[callback(err)]) - Write character (c) to screen at cursor

Digole12864.prototype.character = function (character, cb){
  var self = this;
  if(DEBUG) console.log("Write character ["+character+"]");
  self._lcdWrite(character);
    if(cb)
        cb();
};

//Digole12864.**string**(s,[callback(err)]) - Write string (s) to screen at cursor

Digole12864.prototype.string = function (data, cb){
  var self = this;
  if(DEBUG) console.log("Write string: "+data);
  self._lcdWrite('TT'+data);
  if(cb)
    cb();
};

//Digole12864.**stringXY**(x,y,s,[callback(err)]) - Write string (s) to screen at (x,y)

Digole12864.prototype.stringXY = function (x,y, data, cb){
  var self = this;
  async.series([
    function(callback){
        if(DEBUG) console.log("Update position: "+util.format("ETP%d%d",x,y));
        var buf = new Buffer(2);
        buf.writeUInt8(x, 0);
        buf.writeUInt8(y, 1);
        self._lcdWrite('ETP'+buf.toString()+'\n',callback);

    },
    function(callback){
      self.string(data, callback);
        
    }
  ], function(err, results){
      if(cb)
        cb(err);
  });
};

//Digole12864.**setTextPosAbs**(x,y,[callback(err)]) - Set text cursor at (x,y)

Digole12864.prototype.setTextPosAbs = function(x, y, cb){
    var self = this;
    var buf = new Buffer(2);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    self._lcdWrite('ETP'+buf.toString()+'\n',cb);
}

//Digole12864.**setTextPosOffset**(xoff,yoff,[callback(err)]) - Set text cursor offset (xoff,yoff)

Digole12864.prototype.setTextPosOffset = function(xoff, yoff, cb){
    var self = this;
    var buf = new Buffer(2);
    buf.writeUInt8(xoff, 0);
    buf.writeUInt8(yoff, 1);
    self._lcdWrite('ETO'+buf.toString()+'\n',cb);
}

//Digole12864.**setTextPosBack**([callback(err)]) - Reset text offset setting

Digole12864.prototype.setTextPosBack = function(cb){
    var self = this;
    self._lcdWrite('ETB\n',cb);
}

//Digole12864.**nextTextLine**([callback(err)]) - Start next text draw on new line

Digole12864.prototype.nextTextLine = function(cb){
    var self = this;
    self._lcdWrite('TRT\n',cb);
}



/*---- Drawing Methods ----*/

//Digole12864.**drawBox**(x,y,w,h,[callback(err)]) - Draw filled rectangle at (x,y) and size (w,h)

Digole12864.prototype.drawBox = function (x, y, w, h, cb){
  var self = this;
  if(DEBUG) console.log("Draw box: "+util.format("%d,%d %d,%d",x,y,x+w,y+h));
    var buf = new Buffer(4);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(x+w, 2);
    buf.writeUInt8(y+h, 3);

  self._lcdWrite('FR'+buf.toString()+'\n',cb);
};

//Digole12864.**drawBoxFrame**(x,y,w,h,[callback(err)]) - Draw framed rectangle at (x,y) and size (w,h)

Digole12864.prototype.drawBoxFrame = function (x, y, w, h, cb){
    var self = this;
    if(DEBUG) console.log("Frame box: "+util.format("%d,%d %d,%d",x,y,x+w,y+h));
    var buf = new Buffer(4);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(x+w, 2);
    buf.writeUInt8(y+h, 3);
    
    self._lcdWrite('DR'+buf.toString()+'\n',cb);
};

//Digole12864.**drawCircle**(x,y,r,[callback(err)]) - Draw filled circle at (x,y) and radius (r)

Digole12864.prototype.drawCircle = function (x, y, r, cb){
    var self = this;
    if(DEBUG) console.log("Draw circle: "+util.format("%d,%d %d",x,y,r));
    var buf = new Buffer(4);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(r, 2);
    buf.writeUInt8(1, 3);       // Filled circle
    
    self._lcdWrite('CC'+buf.toString()+'\n',cb);
};

//Digole12864.**drawCircleFrame**(x,y,r,[callback(err)]) - Draw framed circle at (x,y) and radius (r)

Digole12864.prototype.drawCircleFrame = function (x, y, r, cb){
    var self = this;
    if(DEBUG) console.log("Frame circle: "+util.format("%d,%d %d",x,y,r));
    var buf = new Buffer(4);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(r, 2);
    buf.writeUInt8(0, 3);       // Filled circle
    
    self._lcdWrite('CC'+buf.toString()+'\n',cb);
};

//Digole12864.**drawPixel**(x,y,[callback(err)]) - Draw pixel at (x,y)

Digole12864.prototype.drawPixel = function(x, y, cb){
    var self = this;
    var buf = new Buffer(2);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    self._lcdWrite('DP'+buf.toString()+'\n',cb);
}

//Digole12864.**setLinePattern**(p,[callback(err)]) - Set drawing line pattern (p: bit field)

Digole12864.prototype.setLinePattern = function(pattern, cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(pattern, 0);
    self._lcdWrite('SLP'+buf.toString()+'\n',cb);
}

//Digole12864.**setPosition**(x,y,[callback(err)]) - Begin line drawing from (x,y)

Digole12864.prototype.setPosition = function(x, y, cb){
    var self = this;
    var buf = new Buffer(2);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    self._lcdWrite('GP'+buf.toString()+'\n',cb);
}

//Digole12864.**drawLineTo**(x,y,[callback(err)]) - Draw line to (x,y)

Digole12864.prototype.drawLineTo = function(x, y, cb){
    var self = this;
    var buf = new Buffer(2);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    self._lcdWrite('LT'+buf.toString()+'\n',cb);
}

//Digole12864.**drawLine**(x,y,x1,y1,[callback(err)]) - Draw line from (x,y) to (x1,y1)

Digole12864.prototype.drawLine = function(x, y, x1, y1, cb){
    var self = this;
    var buf = new Buffer(4);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(x1, 2);
    buf.writeUInt8(y2, 3);
    self._lcdWrite('LN'+buf.toString()+'\n',cb);
}

//Digole12864.**setRotation**(r,[callback(err)]) - Set rotation for subsequent draws (0-3: 0/90/180/270 degrees)

Digole12864.prototype.setRotation = function(rot, cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(rot, 0);
    self._lcdWrite('SD'+buf.toString()+'\n',cb);
}

//Digole12864.**setRotation0**([callback(err)]) - Set rotation for subsequent draws to 0 degrees

Digole12864.prototype.setRotation0 = function(cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(0, 0);
    self._lcdWrite('SD'+buf.toString()+'\n',cb);
}

//Digole12864.**setRotation90**([callback(err)]) - Set rotation for subsequent draws to 90 degrees

Digole12864.prototype.setRotation90 = function(cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(1, 0);
    self._lcdWrite('SD'+buf.toString()+'\n',cb);
}

//Digole12864.**setRotation180**([callback(err)]) - Set rotation for subsequent draws to 180 degrees

Digole12864.prototype.setRotation180 = function(cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(2, 0);
    self._lcdWrite('SD'+buf.toString()+'\n',cb);
}

//Digole12864.**setRotation270**([callback(err)]) - Set rotation for subsequent draws to 270 degrees

Digole12864.prototype.setRotation270 = function(cb){
    var self = this;
    var buf = new Buffer(1);
    buf.writeUInt8(3, 0);
    self._lcdWrite('SD'+buf.toString()+'\n',cb);
}



/*----- Bitmap Methods -----*/

//Digole12864.**bitmap**(x,y,w,h,data,[callback(err)]) - Draw bit map at (x,y) of size (w,h) with data (data)

Digole12864.prototype.bitmap = function (x,y,w,h,DATA,cb){
    var self = this;
    var buf = new Buffer(3+4+DATA.length+1);
    var i = 0;
    buf.writeUInt8(68, i++);        // ASCII 'D'
    buf.writeUInt8(73, i++);        // ASCII 'I'
    buf.writeUInt8(77, i++);        // ASCII 'M'
    buf.writeUInt8(x, i++);
    buf.writeUInt8(y, i++);
    buf.writeUInt8(w, i++);
    buf.writeUInt8(h, i++);
    
    for (j=0 ;j<DATA.length; j++){
        buf.writeUInt8(DATA[j], i++);
    }
    
    self.uart.write(buf,cb);

};


Digole12864.prototype.bitmaplogo = function (x,y,cb){
    var self = this;
    var LOGO = [0x00,0x00,0x00,0x00,0x00,0x00,0x3f
                ,0x00,0x00,0x00,0x00,0x00,0x00,0x3f
                ,0x00,0x00,0x01,0xc0,0x00,0x00,0x3f
                ,0x00,0x00,0x03,0x60,0x00,0x00,0x3f
                ,0x00,0x00,0x03,0x60,0x00,0x00,0x3f
                ,0x00,0x00,0x07,0xc0,0x00,0x00,0x3f
                ,0x00,0x00,0x1c,0x00,0x00,0x00,0x3f
                ,0x00,0x00,0x70,0x00,0x00,0x00,0x3f
                ,0x00,0x00,0xc0,0x01,0xc0,0x00,0x3f
                ,0x00,0x03,0x80,0x00,0x60,0x00,0x3f
                ,0x00,0x0e,0x00,0x00,0x38,0x00,0x3f
                ,0x00,0x18,0x00,0x00,0x0e,0x00,0x3f
                ,0x00,0x70,0x00,0x00,0x03,0x00,0x3f
                ,0x01,0xc0,0x00,0x00,0x01,0xc0,0x3f
                ,0x03,0x00,0x00,0x00,0x00,0x70,0x3f
                ,0x06,0x00,0x00,0x00,0x00,0x30,0x3f
                ,0x06,0x00,0x00,0x00,0x00,0x10,0x3f
                ,0x06,0x00,0x00,0x00,0x00,0x10,0x3f
                ,0x06,0x00,0x00,0x00,0x00,0x10,0x3f
                ,0x06,0x01,0xff,0x7f,0xc0,0x10,0x3f
                ,0x06,0x01,0xff,0x7f,0xc0,0x10,0x3f
                ,0x06,0x01,0xff,0x7f,0xc0,0x10,0x3f
                ,0x06,0x01,0xff,0x7f,0xc0,0x10,0x3f
                ,0x06,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x06,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x06,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x04,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x10,0x3f
                ,0x0f,0x00,0x00,0x00,0x00,0x78,0x3f
                ,0x09,0x00,0x00,0x00,0x00,0x6c,0x3f
                ,0x09,0x80,0x00,0x00,0x00,0x6c,0x3f
                ,0x0f,0xc0,0x00,0x00,0x00,0x38,0x3f
                ,0x00,0x70,0x00,0x00,0x00,0x00,0x3f
                ,0x00,0x1c,0x00,0x00,0x00,0x00,0x3f
                ,0x00,0x06,0x00,0x00,0x30,0x00,0x3f
                ,0x00,0x03,0x80,0x00,0xe0,0x00,0x3f
                ,0x00,0x00,0xe0,0x01,0x80,0x00,0x3f
                ,0x00,0x00,0x30,0x07,0x00,0x00,0x3f
                ,0x00,0x00,0x1c,0x1c,0x00,0x00,0x3f
                ,0x00,0x00,0x07,0x70,0x00,0x00,0x3f
                ,0x00,0x00,0x01,0xc0,0x00,0x00,0x3f
                ,0x00,0x00,0x00,0x00,0x00,0x00,0x3f
                ,0x00,0x00,0x00,0x00,0x00,0x00,0x3f
                ];
    
    
    var buf = new Buffer(3+4+LOGO.length+1);
    var i = 0;
    buf.writeUInt8(68, i++);        // ASCII 'D'
    buf.writeUInt8(73, i++);        // ASCII 'I'
    buf.writeUInt8(77, i++);        // ASCII 'M'
    buf.writeUInt8(x, i++);
    buf.writeUInt8(y, i++);
    buf.writeUInt8(50, i++);
    buf.writeUInt8(50, i++);
    
    for (j=0 ;j<LOGO.length; j++){
        buf.writeUInt8(LOGO[j], i++);
    }
    
    self.uart.write(buf,cb);
    
    
};



//Digole12864.**moveArea**(x,y,w,h,xoff,yoff,[callback(err)]) - Move region of screen at (x,y) and size (w,h) by offset (xoff,yoff)

Digole12864.prototype.moveArea = function(x, y, w, h, xoff, yoff, cb){
    var self = this;
    var buf = new Buffer(6);
    buf.writeUInt8(x, 0);
    buf.writeUInt8(y, 1);
    buf.writeUInt8(w, 2);
    buf.writeUInt8(h, 3);
    buf.writeUInt8(xoff, 4);
    buf.writeUInt8(yoff, 5);
    self._lcdWrite('MA'+buf.toString()+'\n',cb);
}

//Digole12864.**clear**([callback(err)]) - Clear screen

Digole12864.prototype.clear = function (cb){
  var self = this;
  self._lcdWrite('CL\n', cb);
};

//Digole12864.**setMode**(m,[callback(err)]) - Set drawing mode (m: !=nor, ^=xor, &=and, C=copy)

Digole12864.prototype.setMode = function(m, cb){
    var self = this;
    self._lcdWrite('SM'+m, cb);
}


// Every module needs a use function which calls the constructor
function use (hardware, callback) {
  return new Digole12864(hardware, callback);
}

// Export functions
exports.Digole12864 = Digole12864;
exports.use = use;




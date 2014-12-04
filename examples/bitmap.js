var tessel = require('tessel');
var digole12864 = require('../').use(tessel.port['D']);
var async = require('async');

console.log("Sending OLED set up command...");

digole12864.on('ready', function(){
    console.log("Begin test...");

    digole12864.clear(function(){
                      //digole12864.drawBox(0,0,128,64);
                      digole12864.setFont(10);
                      digole12864.stringXY(30,64,"Draw bitmap6\n");
                      digole12864.bitmap1();
                      digole12864.bitmap2();
                      
                      var LOGO = [0x00,0x00,0x00,0x00
                                  ,0x00,0x01,0x80,0x00
                                  ,0x00,0x02,0x80,0x00
                                  ,0x00,0x07,0x80,0x00
                                  ,0x00,0x08,0x00,0x00
                                  ,0x00,0x30,0x08,0x00
                                  ,0x00,0xc0,0x02,0x00
                                  ,0x01,0x00,0x01,0x80
                                  ,0x06,0x00,0x00,0x40
                                  ,0x08,0x00,0x00,0x10
                                  ,0x10,0x00,0x00,0x10
                                  ,0x10,0x00,0x00,0x10
                                  ,0x10,0x3e,0xfc,0x10
                                  ,0x10,0x3e,0xfc,0x10
                                  ,0x10,0x3e,0xfc,0x10
                                  ,0x10,0x02,0xc0,0x10
                                  ,0x10,0x02,0xc0,0x10
                                  ,0x00,0x02,0xc0,0x10
                                  ,0x00,0x02,0xc0,0x10
                                  ,0x00,0x02,0xc0,0x10
                                  ,0x00,0x02,0xc0,0x10
                                  ,0x00,0x02,0xc0,0x10
                                  ,0x18,0x02,0xc0,0x18
                                  ,0x28,0x00,0x00,0x28
                                  ,0x1c,0x00,0x00,0x18
                                  ,0x03,0x00,0x00,0x00
                                  ,0x00,0xc0,0x00,0x00
                                  ,0x00,0x20,0x0c,0x00
                                  ,0x00,0x08,0x10,0x00
                                  ,0x00,0x06,0x40,0x00
                                  ,0x00,0x01,0x80,0x00
                                  ,0x00,0x00,0x00,0x00
                                  ];
                      digole12864.bitmap(128-32,0,32,32,LOGO);
    });


});
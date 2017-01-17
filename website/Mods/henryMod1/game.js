// game.js for Perlenspiel 3.2

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-15 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.

Perlenspiel uses dygraphs (Copyright © 2009 by Dan Vanderkam) under the MIT License for data visualization.
See dygraphs License.txt, <http://dygraphs.com> and <http://opensource.org/licenses/MIT> for more information.
*/

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// This is a template for creating new Perlenspiel games

// All of the functions below MUST exist, or the engine will complain!


/** Author Henry Wheeler-Mackta
 * Mods:
 * 	1. Interacting w/ Black Bead will create a random gradient
 * 	2. Interacting w/ any other bead will change the background color to that of that bead
 * 	3. Pressing ENTER will also randomize the gradient
 * 	4. Pressing SPACEBAR will toggle PAINTING MODE
 */
var w;
var h;
var s;
var p;
var xxx;

PS.init = function( system, options ) {
	"use strict";
	PS.gridShadow(true);
	PS.audioLoad("fx_jump5");
	PS.audioLoad("fx_jump6");
	PS.audioLoad("fx_jump7");
	PS.audioLoad("fx_jump8");
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	w = PS.gridSize( 16, 16).width;
	h = PS.gridSize(16, 16).height;
	PS.color(w-1, h-1, 0,0,0);
	PS.borderColor(w-1, h-1, 0,0,0);
	PS.gridColor(0, 0, 0);
	var y2, x2;
	s = 0;
	for (y2 = 0; y2 < h; y2++){
		for(x2 =0; x2 < w; x2++){
			PS.border(x2,y2,0);
		}
	}
	PS.statusText("Touch BLACK, Touch BEADS, or Press SPACE!");
	PS.statusColor(256, 256, 256);
	// Add any other initialization code you need here

	xxx = 0;
	p = false;
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	"use strict"

	var x2, y2, r, g, b, r2, g2, b2;

	PS.gridShadow(true);

	PS.gradient(x, y);

	if((x != (w-1) && (y!= (h-1)))){
		var c = PS.color(x,y);
		PS.gridColor(c);
		PS.statusText("Background Changed!");
	}
};

PS.gradient = function(x, y){

	xxx ++;

	var x2, y2, r, g, b, r2, g2, b2;
	if((x == (w-1)) && (y == (h-1))){
		switch(s) {
			case 0:
				PS.audioPlay("fx_jump5");
				break;
			case 1:
				PS.audioPlay("fx_jump6");
				break;
			case 2:
				PS.audioPlay("fx_jump7");
				break;
			case 3:
				PS.audioPlay("fx_jump8");
				break;
			default:
		}
		s++;
		if(s==4){
			s=0;
		}
		r = PS.random(256);
		g = PS.random(256);
		b = PS.random(256);
		PS.statusText("Randomized!");
		for (y2 = 0; y2 < h; y2++){
			for(x2 =0; x2 < w; x2++){
				r2 = r-(x2 * 5);
				g2 = g-(x2 * 5);
				b2 = b-(x2 * 5);
				PS.color(x2,y2,r2,g2,b2);
				PS.border(x2,y2,0);
			}
		}
		PS.color(x,y,0,0,0);
		PS.border(x,y, 2);
		PS.borderColor(x, y, 256, 256, 256);
	}
	if(xxx > 50){
		PS.statusText("Isn't your finger tired?")
	}

}
// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function( x, y, data, options ) {
	"use strict";

	if(p == true){
		var c = PS.color(x, y);
		PS.color(x, y, c + 30);
	}
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.exit = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
	"use strict";

	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the following constants:
// Arrow keys = PS.ARROW_UP, PS.ARROW_DOWN, PS.ARROW_LEFT, PS.ARROW_RIGHT
// Function keys = PS.F1 through PS.F1
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
	if(key == 13){
		PS.gradient((w-1),(h-1));
	}
	if(key == 32){
		if(p == false){
			PS.statusText("TERRIBLE PAINT MODE ENABLED");
			p=true;
		}else{
			PS.statusText("TERRIBLE PAINT MODE DISABLED");
			p=false;
		}


	}
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the following constants:
// Arrow keys = PS.ARROW_UP, PS.ARROW_DOWN, PS.ARROW_LEFT, PS.ARROW_RIGHT
// Function keys = PS.F1 through PS.F12
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};

// PS.swipe ( data, options )
// Called when a mouse/finger swipe across the grid is detected
// It doesn't have to do anything
// [data] = an object with swipe information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.swipe = function( data, options ) {
	"use strict";

	// Uncomment the following block to inspect parameters

	/*
	 var len, i, ev;
	 PS.debugClear();
	 PS.debug( "PS.swipe(): start = " + data.start + ", end = " + data.end + ", dur = " + data.duration + "\n" );
	 len = data.events.length;
	 for ( i = 0; i < len; i += 1 ) {
	 ev = data.events[ i ];
	 PS.debug( i + ": [x = " + ev.x + ", y = " + ev.y + ", start = " + ev.start + ", end = " + ev.end +
	 ", dur = " + ev.duration + "]\n");
	 }
	 */

	// Add code here for when an input event is detected
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function( sensors, options ) {
	"use strict";

	// Uncomment the following block to inspect parameters
	/*
	PS.debug( "PS.input() called\n" );
	var device = sensors.wheel; // check for scroll wheel
	if ( device )
	{
		PS.debug( "sensors.wheel = " + device + "\n" );
	}
	*/
	
	// Add code here for when an input event is detected
};


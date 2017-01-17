// game.js for Perlenspiel 3.1

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-14 Worcester Polytechnic Institute.
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
*/

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// This is a template for creating new Perlenspiel games

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

//David Allen IMGD 2900 mods:
//A single block appears on a 10x10 grid
//Clicking on the block will create a predetermined design including a new clickable block
//Clicking on the new block will continue to create the design
//Once it is complete, the status bar will change and the program will reset on next click

//Notable changes: Transparent borders, new sound effects, self-filling grid, use of global variables,
//dynamically changing status line, use of game state recording to alter the image, and instant reinitialization
var count;

PS.init = function( system, options ) {
	"use strict";

	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( 10, 10 );
	PS.gridColor( 0x303030 ); // Perlenspiel gray
	PS.color(PS.ALL, PS.ALL, 0x303030);
	PS.color(0, 0, PS.COLOR_BLACK);
	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Begin" );
	PS.borderAlpha( PS.ALL, PS.ALL, 0 );
    count = 0; //number of correct clicks
	PS.audioLoad( "fx_blast3", { lock: true } );
    PS.audioLoad( "fx_coin4", { lock: true } );
    PS.audioPlay("fx_coin4");
    // load & lock click sound
	// Add any other initialization code you need here
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	"use strict";

	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

    //Gradually change the displayed pictured based off of sequential clicks
    //Only a single bead is clickable per iteration
    //Once the desgin is finished, the grid will reset
	if ((x === count && y === count) || count == 5) {

			switch (count) {
				case 0:
				{
                    PS.statusText("");
					PS.color(0, 9, PS.COLOR_BLACK);
					PS.color(1, 9, PS.COLOR_BLACK);
					PS.color(0, 8, PS.COLOR_BLACK);

					PS.color(9, 0, PS.COLOR_BLACK);
					PS.color(8, 0, PS.COLOR_BLACK);
					PS.color(9, 1, PS.COLOR_BLACK);

					PS.color(9, 9, PS.COLOR_BLACK);
					PS.color(8, 9, PS.COLOR_BLACK);
					PS.color(9, 8, PS.COLOR_BLACK);

					PS.color(1, 0, PS.COLOR_BLACK);
					PS.color(0, 1, PS.COLOR_BLACK);

                    PS.color(1, 1, PS.COLOR_YELLOW);
                    break;
				}
                case 1:
                {
                    for(var i = 2;  i <= 7; i++){
                        PS.color(i, 0, PS.COLOR_YELLOW);
                        PS.color(0, i, PS.COLOR_YELLOW);
                        PS.color(i, 9, PS.COLOR_YELLOW);
                        PS.color(9, i, PS.COLOR_YELLOW);
                    }

                    PS.color(2, 2, PS.COLOR_MAGENTA);
                    break;
                }
                case 2:
                {
                    for(var j = 8; j >= 1; j--){
                        PS.color(((-1*j) + 9),j, PS.COLOR_MAGENTA);
                }
                    PS.color(4, 6, PS.COLOR_MAGENTA);
                    PS.color(3, 5, PS.COLOR_MAGENTA);
                    PS.color(5, 3, PS.COLOR_MAGENTA);
                    PS.color(6, 4, PS.COLOR_MAGENTA);

                    PS.color(3, 3, PS.COLOR_GREEN);
                    break;
                }
                case 3:
                {
                    PS.color(3, 4, PS.COLOR_GREEN);
                    PS.color(4, 3, PS.COLOR_GREEN);
                    PS.color(8, 8, PS.COLOR_GREEN);
                    for(var k = 3; k <= 7; k++){
                        PS.color(k, 7, PS.COLOR_GREEN);
                        PS.color(7, k, PS.COLOR_GREEN);
                    }
                    PS.color(4, 4, PS.COLOR_BLUE);
                    break;
                }
                case 4:
                {
                    for(var i = 2; i <= 7; i++){
                        PS.color(i, 1, PS.COLOR_BLUE);
                        PS.color(1, i, PS.COLOR_BLUE);
                        PS.color(i, 8, PS.COLOR_BLUE);
                        PS.color(8, i, PS.COLOR_BLUE);
                    }
                    for(var j = 3; j <= 6; j++) {
                        PS.color(j, 2, PS.COLOR_CYAN);
                        PS.color(2, j, PS.COLOR_CYAN);
                    }
                    PS.color(5, 5, PS.COLOR_CYAN);
                    PS.color(5, 6, PS.COLOR_CYAN);
                    PS.color(6, 5, PS.COLOR_CYAN);
                    PS.color(6, 6, PS.COLOR_CYAN);
                    PS.statusText("Finish");
                    break;
                }
                case 5:
                {
                    break;
                }

			}
        if(count === 5) {
            PS.audioPlay("fx_coin4");
            PS.init();
        }else{
            PS.audioPlay("fx_blast3" );
            count++;
        }
	}

	// Add code here for mouse clicks/touches over a bead
};

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


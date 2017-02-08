// game.js for Perlenspiel 3.2.x

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
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

/**
 * Threnody
 * Created by Henry Wheeler-Mackta and David Allen
 * February 2017
 *
 * Background music is...
 * All sound effects are...
 **/
"use strict";
var G = {//general game logic
	GRID_HEIGHT: 32,
	GRID_WIDTH: 32,

	global_rate: 1,
	global_timer: 0,

	beat_rate: 0,	
	
	//beats
	// tick counter divided by the timing variables will trigger the playing of a note
	tick_per_measure: 192,
	timing_quarter: 0,
	timing_eighth: 0,
	timing_sixteenth: 0,
	timing_triplet: 0,

	
	counter: 0,

	init_measure : function() {
		//quarter
		if(G.tick_per_measure % 4 === 0){
			G.timing_quarter = (G.tick_per_measure / 4);
			
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 4\n');
			PS.debug('FAILED ON QUARTER NOTES\n');
		}

		//eighth
		if(G.tick_per_measure % 8 === 0){
			G.timing_eighth = (G.tick_per_measure / 8);
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 8\n');
			PS.debug('FAILED ON EIGHTH NOTES\n');
		}

		//sixteenth
		if(G.tick_per_measure % 16 === 0){
			G.timing_sixteenth = (G.tick_per_measure / 16);
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 16\n');
			PS.debug('FAILED ON SIXTEENTH NOTES\n');
		}

		//triplet
		if(G.tick_per_measure % 12 === 0){
			G.timing_triplet = (G.tick_per_measure / 12);
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 12\n');
			PS.debug('FAILED ON TRIPLETS\n');

		}

		//Counter for the tick
		// Starts at the tick rate as we want the notes to hit on tick 1  
		G.counter = G.tick_per_measure;

		// PS.debug("\nquarter\n");
		// PS.debug(G.timing_quarter);
		// PS.debug("\neighth\n");
		// PS.debug(G.timing_eighth);
		// PS.debug("\nsixteenth\n");
		// PS.debug(G.timing_sixteenth);
		// PS.debug("\ntriplet\n");
		// PS.debug(G.timing_triplet);
		
	},

	tick : function () { // the big global tick
		PS.color(PS.ALL, PS.ALL, 0xFFFFFF);

		// Play a quarter note
		if(G.counter % G.timing_quarter === 0){
			PS.audioPlay( A.tone_quarter, { volume: 0.75 } );
			PS.color ( 1, 1, 0x0000FF);
		}

		// Play a eighth note
		if(G.counter % G.timing_eighth === 0){
			PS.audioPlay( A.tone_eighth, { volume: 0.75 } );
			PS.color ( 1, 3, 0x00FF00);
		}

		// Play a sixteenth note
		if(G.counter % G.timing_sixteenth === 0){
			PS.audioPlay( A.tone_sixteenth, { volume: 0.75 } );
			PS.color ( 1, 5, 0xFF0000);
		}

		// Play a triplet
		if(G.counter % G.timing_triplet === 0){
			PS.audioPlay( A.tone_triplet, { volume: 0.75 } );
			PS.color ( 1, 7, 0xFF00FF);
		}
		// increment
		G.counter -= 1;

		if(G.counter <=  0){
			G.counter = G.tick_per_measure; 
		}

	},

	start_global_timer : function() { // starts the global timer
		G.global_timer = PS.timerStart(G.global_rate, G.tick);
	}
};

var L = {//level or chapter logic
};

var S = { // status line

	};

var J = {//juice
	COLOR_BACKGROUND: PS.COLOR_BLACK,
	COLOR_BACKGROUND_GLOW: PS.COLOR_WHITE,



};

var A = {//audio

	//sounds 
	tone_quarter: "perc_drum_snare",
	tone_eighth: "fx_coin4",
	tone_sixteenth: "fx_click",
	tone_triplet: "fx_pop",

	load : function() {
		// Quarter Notes
		PS.audioLoad( A.tone_quarter, { lock : true } );
		
		// 8th Notes
		PS.audioLoad( A.tone_eighth , { lock : true } );

		// 16th notes
		PS.audioLoad( A.tone_sixteenth, { lock : true } );

		// Triplets
		PS.audioLoad( A.tone_triplet, { lock : true } );
	}
	
};


// The "use strict" directive in the following line is important. Don't remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't remove them!

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

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( 8, 8 );

	A.load();
	G.init_measure();
	G.start_global_timer();

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
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

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
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function( key, shift, ctrl, options ) {
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

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.shutdown = function( options ) {

	// Add code here for when Perlenspiel is about to close
};
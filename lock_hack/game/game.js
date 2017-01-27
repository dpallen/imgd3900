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
 * LOCK:HACK
 * Created by Henry Wheeler-Mackta and David Allen
 * January 2017
 *
 * Background music is...
 * All sound effects are...
 **/

var G = { // General game logic
	GRID_HEIGHT: 9,
	GRID_WIDTH: 9,

	COLOR_BG: PS.COLOR_BLACK, // temporary until we figure out what the background will look like
	COLOR_BEAD_DEFAULT: PS.COLOR_WHITE, // bead that is not toggled or on or whatever
	COLOR_BEAD_SELECTED: PS.COLOR_GRAY, // bead that is currently selected
	COLOR_BEAD_CORRECT: PS.COLOR_GREEN, // bead that was correct
	COLOR_BEAD_INCORRECT: PS.COLOR_RED, // bead that isn't involved
	COLOR_BEAD_ALMOST: PS.COLOR_YELLOW, // bead that is in the right spot but not the right order
	COLOR_LINE_DEFAULT: PS.COLOR_GRAY, // line while drawing


	isPlayable: false, // for cutscenes, etc.
	isDragging: false, // is player dragging the mouse?

	currentPool: "zero", // difficulty pool
	currentLevel: "", // name of level

	currentStep: 0, // the currentStep, starts at 0
	currentLockedBead: [0, 0], // the current locked bead
	currentAttemps: 0, // current attemps
	lastLockedBead: [0, 0],
	level_attempt:[], // the level attempt
	hint_array:[], // the hint array

	HINT_NOTPART: 0, //for hint array
	HINT_CORRECT: 1,
	HINT_WRONG: 2,
	HINT_ALMOST: 3,

	show_hint_rate: 60, // how long to show hints
	show_hint_timer: 0, // how long to show hints timer
	show_win_rate: 120, // how long to show win
	show_win_timer: 0, // how long to show win timer

	reset_attempt: function(){ // reset the level_attempt
		G.level_attempt =
			[0, 0, 0,
				0, 0, 0,
				0, 0, 0];
	},

	toggle_bead: function(x, y){
		// convert the x/y to the 3*3 scale
		// 0 1 2
		// 3 4 5
		// 6 7 8
		var level_x = -1; // the x translated to level logic
		var level_y = -1; // the y translated to level logic

		switch(x){ // convert x
			case L.x_coords[0]:
				level_x = 0;
				break;
			case L.x_coords[1]:
				level_x = 1;
				break;
			case L.x_coords[2]:
				level_x = 2;
				break;
			default: // doesn't do anything
				break;
			}

		switch(y){ // convert yy
			case L.y_coords[0]:
				level_y = 0;
				break;
			case L.y_coords[1]:
				level_y = 1;
				break;
			case L.y_coords[2]:
				level_y = 2;
				break;
			default: // doesn't do anything
				break;
		}

		// if either level_x or level_y are equal to -1, escape
		if((level_x == -1) || (level_y == -1)){
			//PS.debug("no");
			return;
		}

		//

		//J.lock_line();
		G.lastLockedBead = G.currentLockedBead;
		G.currentLockedBead = [x, y];
		// Lock the previous drawn line if greater than step 1
		if(G.currentStep > 0) {
			PS.audioPlay(A.sfx_click_next);
			J.lock_line();
		}else{
			PS.audioPlay(A.sfx_click);

		}

		var ptr = ( level_y * L.y_height ) + level_x; // pointer to location in level attempt array

		if(G.level_attempt[ptr] == 0) { // only iterate if we're on a spot that hasn't been occupied yet
			G.currentStep++; // iterate currentStep

		// set level_attempt index value to whatever currentStep is
		//PS.debug("ptr:" + ptr);
		//PS.debug("\nptrv: " + G.level_attempt[ptr] + "\n");

			G.level_attempt[ptr] = G.currentStep;

			var short_correct = G.check_attempt_helper(); // check for correctness
			if(short_correct){
				G.check_attempt();
			}
		}
		},

	check_attempt_helper : function(){ // check the actual values
		var correct = true;
		for (var i = 0; i < G.level_attempt.length; i++) {
			if (G.level_attempt[i] !== L.level[i]){
				//PS.debug("you're wrong"); /** FOR DEBUGGING**/
				correct = false;
			}
		}

		return correct;
	},

	check_attempt: function(){ // check attempt versus current level
		G.isPlayable = false;
		J.clear_drawn_lines();
		G.currentAttemps++;
		//PS.debug(G.level_attempt + "\n");
		//PS.debug(L.level + "\n");
		var correct = G.check_attempt_helper();
		//PS.debug("you're right"); /** FOR DEBUGGING**/

		if(!correct){
			G.give_hint();
		}else{
			// GO ON TO NEXT LEVEL OR SOMETHING
			G.win_board();
		}
		return correct;
	},

	give_hint: function(){ // builds the hint array and sends it to juice
		//PS.debug("building hint array...\n");

		PS.audioPlay(A.sfx_fail);
		G.hint_array = // populate with not parts
			[G.HINT_NOTPART, G.HINT_NOTPART, G.HINT_NOTPART,
				G.HINT_NOTPART, G.HINT_NOTPART, G.HINT_NOTPART,
				G.HINT_NOTPART, G.HINT_NOTPART, G.HINT_NOTPART];

		// HINT VALUES:
		// 0 = who cares
		// 1 = correct
		// 2 = incorrect
		// 3 = correct but in wrong order

		for(var i = 0; i< L.level.length; i++){ // check versus attempt
			if((L.level[i] == G.HINT_NOTPART) && (G.level_attempt[i] != G.HINT_NOTPART)){ // a part that shouldn't be
				G.hint_array[i] = G.HINT_WRONG;
			}else if((L.level[i] != G.level_attempt[i])&&(G.level_attempt[i]!=0)){ // wrong order
				G.hint_array[i] = G.HINT_ALMOST;
			}

			if((L.level[i] == G.level_attempt[i]) && (G.level_attempt[i] != 0)){ // check if they're the same, but not if the attempt included 0
				G.hint_array[i] = G.HINT_CORRECT;
			}
		}

		//PS.debug(G.hint_array);
		J.show_hints(); // show the hints
	},

	reset_board: function(){
		G.currentStep = 0; // the currentStep, starts at 0
		G.currentLockedBead = [0, 0]; // the current locked bead
		G.lastLockedBead = [0, 0];
		G.level_attempt =[]; // the level attempt
		G.hint_array=[]; // the hint array
	},

	win_board: function(){ // the board is won!
		S.showIntel();
		PS.audioPlay(A.sfx_win);
		// start timer for how long to show intel then load another one
		G.show_win_timer = PS.timerStart(G.show_win_rate, G.next_level);

		PS.gridPlane(J.PLANE_BEAD_HINT);
		for(var i = 0; i< G.level_attempt.length; i++){
			// if its not zero it has to be part of it
			if(G.level_attempt[i]>0){
				var real = G.convert_simple_to_actual(i);
				PS.alpha(real[0], real[1], 100);
				J.paint_bead(real[0], real[1], "CORRECT");
			}
		}

		// send end to database
		PS.dbEvent( "lockhack_db", "1 for Start 2 for End", 1, "Total attempts", G.currentAttemps, "Level Code 0", L.level[0], "Level Code 1", L.level[1], "Level Code 2", L.level[2], "Level Code 3", L.level[3], "Level Code 4", L.level[4], "Level Code 5", L.level[5], "Level Code 6", L.level[6], "Level Code 7", L.level[7], "Level Code 8", L.level[8]);
	},

	next_level: function(){ // stop the win timer
		PS.timerStop(G.show_win_timer);
		// clear the boards and stuff
		G.reset_attempt();
		G.reset_board();
		J.repaint_board();
		S.hideIntel();
		L.load_level("zero_1");
	},

	convert_simple_to_actual: function(ptr){ // convert the pointer to the actual X/Y value
		var actual_x = 0;
		var actual_y = 0;

		// first we convert to the 3*3 array
		actual_y = Math.floor(ptr / L.y_height);
		actual_x = ptr - (actual_y * L.y_height);

		// next we convert to the actual 9*9 array
		//2 = 7
		//1 = 4
		//0 = 1
		actual_y = actual_y * 3 + 1; /** HARD-CODED **/
		actual_x = actual_x * 3 + 1;

		return [actual_x, actual_y];
	}
};

var L = { // Level logic, loading, etc.

	// Which beads do we care about?
	x_coords: [1, 4, 7], // the x-coords that can have a thing
	y_coords: [1, 4, 7], // the y-coords that can have a thing
	x_width: 3, // height of the level array
	y_height: 3, // height of the level array

	level:[], // the level data, typically a 3x3 array
	numSteps: 0, // the number of beads needed to complete the level


	load_level: function(){
		// reset the level attempt and board
		PS.statusColor(PS.COLOR_WHITE);
		PS.audioPlay(A.sfx_load);
		//PS.statusText("GO: HACKER");

		G.reset_board();
		G.reset_attempt();
		G.isDragging = false; // set dragging to false
		L.numSteps = 0; // set steps to zero initially
		L.currentStep = 0; // reset step to 0
		G.currentAttemps = 0;

		//L.level = level; // set the level
		var level = L.generate_level(false, 4);
		var iterator = 0;

		for(var i = 0; i < level.length; i++){
			for(var j = 0; j < level[0].length; j++){
				L.level[iterator] = level[i][j];
				iterator++;
			}
		}

		PS.gridPlane(J.PLANE_FLOOR);
		PS.borderColor(PS.ALL, PS.ALL, G.COLOR_BG); // temporary until we figure out what background will look like

		var i = 0; // counter for level populator
		for(var y = 0; y < G.GRID_HEIGHT; y++){
			for(var x = 0; x < G.GRID_WIDTH; x++){
				// Check if X or Y are equal to the beads that we care about
				if(L.x_coords.indexOf(x) != -1){
					if(L.y_coords.indexOf(y) != -1){
						// we care
						PS.data(x, y, L.level[i]);
						PS.gridPlane(J.PLANE_BEAD);
						PS.alpha(x, y, 255);
						J.paint_bead(x, y, "DEFAULT"); // color it white or whatever

						if(L.level[i] != 0){ // zeroes are beads that aren't part of the puzzle
							L.numSteps++; // increase nusteps by one
							//PS.color(x, y, PS.COLOR_CYAN); /**FOR DEBUGGING**/
						}

						//PS.glyph(x, y, i.toString()); /**FOR DEBUGGING**/
						i++;

					}
				}
			}
		}

		G.isPlayable = true; // set playable

		// send start to database
		PS.dbEvent( "lockhack_db", "1 for Start 2 for End", 1, "Total attempts", 0, "Level Code 0", L.level[0], "Level Code 1", L.level[1], "Level Code 2", L.level[2], "Level Code 3", L.level[3], "Level Code 4", L.level[4], "Level Code 5", L.level[5], "Level Code 6", L.level[6], "Level Code 7", L.level[7], "Level Code 8", L.level[8]);
	},

	// Code based on Android Password Generator from Berkeley Churchill
	// Content Copyright 2009-2014 Berkeley Churchill. All rights reserved.

	generate_level: function(hard, num) {

		var max_length = num;

		var order = [];

		var mx;
		var my;

		var done = new Array(3);
		var legal = new Array(3);
		var available = 9;

		for (var i = 0;i<3;i++)
		{
			done[i] = new Array(3);
			legal[i] = new Array(3);
			for(var j = 0; j<3 ;j++)
			{
				done[i][j] = 0;
				legal[i][j] = 1;
			}
		}
		var x = -1;
		var y = -1;

		for(var length = 1; length <= max_length; length++)
		{
			//pick an available next location
			var prevx = x;
			var prevy = y;
			var index = Math.ceil(Math.random()*available); //1..available
			var sofar = 0;
			//choice = -1;
			for(var i = 0;i<3;i++)
				for(var j = 0;j<3;j++)
					if(legal[i][j] == 1)
					{
						sofar++;
						if(sofar == index)
						{
							x = i;
							y = j;
							order.push(x);
							order.push(y);
							break;
						}
					}

			//record it
			done[x][y] = length;

			//check available next spots

			available = 0;
			for(var i = 0;i<3;i++)
				for(var j = 0;j<3;j++)
				{
					if(done[i][j] > 0)
					{
						legal[i][j] = 0;
						continue;
					}

					var d1 = Math.abs(i-x);
					var d2 = Math.abs(j-y);
					if(d1 < 2 && d2 < 2)
					{
						legal[i][j] = 1;
						available++;
					}else
					{
						if(d1 != 1 && d2 != 1) //one is 0 or 2, the other is 2
						{
							//just check midpoint
							mx = (x+i)/2;
							my = (y+j)/2;
							if(done[mx][my] == 0)
							{
								legal[i][j] = 0;
								continue;
							}
							else
							{
								legal[i][j] = 1;
								available++;
								continue;
							}
						}else
						{
							if(hard == 1)
							{
								legal[i][j] = 1;
								available++;
								continue;
							}

							if(d1 == 1) //d1 == 1, d2 == 2
							{
								my = (j + y)/2;
								if(done[i][my] == 0 && done[x][my] == 0)
								{
									legal[i][j] = 0;
									continue;
								}
								else
								{
									legal[i][j] = 1;
									available++;
									continue;
								}
							}else       //d1 == 2, d1 == 1
							{
								mx = (i + x)/2;
								if(done[mx][j] == 0 && done[mx][y] == 0)
								{
									legal[i][j] = 0;
									continue;
								}
								else
								{
									available++;
									legal[i][j] = 1;
									continue;
								}
							}

						}
					}
				}
			//done finding valid next moves
		}
		return done;
	}
};

var J = { // Juice
	PLANE_FLOOR: 0, // plane for floor (unneeded?)
	PLANE_LINE: 1, // plane for drawn lines
	PLANE_NEWLINE: 2, // plane for newly drawn lines
	PLANE_BEAD: 3, // plane for drawn beads
	PLANE_LINE_HINT: 4, // plane for hints
	PLANE_BEAD_HINT: 5, // plane for hints


	paint_bead: function(x, y, style){ // style can be DEFAULT, SELECTED, WRONG, ALMOST, CORRECT
		PS.borderColor(x, y, G.COLOR_BG);
		switch(style){
			case "DEFAULT":
				PS.color(x, y, G.COLOR_BEAD_DEFAULT);
				break;
			case "SELECTED":
				PS.color(x, y, G.COLOR_BEAD_SELECTED); // I don't know what this will be
				break;
			case "WRONG":
				PS.color(x, y, G.COLOR_BEAD_INCORRECT);
				break;
			case "ALMOST":
				PS.color(x, y, G.COLOR_BEAD_ALMOST);
				break;
			case "CORRECT":
				PS.color(x, y, G.COLOR_BEAD_CORRECT);
				break;
		}
	},

	repaint_board: function(){ // repaints the whole board to the default
		PS.gridPlane(J.PLANE_FLOOR);
		PS.color(PS.ALL, PS.ALL, G.COLOR_BG);

		// now clear the lines
		PS.gridPlane(J.PLANE_NEWLINE);
		PS.alpha(PS.ALL, PS.ALL, 0);
		PS.gridPlane(J.PLANE_LINE);
		PS.alpha(PS.ALL, PS.ALL, 0);

		// also clear hints
		PS.gridPlane(J.PLANE_BEAD_HINT);
		PS.alpha(PS.ALL, PS.ALL, 0);
	},

	show_hints: function(){ // show the hints, this will be more complicated eventually
		// START HINT TIMER
		G.show_hint_timer = PS.timerStart(G.show_hint_rate, J.hide_hints);

		PS.gridPlane(J.PLANE_BEAD_HINT);
		for(var i = 0; i<G.hint_array.length; i++){
			// switch for the 3 possibilities
			switch(G.hint_array[i]){
				case G.HINT_CORRECT: // make it green
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 100);
					J.paint_bead(real[0], real[1], "CORRECT");
					break;
				case G.HINT_ALMOST: // make it yellow
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 100);
					J.paint_bead(real[0], real[1], "ALMOST");
					break;
				case G.HINT_WRONG: // make it RED
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 100);
					J.paint_bead(real[0], real[1], "WRONG");
					break;
			}
		}
	},

	hide_hints: function(){ // hide the hints, allowing for additional attempts
		PS.timerStop(G.show_hint_timer);
		//PS.debug("hide them now");

		// first clear the hints
		PS.gridPlane(J.PLANE_BEAD_HINT);
		for(var i = 0; i<G.hint_array.length; i++){
			// switch for the 3 possibilities
			switch(G.hint_array[i]){
				case G.HINT_CORRECT: // make it green
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 0);
					J.paint_bead(real[0], real[1], "DEFAULT");
					break;
				case G.HINT_ALMOST: // make it yellow
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 0);
					J.paint_bead(real[0], real[1], "DEFAULT");
					break;
				case G.HINT_WRONG: // make it RED
					var real = G.convert_simple_to_actual(i);
					PS.alpha(real[0], real[1], 0);
					J.paint_bead(real[0], real[1], "DEFAULT");
					break;
			}
		}

		// reset the board and attempt
		J.repaint_board();
		G.reset_board();
		G.reset_attempt();

		// make playable again
		G.isPlayable = true;

	},

	init_planes: function(){
		/*
		PLANE_FLOOR: 0, // plane for floor (unneeded?)
			PLANE_LINE: 1, // plane for drawn lines
			PLANE_NEWLINE: 2, // plane for newly drawn lines
			PLANE_BEAD: 3, // plane for drawn beads
			PLANE_LINE_HINT: 4, // plane for hints
			PLANE_BEAD_HINT: 5, // plane for hints
			*/
		PS.gridPlane(J.PLANE_FLOOR);

		PS.gridPlane(J.PLANE_LINE);
		PS.color(PS.ALL, PS.ALL, G.COLOR_LINE_DEFAULT);
		PS.alpha(PS.ALL, PS.ALL, 0); // invisibile initially
		PS.border(PS.ALL, PS.ALL, 10);
		PS.borderAlpha(PS.ALL, PS.ALL, 0);

		PS.gridPlane(J.PLANE_NEWLINE);
		PS.color(PS.ALL, PS.ALL, G.COLOR_LINE_DEFAULT);
		PS.alpha(PS.ALL, PS.ALL, 0);
		PS.border(PS.ALL, PS.ALL, 16);
		PS.borderColor(PS.ALL, PS.ALL, G.COLOR_BEAD_CORRECT);
		PS.borderAlpha(PS.ALL, PS.ALL, 255);

		PS.gridPlane(J.PLANE_BEAD);
		PS.alpha(PS.ALL, PS.ALL, 0);
		PS.color(PS.ALL, PS.ALL, G.COLOR_BG);
		PS.border(PS.ALL, PS.ALL, 0);



	},

	clear_drawn_lines: function(){
		PS.gridPlane(J.PLANE_NEWLINE);
		PS.alpha(PS.ALL, PS.ALL, 0);
	},

	draw_line: function(x, y, x2, y2){ // draws a line from (x, y) to (x2, y2)
		PS.gridPlane(J.PLANE_NEWLINE);
		// first, clear all lines on the new plane (make transparent)
		J.clear_drawn_lines();

		var line_array = PS.line(x, y, x2, y2);
		for(var i = 0; i<line_array.length; i++){ //iterate thru line array
			var x_point = line_array[i][0];
			var y_point = line_array[i][1];
			PS.alpha(x_point, y_point, 255); // set alpha to max
			//PS.debug("\nx: " + line_array[i][0]);
			//PS.debug("\ny: " + line_array[i][1]);

			var isPeg = false;
			if(L.x_coords.indexOf(x_point) != -1) {
				if (L.y_coords.indexOf(y_point) != -1) {
					isPeg = true;
					// also toggle it
					G.toggle_bead(x_point, y_point);
				}
			}

			if(!isPeg){
				PS.border(line_array[i][0], line_array[i][1], 16); // set border to max
			}

		}
	},

	lock_line: function(){ // draws a permanent line from last x/y to last x2/y2
		PS.gridPlane(J.PLANE_LINE);
		//PS.alpha(PS.ALL, PS.ALL, 0);
		var line_array = PS.line(G.lastLockedBead[0], G.lastLockedBead[1], G.currentLockedBead[0], G.currentLockedBead[1]);
		for(var i = 0; i<line_array.length; i++){ //iterate thru line array
			PS.alpha(line_array[i][0], line_array[i][1], 255); // set alpha to max
		}
	}


};

var A = { // Audio
	sfx_click: "fx_chirp1", // initial touch
	sfx_click_next: "fx_chirp2", // after the initial
	sfx_load: "fx_pop", // loading a level
	sfx_fail: "fx_blast4", // wrong
	sfx_win: "fx_squawk", // correct

	init_sound: function () {

		PS.audioLoad(A.sfx_click);
		PS.audioLoad(A.sfx_click_next);
		PS.audioLoad(A.sfx_load);
		PS.audioLoad(A.sfx_fail);
		PS.audioLoad(A.sfx_win);

	}
};

var E = { // Editor

};

var S = { // Status Line
	intelArray: [], // array of all intel
	readIntel: [], // intel that has been read

	populateIntel : function(){ // populates the array
		// just put strings below here
		// strings must look like...
		//intelArray.push("#############################################");
		S.intelArray.push("Aliens are real.");
		S.intelArray.push("Anime is real.");
		S.intelArray.push("The government is real.");
		S.intelArray.push("Good boys sleep with hands atop the covers.");
		S.intelArray.push("Missouri: Best Nuclear Dropping Site");
		S.intelArray.push("Vaporwave isn't real");
		S.intelArray.push("Burger King: 50% of Gov. Stock");
		S.intelArray.push("[PUT SECRET HERE]");
		S.intelArray.push("The Burger King is the most prolific Lobbyist");
		S.intelArray.push("McDonalds owns 70% of Gov. Stock");
		S.intelArray.push("Unreliable Narrator :^)");
		S.intelArray.push("A hotdog with no bun");
		S.intelArray.push("1/2 Cups of Walnut sauce");
		S.intelArray.push("Cigarettes cure cancer");
		S.intelArray.push("Lobbyists hate him!");
		S.intelArray.push("Military.");
		S.intelArray.push("We lost all the tanks.");
		S.intelArray.push("'Nuclear proliferation is okay I guess'");


	},

	showIntel : function() { // outputs intel to status line
		var rando = PS.random(S.intelArray.length); // generate from 1 to max

		// push shown intel to the already read intel array
		S.readIntel.push(S.intelArray[rando]);
		PS.statusColor(PS.COLOR_WHITE);
		PS.statusText(S.intelArray[rando]);

	},

	hideIntel : function() { // clears status line
		PS.statusText("");
	},
};



// The "use strict" directive in the following line is important. Don't remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't remove them!

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize(G.GRID_WIDTH, G.GRID_HEIGHT);
	PS.data(PS.ALL, PS.ALL, 0);   //init all beads to 0
	PS.gridColor(G.COLOR_BG);
	PS.gridFade(50);
	PS.color(PS.ALL, PS.ALL, G.COLOR_BG);
	PS.border(PS.ALL, PS.ALL, 0);

	PS.dbInit("lockhack_db", false ); // establish database for puzzles, request username input

	J.repaint_board();


	//A.init_sound();
	//L.populate_fail_count();

	J.init_planes();
	A.init_sound();
	S.populateIntel();
	L.load_level();
	//A.start_bgm();

	// Add any other initialization code you need here
};

PS.touch = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	if(!G.isPlayable){
		return;
	}
	G.isDragging = true;  // we are dragging
	G.toggle_bead(x, y);
	G.currentLockedBead = [x, y];
	G.lastLockedBead = [x, y];
};


PS.release = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );
	if(!G.isPlayable){
		return;
	}
	G.isDragging = false; // we are no longer dragging
	G.check_attempt();
};


PS.enter = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );
	if(!G.isPlayable){
		return;
	}
	if(G.isDragging){
		G.toggle_bead(x, y);
		J.draw_line(G.currentLockedBead[0], G.currentLockedBead[1], x, y);
	}
};


PS.exit = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );


};


PS.exitGrid = function( options ) {
	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	J.clear_drawn_lines();
	if(!G.isPlayable){
		return;
	}
	G.isDragging = false; // we are no longer dragging
	G.check_attempt();
};


PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
};


PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};


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


PS.shutdown = function( options ) {
		PS.dbEvent( "lockhack_db", "shutdown", true );
		PS.dbSend( "lockhack_db", "dpallen" );

};
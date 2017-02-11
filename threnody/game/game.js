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
	tick_per_measure: 240,

	timing_quarter: 0,
	timing_eighth: 0,
	timing_sixteenth: 0,
	timing_triplet: 0,

	counter: 0, //current tick
	measure_counter: 0, //current measure
	logic_counter: 0, //current index in logic array

	logic_timings: [], //kms
	last_logic_activity: 0, // used for activities

	isOpportunity: false, // if true, clicking is good!
	isRhythmBegun: false, // has the rhythm begun?
	movementType: 0,

	insanityLevel: 0,
	wiggleRoom: 5,

	init_measure : function() {
		//quarter
		if(G.tick_per_measure % 4 === 0){
			G.timing_quarter = G.tick_per_measure / 4;
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 4\n');
			PS.debug('FAILED ON QUARTER NOTES\n');
		}

		//eighth
		if(G.tick_per_measure % 8 === 0){
			G.timing_eighth = G.tick_per_measure / 8;
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 8\n');
			PS.debug('FAILED ON EIGHTH NOTES\n');
		}

		//sixteenth
		if(G.tick_per_measure % 16 === 0){
			G.timing_sixteenth = G.tick_per_measure / 16;
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 16\n');
			PS.debug('FAILED ON SIXTEENTH NOTES\n');
		}

		//triplet
		if(G.tick_per_measure % 12 === 0){
			G.timing_triplet = G.tick_per_measure / 12;
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 12\n');
			PS.debug('FAILED ON TRIPLETS\n');
		}

		//populate distance array
		G.populate_distance();

		//Counter for the tick
		// Starts at the tick rate as we want the notes to hit on tick 1  
		G.counter = G.tick_per_measure;
		
	},

	//calculate at what tick possible inputs happen
	populate_distance : function(){
		G.logic_timings[0] = G.tick_per_measure;
		G.logic_timings[1] = G.tick_per_measure - G.timing_sixteenth;
		G.logic_timings[2] = G.tick_per_measure - G.timing_triplet;
		G.logic_timings[3] = G.tick_per_measure - (G.timing_sixteenth * 2);
		G.logic_timings[4] = G.tick_per_measure - (G.timing_triplet * 2);
		G.logic_timings[5] = G.tick_per_measure - (G.timing_sixteenth * 3);

		G.logic_timings[6] = G.tick_per_measure - G.timing_quarter;
		G.logic_timings[7] = (G.tick_per_measure - G.timing_quarter) - G.timing_sixteenth;
		G.logic_timings[8] = (G.tick_per_measure - G.timing_quarter) - G.timing_triplet;
		G.logic_timings[9] = (G.tick_per_measure - G.timing_quarter) - (G.timing_sixteenth * 2);
		G.logic_timings[10] = (G.tick_per_measure - G.timing_quarter) - (G.timing_triplet * 2);
		G.logic_timings[11] = (G.tick_per_measure - G.timing_quarter) - (G.timing_sixteenth * 3);

		G.logic_timings[12] = G.tick_per_measure - (G.timing_quarter * 2);
		G.logic_timings[13] = (G.tick_per_measure - (G.timing_quarter * 2)) - G.timing_sixteenth;
		G.logic_timings[14] = (G.tick_per_measure - (G.timing_quarter * 2)) - G.timing_triplet;
		G.logic_timings[15] = (G.tick_per_measure - (G.timing_quarter * 2)) - (G.timing_sixteenth * 2);
		G.logic_timings[16] = (G.tick_per_measure - (G.timing_quarter * 2)) - (G.timing_triplet * 2);
		G.logic_timings[17] = (G.tick_per_measure - G.timing_quarter * 2) -(G.timing_sixteenth * 3);

		G.logic_timings[18] = G.tick_per_measure - (G.timing_quarter * 3);
		G.logic_timings[19] = (G.tick_per_measure - (G.timing_quarter * 3)) - G.timing_sixteenth;
		G.logic_timings[20] = (G.tick_per_measure - (G.timing_quarter * 3)) - G.timing_triplet;
		G.logic_timings[21] = (G.tick_per_measure - (G.timing_quarter * 3)) - (G.timing_sixteenth * 2);
		G.logic_timings[22] = (G.tick_per_measure - (G.timing_quarter * 3)) - (G.timing_triplet * 2);
		G.logic_timings[23] = (G.tick_per_measure - G.timing_quarter * 3) - (G.timing_sixteenth * 3);
	},

	calc_tick_distance : function(goal){
	//	PS.debug("CALCULATING!!!\n");
		var new_index = G.logic_counter + 1; //how many indexes away the next action is 
		var measure = G.measure_counter; //so we can play with measure countign nondestructively

		while((L.level[measure][L.INDEX_LOGIC][new_index]) != goal){
			new_index += 1; //increment if the next one is a 0
			if(new_index >= L.LENGTH_LOGIC){
				measure += 1;

				if(measure >= L.max_measures){
					//not really sure what to do here.  this will be when there aren't any more non-zero event left in the level.  edge cases, man
					//PS.debug('max measures  ' + L.max_measures + '\n');
					//PS.debug('measures  ' + measure + '\n');
                    //
                    //
					//PS.debug('current tick  ' + G.counter + '\n');
					//PS.debug('logic i  ' +  G.logic_counter + '\n');
					//PS.debug('new index  ' + new_index + '\n');
					//PS.debug('new tick  ' + G.logic_timings[new_index] + '\n');
                    //
					//PS.debug('\n\n\n\n');
					return "bad";
				}
			}
		}
		//number of ticks between 
		var delta = ((measure - G.measure_counter) * G.tick_per_measure) + G.counter - (G.logic_timings[new_index]);

		 //PS.debug('max measures  ' + L.max_measures + '\n');
		 //PS.debug('measures  ' + measure + '\n');
		 //PS.debug('current tick  ' + G.counter + '\n');
		 //PS.debug('logic i  ' +  G.logic_counter + '\n');
		 //PS.debug('new index  ' + new_index + '\n');
		 //PS.debug('new tick  ' + G.logic_timings[new_index] + '\n');
         //
		 //PS.debug('delta  ' + delta + '\n');
         //
		 //PS.debug('\n\n\n\n');

		return delta; 

	},

	tick : function () { // the big global tick
		var sixteenth = false;
		var triplet = false;
		// Play a quarter note
		if(G.counter % G.timing_quarter === 0){
			var index_q = 4 - (G.counter / G.timing_quarter); //Defines the position in the level array, which is played
			if(L.level[G.measure_counter][L.INDEX_QUARTER][index_q] === 1){
				PS.audioPlay( A.tone_quarter, { volume: 0.75 } );
				//PS.color ( 1, 1, 0x0000FF);
			} else {
				//PS.color ( 1, 1, 0xFFFFFF);
			}
			
		}

		// Play a eighth note
		if(G.counter % G.timing_eighth === 0){
			var index_e = 8 - (G.counter / G.timing_eighth); //Defines the position in the level array, which is played
			if(L.level[G.measure_counter][L.INDEX_EIGHTH][index_e] === 1){
				PS.audioPlay( A.tone_eighth, { volume: 0.75 } );
				//PS.color ( 1, 3, 0x00FF00);
			} else {
				//PS.color ( 1, 3, 0xFFFFFF);
			}
		}

		// Play a sixteenth note
		if(G.counter % G.timing_sixteenth === 0){
			var index_s = 16 - (G.counter / G.timing_sixteenth); //Defines the position in the level array, which is played
			sixteenth = true;
			if(L.level[G.measure_counter][L.INDEX_SIXTEENTH][index_s] === 1){
				PS.audioPlay( A.tone_sixteenth, { volume: 0.75 } );
				//PS.color ( 1, 5, 0xFF0000);
			} else {
				//PS.color ( 1, 5, 0xFFFFFF);
			}
		}

		// Play a triplet
		if(G.counter % G.timing_triplet === 0){
			var index_t = 12 - (G.counter / G.timing_triplet); //Defines the position in the level array, which is played
			triplet = true;			
			if(L.level[G.measure_counter][L.INDEX_TRIPLET][index_t] === 1){
				PS.audioPlay( A.tone_triplet, { volume: 0.75 } );
				//PS.color ( 1, 7, 0xFF00FF);
			} else {
				//PS.color ( 1, 7, 0xFFFFFF);
			}
		}

		// Call if eligible for prompt, 1 = start fadein, 2 = clear because miss, 3 = open opportunity
		if(triplet || sixteenth){
			if(L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] !== 0){
				// This would be the command for input sprite drawing
				G.beat_logic(L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter]);
			//	PS.color(6, PS.ALL, 0xFFFF00);
			} else {
				//PS.color(6, PS.ALL, 0xFFFFFF);
			}
			
			G.logic_counter += 1;
		}

		// increment
		G.counter -= 1;

		if(G.counter <=  0){
			G.counter = G.tick_per_measure;

			G.measure_counter += 1;
			G.logic_counter = 0;

			if(G.measure_counter >= (L.max_measures)){
				// set measure counter back to 0
				G.measure_counter = 0;
				//PS.timerStop(G.global_timer);
			}
		}

	},

	start_global_timer : function() { // starts the global timer
		G.isRhythmBegun = true;
		G.global_timer = PS.timerStart(G.global_rate, G.tick);
	},

	//1 = start fadein, 2 = clear because miss, 3 = open opportunity
	beat_logic : function(action){
		//PS.debug(action);
		switch(action){
			case 1: // start fadein
				PS.statusText("FADING");
				G.isOpportunity = true;
				G.spawn_object_tap(0);
				break;
			case 2: // clear because miss
				PS.statusText("");
				G.miss_object();
				break;
			case 3: // open opportunity
				PS.statusText("CLICK NOW");
				G.last_logic_activity = G.counter;
				//PS.debug("LAST LOGIC: " + G.last_logic_activity);
				//PS.debug("\n");
				//PS.debug("NEXT LOGIC: " + (G.counter+ G.calc_tick_distance()));
				//PS.debug("\n");
				break;
		}
	},

	spawn_object_tap : function(fade_time) { // creates a tap object
		J.object_show_time = fade_time;
		P.spawn_object("tap");
	},

	spawn_object_drag : function(fade_time) { // creates a drag object

	},

	spawn_object_hold : function(fade_time) {

	},

	click : function() {
		if(!G.isOpportunity){
			return;
		}
		// PUT IF STATEMENT HERE, IS IT IN RANGE?!?!?
		//PS.debug("delta: " + G.calc_tick_distance());
		//PS.debug("wiga: " + G.wiggleRoom);
		G.wiggleRoom = 10;
		var last_good = G.last_logic_activity;
		var next_good = G.counter - G.calc_tick_distance(3);
		var dif_last = last_good - G.counter;
		var dif_next = G.counter - next_good;

		//PS.debug("current tick: " + G.counter + "\n");
		//PS.debug("last tick: " + G.last_logic_activity + "\n");
		//PS.debug("next tick: " + next_good + "\n");
		//PS.debug("dif last: " + dif_last + "\n");
		//PS.debug("dif next: " + dif_next + "\n");

		var is_close_to_last = false
		var is_close_to_next = false;
		if(dif_last < G.wiggleRoom){
			is_close_to_last = true;
		}
		if(dif_next < G.wiggleRoom){
			is_close_to_next = true;
		}

		//PS.debug("close last: " + is_close_to_last + "\n");
		//PS.debug("close next: " + is_close_to_next + "\n");

		if(is_close_to_last || is_close_to_next){
			G.hit_object();

		}else{
			G.bad_click();
		}
	},

	bad_click : function(){
		PS.dbEvent( "threnody", "hit status: ", "hit at wrong time");
		G.isOpportunity = false;

		J.error_glow();
		G.increase_insanity();

	},

	hit_object : function(){
		//PS.debug("hit!");
		G.isOpportunity = false;

		PS.dbEvent( "threnody", "hit status: ", "hit");
		J.hit_glow();
		P.delete_object();
	},

	miss_object : function(){
		//PS.debug("miss!");
		PS.dbEvent( "threnody", "hit status: ", "misssed");
		G.isOpportunity = false;

		if(!P.object_exists){
			return;
		}
		//G.opportunity_close();
		J.error_glow();
		J.hide_object();

		G.increase_insanity();
	},

	increase_insanity : function(){
		G.insanityLevel++;
	},

	complete_chapter : function(){
		PS.dbEvent( "threnody", "chapter complete", true);
	},

	start_chapter : function(number){
		switch(number){
			case "one":
				PS.dbEvent( "threnody", "chapter one begun", true);
				break;
			case "two":
				PS.dbEvent( "threnody", "chapter two begun", true);
				break;
			case "three":
				PS.dbEvent( "threnody", "chapter three begun", true);
				break;
		}

	},

	end_game : function(){

		PS.dbEvent( "threnody", "endgame", true );

		// Email the database and discard it

		PS.dbSend( "threnody", "dpallen", { discard : true } );
	},
};

var L = {//level or chapter logic
	INDEX_QUARTER: 0,
	INDEX_EIGHTH: 1,
	INDEX_SIXTEENTH: 2,
	INDEX_TRIPLET: 3,

	INDEX_LOGIC: 4,

	LENGTH_LOGIC: 24,

	level: [],
	max_measures: 0,

	one : function() {

		L.level = [
			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  0,  0, 1, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic

			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     1,     0,     1,     1,     0,     1    ],  //eighth
				[0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  0,  0, 0, 0,  1,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 0, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     1,     0,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  0,  0, 0, 0,  1,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 0, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[0, 0,  1,  0, 0, 0,  0,  0, 0, 0,  1,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[0, 0,0,1,0,0, 3, 0,0,2,0,0, 0, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     1,     0,     1,     1,     0,     1    ],  //eighth
				[0, 0,  1,  0, 0, 0,  0,  0, 0, 0,  1,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[0, 0,0,1,0,0, 3, 0,0,2,0,0, 0, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  1,  0, 0, 0,  1,  0, 1, 0,  0,  0],  //sixteenth
				[0,   0,  0,   0,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 0, 0,0,3,0,0, 2, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     0,     1,     0,     1,     0,     1    ],  //eighth
				[1, 0,  1,  0, 1, 0,  1,  0, 1, 0,  1,  0, 1, 0,  1,  0],  //sixteenth
				[1,   0,  0,   1,   0,  0,   1,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,3,0,2, 1, 0,0,3,0,2, 1, 0,0,3,0,2, 1, 0,0,3,0,2],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  1,  0, 0, 0,  1,  0, 1, 0,  0,  0],  //sixteenth
				[0,   0,  0,   0,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 0, 0,0,3,0,0, 2, 0,0,1,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     0,     1,     0,     1,     0,     1    ],  //eighth
				[1, 0,  1,  0, 1, 0,  1,  0, 1, 0,  1,  0, 1, 0,  1,  0],  //sixteenth
				[1,   0,  0,   1,   0,  0,   1,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,3,0,2, 1, 0,0,3,0,2, 1, 0,0,3,0,2, 1, 0,0,3,0,2],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     0,     1,     0,     1,     0,     1,     0    ],  //eighth
				[1, 0,  0,  0, 1, 0,  0,  0, 1, 0,  0,  0, 1, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   1,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic

			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     0,     1,     0,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 1, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[1,   1,  1,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,3,2,1,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     0,     1,     0,     1,     0,     1,     0    ],  //eighth
				[1, 0,  0,  0, 1, 0,  0,  0, 1, 0,  0,  0, 1, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   1,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic

			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     0,     1,     0,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 1, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[1,   1,  1,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,3,2,1,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[1,     1,     0,     1,     1,     1,     0,     1    ],  //eighth
				[1, 0,  0,  0, 0, 0,  0,  0, 1, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic

			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1,            1,            1,            1           ],  //quarter
				[0,     1,     1,     0,     1,     1,     0,     1    ],  //eighth
				[0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0],  //sixteenth
				[0,   0,  0,   1,   0,  0,   0,   0,  0,   1,   0,  0  ],  //triplet
				[1, 0,0,0,0,0, 3, 0,0,2,0,0, 1, 0,0,0,0,0, 3, 0,0,2,0,0],  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				]
				
		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	}
};

var S = { // status line

	};

var J = {//juice
	COLOR_BACKGROUND: PS.COLOR_BLACK,
	COLOR_BACKGROUND_GLOW: PS.COLOR_WHITE,
	COLOR_BACKGROUND_BORDER: PS.COLOR_WHITE,

	LAYER_BACKGROUND: 0,
	LAYER_OBJECT: 1,
	LAYER_OBJECT_HIDE: 2,
	LAYER_CLICK: 3,

	object_show_time: 0,
	object_hide_time: 0,

	error_timer: 0, // timer for error glow
	opportunity_glow_timer: 0, // timer for timing grid glow

	init_grid: function(){
		PS.gridSize(G.GRID_WIDTH, G.GRID_HEIGHT);
		PS.gridColor(J.COLOR_BACKGROUND);

		PS.gridPlane(J.LAYER_BACKGROUND); // set to background layer
		PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);
		PS.color(PS.ALL, 0, J.COLOR_BACKGROUND_BORDER);
		PS.color(PS.ALL, 31, J.COLOR_BACKGROUND_BORDER);
		PS.color(0, PS.ALL, J.COLOR_BACKGROUND_BORDER);
		PS.color(31, PS.ALL, J.COLOR_BACKGROUND_BORDER);

		PS.border(PS.ALL, PS.ALL, 0);

		PS.gridPlane(J.LAYER_OBJECT_HIDE);
		PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);
		PS.color(PS.ALL, 0, J.COLOR_BACKGROUND_BORDER);
		PS.color(PS.ALL, 31, J.COLOR_BACKGROUND_BORDER);
		PS.color(0, PS.ALL, J.COLOR_BACKGROUND_BORDER);
		PS.color(31, PS.ALL, J.COLOR_BACKGROUND_BORDER);
		PS.fade(PS.ALL, PS.ALL, 0);
		PS.alpha(PS.ALL, PS.ALL, 255);
	},

	show_object: function(){
		PS.gridPlane(J.LAYER_OBJECT_HIDE);
		// UPDATE THE OBJECT SHOW TIME
		//PS.debug("SHOWING OBJECT\n");
		J.object_show_time = G.calc_tick_distance(3);
	//	PS.debug(J.object_show_time);
		//PS.debug("DELTA: " + J.object_show_time + "\n");
		PS.fade(PS.ALL, PS.ALL, J.object_show_time);
		//PS.fade(0, 0, J.object_show_time, {onEnd: G.opportunity_open});
		PS.alpha(PS.ALL, PS.ALL, 0);
		PS.gridShadow(false);
	},

	hide_object: function(){
		PS.gridPlane(J.LAYER_OBJECT_HIDE);
		PS.fade(PS.ALL, PS.ALL, 0);
		PS.alpha(PS.ALL, PS.ALL, 255);
	},

	hit_glow: function(){
		PS.gridShadow(true, PS.COLOR_GREEN);
	},

	error_glow: function(){
		//PS.debug("mistake!");
		PS.gridShadow(true, PS.COLOR_RED);
	},

};

var P = { // sPrites
	SPRITE_PATH: "C:/Users/henry/Documents/GitHub/imgd3900/threnody/game/sprites/",	//where are the sprites?

	spriteX: 11, // where do sprites go
	spriteY: 11, // where do sprites go
	current_object: 0, // there is only ever one object

	object_exists: false, // is there an object there?

	spawn_object: function(type){
		var loader;
		loader = function(data){
			P.current_object = PS.spriteImage(data);
			PS.spritePlane(P.current_object, J.LAYER_OBJECT);
			PS.spriteMove(P.current_object, 11, 11);

		};
		switch(type){
			case "tap":
				PS.imageLoad("sprites/peg_tap.png", loader);
				break;
			case "hold":
				break;

		}

		PS.gridFade(0);
		P.object_exists = true;
		J.show_object();
	},

	delete_object: function(){
		if(P.object_exists){
			PS.spriteDelete(P.current_object);
			P.object_exists = false;
			J.hide_object();
			return;
		}

	},
};

var A = {//audio

	//sounds 
	tone_quarter: "xylo_c5",
	tone_eighth: "xylo_eb5",
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

	A.load();

	J.init_grid();
	
	G.init_measure();
	L.one();

	//G.spawn_object_tap(15);

	//SET TO TRUE BFORE WE'RE DONE
	PS.dbInit( "threnody", { login : false } );

	//G.start_global_timer();

	//G.spawn_object_tap(15);

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

	// TEMP 
	//var d = G.calc_tick_distance();

	if(!G.isRhythmBegun){
		PS.statusText("THE PLACEHOLDER SOUNDS");
		PS.statusColor(PS.COLOR_WHITE);
		G.start_global_timer();
	}else{
		G.click();
	}
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
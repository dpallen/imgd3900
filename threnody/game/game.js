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

	peg_width: 10,
	peg_height: 10,

	global_rate: 1,
	global_timer: 0,

	beat_rate: 0,	
	
	//beats
	// tick counter divided by the timing variables will trigger the playing of a note
	tick_per_measure: 240,

	timing_quarter: 0, 
	timing_sixteenth: 0,
	timing_triplet: 0,

	counter: 0, //current tick
	measure_counter: 0, //current measure
	logic_counter: 0, //current index in logic array

	logic_timings: [], //kms
	last_logic_activity: 0, // used for activities

	isPlayable: true,
	isOpportunity: false, // if true, clicking is good!
	isRhythmBegun: false, // has the rhythm begun?
	isHolding: false, // are we holding?
	actionType: 0, // 1 for tap, 2 for hold, [amount] for direction

	insanityLevel: 0,
	wiggleRoom: 5,

	init_measure : function() {
		
		if(G.tick_per_measure % 4 === 0){
			G.timing_quarter = G.tick_per_measure / 4;
		} else {
			PS.debug('TICKS PER MEASURE NOT DIVISIBLE BY 4\n');
			PS.debug('FAILED ON QUARTER NOTES\n');
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
		var new_index = G.logic_counter + 1; //how many indexes away the next action is 
		var measure = G.measure_counter; //so we can play with measure countign nondestructively

		while((L.level[measure][L.INDEX_LOGIC][new_index]) != goal){
			new_index += 1; //increment if the next one is a 0
			if(new_index >= L.LENGTH_LOGIC){
				measure += 1;

				if(measure >= L.max_measures){
					return "bad";
				}
			}
		}
		//number of ticks between

		//PS.debug("\n" + measure +"\n");
		//PS.debug(G.measure_counter +"\n");
		//PS.debug(G.tick_per_measure +"\n");
		//PS.debug(G.counter +"\n");
		//PS.debug(new_index);
		//PS.debug(G.logic_timings[new_index] +"\n");

		var delta = ((measure - G.measure_counter) * G.tick_per_measure) + G.counter - (G.logic_timings[new_index]);

		return delta; 

	},

	tick : function () { // the big global tick
		
		// Call if eligible for prompt, 1 = start fadein, 2 = clear because miss, 3 = open opportunity
		if((G.counter % G.timing_triplet === 0) || (G.counter % G.timing_sixteenth === 0)){
			if(L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] !== 0){
				G.beat_logic(L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter]);
			}
			if(L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_TAP ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_HOLD ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoB ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoL ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoLR ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoR ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoU ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_IN_DRAG_MtoUB ||
				L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter] === L.ACT_FADE_OUT){
				A.play_beat();
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
				//G.measure_counter = 0;
				PS.timerStop(G.global_timer);

				// game over
				S.end_game();
			}
		}

	},

	start_global_timer : function() { // starts the global timer
		G.isRhythmBegun = true;
		G.isPlayable = true;
		G.global_timer = PS.timerStart(G.global_rate, G.tick);
	},

	//1 = start fadein, 2 = clear because miss, 3 = open opportunity
	beat_logic : function(action){
		switch(action){
			case L.ACT_FADE_IN_TAP: // start fadein
				G.isOpportunity = true;
				L.actionType = L.ACT_FADE_IN_TAP; // set the action to the current fade in style
				G.spawn_object_tap();
				break;
			case L.ACT_FADE_IN_HOLD:
				G.isOpportunity = true;
				L.actionType = L.ACT_FADE_IN_HOLD;
				G.spawn_object_hold();
				break;
			case L.ACT_FADE_IN_DRAG_MtoB:
				break;
			case L.ACT_FADE_IN_DRAG_MtoL: // clear because miss
				break;
			case L.ACT_FADE_IN_DRAG_MtoLR: // open opportunity
				break;
			case L.ACT_FADE_IN_DRAG_MtoR:
				break;
			case L.ACT_FADE_IN_DRAG_MtoU:
				break;
			case L.ACT_FADE_IN_DRAG_MtoUB:
				break;
			case L.ACT_CLICK: // open opportunity
				G.last_logic_activity = G.counter;
				break;
			case L.ACT_FADE_OUT: // clear because miss
				PS.statusText("");
				G.miss_object();
				break;

		}
	},

	spawn_object_tap : function() { // creates a tap object
		G.actionType = L.ACT_FADE_IN_TAP;
		P.object_is_hit = false;
		P.SPRITE_LOCATION = "sprites/tap_shrink/";
		S.show_message("GET READY TO TAP");
		P.spawn_object("peg_tap_shrink");
	},

	spawn_object_drag : function() { // creates a drag object

	},

	spawn_object_hold : function() {
		G.actionType = L.ACT_FADE_IN_HOLD;
		P.object_is_hit = false;
		P.SPRITE_LOCATION = "sprites/hold_shrink/";
		S.show_message("GET READY TO HOLD");
		P.spawn_object("hold_shrink");
	},

	is_wiggle_room : function(){
		G.wiggleRoom = 10; // set waggle room

		var last_good = G.last_logic_activity;
		var next_good = G.counter - G.calc_tick_distance(L.ACT_CLICK);
		var dif_last = last_good - G.counter;
		var dif_next = G.counter - next_good;


		var is_close_to_last = false;
		var is_close_to_next = false;

		/*PS.debug("current tick: " + G.counter + "\n");
		PS.debug("last tick: " + G.last_logic_activity + "\n");
		PS.debug("next tick: " + next_good + "\n");
		PS.debug("dif last: " + dif_last + "\n");
		PS.debug("dif next: " + dif_next + "\n");*/

		if((dif_last < G.wiggleRoom) && (last_good > G.counter)){
			is_close_to_last = true;
		}
		if(dif_next < G.wiggleRoom){
			is_close_to_next = true;
		}

		if(is_close_to_last || is_close_to_next){
			return true;
		}

		return false;
	},

	click : function() {
		if(!G.isOpportunity){
			return;
		}

		if(G.is_wiggle_room()){
			// what kind of interaction?
			if(G.actionType == L.ACT_FADE_IN_TAP){
				G.hit_object();
			}
			if(G.actionType == L.ACT_FADE_IN_HOLD){
				G.hold_object();
			}

		}else{
			G.bad_click();
		}
	},

	isOnPeg : function(x, y){ // are we on the peg?
		if(x > 10 && x < 21){
			if(y > 10 && y < 21){
				return true;
			}
		}

		return false;
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
		P.object_is_hit = true;

		PS.dbEvent( "threnody", "hit status: ", "hit");
		S.show_message("HIT");

		A.play_action_sound();
		J.hit_glow();
		//P.delete_object();
	},

	hold_object : function(){
		PS.dbEvent( "threnody", "hit status: ", "hold start");
		S.show_message("HOLDING");

		P.object_is_hit = true;
		A.play_beat();
		J.hold_glow();

	},

	miss_object : function(){
		//PS.debug("miss!");
		PS.dbEvent( "threnody", "hit status: ", "misssed");
		G.isOpportunity = false;


		if(P.object_is_missed || P.object_is_hit){
			return;
		}

		J.error_glow();
		J.hide_object();
		G.increase_insanity();
	},

	increase_insanity : function(){
		G.insanityLevel++;
	},

};

var L = {//level or chapter logic
	
	ACT_NULL: 0,
	ACT_FADE_IN_TAP: 1, // was 1 originally
	ACT_FADE_IN_HOLD: 2,
	ACT_FADE_IN_DRAG_MtoL: 3,
	ACT_FADE_IN_DRAG_MtoR: 4,
	ACT_FADE_IN_DRAG_MtoLR: 5,
	ACT_FADE_IN_DRAG_MtoU: 6,
	ACT_FADE_IN_DRAG_MtoB: 7,
	ACT_FADE_IN_DRAG_MtoUB: 8,
	ACT_FADE_OUT: 9, // was 2 originally
	ACT_CLICK: 10, // was 3 originally

	INDEX_LOGIC: 0,

	LENGTH_LOGIC: 24,

	level: [],
	max_measures: 0,

	one : function() {

		L.level = [
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,2,0,0, 10, 0,0,9,0,0] //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[0, 0,0,1,0,0, 10, 0,0,9,0,0, 0, 0,0,2,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[0, 0,0,2,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 0, 0,0,10,0,0, 9, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1, 0,0,10,0,9, 1, 0,0,10,0,9, 1, 0,0,10,0,9, 1, 0,0,10,0,9]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
			[
				[1, 0,0,0,0,0, 0, 0,0,10,0,0, 9, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				
			[
				[1, 0,0,10,0,9, 1, 0,0,10,0,9, 1, 0,0,10,0,9, 1, 0,0,10,0,9]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0] //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,10,9,1,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,10,9,1,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				]
				
		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	}
};

var S = { // status line and chapter control
	welcome_array: [],
	welcome_timer: 0,
	welcome_rate: 15,
	welcome_counter: 0,
	welcome_text_counter: 0,

	show_message: function(text){
		PS.statusColor(PS.COLOR_WHITE);
		PS.statusText(text);
	},

	populate_welcome_array: function(){
		S.welcome_array[0] = "July 16, 1923";
		S.welcome_array[1] = "Exham Priory, England";
		S.welcome_array[2] = "I am a Delapore";
		S.welcome_array[3] = "This is my estate";

	},
	welcome_statement: function(){
		PS.statusColor(PS.COLOR_BLACK);
		PS.statusFade(5);
		G.isPlayable = false;
		S.welcome_timer = PS.timerStart(S.welcome_rate, S.welcome_statement_helper);
	},
	welcome_statement_helper: function(){
		//PS.debug(S.welcome_counter);
		if(S.welcome_counter%2 == 0){ // every other should be a message update
			if(!A.bgm_is_playing){
				A.play_bgm();
			}
			PS.statusColor(PS.COLOR_WHITE);

			PS.statusText(S.welcome_array[S.welcome_text_counter]);
			S.welcome_text_counter++;

		}else{
			PS.statusColor(PS.COLOR_BLACK);
		}

		S.welcome_counter++;
		if(S.welcome_text_counter > S.welcome_array.length){
			//PS.debug("stopping");
			PS.statusColor(PS.COLOR_BLACK);
			//PS.statusFade(0);
			//PS.statusText("MEME");
			//PS.statusColor(PS.COLOR_WHITE);
			PS.timerStop(S.welcome_timer);
			S.start_chapter("one");
		}
	},

	complete_chapter : function(){
		PS.dbEvent( "threnody", "chapter complete", true);
	},

	start_chapter : function(number){
		switch(number){
			case "one":
				PS.dbEvent( "threnody", "chapter one begun", true);
				PS.statusColor(PS.COLOR_WHITE);
				PS.statusText("CHAPTER ONE");
				G.start_global_timer();
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

		S.show_message("DEMO OVER");

		PS.dbEvent( "threnody", "endgame", true );

		// Email the database and discard it

		PS.dbSend( "threnody", "dpallen", { discard : true } );
	},
};

var J = {//juice
	COLOR_BACKGROUND: PS.COLOR_BLACK,
	COLOR_BACKGROUND_GLOW: PS.COLOR_WHITE,
	COLOR_BACKGROUND_BORDER: PS.COLOR_WHITE,

	COLOR_HOLD: PS.COLOR_BROWN,

	LAYER_BACKGROUND: 0,
	LAYER_OBJECT: 1,
	LAYER_OBJECT_HIDE: 2,
	LAYER_CLICK: 3,

	object_show_time: 0,
	object_hide_time: 0,
	object_hit_time: 1,
	object_hold_time: 3,
	object_miss_time: 3,

	hit_total_sprites: 0,
	hold_total_sprites: 0,
	miss_total_sprites: 0,

	object_show_counter: 16,
	object_show_rate: 0,
	object_show_timer: 0,

	object_hit_counter: 6,
	object_hit_rate: 0,
	object_hit_timer: 0,

	object_hold_counter: 5,
	object_hold_rate: 0,
	object_hold_timer: 0,

	object_miss_counter: 6,
	object_miss_rate: 0,
	object_miss_timer: 0,

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
		//PS.alpha(PS.ALL, PS.ALL, 255);
	},

	show_object: function(type){
		PS.gridPlane(J.LAYER_OBJECT_HIDE);
		// UPDATE THE OBJECT SHOW TIME
	  //PS.debug("SHOWING OBJECT\n");

		J.current_object_type = type;
		J.object_show_time = G.calc_tick_distance(L.ACT_CLICK); // time until opportuity

		J.object_show_counter = 14; // default???
		J.object_show_rate = J.object_show_time / J.object_show_counter;
		//PS.debug(J.object_show_time);
		//PS.debug("DELTA: " + J.object_show_time + "\n");
		//PS.fade(PS.ALL, PS.ALL, J.object_show_time);
		//PS.fade(0, 0, J.object_show_time, {onEnd: G.opportunity_open});
		//PS.alpha(PS.ALL, PS.ALL, 0);
		//PS.gridShadow(false);

		P.object_is_appearing = true;
		P.object_is_missed = false;

		switch(G.actionType){
			case L.ACT_FADE_IN_TAP:
				P.ready_sprite = "sprites/peg_tap_ready.png";
				P.move_x = 1;
				P.move_y = 11;
				J.object_show_timer = PS.timerStart(J.object_show_rate, P.show_object_helper);
				break;
			case L.ACT_FADE_IN_HOLD:
				P.ready_sprite = "sprites/peg_hold_ready.png";
				P.move_x = 11;
				P.move_y = 1;
				J.object_show_timer = PS.timerStart(J.object_show_rate, P.show_object_helper);
				break;
		}
	},

	hide_object: function(){
	//	PS.gridPlane(J.LAYER_OBJECT_HIDE);
		//PS.fade(PS.ALL, PS.ALL, 0);
		//PS.alpha(PS.ALL, PS.ALL, 255);
	},

	hit_glow: function(){
		PS.gridShadow(true, PS.COLOR_GREEN);
		J.current_object_type = "peg_tap_hit";
		J.object_hit_counter = 0;
		J.object_hit_rate = J.object_hit_time;
		J.hit_total_sprites = 8;
		//PS.debug("\n" + J.object_hit_rate + "\n");

		P.SPRITE_LOCATION = "sprites/tap_hit/";
		if(P.object_is_appearing){
			PS.timerStop(J.object_show_timer);
		}
		J.object_hit_timer = PS.timerStart(J.object_hit_rate, P.hit_object_helper);
	},

	hold_glow: function(){
		PS.gridShadow(true, J.COLOR_HOLD);
		P.object_is_held = true;

		J.current_object_type = "peg_hold_hit";
		J.object_hold_counter = 0;
		J.object_hold_rate = J.object_hold_time;
		J.hold_total_sprites = 5;

		P.SPRITE_LOCATION = "sprites/hold_hit/";
		if(J.object_is_appearing){
			PS.timerStop(J.object_show_timer);
		}
		J.object_hold_timer = PS.timerStart(J.object_hold_rate, P.hold_object_helper);

	},

	error_glow: function(){
		//PS.debug("mistake!");
		P.delete_object();
		S.show_message("MISS");
		// stop appearing
		if(P.object_is_appearing){
			P.object_is_appearing = false;
			PS.timerStop(J.object_show_timer);
		}

		if(P.object_is_missed){ // do not miss if we are already misisng
			return;
		}

		PS.gridShadow(true, PS.COLOR_RED);
		P.object_is_missed = true; // we are in miss state

		J.current_object_type = "peg_tap_miss";
		J.object_miss_counter = 0;
		J.object_miss_rate = J.object_miss_time;
		J.miss_total_sprites = 5;

		P.SPRITE_LOCATION = "sprites/tap_miss/";
		J.object_miss_timer = PS.timerStart(J.object_miss_rate, P.miss_object_helper);
	},

};

var P = { // sPrites
	SPRITE_PATH: "C:/Users/henry/Documents/GitHub/imgd3900/threnody/game/sprites/",	//where are the sprites?
	SPRITE_LOCATION: "",

	spriteX: 11, // where do sprites go
	spriteY: 11, // where do sprites go
	current_object: 0, // there is only ever one object
	current_miss: 0,
	current_hit: 0,
	current_object_type: "",

	ready_sprite: "", // the ready sprite

	object_exists: false, // is there an object there?
	object_is_appearing: false, // is the object appearing?
	object_is_missed: false, // is the object missed?
	object_is_held: false, // is the object in held state?
	object_is_hit: false, // is the object in hit state?

	move_x: 0,
	move_y: 0,

	reset_sprite: function(){

		P.delete_object();

		//P.current_object = 0;
		//P.current_object_type = "nothing";
		//J.object_show_counter = "nothing";
		//P.ready_sprite = "nothing";

	},

	spawn_object: function(type){
		PS.gridFade(0);
		P.object_exists = true;
		J.show_object(type);
	},

	show_object_helper: function(){

		var loader;
		loader = function(data){
			P.current_object = PS.spriteImage(data);
			PS.spritePlane(P.current_object, J.LAYER_OBJECT);
			PS.spriteMove(P.current_object, P.move_x, P.move_y);

		};

		if(J.object_show_counter < 10){
			var theImage = J.current_object_type + "0" + J.object_show_counter;
		}else{
			var theImage = J.current_object_type + J.object_show_counter;
		}
		theImage = P.SPRITE_LOCATION + theImage + ".png";

		PS.imageLoad(theImage, loader);
		J.object_show_counter--;

		//sound stuff
		if(G.actionType == L.ACT_FADE_IN_TAP){
			A.play_appear_horiz();
		}
		if(G.actionType == L.ACT_FADE_IN_HOLD){
			A.play_appear_vert();
		}
		if(J.object_show_counter<0){
			theImage = P.ready_sprite;
			PS.imageLoad(theImage, loader);
			PS.timerStop(J.object_show_timer);
			P.object_is_appearing = false;
			//P.reset_sprite();
		}


	},

	hit_object_helper: function(){
		var loader;
		loader = function(data){
			P.current_hit = PS.spriteImage(data);
			PS.spritePlane(P.current_hit, J.LAYER_OBJECT);
			PS.spriteMove(P.current_hit, 1, 11);

		};

		if(J.object_hit_counter < 10){
			var theImage = J.current_object_type + "0" + J.object_hit_counter;
		}else{
			var theImage = J.current_object_type + J.object_hit_counter;
		}
		theImage = P.SPRITE_LOCATION + theImage + ".png";

		PS.imageLoad(theImage, loader);
		J.object_hit_counter++;
		if(J.object_hit_counter > J.hit_total_sprites){
			//theImage = "sprites/peg_tap_ready.png";
			//PS.imageLoad(theImage, loader);
			PS.timerStop(J.object_hit_timer);
			//P.reset_sprite();
		}
	},

	hold_object_helper: function(){
		if(!G.isHolding){
			//PS.debug("HOLD OH NO");
			PS.timerStop(J.object_hold_timer);
			P.object_is_held = false;
			P.hold_object_miss();
		}
		var loader;
		loader = function(data){
			P.current_object = PS.spriteImage(data);
			PS.spritePlane(P.current_object, J.LAYER_OBJECT);
			PS.spriteMove(P.current_object, 11, 1);

		};


		if(J.object_hold_counter < 10){
			var theImage = J.current_object_type + "0" + J.object_hold_counter;
		}else{
			var theImage = J.current_object_type + J.object_hold_counter;
		}
		theImage = P.SPRITE_LOCATION + theImage + ".png";

		PS.imageLoad(theImage, loader);
		J.object_hold_counter++;
		if(J.object_hold_counter > J.hold_total_sprites){
			//theImage = "sprites/peg_tap_ready.png";
			//PS.imageLoad(theImage, loader);
				PS.timerStop(J.object_hold_timer);
				P.object_is_held = false;
				PS.gridShadow(true, PS.COLOR_GREEN);
				P.reset_sprite();
		}
	},

	release_object: function(){

	},

	hold_object_miss: function(){

		//P.reset_sprite();
		PS.gridPlane(J.LAYER_OBJECT);
		PS.gridShadow(true, PS.COLOR_RED);
	},

	miss_object_helper: function(){

		var loader;
		loader = function(data){
			P.current_miss = PS.spriteImage(data);
			PS.spritePlane(P.current_miss, J.LAYER_OBJECT);
			PS.spriteMove(P.current_miss, 1, 11);

		};

		if(J.object_miss_counter < 10){
			var theImage = J.current_object_type + "0" + J.object_miss_counter;
		}else{
			var theImage = J.current_object_type + J.object_miss_counter;
		}
		theImage = P.SPRITE_LOCATION + theImage + ".png";

		PS.imageLoad(theImage, loader);
		J.object_miss_counter++;
		if(J.object_miss_counter > J.miss_total_sprites){
			//theImage = "sprites/peg_tap_ready.png";
			//PS.imageLoad(theImage, loader);
			PS.timerStop(J.object_miss_timer);
			//P.reset_sprite();
		}
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

	TONE_NULL: "NULL",
	TONE_FADE_IN: "fx_hoot",
	TONE_FADE_OUT: "NULL",
	TONE_CLICK: "fx_pop",

	SONG_BGM_0: "bgm_level_0_drum",
	TONE_TAP_0: "sfx_hit_0",
	TONE_TAP_1: "sfx_hit_1",
	TONE_TAP_2: "sfx_hit_2",
	TONE_TAP_3: "sfx_hit_3",
	TONE_TAP_4: "sfx_hit_4",

	TONE_APPEAR_HORIZ_0: "sfx_fade_horizontal_0",
	TONE_APPEAR_HORIZ_1: "sfx_fade_horizontal_1",
	TONE_APPEAR_HORIZ_2: "sfx_fade_horizontal_2",
	TONE_APPEAR_HORIZ_3: "sfx_fade_horizontal_3",
	TONE_APPEAR_HORIZ_4: "sfx_fade_horizontal_4",
	TONE_APPEAR_HORIZ_5: "sfx_fade_horizontal_5",
	TONE_APPEAR_HORIZ_6: "sfx_fade_horizontal_6",
	TONE_APPEAR_HORIZ_7: "sfx_fade_horizontal_7",
	TONE_APPEAR_HORIZ_8: "sfx_fade_horizontal_8",
	TONE_APPEAR_HORIZ_9: "sfx_fade_horizontal_9",
	TONE_APPEAR_HORIZ_10: "sfx_fade_horizontal_10",
	TONE_APPEAR_HORIZ_11: "sfx_fade_horizontal_11",
	TONE_APPEAR_HORIZ_12: "sfx_fade_horizontal_12",
	TONE_APPEAR_HORIZ_13: "sfx_fade_horizontal_13",
	TONE_APPEAR_HORIZ_14: "sfx_fade_horizontal_14",
	TONE_APPEAR_HORIZ_15: "sfx_fade_horizontal_15",

	TONE_APPEAR_VERT_0: "sfx_fade_vertical_0",
	TONE_APPEAR_VERT_1: "sfx_fade_vertical_1",
	TONE_APPEAR_VERT_2: "sfx_fade_vertical_2",
	TONE_APPEAR_VERT_3: "sfx_fade_vertical_3",
	TONE_APPEAR_VERT_4: "sfx_fade_vertical_4",
	TONE_APPEAR_VERT_5: "sfx_fade_vertical_5",
	TONE_APPEAR_VERT_6: "sfx_fade_vertical_6",
	TONE_APPEAR_VERT_7: "sfx_fade_vertical_7",
	TONE_APPEAR_VERT_8: "sfx_fade_vertical_8",
	TONE_APPEAR_VERT_9: "sfx_fade_vertical_9",
	TONE_APPEAR_VERT_10: "sfx_fade_vertical_10",
	TONE_APPEAR_VERT_11: "sfx_fade_vertical_11",
	TONE_APPEAR_VERT_12: "sfx_fade_vertical_12",
	TONE_APPEAR_VERT_13: "sfx_fade_vertical_13",
	TONE_APPEAR_VERT_14: "sfx_fade_vertical_14",
	TONE_APPEAR_VERT_15: "sfx_fade_vertical_15",




	SOUND_PATH: "audio/",
	TONES_GROW_PATH: "audio/fadein/",


	TONES: [],
	TONES_HORIZ:[],
	TONES_VERT: [],
	TAP_ARRAY: [],

	appear_counter: 0,

	bgm_is_playing: false,

	play_beat: function(){
		var tone = L.level[G.measure_counter][L.INDEX_LOGIC][G.logic_counter];

		//these things don't have sounds.  if they 
		if(A.TONES[tone] !== "NULL"){
			//PS.debug("why");
			//PS.audioPlay(A.TONES[tone]);
		}	
	},

	play_action_sound: function(){
		//PS.debug("please");
		switch(G.actionType){
			case L.ACT_FADE_IN_TAP:
				var rando = PS.random(A.TAP_ARRAY.length-1); // generate from 1 to max
				PS.audioPlay(A.TAP_ARRAY[rando], {volume: 0.5, path: A.SOUND_PATH});
				break;
		}
		//PS.audioPlay(A.TONES[L.ACT_CLICK]);
	},

	load : function() {
		A.TONES[L.ACT_NULL] = A.TONE_NULL;
		A.TONES[L.ACT_FADE_IN_TAP] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_HOLD] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoB] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoL] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoLR] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoR] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoU] = A.TONE_FADE_IN;
		A.TONES[L.ACT_FADE_IN_DRAG_MtoUB] = A.TONE_FADE_IN;


		A.TAP_ARRAY[0] = A.TONE_TAP_0;
		A.TAP_ARRAY[1] = A.TONE_TAP_1;
		A.TAP_ARRAY[2] = A.TONE_TAP_2;
		A.TAP_ARRAY[3] = A.TONE_TAP_3;
		A.TAP_ARRAY[4] = A.TONE_TAP_4;

		A.TONES_HORIZ[0] = A.TONE_APPEAR_HORIZ_0;
		A.TONES_HORIZ[1] = A.TONE_APPEAR_HORIZ_1;
		A.TONES_HORIZ[2] = A.TONE_APPEAR_HORIZ_2;
		A.TONES_HORIZ[3] = A.TONE_APPEAR_HORIZ_3;
		A.TONES_HORIZ[4] = A.TONE_APPEAR_HORIZ_4;
		A.TONES_HORIZ[5] = A.TONE_APPEAR_HORIZ_5;
		A.TONES_HORIZ[6] = A.TONE_APPEAR_HORIZ_6;
		A.TONES_HORIZ[7] = A.TONE_APPEAR_HORIZ_7;
		A.TONES_HORIZ[8] = A.TONE_APPEAR_HORIZ_8;
		A.TONES_HORIZ[9] = A.TONE_APPEAR_HORIZ_9;
		A.TONES_HORIZ[10] = A.TONE_APPEAR_HORIZ_10;
		A.TONES_HORIZ[11] = A.TONE_APPEAR_HORIZ_11;
		A.TONES_HORIZ[12] = A.TONE_APPEAR_HORIZ_12;
		A.TONES_HORIZ[13] = A.TONE_APPEAR_HORIZ_13;
		A.TONES_HORIZ[14] = A.TONE_APPEAR_HORIZ_14;
		A.TONES_HORIZ[15] = A.TONE_APPEAR_HORIZ_15;

		A.TONES_VERT[0] = A.TONE_APPEAR_VERT_0;
		A.TONES_VERT[1] = A.TONE_APPEAR_VERT_1;
		A.TONES_VERT[2] = A.TONE_APPEAR_VERT_2;
		A.TONES_VERT[3] = A.TONE_APPEAR_VERT_3;
		A.TONES_VERT[4] = A.TONE_APPEAR_VERT_4;
		A.TONES_VERT[5] = A.TONE_APPEAR_VERT_5;
		A.TONES_VERT[6] = A.TONE_APPEAR_VERT_6;
		A.TONES_VERT[7] = A.TONE_APPEAR_VERT_7;
		A.TONES_VERT[8] = A.TONE_APPEAR_VERT_8;
		A.TONES_VERT[9] = A.TONE_APPEAR_VERT_9;
		A.TONES_VERT[10] = A.TONE_APPEAR_VERT_10;
		A.TONES_VERT[11] = A.TONE_APPEAR_VERT_11;
		A.TONES_VERT[12] = A.TONE_APPEAR_VERT_12;
		A.TONES_VERT[13] = A.TONE_APPEAR_VERT_13;
		A.TONES_VERT[14] = A.TONE_APPEAR_VERT_14;
		A.TONES_VERT[15] = A.TONE_APPEAR_VERT_15;


		A.TONES[L.ACT_FADE_OUT] = A.TONE_FADE_OUT;
		A.TONES[L.ACT_CLICK] = A.TONE_CLICK;

		for(var i = 0; i < A.TONES.length; i++){
			if(A.TONES[i] !== "NULL") {
				PS.audioLoad(A.TONES[i]);
			}
		}

		PS.audioLoad(A.SONG_BGM_0, {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[0], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[1], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[2], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[3], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[4], {lock:true, path: A.SOUND_PATH});

		for(var i = 0; i < A.TONES_HORIZ.length; i++){
			PS.audioLoad(A.TONES_HORIZ[i], {lock:true, path: A.TONES_GROW_PATH});
		}
	},

	play_appear_horiz: function(){
		//PS.debug(A.appear_counter + "\n");
		PS.audioPlay(A.TONES_HORIZ[A.appear_counter], {volume:0.05, path: A.TONES_GROW_PATH});
		A.appear_counter++;
		if(A.appear_counter > 14){
			//PS.debug("yes");
			A.appear_counter = 0;
		}
	},

	play_appear_vert: function(){
		PS.audioPlay(A.TONES_VERT[A.appear_counter], {volume:0.05, path: A.TONES_GROW_PATH});
		A.appear_counter++;
		if(A.appear_counter > 14){
			//PS.debug("yes");
			A.appear_counter = 0;
		}
	},

	play_bgm: function(){
		PS.audioPlay(A.SONG_BGM_0, {volume:0.25, path: A.SOUND_PATH});
		A.bgm_is_playing = true;
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
	S.populate_welcome_array();

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
	G.isHolding = true
	if(!G.isPlayable){
		return;
	}

	if(!G.isRhythmBegun){
		//PS.statusText("THE PLACEHOLDER SOUNDS");
		//PS.statusColor(PS.COLOR_WHITE);
		//A.play_bgm();
		//G.start_global_timer();
		S.welcome_statement();
	}else{
		if(G.isOnPeg(x, y)){
			G.click();
		}
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
	if(!G.isPlayable){
		return;
	}

	// Add code here for when the mouse button/touch is released over a bead
	G.isHolding = false;
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
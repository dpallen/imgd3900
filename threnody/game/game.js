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
	// viable values: 48 | 96 | 144 | 192 | 240 | 288 | 336 | 384 | 432 | 480
	tick_per_measure: 240,// 240, 60 bpm
	tempo_array: [],

	timing_quarter: 0, 
	timing_sixteenth: 0,
	timing_triplet: 0,

	testcounter: 0,
	counter: 0, //current tick
	measure_counter: 0, //current measure
	logic_counter: 0, //current index in logic array

	logic_timings: [], //kms
	last_logic_activity: 0, // used for activities

	isPlayable: true,
	isOpportunity: false, // if true, clicking is good!
	isRhythmBegun: false, // has the rhythm begun?
	isHolding: false, // are we holding?
	isDragging: false, // are we dragging?
	canClick: true, // can we click
	actionType: 0, // 1 for tap, 2 for hold, [amount] for direction

	currentDragX: 16,
	currentDragY: 16,
	dragHighThreshold: 28,
	dragLowThreshold: 4,

	dragUp: false,
	dragLeft: false,
	dragRight: false,
	dragDown: false,

	dragUpLowest: 17, // how much to the NOT THIS DIRECTION the peg can be dragged
	dragLeftLowest: 17,
	dragRightLowest: 17,
	dragDownLowest: 17,

	insanityLevel: 0,
	tempoLevel: 0,
	insanityTimer: 0,
	insanityRate: 200, // rate for modulating insanity
	wiggleRoom: 15,

	successfulTap: false,
	successfulHold: false,
	successfulDrag: false,

	activityCounter: 0, // for debugging
	tutorialComplete: false,

	isBreakTime: false,

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
	populate_tempo_array : function(){
		G.tempo_array[0] = 240;
		G.tempo_array[1] = 192 ;
		G.tempo_array[2] = 144;
		G.tempo_array[3] = 96;
	},

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
/*
		PS.debug("\n" + measure +"\n");
		PS.debug(G.measure_counter +"\n");
		PS.debug(G.tick_per_measure +"\n");
		PS.debug(G.counter +"\n");
		PS.debug(new_index);
		PS.debug(G.logic_timings[new_index] +"\n");
*/
		var delta = ((measure - G.measure_counter) * G.tick_per_measure) + G.counter - (G.logic_timings[new_index]);

		return delta; 

	},

	tick : function () { // the big global tick
		G.testcounter++;
		
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
			/* DO LOGIC FOR MESSAGE SHOWING */
			//24, 18, 12, 6
			if((G.measure_counter == 6)||
				(G.measure_counter == 12)||
				(G.measure_counter == 18)||
				(G.measure_counter == 24)){
				S.load_message();
			}



			G.logic_counter = 0;

			if(G.measure_counter >= (L.max_measures)){
				// set measure counter back to 0
				//G.measure_counter = 0;
				PS.timerStop(G.global_timer);

				// game over
				S.complete_chapter();
			}
		}

	},

	start_global_timer : function() { // starts the global timer
		G.isRhythmBegun = true;
		G.isPlayable = true;
		G.global_timer = PS.timerStart(G.global_rate, G.tick);
	},

	stop_global_timer : function(){
		G.isRhythmBegun = false;
		G.isPlayable = false;
		PS.timerStop(G.global_timer);
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
			case L.ACT_FADE_IN_DRAG:
				G.isOpportunity = true;
				L.actionType = L.ACT_FADE_IN_DRAG;
				G.spawn_object_drag();
				break;
			case L.ACT_CLICK: // open opportunity
				//PS.statusText(G.testcounter);
				G.last_logic_activity = G.counter;
				break;
			case L.ACT_FADE_OUT: // clear because miss
				//PS.statusText("");
				G.miss_object();
				break;

		}
	},

	spawn_object_tap : function() { // creates a tap object
		G.actionType = L.ACT_FADE_IN_TAP;
		P.object_is_hit = false;
		P.SPRITE_LOCATION = "sprites/tap_shrink/";
		//S.show_message("GET READY TO TAP");
		if(!G.successfulTap){
			S.message_fade = 25;
			S.show_message("Tap with the rhythm");
		}

		J.object_show_counter = 15; // default???
		P.spawn_object("peg_tap_shrink");
	},

	spawn_object_drag : function() { // creates a drag object
		G.actionType = L.ACT_FADE_IN_DRAG;

		G.dragLeft = false;
		G.dragUp = false;
		G.dragRight = false;
		G.dragDown = false;

		// what direction?
		var rando = PS.random(4);
		switch(rando){
			case 1:
				G.dragLeft = true;
				P.SPRITE_LOCATION = "sprites/drag_shrink_left/";
				break;
			case 2:
				G.dragUp = true;
				P.SPRITE_LOCATION = "sprites/drag_shrink_up/";
				break;
			case 3:
				G.dragRight = true;
				P.SPRITE_LOCATION = "sprites/drag_shrink_right/";
				break;
			case 4:
				G.dragDown = true;
				P.SPRITE_LOCATION = "sprites/drag_shrink_down/";
				break;
		}
		P.object_is_hit = false;
		if(!G.successfulDrag){
			S.show_message("Drag towards the white");
		}

		J.object_show_counter = 14; // default???
		P.spawn_object("drag_shrink");
	},

	spawn_object_hold : function() {
		G.actionType = L.ACT_FADE_IN_HOLD;
		P.object_is_hit = false;
		P.SPRITE_LOCATION = "sprites/hold_shrink/";
		if(!G.successfulHold){
			S.show_message("Hold on to it");
		}

		J.object_show_counter = 15; // default???
		P.spawn_object("hold_shrink");
	},

	is_wiggle_room : function(){
		if(P.drag_exists){
			G.wiggleRoom = 50;
		}else{
			G.wiggleRoom = 15; // set waggle room
		}

		var last_good = G.last_logic_activity;
		var next_good = G.counter - G.calc_tick_distance(L.ACT_CLICK);
		var dif_last = last_good - G.counter; // this is if our goal was slightly before us
		var dif_next = G.counter - next_good; // this is if our goal is slightly ahead of us


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
			if(G.actionType == L.ACT_FADE_IN_DRAG){
				//PS.debug("dragging");
				G.start_drag();
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

		if(S.current_chapter == 0){
			L.tap_correct++;
		}

		PS.dbEvent( "threnody", "hit status: ", "hit");
		//S.show_message("HIT");

		A.play_action_sound();
		J.hit_glow();
		G.successfulTap = true;
		//P.delete_object();
	},

	hold_object : function(){
		PS.dbEvent( "threnody", "hit status: ", "hold start");
		//S.show_message("HOLDING");

		P.object_is_hit = true;
		A.play_hold();
		J.hold_glow();

	},

	start_drag: function(){
		PS.dbEvent( "threnody", "hit status: ", "drag start");
		//S.show_message("DRAGGING");

		//P.object_is_hit = true;
		G.isDragging = true; // is this actually the same thing?
		/**TODO: AUDIO FOR DRAG START **/
		//A.play_start_drag();
		//P.place_drag_peg();
	},

	stop_drag: function(){
		PS.dbEvent( "threnody", "his status: ", "drag release");
		//S.show_message("DRAG STOP");
		G.isOpportunity = false;

		P.remove_drag_peg();
		J.error_glow();
		G.increase_insanity();

	},

	drag: function(x, y){

		var didMove = false;
		// update the current drag X
		if(G.dragLeft){
			if(x < G.dragLeftLowest){
				G.currentDragX = x;
				didMove = true;
			}else{
				G.currentDragX = G.currentDragX;
			}
			G.currentDragY = 16;
		}

		if(G.dragRight){
			if(x > G.dragRightLowest){
				G.currentDragX = x;
				didMove = true;
			}else{
				G.currentDragX = G.currentDragX;
			}
			G.currentDragY = 16;
		}

		if(G.dragUp){
			if(y < G.dragUpLowest){
				G.currentDragY = y;
				didMove = true;
			}else{
				G.currentDragY = G.currentDragY;
			}
			G.currentDragX = 16;

		}

		if(G.dragDown){
			if(y > G.dragDownLowest){
				G.currentDragY = y;
				didMove = true;
			}else{
				G.currentDragY = G.currentDragY;
			}
			G.currentDragX = 16;

		}

		if(didMove){
			//A.play_drag();
		}
		P.update_drag_peg(G.currentDragX, G.currentDragY);

		// if current drag X is equal to a certain threshold, we've done it boys
		if(G.check_drag_completion()){
			G.isDragging = false;
			G.isPlayable = false;
			J.COLOR_VICTORY = J.COLOR_BACKGROUND_GLOW;
			A.play_action_sound();
			J.drag_success_glow();
		}


	},

	check_drag_completion: function(){
		if(G.dragLeft){
			if(G.currentDragX <= G.dragLowThreshold){
				return true;
			}else{
				return false;
			}
		}

		if(G.dragRight){
			if(G.currentDragX >= G.dragHighThreshold){
				return true;
			}else{
				return false;
			}
		}

		if(G.dragUp){
			if(G.currentDragY <= G.dragLowThreshold){
				return true;
			}else{
				return false;
			}
		}

		if(G.dragDown){
			if(G.currentDragY >= G.dragHighThreshold){
				return true;
			}else{
				return false;
			}
		}
	},

	miss_object : function(){
		PS.dbEvent( "threnody", "hit status: ", "misssed");
		G.isOpportunity = false;


		if(P.object_is_missed || P.object_is_hit){
			return;
		}

		if(P.drag_exists){
			P.remove_drag_peg();
		}

		J.miss_fade(); // create a black cross
	},

	increase_insanity : function(){
		// do not increase if tutorial
		if(S.current_chapter == 0){
			return;
		}
		if(G.insanityLevel == 0){
			J.start_insanity_timer();
		}else{
			if(G.insanityLevel %10 == 0){ // every 10 messups...
				//J.globalFadeRate += 5;
			}
		}
		G.insanityLevel++;
	},

	halt_click : function(){
		G.canClick = false;

		var click_timer = 0;
		var click_rate = 30;

		var reenable_click = function(){
			G.canClick = true;
			PS.timerStop(click_timer);
		}

		click_timer = PS.timerStart(click_rate, reenable_click);
	}

};

var L = {//level or chapter logic
	
	ACT_NULL: 0,
	ACT_FADE_IN_TAP: 1, // was 1 originally
	ACT_FADE_IN_HOLD: 2,
	ACT_FADE_IN_DRAG: 3,
	ACT_FADE_IN_DRAG_MtoL: 3, // deprecated
	ACT_FADE_IN_DRAG_MtoR: 4, // deprecated
	ACT_FADE_IN_DRAG_MtoLR: 5, // deprecated
	ACT_FADE_IN_DRAG_MtoU: 6, // deprecated
	ACT_FADE_IN_DRAG_MtoB: 7, // deprecated
	ACT_FADE_IN_DRAG_MtoUB: 8, // deprecated
	ACT_FADE_OUT: 9, // was 2 originally
	ACT_CLICK: 10, // was 3 originally

	INDEX_LOGIC: 0,

	LENGTH_LOGIC: 24,

	level: [],
	max_measures: 0,

	tap_correct : 0,
	hold_correct : 0,
	drag_correct : 0,
	current_tutorial : "tap",

	// each level is 24 tracks long
	zero_tap : function(){
		L.level = [
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
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
		L.tap_correct = 0;
		G.successfulTap = false;
		L.current_tutorial = "tap";
	},

	zero_hold : function(){
		L.level = [
			[
				[2, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 2, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			]
		];

		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
		L.hold_correct = 0;
		G.successfulHold = false;
		L.current_tutorial = "hold";
	},

	zero_drag : function(){
		L.level = [
			[
				[3, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			]
		];

		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
		L.drag_correct = 0;
		G.successfulDrag = false;
		L.current_tutorial = "drag";
	},

	one : function() {

		L.level = [
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[1, 0,0,10,0,0, 9, 0,0,0,0,0, 1, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],



			[
				[2, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 2, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 2, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,2,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],



			[
				[3, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 2, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],


			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 2, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 1, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[

				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 2, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],


			[
				[1, 0,0,10,9,0, 2, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				]
				
		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	},

	two : function() {

		L.level = [
			[
				[1, 0,0,0,0,0, 0, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 2, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],



			[
				[2, 0,0,0,0,0, 0, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 2, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
				


			[
				[1, 0,0,10,0,0, 9, 0,0,1,0,0, 10, 9,0,1,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,0,0, 9, 0,0,1,0,0, 10, 9,0,1,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],



			[
				[2, 0,0,10,0,0, 9, 0,0,2,0,0, 10, 9,0,2,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,0,0, 9, 0,0,2,0,0, 10, 9,0,2,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],



			[
				[3, 0,0,0,0,0, 0, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,0,0, 9, 0,0,2,0,0, 10, 9,0,2,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

			[
				[3, 0,0,0,0,0, 0, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 2, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,0,0, 9, 0,0,1,0,0, 10, 9,0,2,0,0, 10, 0,0,9,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	},

	three : function() {

		L.level = [
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[1, 0,0,10,0,0, 9, 0,0,0,0,0, 1, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],




			[
				[2, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 2, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 2, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,2,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],




			[
				[3, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 3, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 2, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],



			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],

			[
				[1, 0,0,0,0,0, 10, 0,0,9,0,0, 2, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[

				[2, 0,0,10,0,0, 9, 0,0,0,0,0, 1, 0,0,10,0,0, 9, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],



			[

				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 2, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],


			[
				[1, 0,0,10,9,0, 2, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,1,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
				]
				
		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	},

	four : function() {

		L.level = [
			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],



			[
				[0, 0,0,1,0,0, 10, 9,0,2,0,0, 10, 9,0,3,0,0, 10, 9,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,2,0,0, 10, 9,0,1,0,0, 10, 9,0,3,0,0, 10, 9,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,10,9,0, 3, 0,0,10,9,0, 1, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[2, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],


			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,0,0,0, 0, 0,0,0,0,0, 0, 0,0,0,0,0, 1, 0,0,10,9,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

			[
				[0, 0,0,2,0,0, 10, 9,0,1,0,0, 10, 9,0,3,0,0, 10, 9,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[0, 0,0,2,0,0, 10, 9,0,3,0,0, 10, 9,0,2,0,0, 10, 9,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],



			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 2, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 1, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 2, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 0, 0,0,0,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 1, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],


			[
				[3, 0,0,0,0,0, 0, 0,0,0,0,0, 10, 9,0,3,0,0, 9, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 2, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 2, 0,0,10,9,0, 3, 0,0,10,9,0, 1, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,10,9,0, 1, 0,0,10,9,0, 3, 0,0,10,9,0, 3, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

		
			[
				[1, 0,0,10,9,0, 2, 0,0,10,9,0, 1, 0,0,10,9,0, 2, 0,0,10,9,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[3, 0,0,0,0,0, 10, 0,0,9,0,0, 1, 0,0,0,0,0, 10, 0,0,9,0,0]  //logic
			  //[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
				
		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
<<<<<<< HEAD
	},


	five: function() {
		L.level = [
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],
			[
				[1, 0,0,0,0,0, 10, 0,0,0,0,0, 9, 0,0,0,0,0, 0, 0,0,0,0,0]  //logic
				//[q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s, q, s,t,e,t,s],  //logic key
			],

		];
		//The next two lines will go into a generic 'level load' function once we write it
		G.measure_counter = 0;
		L.max_measures = L.level.length;
	},

=======
	}
>>>>>>> parent of 029b065... code I have
};

var S = { // status line and chapter control
	welcome_array: [],
	tutorial_array: [],
	chapter_one_array: [],
	chapter_two_welcome_array: [],
	chapter_two_array: [],
	chapter_three_welcome_array:[],
	chapter_three_array: [],
	chapter_four_welcome_array:[],
	chapter_four_array:[],

	welcome_timer: 0,
	welcome_rate: 14.5,
	welcome_counter: 0,
	welcome_text_counter: 0,

	current_chapter: 1,

	message_timer: 0,
	message_rate: 200,
	message_timer_exists: false,
	message_counter: 0,
	message_fade : 200,

	time_until_next_chapter: 150,
	next_chapter_timer: 0,

	show_message: function(text){
		PS.statusColor(PS.COLOR_BLACK);
		PS.statusFade(S.message_fade);
		PS.statusColor(PS.COLOR_WHITE);
		PS.statusText(text);
		S.message_timer_exists = true;
		S.message_timer = PS.timerStart(S.message_rate, S.hide_message);
	},

	hide_message: function(){
		if(S.message_timer_exists) {
			PS.statusFade(S.message_fade);
			PS.statusColor(PS.COLOR_BLACK);
			PS.timerStop(S.message_timer);
			S.message_timer_exists = false;
		}
	},

	populate_message_arrays: function(){
		S.tutorial_array[0] = "Threnody";
		S.tutorial_array[1] = "Threnody";
		S.tutorial_array[2] = "Threnody";
		S.tutorial_array[3] = "Threnody";


		S.welcome_array[0] = "Chapter One";
		S.welcome_array[1] = "July 16, 1923";
		S.welcome_array[2] = "Exham Priory, England";
		S.welcome_array[3] = "Walls";

		S.chapter_one_array[0] = "The scurrying of rats";
		S.chapter_one_array[1] = "Scratching at the new panels";
		S.chapter_one_array[2] = "From depths inconceivably below";
		S.chapter_one_array[3] = "My friend, Captain Norrys";

		S.chapter_two_welcome_array[0] = "Chapter Two";
		S.chapter_two_welcome_array[1] = "Very sleepy";
		S.chapter_two_welcome_array[2] = "Retired Early";
		S.chapter_two_welcome_array[3] = "Dreams";

		S.chapter_two_array[0] = "Harassed by visions";
		S.chapter_two_array[1] = "The twilit Grotto";
		S.chapter_two_array[2] = "The swineheard";
		S.chapter_two_array[3] = "Abruptly awake";

		S.chapter_three_welcome_array[0] = "Chapter Three";
		S.chapter_three_welcome_array[1] = "From depths below";
		S.chapter_three_welcome_array[2] = "The scurrying of rats";
		S.chapter_three_welcome_array[3] = "Descent";

		S.chapter_three_array[0] = "Deepest of sub-cellars";
		S.chapter_three_array[1] = "Implements of excavation";
		S.chapter_three_array[2] = "With the plump Captain Norrys";
		S.chapter_three_array[3] = "A light ahead";

		S.chapter_four_welcome_array[0] = "Chapter Four";
		S.chapter_four_welcome_array[1] = "Skulls";
		S.chapter_four_welcome_array[2] = "Men";
		S.chapter_four_welcome_array[3] = "Rats";

		S.chapter_four_array[0] = "The twilit grotto";
		S.chapter_four_array[1] = "Ten stone cells";
		S.chapter_four_array[2] = "Bones were gnawed";
		S.chapter_four_array[3] = "Captain Norrys";

	},

	welcome_statement: function(){
		A.stop_bgm();
		PS.statusColor(PS.COLOR_BLACK);
		PS.statusFade(15);
		G.isPlayable = false;
		S.welcome_counter = 0;
		S.welcome_text_counter = 0;
		S.welcome_timer = PS.timerStart(S.welcome_rate, S.welcome_statement_helper);
	},

	welcome_statement_helper: function(){
		//PS.debug(S.welcome_counter);
		var whichArray;
		switch(S.current_chapter){
			case 0:
				whichArray = S.tutorial_array;
				break;
			case 1:
				whichArray = S.welcome_array;
				break;
			case 2:
				whichArray = S.chapter_two_welcome_array;
				break;
			case 3:
				whichArray = S.chapter_three_welcome_array;
				break;
			case 4:
				whichArray = S.chapter_four_welcome_array;
				break;
		}
		if(S.welcome_counter%2 == 0){ // every other should be a message update
			if(!A.bgm_is_playing && !A.drum_is_playing){
				A.play_bgm();
			}
			PS.statusColor(PS.COLOR_WHITE);

			PS.statusText(whichArray[S.welcome_text_counter]);
			S.welcome_text_counter++;

		}else{
			PS.statusColor(PS.COLOR_BLACK);
		}

		S.welcome_counter++;
		if(S.welcome_text_counter > whichArray.length){
			//PS.debug("stopping");
			PS.statusColor(PS.COLOR_BLACK);
			//PS.statusFade(0);
			//PS.statusText("MEME");
			//PS.statusColor(PS.COLOR_WHITE);

			S.welcome_counter = 0;
			PS.timerStop(S.welcome_timer);
			S.start_chapter(S.current_chapter);
		}
	},

	load_message: function(){

		var whichArray;
		switch(S.current_chapter){
			case 1:
				whichArray = S.chapter_one_array;
				break;
			case 2:
				whichArray = S.chapter_two_array;
				break;
			case 3:
				whichArray = S.chapter_three_array;
				break;
			case 4:
				whichArray = S.chapter_four_array;
				break;
		}

		S.message_rate = 200;

		S.message_fade = 200;
		S.show_message(whichArray[S.message_counter]);
		S.message_counter++;
	},

	complete_chapter : function(){
		G.isPlayable = false;
		if(S.current_chapter == 0){
			S.check_complete();
			return;
		}
		S.current_chapter++;

		if(S.current_chapter == 3){ // the current end state
			S.end_game();
			return;
		}

		G.insanityLevel = 0;



		S.message_counter = 0;
		S.welcome_counter = 0;

		S.time_until_next_chapter = 300;
		S.next_chapter_timer = PS.timerStart(S.time_until_next_chapter, S.start_break_time);
	},

	check_complete : function(){
		switch(L.current_tutorial){
			case "tap":
				if(L.tap_correct == 4){
					L.current_tutorial = "hold";
				}
				S.start_chapter(0);
				break;
			case "hold":
				if(L.hold_correct == 4){
					L.current_tutorial = "drag";
				}
				S.start_chapter(0);
				break;
			case "drag":
				if(L.drag_correct == 2){
					S.current_chapter++;
					A.stop_bgm();

					G.insanityLevel = 0;
					S.message_counter = 0;
					S.welcome_counter = 0;

					S.next_chapter_timer = PS.timerStart(S.time_until_next_chapter, S.start_break_time); // on to the real break
				}else{
					S.start_chapter(0);
				}
				break;
		}
	},

	start_break_time : function(){
		G.isBreakTime = true;
		S.show_message("Click to continue...");
		PS.timerStop(S.next_chapter_timer);

	},

	end_break_time : function(){
		PS.statusText("");
		G.isBreakTime = false;
		S.next_chapter_timer = PS.timerStart(S.time_until_next_chapter, S.next_chapter); // on to the real game
	},

	next_chapter : function(){
		PS.timerStop(S.next_chapter_timer);
		S.welcome_statement();
	},

	start_chapter : function(number){
		switch(number){
			case 0:
				PS.dbEvent("threnody", "chapter zero begun", true);
				switch(L.current_tutorial){
					case "tap":
						L.zero_tap();
						break;
					case "hold":
						L.zero_hold();
						break;
					case "drag":
						L.zero_drag();
						break;
				}
				G.start_global_timer();
				break;
			case 1:
				PS.dbEvent( "threnody", "chapter one begun", true);
				L.one();
				G.start_global_timer();
				break;
			case 2:
				PS.dbEvent( "threnody", "chapter two begun", true);
				L.two();
				G.start_global_timer();
				break;
			case 3:
				PS.dbEvent( "threnody", "chapter three begun", true);
				break;
			case 4:
				PS.dbEvent( "threnody", "chapter four begun", true);
				break;
		}
	},

	end_game : function(){

		S.show_message("Demo Over -- more to come");

		PS.dbEvent( "threnody", "endgame", true );

		// Email the database and discard it

		PS.dbSend( "threnody", "dpallen", { discard : true } );
	},
};

var J = {//juice
	COLOR_BACKGROUND: PS.COLOR_BLACK,
	COLOR_BACKGROUND_GLOW: PS.COLOR_WHITE,
	COLOR_BACKGROUND_BORDER: PS.COLOR_WHITE,
	COLOR_INSANITY: PS.COLOR_RED,
	COLOR_VICTORY: PS.COLOR_WHITE,

	COLOR_HOLD: PS.COLOR_BROWN,


	LAYER_INSANITY: 2,
	LAYER_BACKGROUND: 0,
	LAYER_OBJECT: 1,
	//LAYER_OBJECT_HIDE: 2,
	LAYER_CLICK: 3, // used for peg dragging, etc.
	LAYER_FADE: 4,

	object_show_time: 0,
	object_hide_time: 0,
	object_hit_time: 1,
	object_hold_time: 3,
	object_miss_time: 5, // deprecated

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

	error_fade_rate: 15,
	error_timer_rate: 15,
	error_fade_counter: 0,

	insanityUpperLeftXBound1: 1,
	insanityUpperLeftXBound2: 10,
	insanityUpperLeftYBound1: 1,
	insanityUpperLeftYBound2: 10,
	insanityUpperRightXBound1: 21,
	insanityUpperRightXBound2: 30,
	insanityUpperRightYBound1: 1,
	insanityUpperRightYBound2: 10,
	insanityLowerLeftXBound1: 1,
	insanityLowerLeftXBound2: 10,
	insanityLowerLeftYBound1: 21,
	insanityLowerLeftYBound2: 30,
	insanityLowerRightXBound1: 21,
	insanityLowerRightXBound2: 30,
	insanityLowerRightYBound1: 21,
	insanityLowerRightYBound2: 30,


	insanityFadeRate: 500,
	insanityRandomMax: 100,
	insanityThreshold: 99,

	globalFadeRate: 0,
	dangerDirectionFadeRate: 100,

	init_grid: function(){
		PS.gridSize(G.GRID_WIDTH, G.GRID_HEIGHT);
		PS.gridColor(J.COLOR_BACKGROUND);

		PS.gridPlane(J.LAYER_BACKGROUND); // set to background layer
		PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);
		PS.border(PS.ALL, PS.ALL, 0);

		J.init_border();

		//PS.alpha(PS.ALL, PS.ALL, 255);
	},

	init_border: function(){
		PS.gridPlane(J.LAYER_BACKGROUND); // set to background layer
		PS.color(PS.ALL, 0, J.COLOR_BACKGROUND_BORDER);
		PS.color(PS.ALL, 31, J.COLOR_BACKGROUND_BORDER);
		PS.color(0, PS.ALL, J.COLOR_BACKGROUND_BORDER);
		PS.color(31, PS.ALL, J.COLOR_BACKGROUND_BORDER);
		PS.alpha(PS.ALL, 0, 255);
		PS.alpha(PS.ALL, 31, 255);
		PS.alpha(0, PS.ALL, 255);
		PS.alpha(31, PS.ALL, 255);
	},

	show_object: function(type){
		// UPDATE THE OBJECT SHOW TIME
	  //PS.debug("SHOWING OBJECT\n");

		J.current_object_type = type;
		J.object_show_time = G.calc_tick_distance(L.ACT_CLICK); // time until opportuity

		J.object_show_rate = J.object_show_time / J.object_show_counter;
		//PS.debug(J.object_show_time);
		//PS.debug("DELTA: " + J.object_show_time + "\n");
		//PS.fade(PS.ALL, PS.ALL, J.object_show_time);
		//PS.fade(0, 0, J.object_show_time, {onEnd: G.opportunity_open});
		//PS.alpha(PS.ALL, PS.ALL, 0);
		//PS.gridShadow(false);

		P.object_is_appearing = true;
		P.object_is_missed = false;

		// just in case
		if(J.object_show_rate < 1){
			J.object_show_rate = 5;
		}
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
			case L.ACT_FADE_IN_DRAG:
				//P.ready_sprite = "sprites/"
				J.object_show_counter = 0;
				/**TODO: MAKE SURE THIS IS RIGHT RIGHT RIGHT! **/
				J.object_show_rate = J.object_show_time / 15; // is it 15?
				P.move_x = 1;
				P.move_y = 1;
				//PS.debug("SHOW RATE: " + J.object_show_rate + "\n");
				//PS.debug("SHOW tIME: " + J.object_show_time + "\n");

				J.object_show_timer = PS.timerStart(J.object_show_rate, P.show_drag_helper);
				break;

		}
	},

	hit_glow: function(){
		J.COLOR_VICTORY = J.COLOR_BACKGROUND_GLOW;
		PS.gridShadow(true, J.COLOR_VICTORY);
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
			P.object_is_appearing = false;
			PS.timerStop(J.object_show_timer);
		}
		J.object_hold_timer = PS.timerStart(J.object_hold_rate, P.hold_object_helper);

	},

	drag_success_glow: function(){
		P.delete_object();
		P.remove_drag_peg();
		J.init_border();

		G.successfulDrag = true;
		L.drag_correct++;

		// AUDIO FOR DRAG SUCCESS??? ONE OF THREE???


		if(J.object_is_appearing){
			P.object_is_appearing = false;
			PS.timerStop(J.object_show_timer);
		}

		PS.gridShadow(true, J.COLOR_VICTORY);

		// reuse miss code
		J.object_miss_counter = 0;
		J.object_miss_rate = J.error_fade_rate;
		for(var i = 0; i< G.GRID_WIDTH; i++){
			for(var j = 0; j < G.GRID_HEIGHT; j++){
				if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
					PS.gridPlane(J.LAYER_FADE);
					PS.fade(i, j, J.error_fade_rate);
					PS.alpha(i, j, 255);
					PS.color(i, j, J.COLOR_BACKGROUND_GLOW);
				}
			}
		}

		J.error_fade_counter = 0;

		J.object_miss_timer = PS.timerStart(J.error_timer_rate, J.drag_success_glow_helper);

	},

	drag_success_glow_helper: function(){
		// make it all red
		for(var i = 0; i< G.GRID_WIDTH; i++){
			for(var j = 0; j < G.GRID_HEIGHT; j++){
				if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
					PS.gridPlane(J.LAYER_FADE);
					PS.fade(i, j, J.error_fade_rate-1);
					PS.alpha(i, j, 0);
					PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);
				}
			}
		}

		if(J.error_fade_counter == 1){
			for(var i = 0; i< G.GRID_WIDTH; i++){
				for(var j = 0; j < G.GRID_HEIGHT; j++){
					if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
						PS.gridPlane(J.LAYER_FADE);
						//PS.fade(i, j, 0);
						//PS.debug("why");
						PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);
						PS.alpha(i, j, 0);
					}
				}
			}
		}

		if(J.error_fade_counter == 2){
			for(var i = 0; i< G.GRID_WIDTH; i++){
				for(var j = 0; j < G.GRID_HEIGHT; j++){
					if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
						PS.gridPlane(J.LAYER_FADE);
						PS.fade(i, j, J.globalFadeRate);
					}
				}
			}
			PS.timerStop(J.object_miss_timer);
		}
		J.error_fade_counter++;
	},

	error_glow: function(){
		//PS.debug("mistake!");
		//S.show_message("MISS");
		// audio stuff
		A.play_miss();
		J.init_border();
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

		//J.current_object_type = "peg_tap_miss";
		J.object_miss_counter = 0;
		J.object_miss_rate = J.error_fade_rate;

		//P.SPRITE_LOCATION = "sprites/tap_miss/";

		// make it all red
		for(var i = 0; i< G.GRID_WIDTH; i++){
			for(var j = 0; j < G.GRID_HEIGHT; j++){
				if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
					PS.gridPlane(J.LAYER_FADE);
					PS.fade(i, j, J.error_fade_rate);
					PS.alpha(i, j, 255);
					PS.color(i, j, PS.COLOR_RED);
				}
			}
		}

		J.error_fade_counter = 0;

		J.object_miss_timer = PS.timerStart(J.error_timer_rate, J.error_glow_helper); // timer to turn it off
	},

	error_glow_helper: function(){
		// make it black again
		J.black_cross();
		J.clear_cross();
		P.delete_object();

		for(var i = 0; i< G.GRID_WIDTH; i++){
			for(var j = 0; j < G.GRID_HEIGHT; j++){
				if((i > 0 && i < G.GRID_WIDTH-1) && (j > 0 && j < G.GRID_WIDTH-1)){
					PS.gridPlane(J.LAYER_FADE);
					PS.fade(i, j, J.error_fade_rate-1);
					PS.alpha(i, j, 0);
					PS.color(PS.ALL, PS.ALL, J.COLOR_BACKGROUND);

				}
			}
		}
		PS.timerStop(J.object_miss_timer);
	},

	start_insanity_timer: function(){
		J.populate_insanity();
		G.insanityTimer = PS.timerStart(G.insanityRate, J.update_insanity);
	},

	populate_insanity: function(){
		// iterate thru every spot to establish bounds
		for(var x = 0; x< G.GRID_WIDTH; x++){
			for(var y = 0; y< G.GRID_HEIGHT; y++){
				// check for bounds
				PS.gridPlane(J.LAYER_INSANITY);
				if((x >= J.insanityUpperLeftXBound1 && x <= J.insanityUpperLeftXBound2) &&
					(y >= J.insanityUpperLeftYBound1 && y<= J.insanityUpperLeftYBound2)){
					PS.color(x, y, J.COLOR_INSANITY);
					PS.alpha(x, y, 0);
					PS.fade(x, y, J.insanityFadeRate);
				}
				if((x >= J.insanityLowerLeftXBound1 && x <= J.insanityLowerLeftXBound2) &&
					(y >= J.insanityLowerLeftYBound1 && y<= J.insanityLowerLeftYBound2)){
					PS.color(x, y, J.COLOR_INSANITY);
					PS.alpha(x, y, 0);
					PS.fade(x, y, J.insanityFadeRate);

				}
				if((x >= J.insanityUpperRightXBound1 && x <= J.insanityUpperRightXBound2) &&
					(y >= J.insanityUpperRightYBound1 && y<= J.insanityUpperRightYBound2)){
					PS.color(x, y, J.COLOR_INSANITY);
					PS.alpha(x, y, 0);
					PS.fade(x, y, J.insanityFadeRate);

				}
				if((x >= J.insanityLowerRightXBound1 && x <= J.insanityLowerRightXBound2) &&
					(y >= J.insanityLowerRightYBound1 && y<= J.insanityLowerRightYBound2)){
					PS.color(x, y, J.COLOR_INSANITY);
					PS.alpha(x, y, 0);
					PS.fade(x, y, J.insanityFadeRate);

				}
			}
		}
	},

	update_insanity: function(){
		// iterate thru every spot to establish bounds
		for(var x = 0; x< G.GRID_WIDTH; x++){
			for(var y = 0; y< G.GRID_HEIGHT; y++){
				// check for bounds
				PS.gridPlane(J.LAYER_INSANITY);
				if((x >= J.insanityUpperLeftXBound1 && x <= J.insanityUpperLeftXBound2) &&
					(y >= J.insanityUpperLeftYBound1 && y<= J.insanityUpperLeftYBound2)) {

					// dead zone
					if(( x >= J.insanityUpperLeftXBound1 + 4) && (y >= J.insanityUpperLeftYBound1 + 4)){
						continue;
					}


					PS.fade(x, y, J.insanityFadeRate);

					var rando = PS.random(J.insanityRandomMax);
					//PS.debug("ORIG RANDO: " + rando + "\n");
					rando = rando + (rando * (G.insanityLevel/100)); // if insanity level is 2, rando = rando + 2%, etc.
					//PS.debug("NEW RANDO: " + rando + "\n");

					// check for proximity to center
					var threshold = J.insanityThreshold;
					if(x < 5 && y < 5){ // we don't want to be too close
						threshold = threshold - 1;
					}
					if(x < 4 && y < 4){
						threshold = threshold - 1;
					}
					if(x < 3 && y < 3){
						threshold = threshold - 1;
					}
					if(x < 2 && y < 2){
						threshold = threshold - 1;
					}
					if(x < 1 && y < 1){
						threshold = threshold - 1;
					}
					if(rando >= threshold){
						PS.alpha(x, y, 200);
					}else{
						PS.alpha(x, y, 0);
					}
				}
				if((x >= J.insanityLowerLeftXBound1 && x <= J.insanityLowerLeftXBound2) &&
					(y >= J.insanityLowerLeftYBound1 && y<= J.insanityLowerLeftYBound2)){

					// dead zone
					if(( x >= J.insanityLowerLeftXBound1 + 4) && (y <= J.insanityLowerLeftYBound2 - 4)){
						continue;
					}

					PS.fade(x, y, J.insanityFadeRate);

					var rando = PS.random(J.insanityRandomMax);
					//PS.debug("ORIG RANDO: " + rando + "\n");
					rando = rando + (rando * (G.insanityLevel/100)); // if insanity level is 2, rando = rando + 2%, etc.
					//PS.debug("NEW RANDO: " + rando + "\n");

					// check for proximity to center
					var threshold = J.insanityThreshold;
					if(x < 5 && y < 5){ // we don't want to be too close
						threshold = threshold - 1;
					}
					if(x < 4 && y < 4){
						threshold = threshold - 1;
					}
					if(x < 3 && y < 3){
						threshold = threshold - 1;
					}
					if(x < 2 && y < 2){
						threshold = threshold - 1;
					}
					if(x < 1 && y < 1){
						threshold = threshold - 1;
					}
					if(rando >= threshold){
						PS.alpha(x, y, 200);
					}else{
						PS.alpha(x, y, 0);
					}
				}
				if((x >= J.insanityUpperRightXBound1 && x <= J.insanityUpperRightXBound2) &&
					(y >= J.insanityUpperRightYBound1 && y<= J.insanityUpperRightYBound2)){

					// dead zone
					if(( x <= J.insanityUpperRightXBound2 - 4) && (y >= J.insanityUpperRightYBound1 + 4)){
						continue;
					}
					PS.fade(x, y, J.insanityFadeRate);

					var rando = PS.random(J.insanityRandomMax);
					//PS.debug("ORIG RANDO: " + rando + "\n");
					rando = rando + (rando * (G.insanityLevel/100)); // if insanity level is 2, rando = rando + 2%, etc.
					//PS.debug("NEW RANDO: " + rando + "\n");

					// check for proximity to center
					var threshold = J.insanityThreshold;
					if(x < 5 && y < 5){ // we don't want to be too close
						threshold = threshold - 1;
					}
					if(x < 4 && y < 4){
						threshold = threshold - 1;
					}
					if(x < 3 && y < 3){
						threshold = threshold - 1;
					}
					if(x < 2 && y < 2){
						threshold = threshold - 1;
					}
					if(x < 1 && y < 1){
						threshold = threshold - 1;
					}
					if(rando >= threshold){
						PS.alpha(x, y, 200);
					}else{
						PS.alpha(x, y, 0);
					}				}
				if((x >= J.insanityLowerRightXBound1 && x <= J.insanityLowerRightXBound2) &&
					(y >= J.insanityLowerRightYBound1 && y<= J.insanityLowerRightYBound2)){

					// dead zone
					if(( x <= J.insanityLowerRightXBound2 - 4) && (y <= J.insanityLowerRightYBound2 - 4)){
						continue;
					}
					PS.fade(x, y, J.insanityFadeRate);

					var rando = PS.random(J.insanityRandomMax);
					//PS.debug("ORIG RANDO: " + rando + "\n");
					rando = rando + (rando * (G.insanityLevel/100)); // if insanity level is 2, rando = rando + 2%, etc.
					//PS.debug("NEW RANDO: " + rando + "\n");

					// check for proximity to center
					var threshold = J.insanityThreshold;
					if(x < 5 && y < 5){ // we don't want to be too close
						threshold = threshold - 1;
					}
					if(x < 4 && y < 4){
						threshold = threshold - 1;
					}
					if(x < 3 && y < 3){
						threshold = threshold - 1;
					}
					if(x < 2 && y < 2){
						threshold = threshold - 1;
					}
					if(x < 1 && y < 1){
						threshold = threshold - 1;
					}
					if(rando >= threshold){
						PS.alpha(x, y, 200);
						PS.color(x, y, J.COLOR_INSANITY);
					}else{
						PS.alpha(x, y, 0);
						PS.color(x, y, J.COLOR_BACKGROUND);
					}
				}

			}
		}
	},

	show_danger_direction: function(){
		PS.gridPlane(J.LAYER_BACKGROUND);
		switch(G.dangerDirection){
			case 0: // everything is fine
				break;
			case 1: // left is evil
				for(var y = 1; y < 31; y++){
					PS.alpha(0, y, 255);
					PS.fade(0, y, J.dangerDirectionFadeRate);
					PS.color(0, y, J.COLOR_INSANITY);
				}
				break;
			case 2: // up is evil
				for(var x = 1; x < 31; x++){
					PS.alpha(x, 0, 255);
					PS.fade(x, 0, J.dangerDirectionFadeRate);
					PS.color(x, 0, J.COLOR_INSANITY);
				}
				break;
			case 3: // right is evil
				for(var y = 1; y < 31; y++){
					PS.alpha(31, y, 255);
					PS.fade(31, y, J.dangerDirectionFadeRate);
					PS.color(31, y, J.COLOR_INSANITY);
				}
				break;

		}
	},

	black_cross: function(){ // creates a block cross, for covering up things
		PS.gridPlane(J.LAYER_FADE);
		for(var x = 0; x < G.GRID_WIDTH; x++){
			for(var y = 0; y < G.GRID_HEIGHT; y++){
				// topdown quadrant
				if((x > 10 && x < 21) && (y > 0 && y < 31)){
					PS.fade(x, y, 0);
					PS.alpha(x, y, 255);
					PS.color(x, y, PS.COLOR_BLACK);
				}

				//right quadrant
				if((x > 0 && x < 31) && (y > 10 && y < 21)){
					PS.fade(x, y, 0);
					PS.alpha(x, y, 255);
					PS.color(x, y, PS.COLOR_BLACK);
				}
			}
		}
	},

	clear_cross: function(){
		PS.gridPlane(J.LAYER_FADE);
		for(var x = 0; x < G.GRID_WIDTH; x++){
			for(var y = 0; y < G.GRID_HEIGHT; y++){
				// topdown quadrant
				if((x > 10 && x < 21) && (y > 0 && y < 31)){
					PS.fade(x, y, 0);
					PS.alpha(x, y, 0);
					PS.color(x, y, PS.COLOR_BLACK);
				}

				//right quadrant
				if((x > 0 && x < 31) && (y > 10 && y < 21)){
					PS.fade(x, y, 0);
					PS.alpha(x, y, 0);
					PS.color(x, y, PS.COLOR_BLACK);
				}
			}
		}
	},

	miss_fade: function(){
		PS.gridPlane(J.LAYER_FADE);
		for(var x = 0; x < G.GRID_WIDTH; x++){
			for(var y = 0; y < G.GRID_HEIGHT; y++){
				// topdown quadrant
				if((x > 10 && x < 21) && (y > 0 && y < 31)){
					PS.fade(x, y, 5);
					PS.alpha(x, y, 255);
					PS.color(x, y, PS.COLOR_BLACK);
				}

				//right quadrant
				if((x > 0 && x < 31) && (y > 10 && y < 21)){
					PS.fade(x, y, 5);
					PS.alpha(x, y, 255);
					PS.color(x, y, PS.COLOR_BLACK);
				}
			}
		}
	}
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

	drag_object: 0, // the drag peg
	drag_exists: false,
	dragX: 0,
	dragY: 0,

	spawn_object: function(type){
		G.activityCounter++;
		//PS.debug(G.activityCounter + "\n");
		PS.gridFade(0);
		if(P.object_exists){
			P.delete_object();
		}
		P.object_exists = true;
		G.isPlayable = true;

		J.clear_cross(); // to remove fade
		J.show_object(type);
	},

	show_object_helper: function(){

		//sound stuff
		if(G.actionType == L.ACT_FADE_IN_TAP){
			A.play_appear_horiz();
		}
		if(G.actionType == L.ACT_FADE_IN_HOLD){
			A.play_appear_vert();
		}

		var loader;
		loader = function(data){
			P.current_object = PS.spriteImage(data);
			PS.spritePlane(P.current_object, J.LAYER_OBJECT);
			PS.spriteMove(P.current_object, P.move_x, P.move_y);

		};

		if(J.object_show_counter < 0 && P.object_is_appearing == true){
			theImage = P.ready_sprite;
			PS.imageLoad(theImage, loader);
			PS.timerStop(J.object_show_timer);
			P.object_is_appearing = false;
			return;
			//P.reset_sprite();
		}

		if(J.object_show_counter < 10){
			var theImage = J.current_object_type + "0" + J.object_show_counter;
		}else{
			var theImage = J.current_object_type + J.object_show_counter;
		}
		theImage = P.SPRITE_LOCATION + theImage + ".png";

		PS.imageLoad(theImage, loader);
		J.object_show_counter--;


	},

	show_drag_helper: function(){
		// sound stuff
		A.play_appear_drag();

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
		J.object_show_counter++;

		// sound stuff
		// play a sound plz
		if(J.object_show_counter>14){
			//theImage = P.ready_sprite;
			//PS.imageLoad(theImage, loader);
			PS.timerStop(J.object_show_timer);
			P.object_is_appearing = false;

			P.place_drag_peg();
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
			if(P.object_is_held) {
				PS.timerStop(J.object_hold_timer);
				P.object_is_held = false;
				J.COLOR_VICTORY = J.COLOR_BACKGROUND_GLOW;
				PS.gridShadow(true, J.COLOR_VICTORY);
				G.successfulHold = true;
				L.hold_correct++;
				//P.reset_sprite();
			}
		}
	},

	hold_object_miss: function(){

		//P.reset_sprite();
		PS.gridPlane(J.LAYER_OBJECT);
		PS.gridShadow(true, PS.COLOR_RED);
		A.pause_hold();
		A.play_miss();
		J.error_glow();
	},

	delete_object: function(){
		if(P.object_exists){
			PS.spriteDelete(P.current_object);
			P.object_exists = false;
			return;
		}

	},

	place_drag_peg: function(){
		var loader;
		P.dragX = 16;
		P.dragY = 16;
		loader = function(data){
			P.drag_object = PS.spriteImage(data);
			PS.spritePlane(P.drag_object, J.LAYER_CLICK);
			PS.spriteAxis(P.drag_object, 5, 5);
			PS.spriteMove(P.drag_object, P.dragX, P.dragY);
		};
		var theImage = "sprites/peg_drag.png";
		PS.imageLoad(theImage, loader);
		P.drag_exists = true;
		A.appear_counter = 0;
	},

	update_drag_peg: function(x, y){
		//PS.debug("(" + x + ", " + y + ")\n");
		PS.spriteMove(P.drag_object, x, y);
	},

	remove_drag_peg: function(){
		PS.spriteDelete(P.drag_object);
		G.dragLeft = false;
		G.dragUp = false;
		G.dragRight = false;
		G.dragDown = false;
		P.drag_exists = false;
	}
};

var A = {//audio

	// channels
	hold_channel: 0,
	bgm_channel: 0,
	drums_channel: 0,
	insanity_channel: 0,

	//sounds 

	TONE_NULL: "NULL",
	TONE_FADE_IN: "fx_hoot",
	TONE_FADE_OUT: "NULL",
	TONE_CLICK: "fx_pop",

	TONE_MISS: "sfx_miss",
	TONE_HOLD: "sfx_hold",

	SONG_BGM_0: "bgm_0",
	SONG_BGM_1: "bgm_1",
	SONG_BGM_2: "bgm_2",
	SONG_BGM_3: "bgm_3",
	SONG_BGM_4: "bgm_4",
	SONG_BGM_5: "bgm_5",


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

	TONE_APPEAR_DRAG_0: "sfx_drag_0",
	TONE_APPEAR_DRAG_1: "sfx_drag_1",
	TONE_APPEAR_DRAG_2: "sfx_drag_2",
	TONE_APPEAR_DRAG_3: "sfx_drag_3",
	TONE_APPEAR_DRAG_4: "sfx_drag_4",
	TONE_APPEAR_DRAG_5: "sfx_drag_5",
	TONE_APPEAR_DRAG_6: "sfx_drag_6",
	TONE_APPEAR_DRAG_7: "sfx_drag_7",
	TONE_APPEAR_DRAG_8: "sfx_drag_8",
	TONE_APPEAR_DRAG_9: "sfx_drag_9",
	TONE_APPEAR_DRAG_10: "sfx_drag_10",
	TONE_APPEAR_DRAG_11: "sfx_drag_11",
	TONE_APPEAR_DRAG_12: "sfx_drag_12",
	TONE_APPEAR_DRAG_13: "sfx_drag_13",
	TONE_APPEAR_DRAG_14: "sfx_drag_14",
	TONE_APPEAR_DRAG_15: "sfx_drag_15",

	SOUND_PATH: "audio/",
	TONES_GROW_PATH: "audio/fadein/",
	TONES_DRAG_PATH: "audio/drag/",


	TONES: [],
	TONES_HORIZ:[],
	TONES_VERT: [],
	TONES_DRAG: [],
	TAP_ARRAY: [],

	appear_counter: 0,

	bgm_is_playing: false,
	insanity_is_playing: false,

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
			case L.ACT_FADE_IN_DRAG:
				var rando = PS.random(A.TAP_ARRAY.length-1); // generate from 1 to max
				PS.audioPlay(A.TAP_ARRAY[rando], {volume: 0.5, path: A.SOUND_PATH});
				break;
		}
		//PS.audioPlay(A.TONES[L.ACT_CLICK]);
	},

	play_start_drag: function(){
		var rando = PS.random(A.TAP_ARRAY.length-1); // generate from 1 to max
		PS.audioPlay(A.TAP_ARRAY[rando], {volume: 0.2, path: A.SOUND_PATH});

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

		A.TONES_DRAG[0] = A.TONE_APPEAR_DRAG_0;
		A.TONES_DRAG[1] = A.TONE_APPEAR_DRAG_1;
		A.TONES_DRAG[2] = A.TONE_APPEAR_DRAG_2;
		A.TONES_DRAG[3] = A.TONE_APPEAR_DRAG_3;
		A.TONES_DRAG[4] = A.TONE_APPEAR_DRAG_4;
		A.TONES_DRAG[5] = A.TONE_APPEAR_DRAG_5;
		A.TONES_DRAG[6] = A.TONE_APPEAR_DRAG_6;
		A.TONES_DRAG[7] = A.TONE_APPEAR_DRAG_7;
		A.TONES_DRAG[8] = A.TONE_APPEAR_DRAG_8;
		A.TONES_DRAG[9] = A.TONE_APPEAR_DRAG_9;
		A.TONES_DRAG[10] = A.TONE_APPEAR_DRAG_10;
		A.TONES_DRAG[11] = A.TONE_APPEAR_DRAG_11;
		A.TONES_DRAG[12] = A.TONE_APPEAR_DRAG_12;
		A.TONES_DRAG[13] = A.TONE_APPEAR_DRAG_13;
		A.TONES_DRAG[14] = A.TONE_APPEAR_DRAG_14;
		A.TONES_DRAG[15] = A.TONE_APPEAR_DRAG_15;




		A.TONES[L.ACT_FADE_OUT] = A.TONE_FADE_OUT;
		A.TONES[L.ACT_CLICK] = A.TONE_CLICK;

		for(var i = 0; i < A.TONES.length; i++){
			if(A.TONES[i] !== "NULL") {
				PS.audioLoad(A.TONES[i]);
			}
		}

		PS.audioLoad(A.SONG_BGM_1, {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.SONG_BGM_2, {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.SONG_BGM_3, {lock:true, path: A.SOUND_PATH});
		//PS.audioLoad(A.SONG_BGM_4, {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.SONG_BGM_5, {lock:true, path: A.SOUND_PATH});


		PS.audioLoad(A.TAP_ARRAY[0], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[1], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[2], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[3], {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TAP_ARRAY[4], {lock:true, path: A.SOUND_PATH});

		PS.audioLoad(A.TONE_MISS, {lock:true, path: A.SOUND_PATH});
		PS.audioLoad(A.TONE_HOLD, {lock:true, path: A.SOUND_PATH});

		for(var i = 0; i < A.TONES_HORIZ.length; i++){
			PS.audioLoad(A.TONES_HORIZ[i], {lock:true, path: A.TONES_GROW_PATH});
		}

		for(var i = 0; i < A.TONES_VERT.length; i++){
			PS.audioLoad(A.TONES_VERT[i], {lock:true, path: A.TONES_GROW_PATH});
		}

		for(var i = 0; i < A.TONES_DRAG.length; i++){
			PS.audioLoad(A.TONES_DRAG[i], {lock:true, path: A.TONES_GROW_PATH});
		}
	},

	play_miss: function(){
		PS.audioPlay(A.TONE_MISS, {volume:0.1, path: A.SOUND_PATH});
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

	play_appear_drag: function(){
		PS.audioPlay(A.TONES_DRAG[A.appear_counter], {volume:0.05, path: A.TONES_GROW_PATH});
		A.appear_counter++;
		if(A.appear_counter > 14){
			//PS.debug("yes");
			A.appear_counter = 0;
		}
	},

	play_drag: function(){
		if(A.appear_counter % 16 == 0){
			PS.audioPlay(A.TONES_DRAG[A.appear_counter], {volume:0.5, path: A.TONES_DRAG_PATH});
		}
		A.appear_counter++;
	},

	play_bgm: function(){
		var theBgm;
		switch(S.current_chapter){
			case 0:
				theBgm = A.SONG_BGM_0;
				break;
			case 1:
				theBgm = A.SONG_BGM_1;
				break;
			case 2:
				theBgm = A.SONG_BGM_2;
				break;
			case 3:
				theBgm = A.SONG_BGM_3;
				break;
			case 4:
				theBgm = A.SONG_BGM_4;
				break;
			case 5:
				theBgm = A.SONG_BGM_5;
				break;
		}
		if(S.current_chapter != 0){
			A.bgm_channel = PS.audioPlay(theBgm, {loop: false, volume:0.1, path: A.SOUND_PATH});
			A.bgm_is_playing = true;
		}else{
			A.bgm_channel = PS.audioPlay(theBgm, {loop: true, volume:0.1, path: A.SOUND_PATH});
			A.bgm_is_playing = true;
		}
	},

	stop_bgm: function(){
		if(A.bgm_is_playing){
			PS.audioStop(A.bgm_channel);
		}
		A.bgm_is_playing = false;
	},

	play_hold: function(){
		A.hold_channel = PS.audioPlay(A.TONE_HOLD, {loop: false, volume: 0.5, path: A.SOUND_PATH});
	},

	pause_hold: function(){
		PS.audioStop(A.hold_channel);
	},

	play_insanity: function(){

	},

	increase_insanity: function(){

	},


	
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

var callback = function ( id ) {
	if ( id === PS.ERROR ) {
		// If this test succeeds, the collected username was invalid.
		// Your database still exists, but no username will be associated with it.
		// A warning notice will appear in the footer, but no actual error is thrown.
		PS.statusColor(PS.COLOR_WHITE);
		PS.statusText("USERNAME INVALID, REFRESH PLZ");
	}else{
		S.current_chapter = 0;
		S.welcome_statement();
	}

// This is where you should complete initialization
// and start your game
};

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	A.load();

	J.init_grid();
	
	G.init_measure();

	J.black_cross();
	J.clear_cross();

	G.populate_tempo_array();
	S.populate_message_arrays();
	//J.start_insanity_timer();

	//G.spawn_object_tap(15);

	//SET TO TRUE BFORE WE'RE DONE
	PS.statusColor(PS.COLOR_WHITE);

	PS.dbInit( "threnody", { login : callback } );

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
	//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	if(G.isBreakTime){
		S.end_break_time();
		return;
	}

	if(!A.insanity_is_playing){
		A.play_insanity();
	}else{
		A.increase_insanity();
	}
	if(!G.isPlayable){
		return;
	}
	if(!G.canClick){
		return;
	}

	G.halt_click();

	if(!G.isRhythmBegun){
		//PS.statusText("THE PLACEHOLDER SOUNDS");
		//PS.statusColor(PS.COLOR_WHITE);
		//A.play_bgm();
		//G.start_global_timer();
		//S.welcome_statement();
	}else{
		if(G.isOnPeg(x, y)){
			G.click();
			G.isHolding = true;
			G.currentDragX = x;
			G.currentDragY = y;
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
	if(P.drag_exists && G.isDragging){
		G.stop_drag();
	}
	G.isDragging = false;

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

	if(P.drag_exists  && G.isDragging){
		G.drag(x, y);
	}
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

	// don't do this anymore
	//return;
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
//Simple names for drums
var kick, snare, lTom, mTom, hTom, oHH, cHH;

//Simple names for synth notes
var synth1, //C1
	synth2, //Eb1
	synth3, //F1
	synth4, //G1
	synth5, //Bb1
	synth6, //C2
	synth7, //Eb2
	synth8, //F2
	synth9, //G2
	synth10,//Bb2
	synth11;//C3

//Various colors
var borderColor, metroColor, drumOffColor, drumOnColor,
    synthOffColor, synthOnColor, bgColor, tempoSelectColor, shadowColor, shadowR, shadowG, shadowB;

var time; //Current column that is being played
var gridHeight; //Height of entire grid
var gridWidth; //Width of entire grid
var numTracks; //Number of instrument rows
var rows; //Array to contain instruments
var tempo; //Current tempo
var hasBegun; //has the metronome been started?
var timer; // The timer
var paused = false; //Whether or not the program is paused
hasBegun = false;  //Whether or not the first click has occurred
var isDragging = false;
var metroPos = 0; // Metronome slider's position

const MAX_TIME = 15; //Max time
const NUM_SYNTHS = 11; //Number of synth tracks
const NUM_DRUMS = 7;  //Number of drum tracks
const COLUMN_OFFSET = 0; //number of extra columns to the left
const ROW_OFFSET = 0; //number of extra rows on the top
const DEFAULT_TEMPO = 8.1; //Starting tempo


//Assign simple names to all audio and then preload it
create_sound = function() {
	//assign simple names to all instruments
	kick = "perc_drum_bass";
	snare = "perc_drum_snare";
	lTom = "perc_drum_tom3";
    mTom = "perc_drum_tom2";
	hTom = "perc_drum_tom1";
	oHH = "perc_hihat_pedal";
	cHH = "perc_hihat_closed";
	//crash = "perc_cymbal_crash1";

	synth1 = "xylo_c5";
	synth2 = "xylo_eb5";
	synth3 = "xylo_f5";
	synth4 = "xylo_g5";
	synth5 = "xylo_bb5";
	synth6 = "xylo_c6";
	synth7 = "xylo_eb6";
	synth8 = "xylo_f6";
	synth9 = "xylo_g6";
	synth10 = "xylo_bb6";
	synth11 = "xylo_c7";

	//Load and lock all instruments
	PS.audioLoad( kick, { lock : true } );
	PS.audioLoad( snare, { lock : true } );
	PS.audioLoad( lTom, { lock : true } );
	PS.audioLoad( hTom, { lock : true } );
	PS.audioLoad( oHH, { lock : true } );
	PS.audioLoad( cHH, { lock : true } );
	PS.audioLoad( mTom, { lock : true } );

	PS.audioLoad( synth1, { lock : true } );
	PS.audioLoad( synth2, { lock : true } );
	PS.audioLoad( synth3, { lock : true } );
	PS.audioLoad( synth4, { lock : true } );
	PS.audioLoad( synth5, { lock : true } );
	PS.audioLoad( synth6, { lock : true } );
	PS.audioLoad( synth7, { lock : true } );
	PS.audioLoad( synth8, { lock : true } );
	PS.audioLoad( synth9, { lock : true } );
	PS.audioLoad( synth10, { lock : true } );
	PS.audioLoad( synth11, { lock : true } );
};


//Define the colors which will be used in the program
set_colors = function() {

    bgColor = 0x070719;
    borderColor = bgColor;

    PS.color(PS.ALL, PS.ALL, bgColor);

    
    shadowColor = 0x161629;
    shadowR = 22;
    shadowG = 22;
    shadowB = 41;
    metroColor = bgColor;
	drumOffColor = 0x570087;
	drumOnColor = 0xAD44FF;
	synthOffColor  = 0x630D06;
	synthOnColor = 0xCC291E;
    tempoSelectColor =  bgColor;

    PS.gridColor(bgColor);

    PS.borderColor(PS.ALL, PS.ALL, borderColor);
    for(var i = ROW_OFFSET; i < NUM_SYNTHS; i++){
        for(var j = COLUMN_OFFSET; j < 16; j += 4){
            PS.color(j, i, synthOffColor);
        }
    }



};


/* Define what instrument each row is
  * Whenever time advances, it calls the play function which scans each bead in a column
  * if the data says that the bead is "on" (clicked) it will feed the sound file string to the audio play function
  * with the strings being stored within the rows array.  They are sorted in a logical order so that the 3rd row's
  * instrument correlates to rows[3] properly
  */
define_rows = function () {
  for(var i = 0; i < ROW_OFFSET; i++){
		rows[i] = "offset";
	}
	rows[ROW_OFFSET + 0] = synth11;
	rows[ROW_OFFSET + 1] = synth10;
	rows[ROW_OFFSET + 2] = synth9;
	rows[ROW_OFFSET + 3] = synth8;
	rows[ROW_OFFSET + 4] = synth7;
	rows[ROW_OFFSET + 5] = synth6;
	rows[ROW_OFFSET + 6] = synth5;
	rows[ROW_OFFSET + 7] = synth4;
	rows[ROW_OFFSET + 8] = synth3;
	rows[ROW_OFFSET + 9] = synth2;
	rows[ROW_OFFSET + 10] = synth1;

	rows[ROW_OFFSET + 11] = oHH;
	rows[ROW_OFFSET + 12] = cHH;
	rows[ROW_OFFSET + 13] = hTom;
	rows[ROW_OFFSET + 14] = mTom;
	rows[ROW_OFFSET + 15] = lTom;
	rows[ROW_OFFSET + 16] = snare;
	rows[ROW_OFFSET + 17] = kick;
};


//progress time and update status
advance_time = function() {

	//Revert the old time's beads to the default look
    for(var i = 0; i < numTracks; i++){
        PS.borderColor(time + COLUMN_OFFSET, i, bgColor);
        PS.radius(time + COLUMN_OFFSET, i, 35);
    }

	if( time == MAX_TIME) {
		time = 0;   //if time has hit its limit, reset to 0
	} else {
		time += 1;	//advance time
	}

	//Color the new time's borders a slightly different color and make their borders slightly less round
    for(var i = 0; i < numTracks; i++){
        PS.borderColor(time + COLUMN_OFFSET, i, PS.color(time + COLUMN_OFFSET, i) + 25 );
       PS.radius(time + COLUMN_OFFSET, i, 30);
    }

    PS.gridShadow(false); //turn off grid shadow if it was on because of a kick


};

//play a column of beads
play = function() {
    var count = 0; // Number of beads toggled on
	for(var i = ROW_OFFSET; i < gridHeight; i++) {
		if(PS.data((time + COLUMN_OFFSET), i) == "on") {
            count++;
			PS.audioPlay(rows[i]); //the array contains the different strings for the audio files, sorted in row order
            if(rows[i] == kick){
                var light = 20*count;
                var shadowRNew = shadowR + light;
                var shadowGNew = shadowG + light;
                var shadowBNew = shadowB + light;
                PS.gridShadow(true, shadowRNew, shadowGNew, shadowBNew); //Flashes the grid upon every kick

            }
		}
	}
};


//Turn a bead on if it is off, or turn a bead off if it is on
//Turning on/off entails changing the data of a bead (to be read by the "play" function) and changing the color
toggle_state = function(x, y){
	if(PS.data(x, y) == "on") {
		PS.data(x, y, "off");
		if(y < NUM_SYNTHS + ROW_OFFSET){
			PS.color(x, y,synthOffColor);
		} else {
			PS.color(x, y, drumOffColor);
		}
	} else {
		PS.data(x, y, "on");
		if(y < NUM_SYNTHS + ROW_OFFSET){
			PS.color(x, y, synthOnColor);
		} else {
			PS.color(x, y, drumOnColor);
		}

	}
};


//Set up the tempo slider at the bottom
init_metro_slider = function(){

    // Set color of metro slider and row above
    for(var i = 0; i < gridWidth; i++){
        PS.color(i, gridHeight, bgColor);
        PS.border(i, gridHeight, 0);
    }

    var p = .9; // Scaler for metronome slider gradient

	//Left most Color
	var R1 = 253;
	var G1 = 77;
	var B1 = 134;

	//Right most color
	var R2 = 250;
	var G2 = 184;
	var B2 = 206;
    for(var i = 0; i < gridWidth; i++){
        PS.color(i, gridHeight+1, R1, G1, B1);
        PS.border(i, gridHeight+1, 0);
        PS.borderColor(i, gridHeight + 1, tempoSelectColor);
        R1 = R1 * p + R2 * (1 - p);
        G1 = G1 * p + G2 * (1 - p);
        B1 = B1 * p + B2 * (1 - p);
    }
};

var metro = {
    next_beat : function(){ //advances the time and plays sound
        advance_time();
        play();
    }
};


//Define the radius and fade of all beads
define_grid = function(x, y){
  for(var i = ROW_OFFSET; i < numTracks; i++){
      for(var j = COLUMN_OFFSET; j < gridWidth; j++){
          PS.fade(j, i, 10);
          PS.radius(j, i, 35);
      }
  }
};


//Preform various actions upon clicking on the first bead
first_click_reveal = function () {

	//Define all drum beads
    for(var i = NUM_SYNTHS; i < numTracks; i++){
        PS.color(PS.ALL, i, drumOffColor);
    }

	//Turn on the tempo slider
    init_metro_slider();

	//Turn on a kick drum on every beat
    toggle_state(0, numTracks - 1);
    toggle_state(4, numTracks - 1);
    toggle_state(8, numTracks - 1);
    toggle_state(12, numTracks - 1);

	//Define all synth beads
    for(var i = ROW_OFFSET; i < gridWidth; i++){
        for(var j = COLUMN_OFFSET; j < NUM_SYNTHS; j++){
            if((i == 0) || (i == 4) || (i == 8) || (i == 12)){
                i++;
            }
            PS.color(i, j, synthOffColor);
        }
    }

	//define borders
    PS.border(8, numTracks + 1, {
        top: 0,
        left: 10,
        right: 10,
        bottom: 0
    });

	//Set the status line
    PS.statusFade(20);
    PS.statusColor(PS.COLOR_WHITE);
    PS.statusText("Jam On!");

};


PS.init = function( system, options ) {
	"use strict";

	//Define various variables
    numTracks = NUM_SYNTHS + NUM_DRUMS;  //Total number of tracks
    gridHeight = numTracks + ROW_OFFSET; //Height of Grid
    gridWidth = COLUMN_OFFSET + 16;		 //Width of grid
	PS.gridSize(gridWidth, gridHeight + 2); //Set up grid

    set_colors(); //Set various colors
    
	tempo = DEFAULT_TEMPO; //Set default tempo
	time = MAX_TIME; //Initialize the beat counter variable
	create_sound(); //Load and define sounds

	rows = new Array(); //Grid to contain audio clip strings
	define_rows(); //Define above array

	define_grid(); //Set up various attributes about the grid
	
	PS.data(PS.ALL, PS.ALL, "off"); //Define all beads as "off"

    PS.statusText(""); //Show no status text
};


PS.touch = function( x, y, data, options ) {
	"use strict";

	//Event which is triggered upon clicking one of the primary beats for the first time
	//Triggers the "reveal" function
    if(((!hasBegun) && (y < NUM_SYNTHS)) && ((x == 0) || (x == 4) || (x == 8) || (x == 12))){
        first_click_reveal();

        if(x == 0){
            time = MAX_TIME;
        } else {
            time = x - 1;
        }

        timer = PS.timerStart(tempo, metro.next_beat);
        hasBegun = true;
    }

	//Upon clicking on a bead, change it from on to off, or from off to on
	if(y < numTracks && hasBegun){
        toggle_state(x, y);
	}

	//Control for the temposlider at the bottom
    if((y == (numTracks + 1)) && hasBegun){
        isDragging = true;
        
        for(var i = 0; i < gridWidth; i++){
            PS.border(i, numTracks + 1, 0);
        }

        PS.border(x, numTracks + 1, {
            top: 0,
            left: 10,
            right: 10,
            bottom: 0
        });

		var speedMultiplierMax = 0.6; // Increase this to allow for higher max speed, decrease for lower
        tempo = 0.5 * ((gridWidth + 1) - (speedMultiplierMax *x) + 4);

        metroPos = i;
		//Check to make sure the app isn't paused
		if(!paused){
			PS.timerStop(timer);
			timer = PS.timerStart(tempo, metro.next_beat);
		}
        
    }
};


PS.release = function( x, y, data, options ) {
	"use strict";
    //Checks if we're currently dragging, if so, update the tempo
    if(isDragging){
        
		var speedMultiplierMax = 0.6; // Increase this to allow for higher max speed, decrease for lower
        tempo = 0.5 * ((gridWidth + 1) - (speedMultiplierMax *x) + 4);
        
        if(!paused){
			PS.timerStop(timer);
			timer = PS.timerStart(tempo, metro.next_beat);
		}
        metroPos = x;
        isDragging = false;
    }
};


PS.enter = function( x, y, data, options ) {
	"use strict";
    //If we're currently dragging, update the slider's position
    if(isDragging){
        for(var i = 0; i < gridWidth; i++){
            PS.border(i, numTracks + 1, 0);
        }

        PS.border(x, numTracks + 1, {
            top: 0,
            left: 10,
            right: 10,
            bottom: 0
        });
        metroPos = x;
    }
};


PS.exit = function( x, y, data, options ) {
	"use strict";
   
};


PS.exitGrid = function( options ) {
	"use strict";
    //If we're dragging, exiting the grid should stop the metronome slider wherever it currently is.
    if(isDragging){
		var speedMultiplierMax = 0.6; // Increase this to allow for higher max speed, decrease for lower
        tempo = 0.5 * ((gridWidth + 1) - (speedMultiplierMax *metroPos) + 4);
        
        if(!paused){
			PS.timerStop(timer);
			timer = PS.timerStart(tempo, metro.next_beat);
		}
        PS.border(metroPos, numTracks + 1, {
            top: 0,
            left: 10,
            right: 10,
            bottom: 0
        });
        isDragging = false; 
    }
};


PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";

	//Upon pressing Spacebar, pause the playback;  Pressing space again will resume playback
	if((key == 32) && (hasBegun)){
		switch (paused){
			case false: PS.timerStop(timer);
                        PS.gridShadow(false);
						paused = true;
						break;
			case true:  timer = PS.timerStart(tempo, metro.next_beat);
						paused = false;
						break;
		}
	}
};


PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};


PS.swipe = function( data, options ) {
	"use strict";
};


PS.input = function( sensors, options ) {
	"use strict";

};
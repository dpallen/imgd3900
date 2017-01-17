// game.js for Perlenspiel 3.2
// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */


/**
 * Very Good Second Perlenspiel Mod By Henry Wheeler-Mackta
 * Created by Henry Wheeler-Mackta for IMGD3900
 * 1/17/2017
 * MODIFICATIONS:
 * Movement now happens whilst dragging the mouse
 * After collecting one gold piece, and for every gold piece thereafter, the maze will get darker
 * After collecting three gold pieces, the control scheme switches to arrow keys
 * The status line now updates based on how far along the player is
 */
var G; // The G object will contain all public constants, variables and functions
var S; // all shadow behavior

// This self-invoking function encapsulates all game functionality.
// It is called as this file is loaded, and initializes the G object.

( function () {
	"use strict";

	// Constants are in all upper-case

	var WIDTH = 21; // grid width
	var HEIGHT = 21; // grid height

	var PLANE_FLOOR = 0; // z-plane of floor
	var PLANE_ACTOR = 2; // z-plane of actor
	var PLANE_SHADOW = 1; // Darkness
	var PLANE_GOLD = 2; // golden plane, same as actor

	var COLOR_BG = 0x42433D; // background color
	var COLOR_WALL = 0x42433D; // wall color
	var COLOR_FLOOR = 0x818377; // floor color
	var COLOR_ACTOR = PS.COLOR_WHITE // actor color
	var COLOR_GOLD = 0xCFC71D; // gold color

	var SOUND_FLOOR = "click"; // touch floor sound
	var SOUND_WALL = "wall"; // touch wall sound
	var SOUND_GOLD_1 = "gold1"; // take coin sound
	var SOUND_GOLD_2 = "gold2"; // take coin sound
	var SOUND_GOLD_3 = "gold3"; // take coin sound
	var SOUND_DARKNESS = "darkness"; // dark sound
	var SOUND_DEATH = "death";
	var SOUND_BGM = "bgm";


	var BGM_PATH = "C:/Users/henry/Documents/GitHub/imgd3900/henry-mod/sample/bgm/";
	var SFX_PATH = "C:/Users/henry/Documents/GitHub/imgd3900/henry-mod/sample/sfx/";

	var WALL = 0; // wall
	var FLOOR = 1; // floor
	var GOLD = 2; // floor + gold


	// Variables

	var id_sprite; // actor sprite id
	var id_path; // pathmap id for pathfinder
	var id_timer; // timer id

	var gold_count; // initial number of gold pieces in map
	var gold_found; // gold pieces collected
	var won = false; // true on win
	var clickcount = 0; // counter for clicks on win

	var helddown = false;
	var arrowtime = false;
	var shadow_width = 21;
	var shadow_height = 21;

	// This handmade imageMap is used for map drawing and pathfinder logic
	// All properties MUST be present!
	// The map.data array controls the layout of the maze,
	// the location of the gold pieces and exit
	// 0 = wall, 1 = floor, 2 = floor + gold
	// To remove a gold piece, replace a 2 with a 1
	// To add a gold piece, replace a 1 with a 2

	var map = {
		width: 21, // must match WIDTH!
		height: 21, // must match HEIGHT!
		pixelSize: 1, // must be present!
		data: [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 0, 0, 1, 1, 2, 1, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 2, 1, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
			0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
			0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0,
			0, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 2, 0,
			0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
			0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0,
			0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]
	};

	// These two variables control the initial location of the actor
	// This location MUST correspond to a floor location (1) in the maza.data array
	// or a startup error will occur!

	var actorX = 1; // initial x-pos of actor sprite
	var actorY = 1; // initial y-pos of actor sprite

	// These two variables control the location of the exit
	// This location MUST correspond to a floor location (1) in the maza.data array
	// or a startup error will occur!

	var exitX = 19; // x-pos of exit
	var exitY = 19; // y-pos of exit
	var exit_ready = false; // true when exit is opened

	// Timer function, called every 1/10th sec
	// This moves the actor along paths

	var path; // path to follow, null if none
	var step; // current step on path

	var tick = function () {
		var p, nx, ny, ptr, val;

		if(helddown){
			G.move()
		}
		if ( !path ) { // path invalid (null)?
			return; // just exit
		}

		// Get next point on path

		p = path[ step ];
		nx = p[ 0 ]; // next x-pos
		ny = p[ 1 ]; // next y-pos

		// If actor already at next pos,
		// path is exhausted, so nuke it

		if ( ( actorX === nx ) && ( actorY === ny ) ) {
			path = null;
			return;
		}

		// Move sprite to next position

		PS.spriteMove( id_sprite, nx, ny );
		actorX = nx; // update actor's xpos
		actorY = ny; // and ypos

		// If actor has reached a gold piece, take it

		ptr = ( actorY * HEIGHT ) + actorX; // pointer to map data under actor
		val = map.data[ ptr ]; // get map data
		if ( val === GOLD ) {
			map.data[ ptr ] = FLOOR; // change gold to floor in map.data
			PS.gridPlane( PLANE_FLOOR ); // switch to floor plane
			PS.color( actorX, actorY, COLOR_FLOOR ); // change visible floor color

			S.increase();

			// If last gold has been collected, activate the exit

			gold_found += 1; // update gold count
			if ( gold_found >= gold_count ) {
				//exit_ready = true;
				//PS.color( exitX, exitY, COLOR_EXIT ); // show the exit
				//PS.glyphColor( exitX, exitY, PS.COLOR_WHITE ); // mark with white X
				//PS.glyph( exitX, exitY, "X" );
				PS.statusText( "Bad." );
				won = true;
				//PS.audioPlay( SOUND_OPEN );
				PS.audioPlay( SOUND_DEATH, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
				PS.spriteSolidColor( id_sprite, PS.COLOR_RED );

			}

			// Otherwise just update score

			else {
				if(gold_found == 1){
					PS.statusText( "Lights Out.");
					PS.gridFade(50);
					PS.gridColor(PS.COLOR_BLACK);
					PS.audioPlay(SOUND_BGM, {volume: 0.25, path: BGM_PATH});
					PS.audioPlay( SOUND_DARKNESS, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );

				}else{
					var rando = PS.random(3);
					switch(rando){
						case 1:
							PS.audioPlay( SOUND_GOLD_1, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
							break;
						case 2:
							PS.audioPlay( SOUND_GOLD_2, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
							break;
						case 3:
							PS.audioPlay( SOUND_GOLD_3, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
							break;
					}
				}

				if(gold_found == 3){
					PS.statusText( "Arrow Keys Now.");
					G.arrowtime = true;

				}

				if(gold_found == 5){
					PS.statusText( "Art isn't fun.");
					PS.spriteSolidColor( id_sprite, COLOR_GOLD );

				}
				if(gold_found == 6){
					PS.statusText( "Mouse Reactivated.");
					G.arrowtime = false;
				}

				if(gold_found == 7){
					PS.statusText("");
				}
			}

		}

		// If exit is ready and actor has reached it, end game

		else if ( exit_ready && ( actorX === exitX ) && ( actorY === exitY ) ) {
			PS.timerStop( id_timer ); // stop movement timer
			//PS.statusText( "You escaped with " + gold_found + " gold!" );
			//PS.audioPlay( SOUND_WIN );
			won = true;
			return;
		}

		step += 1; // point to next step

		// If no more steps, nuke path

		if ( step >= path.length ) {
			path = null;
		}

		S.draw();
	};

	// Public functions are exposed in the global G object, which is initialized here.
	// Only two functions need to be exposed; everything else is encapsulated!
	// So safe. So elegant.

	G = {
		arrowtime : false,
		// Initialize the game
		// Called once at startup


		getActorX : function(){
			return actorX;
		},
		getActorY : function(){
			return actorY;
		},
		// move( x, y )
		// Set up new path for the actor to follow
		move : function ( x, y ) {
			var line;

			// Do nothing if game over

			if ( won ) {
				clickcount++;
				if(clickcount > 15){
					PS.statusText("The End");
				}
				return;
			}

			// Use pathfinder to calculate a line from current actor position
			// to touched position

			line = PS.pathFind( id_path, actorX, actorY, x, y );

			// If line is not empty, it's valid,
			// so make it the new path
			// Otherwise hoot at the player

			if ( line.length > 0 ) {
				path = line;
				step = 0; // start at beginning
				// DON'T SPAM SOUND IF DRAGGING
			}
			else {
				PS.audioPlay( SOUND_WALL, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );

			}
		},
		init : function () {
			var x, y, val, color;

			// Establish grid size
			// This should always be done FIRST, before any other initialization!

			PS.gridSize( WIDTH, HEIGHT );

			// Check for illegal actor/exit locations

			val = map.data[ ( actorY * HEIGHT ) + actorX ]; // get map data under actor
			if ( val !== FLOOR ) {
				PS.debug( "ERROR: Actor not on empty floor!" );
				//PS.audioPlay( SOUND_ERROR );
				return;
			}

			val = map.data[ ( exitY * HEIGHT ) + exitX ]; // get map data at exit position
			if ( val !== FLOOR ) {
				PS.debug( "ERROR: Exit not on empty floor!" );
				//PS.audioPlay( SOUND_ERROR );
				return;
			}

			PS.gridColor( COLOR_BG ); // grid background color
			PS.border( PS.ALL, PS.ALL, 0 ); // no bead borders
			PS.statusColor( PS.COLOR_WHITE );
			PS.statusText( "TOUCH AND drag to MOVE" );
			PS.statusFade(50);

			// Use the map.data array to draw the maze
			// This also counts the number of gold pieces that have been placed

			gold_count = gold_found = 0;
			for ( y = 0; y < HEIGHT; y += 1 ) {
				for ( x = 0; x < WIDTH; x += 1 ) {
					val = map.data[ ( y * HEIGHT ) + x ]; // get data
					//PS.gridPlane(PLANE_FLOOR);
					if ( val === WALL ) {
						color = COLOR_WALL;
					}
					else if ( val === FLOOR ) {
						color = COLOR_FLOOR;
					}
					else if ( val === GOLD ) {
						//PS.gridPlane(PLANE_GOLD);
						color = COLOR_GOLD;
						gold_count += 1; // add to count
					}
					if(color == COLOR_GOLD){
						PS.gridPlane(PLANE_GOLD);
						PS.alpha(x, y, PS.ALPHA_OPAQUE);
					}else{
						PS.gridPlane(0);
					}
					PS.color( x, y, color );
				}
			}

			// Preload & lock sounds

			PS.audioLoad( SOUND_FLOOR, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_WALL, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_GOLD_1, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_GOLD_2, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_GOLD_3, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_DARKNESS, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
			PS.audioLoad( SOUND_DEATH, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );

			PS.audioLoad(SOUND_BGM, {lock: true, path: BGM_PATH});

			// Create 1x1 solid sprite for actor
			// Place on actor plane in initial actor position

			id_sprite = PS.spriteSolid( 1, 1 );
			PS.spriteSolidColor( id_sprite, COLOR_ACTOR );
			PS.spritePlane( id_sprite, PLANE_ACTOR );
			PS.spriteMove( id_sprite, actorX, actorY );

			// init the shadow
			S.init();
			S.draw();

			// Create pathmap from our imageMap
			// for use by pathfinder

			id_path = PS.pathMap( map );

			// Start the timer function that moves the actor
			// Run at 10 frames/sec (every 6 ticks)

			path = null; // start with no path
			step = 0;
			id_timer = PS.timerStart( 6, tick );
		},
		sound : function(type){
			switch(type){
				case "Selection":
						PS.audioPlay( SOUND_FLOOR, { lock : true, path:SFX_PATH, fileTypes:["wav"] } );
					break;
				case "Step":
					break;
				case "GetItem":
					break;
			}
		},


	};

	S = {
		init: function(){
			PS.gridPlane(PLANE_SHADOW);
			for (var y = 0; y < HEIGHT; y++) {
				for ( var x = 0; x < WIDTH; x++) {
					PS.color( x, y, PS.COLOR_BLACK );
					PS.alpha(x, y, PS.ALPHA_TRANSPARENT);
				}
			}
		},
		increase: function(){

			if(shadow_height > 20){
				shadow_height = shadow_height - 15;//shadow_height - (shadow_height/gold_count); // technically light height / width
				shadow_width = shadow_width - 15;//shadow_width - (shadow_width/gold_count);
			}else{
				if(shadow_height > 0){
					shadow_height = shadow_height - 2;
					shadow_width = shadow_width - 2;
				}
			}
		},

		draw: function(){
			// set everything to black, but update transparency
			for (var y = 0; y < HEIGHT; y++) {
				for ( var x = 0; x < WIDTH; x++) {

					PS.gridPlane(PLANE_SHADOW);
					PS.alpha(x, y, PS.ALPHA_TRANSPARENT);

					if((x > actorX + shadow_width) || (x < actorX - shadow_width)){
						//PS.fade(x, y, 50);
						PS.alpha(x, y, PS.ALPHA_OPAQUE);
					}

					if((y > actorY + shadow_height) || (y < actorY - shadow_height)){
						//PS.fade(x, y, 50);
						PS.alpha(x, y, PS.ALPHA_OPAQUE);
					}

				}
			}
		}
	};
} () ); // end of self-invoking function

// PS.init( system, options )
// Initializes the game

PS.init = function( system, options ) {
	"use strict";

	G.init(); // game-specific initialization
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched

PS.touch = function( x, y, data, options ) {
	"use strict";
	if(G.arrowtime == true){
		return;
	}
	G.move( x, y ); // initiates actor movement
	G.sound("Selection");
	G.helddown = true;


};

// All event functions must be present to prevent startup errors,
// even if they don't do anything

PS.release = function( x, y, data, options ) {
	"use strict";

	G.helddown = false;
};

PS.enter = function( x, y, data, options ) {
	"use strict";
	if(G.arrowtime == true){
		return;
	}
	if(G.helddown == true){
		G.move( x, y );
	}
};

PS.exit = function( x, y, data, options ) {
	"use strict";
};

PS.exitGrid = function( options ) {
	"use strict";
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
	if(G.arrowtime == false){
		return;
	}

	G.sound("Selection");
	if(key == PS.KEY_ARROW_LEFT){
		G.move((G.getActorX() - 1), (G.getActorY()));
	}
	if(key == PS.KEY_ARROW_RIGHT){
		G.move((G.getActorX() +1), (G.getActorY()));
	}
	if(key == PS.KEY_ARROW_UP){
		G.move((G.getActorX()), (G.getActorY()-1));
	}
	if(key == PS.KEY_ARROW_DOWN){
		G.move((G.getActorX()), (G.getActorY()+1));
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


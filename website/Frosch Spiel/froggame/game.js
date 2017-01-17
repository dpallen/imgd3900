// game.js for Perlenspiel 3.2

var A = { //audio
	SHINE_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Frosch%20Spiel/froggame/" ,

	TOAD_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Frosch%20Spiel/froggame/",	//TODO INTEGRATE
	FROG_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Frosch%20Spiel/froggame/",	//TODO INTEGRATE
	QUAKE_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Frosch%20Spiel/froggame/quake/",


	firstBlood: "first_blood",
	headshot: "headshot",

	doubleKill: "double",
	tripleKill: "triple",

	holyShit: "holy_shit",
	impressive: "impressive",
	killingSpree: "killing_spree",
	ludacris: "ludacris",
	monsterKill: "monster",
	multiKill: "mult",
	rampage: "rampage",
	godLike: "god_like",
	ultraKill: "ultra",
	unstoppable: "unstoppable",
	wicked: "wicked",
	dominating: "dominating",

	exciting: [],

	slurp: "fx_squish",
	flyKill: "fx_scratch",
	noFire: "fx_blast1",
	noIce: "fx_powerup4",
	purchase: "fx_coin2",
	shopOpen: "fx_coin3",
	shine: "shine",

	frog: "frog", //TODO INTEGRATE
	toad: "toad",

	whistler: "whistler",
	space: "space",

	init_sound: function() {
		PS.audioLoad( A.slurp, { lock : true , volume : 0.75} );
		PS.audioLoad( A.flyKill, { lock : true } );
		PS.audioLoad( A.noFire, { lock : true } );
		PS.audioLoad( A.noIce, { lock : true } );
		PS.audioLoad( A.purchase, { lock : true } );
		PS.audioLoad( A.shopOpen, { lock : true } );

		PS.audioLoad( A.shine, {lock : true, path : A.SHINE_PATH , fileTypes : ["wav"]} );

		PS.audioLoad( A.frog, {lock : true, path : A.FROG_PATH} );     //TODO INTEGRATE
		PS.audioLoad( A.toad, {lock : true, path : A.TOAD_PATH} );     //TODO INTEGRATE

		PS.audioLoad(A.whistler, {lock : true, path: A.FROG_PATH});
		PS.audioLoad(A.space, {lock: true, path: A.FROG_PATH});

		PS.audioLoad( A.dominating, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.doubleKill, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.firstBlood, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.godLike, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.headshot, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.holyShit, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.impressive, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.killingSpree, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.ludacris, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.monsterKill, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.multiKill, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.rampage, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.tripleKill, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.ultraKill, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.unstoppable, {lock : true, path : A.QUAKE_PATH} );
		PS.audioLoad( A.wicked, {lock : true, path : A.QUAKE_PATH} );


		A.exciting = [A.dominating, A.godLike, A.holyShit, A.impressive, A.killingSpree, A.ludacris, A.monsterKill,
			A.multiKill, A.rampage, A.ultraKill, A.unstoppable, A.wicked, A.headshot];

	}
};
var G = {  //The game state


	// CONSTANTS
	// Constant names are all upper-case to make them easy to distinguish

	GRID_WIDTH: 32, // width of grid
	GRID_HEIGHT: 32, // height of grid
	FLY_REGION: [32 - 3, 32 - 5], // region in which flies will spawn, from (0,0) to this number
	FRAME_RATE: 60,	// animation frame rate; 6/60ths = 10 fps
	COLOR_BG: 0x8080FF, // background color
	MAX_FLIES: 12,


	NO_FLY: "No flies", //to signify an empty space where a fly could be
	USED: "Occupied",
	FLY_NORMAL: "Normal Fly",
	FLY_ICE: "Ice Fly",
	FLY_FIRE: "Fire Fly",
	GAME_NAME : "FROSCH SPIEL",


	firstQuake: true,

	combo: 0,  //TODO INTEGRATE
	comboCooldown: 1,  //TODO INTEGRATE

	activeFlies: [],

	countdown: 30,
	// VARIABLES
	// Variable names are lower-case with camelCaps

	// These two arrays store the X and Y positions of active flies
	flies: [],
	timer : 0,

	points: 0, //lifetime points
	money: 0, //current points for upgrades
	flyCount: 0,

	downHeld: false,


	bgPlane : 0,
	fgPlane : 1,
	fliesPlane : 2,
	fliesFadePlane: 3,
	tonguePlane : 4,
	frogPlane : 5,
	toadPlane : 6,
	menuPlane : 7,
	menuButtonPlane : 8,


	place_fly : function ( x, y, flyType) {
		//generate either 0 or 1, and use it as the starting frame of the fly animation
		var startFrame = Math.floor((Math.random() * 2));

		S.place_fly(x, y, startFrame, flyType);
		G.activeFlies[(G.flyCount*2)] = x;
		G.activeFlies[(G.flyCount*2) + 1] = y;

		G.flies[x+1][y] = G.USED;
		G.flies[x+2][y] = G.USED;
		G.flies[x][y+1] = G.USED;
		G.flies[x+1][y+1] = G.USED;
		G.flies[x+2][y+1] = G.USED;
		G.flies[x][y] = flyType;
	},

	drawGrid : function(){
		if(M.space_level == 0){
			S.draw_pond();
			PS.gridColor(PS.COLOR_BLACK);
		}else{
			S.draw_space();
		}

		S.load_menu_button();
	},


	generate_flies : function() {

	var flyX = Math.floor((Math.random() * G.FLY_REGION[0] - 2));
	var flyY = Math.floor((Math.random() * G.FLY_REGION[1] - 1));

	if (flyY < 0) {
		flyY = 0;
	}
	if (flyX < 0) {
		flyX = 0;
	}

	var topLeftUSED = (G.flies[flyX][flyY] != G.NO_FLY);
	var botRightUSED = (G.flies[flyX + 2][flyY + 1] != G.NO_FLY);
	var topRightUSED = (G.flies[flyX + 2][flyY] != G.NO_FLY);
	var botLeftUSED = (G.flies[flyX][flyY + 1] != G.NO_FLY);
	var topMidUSED = (G.flies[flyX + 1][flyY] != G.NO_FLY);
	var botMidUSED = (G.flies[flyX + 1][flyY + 1] != G.NO_FLY);

	while (topLeftUSED || botRightUSED || topRightUSED || botLeftUSED || topMidUSED || botMidUSED) {
		flyX = Math.floor((Math.random() * G.FLY_REGION[0] - 2));
		flyY = Math.floor((Math.random() * G.FLY_REGION[1] - 1));

		if (flyY < 0) {
			flyY = 0;
		}
		if (flyX < 0) {
			flyX = 0;
		}

		topLeftUSED = (G.flies[flyX][flyY] != G.NO_FLY);
		botRightUSED = (G.flies[flyX + 2][flyY + 1] != G.NO_FLY);
		topRightUSED = (G.flies[flyX + 2][flyY] != G.NO_FLY);
		botLeftUSED = (G.flies[flyX][flyY + 1] != G.NO_FLY);
		topMidUSED = (G.flies[flyX + 1][flyY] != G.NO_FLY);
		botMidUSED = (G.flies[flyX + 1][flyY + 1] != G.NO_FLY);
	}

	var type = Math.floor((Math.random() * 5)); //type of fly to be generated
		if(G.countdown > 0){
			type = 0;
		}
		switch (type) {
		case 0:
		case 1:
		case 2:
			G.place_fly(flyX, flyY, G.FLY_NORMAL);
			break;
		case 3: //Fire flies
			G.place_fly(flyX, flyY, G.FLY_FIRE);
			break;
		case 4: //Ice flies
			G.place_fly(flyX, flyY, G.FLY_ICE);
			break;
	}
	G.flyCount++;

},

	remove_fly : function ( x, y, activeFlyCount){
		var xtodelete = x;
		var ytodelete = y;
		G.flies[x][y] = G.NO_FLY;
		G.flies[x+1][y] = G.NO_FLY;
		if(G.flies[x=2][y] != null){
			G.flies[x+2][y] = G.NO_FLY;
		}
		G.flies[x][y+1] = G.NO_FLY;
		G.flies[x+1][y+1] = G.NO_FLY;

		if(G.flies[x=2][y+1] != null){
			G.flies[x+2][y+1] = G.NO_FLY;
		}
		G.activeFlies[activeFlyCount] = -1;
		G.activeFlies[activeFlyCount+1] = -1;
		G.flyCount--;
		S.kill_fly(xtodelete, ytodelete);
	},

	tick: function(){
		if(G.countdown > 0){
			G.countdown--;
		}
		//For fly generation
		if(G.flyCount < G.MAX_FLIES) {
			var chance = (G.MAX_FLIES - G.flyCount) / G.MAX_FLIES;
			chance = Math.floor((Math.random() + chance));
			if (chance >= 1) {
				G.generate_flies();
			}
		}

		if(G.flyCount > G.MAX_FLIES/2){ //If over 50%, start removing them, sometimes
			if(Math.floor(Math.random() * 2) == 1){
				var killFly = 1;
				while(killFly % 2 != 0){
					killFly = Math.floor(Math.random() * (G.activeFlies.length));
				}
				if ( G.activeFlies[killFly] != -1){

					G.remove_fly(G.activeFlies[killFly], G.activeFlies[killFly+1], killFly);
				}
			}

		}


		if(M.quake_level > 0){
			if(T.comboing){
				G.comboCooldown = 1;
			} else {
				G.comboCooldown -= 1;
			}
			if(G.comboCooldown < 0){
				switch(G.combo) {
					case 0:case 1:
					break;
					case 2:
						if(Math.floor(Math.random()  * 4) > 2){
							var vo = Math.floor(Math.random() * A.exciting.length);
							PS.audioPlay(A.exciting[vo], {path: A.QUAKE_PATH});
						} else {
							PS.audioPlay(A.doubleKill, {path: A.QUAKE_PATH});
						}
						break;
					case 3:
						if(Math.floor(Math.random()  * 4) > 1){
							var vo = Math.floor(Math.random() * A.exciting.length);
							PS.audioPlay(A.exciting[vo], {path: A.QUAKE_PATH});
						} else {
							PS.audioPlay(A.tripleKill, {path: A.QUAKE_PATH});
						}
						break;
					default:

						break;

				}
				G.comboCooldown = 1;
				G.comboing = false;
				G.combo = 0;
			}
		}

	}
};

var S = {
 	// Sprite Controller
	// CONSTANTS

	// Variables
	frogX : 24,
	frogY : 24,

	frogID : 0, // The ID for the frog sprite
	frogstage : 0, // The stage for froggy's animation

	toadID : 0,
	toadX : 0,
	toadY : 0,

	// These two arrays store the X and Y positions of active flies
	fliesSprites: [],
	fliesSprites2: [],

	// Sprite Variables



	// Functions

	load_sprites : function(){

	},

	load_menu_button : function(){
		var MenuButton = PS.spriteSolid( 3, 3 );
		loader = function (data) {
			MenuButton = PS.spriteImage(data);
			PS.spritePlane(MenuButton, G.menuButtonPlane);
			PS.spriteMove(MenuButton, 0, 29);
		};

		PS.imageLoad("menu_button_0.png", loader);
	},
	place_frog : function(){

		loader = function (data) {
			S.frogID = PS.spriteImage(data);
			PS.spritePlane(S.frogID, G.frogPlane);
			PS.spriteMove(S.frogID, S.frogX, S.frogY);
		};

		PS.imageLoad("frog_0.png", loader);

	},

	update_frog : function(){
		var str;
		switch(T.tongueType){
			case "fire":
				str = "fire_";
				break;
			case "water":
				str = "water_";
				break;
			case "normal":
				str = "";
				break;
		}

		loader = function (data) {
			S.frogID = PS.spriteImage(data);
			PS.spritePlane(S.frogID, G.frogPlane);
			if(M.real_level>0){
				PS.spriteAxis(S.frogID, 2, 1);
			}
			PS.spriteMove(S.frogID, S.frogX, S.frogY);
		};

		if (S.frogstage < 2) {
			S.frogstage++;
		} else {
			S.frogstage = 0;
		}
		if(M.real_level == 0){
			switch (S.frogstage) {
				case 0:
					PS.imageLoad("frog_" + str + "" + "0.png", loader);
					break;
				case 1:
					PS.imageLoad("frog_" + str + "" + "1.png", loader);
					break;
				case 2:
					PS.imageLoad("frog_" + str + "" + "2.png", loader);
					break;
			}
		}else{
			switch (S.frogstage) {
				case 0:
					PS.imageLoad("frogreal_" + str + "" + "0.png", loader);
					break;
				case 1:
					PS.imageLoad("frogreal_" + str + "" + "1.png", loader);
					break;
				case 2:
					PS.imageLoad("frogreal_" + str + "" + "2.png", loader);
					break;
			}
		}
	},

	place_toad : function(){
		loader = function(data){
			S.toadID = PS.spriteImage(data);
			PS.spritePlane(S.toadID, G.toadPlane);
			PS.spriteAxis(S.toadID, 1, 3);
			PS.spriteMove(S.toadID, T.tongueSrc2[0], T.tongueSrc2[1]);
		}

		PS.imageLoad("toad_0.png", loader);
	},

	update_toad : function(){
		//PS.spriteDelete(S.toadID);
		PS.spriteMove(S.toadID, T.tongueSrc2[0], T.tongueSrc2[1]);
		if(M.real_level > 0){
			loader = function(data){
				S.toadID = PS.spriteImage(data);
				PS.spritePlane(S.toadID, G.toadPlane);
				PS.spriteAxis(S.toadID, 2, 6);
				PS.spriteMove(S.toadID, T.tongueSrc2[0], T.tongueSrc2[1]);
			}

			PS.imageLoad("realtoad_0.png", loader);
		}
	},

	place_fly : function(x, y, startframe, type){
		var flyID = 0; // dummy value
		var entryTimer = 0;

		fadeOut = function(){
			for(var i = x; i < x + 3; i++){
				for(var j = y; j < y + 2; j++){
					PS.fade(i, j, 0)
				}
			}

			PS.timerStop(entryTimer);

		};

		for(var i = x; i < x + 3; i++) {
			for (var j = y; j < y + 2; j++) {
				PS.fade(i, j, 10)
			}
		}
		entryTimer = PS.timerStart(10, fadeOut);

		loader = function(data){
			flyID = PS.spriteImage(data);
			PS.spritePlane(flyID, G.fliesPlane);
			PS.spriteMove(flyID, x, y);
		};


		if(startframe == 0){
			switch(type){
				case "Normal Fly" : PS.imageLoad("fly_0.png", loader);
					break;
				case "Ice Fly" : 	PS.imageLoad("fly_ice_0.png", loader);
					break;
				case "Fire Fly" : 	PS.imageLoad("fly_fire_0.png", loader);
					break;
			}
			S.fliesSprites[x][y] = 0;
		}else{
			switch(type){
				case "Normal Fly" : PS.imageLoad("fly_1.png", loader);
					break;
				case "Ice Fly" : 	PS.imageLoad("fly_ice_1.png", loader);
					break;
				case "Fire Fly" : 	PS.imageLoad("fly_fire_1.png", loader);
					break;
			}
			S.fliesSprites[x][y] = 1;
		}

	},

	update_fly : function(x, y, type){
		var flyID = 0; // dummy value
		loader = function(data){
			flyID = PS.spriteImage(data);
			PS.spritePlane(flyID, G.fliesPlane);
			PS.spriteMove(flyID, x, y);
		};

		if(S.fliesSprites[x][y] == 0){
			switch(type){
				case "Normal Fly" :
					if(M.space_level == 0){
						PS.imageLoad("fly_0.png", loader);
					}else{
						PS.imageLoad("spacefly_0.png", loader);
					}
					break;
				case "Ice Fly" : 	PS.imageLoad("fly_ice_0.png", loader);
					break;
				case "Fire Fly" : 	PS.imageLoad("fly_fire_0.png", loader);
					break;
			}
			S.fliesSprites[x][y] = 1;
		}else{
			switch(type){
				case "Normal Fly" :
					if(M.space_level == 0){
						PS.imageLoad("fly_1.png", loader);
					}else{
						PS.imageLoad("spacefly_1.png", loader);
					}
					break;
				case "Ice Fly" : 	PS.imageLoad("fly_ice_1.png", loader);
					break;
				case "Fire Fly" : 	PS.imageLoad("fly_fire_1.png", loader);
					break;
			}
			S.fliesSprites[x][y] = 0;
		}
	},

	update_flies : function(){

		for(var x = 0; x < G.FLY_REGION[0]; x++){
			for(var y = 0; y < G.FLY_REGION[1]; y++){

				if(G.flies[x][y] != G.NO_FLY ){
					S.update_fly(x, y, G.flies[x][y]);
				}

			}
		}
	},

	kill_fly : function(x, y){
		var timer;
		var mySprite;

		mySprite = PS.spriteSolid( 3, 3 );
		PS.spriteSolidColor( mySprite, PS.COLOR_BLACK);
		PS.spritePlane(mySprite, G.fliesPlane);
		PS.spriteSolidAlpha(mySprite, 0);
		PS.spriteShow( mySprite, true );
		PS.spriteMove(mySprite, x, y);
		mySpriteDied = function(){
			PS.spriteDelete(mySprite);
			PS.timerStop(timer);
		}
		timer = PS.timerStart(5, mySpriteDied);

	},

	tickF : function(){
		S.update_frog();

	},

	tickFl : function(){
		S.update_flies();
	},

	showShine : function(){
		var shineID;
		var timershine;
		loader = function(data){
			shineID = PS.spriteImage(data);
			PS.spritePlane(shineID, G.toadPlane);
			PS.spriteMove(shineID, 25, 24);
		}

		PS.imageLoad("shinefox_0.png", loader);

		stoptimer = function(){
			PS.spriteDelete(shineID);
			PS.timerStop(timershine);
		}
		timershine = PS.timerStart(5, stoptimer);
	},

	draw_pond : function(){
		var spaceID;
		loader = function(data){
			spaceID = PS.spriteImage(data);
			PS.spritePlane(spaceID, G.bgPlane);
			PS.spriteMove(spaceID, 0, 0);
		}

		PS.imageLoad("pond_0.png", loader);
	},

	draw_space : function(){
		var spaceID;
		loader = function(data){
			spaceID = PS.spriteImage(data);
			PS.spritePlane(spaceID, G.bgPlane);
			PS.spriteMove(spaceID, 0, 0);
		}

		PS.audioStop(A.whistler);
		PS.audioPlay(A.space, {loop : true, path: A.FROG_PATH, volume : 0.25});
		PS.imageLoad("space_0.png", loader);
	}

};

var T = {  //The tongue

	xpos: 0, //current position of tongue
	ypos: 0, //current position of tongue
	xpos2: 0,
	ypos2: 0,
	xpos3: 0,
	ypos3: 0,
	xpos4: 0,
	ypos4: 0,

	path: null, // path to follow, null if none
	path2: null,
	path3: null,
	path4: null,

	step: 0, // current step on path
	step2: 0,
	step3: 0,
	step4: 0,

	isTongueMoving: false,
	isTongue2Moving: false,
	isTongue3Moving: false,
	isTongue4Moving: false,

	MOUTH_LIMIT: [ 5, 22],

	tongueSrc: [28, 29],  //Where the tongue is coming from (the frog)
	tongueSrc2:[13, 30],
	TONGUE_RATE: 5,
	COLOR_TONGUE: 0xFF82AB, // tongue color

	tongueLength: 25,
	tongueType: "normal",
	tongueWidth: 5,

	pierceCount1: 0,
	pierceCount2: 0,
	pierceCount3: 0,
	pierceCount4: 0,

	tonguetimer: 0,

	tongueiterator : 1,

	tongue_iterator: function(){

		if(M.multi_tongue_level != 0){
			if(M.multi_tongue_level == 1){
				if(T.tongueiterator == 1){
					T.tongueiterator = 2;
				}else{
					T.tongueiterator = 1;
				}
			}else{
				if(T.tongueiterator < 3){T.tongueiterator++;

				}else{
					T.tongueiterator = 1;
				}
			}

		}

	},

	recolor_tongue: function(){
		switch(T.tongueType){
			case "fire" :
				T.COLOR_TONGUE = 0xFF7C00;
				break;
			case "water" :
				T.COLOR_TONGUE = 0x3100FF;
				break;
			case "normal" :
				T.COLOR_TONGUE = 0xFF82AB;
				break;
		}
	},

	reach_tongue : function(x, y, tongue){
		var line;
		switch(tongue){
			case 1:
				T.isTongueMoving = true;
				// Calc a line from current position
				// to touched position
				if(T.step == 0){
					line = PS.line(T.tongueSrc[0], T.tongueSrc[1], x, y );
				}
				// If line is not empty,
				// make it the new path
				if ( line.length > 0 ) {
					T.path = line;
					T.step = 0; // start at beginning
					T.pierceCount1 = M.pierce_tongue_level;
				}
				break;
			case 2:
				T.isTongue2Moving = true;
				// Calc a line from current position
				// to touched position
				if(T.step2 == 0){
					line = PS.line(T.tongueSrc[0], T.tongueSrc[1], x, y );
				}
				// If line is not empty,
				// make it the new path
				if ( line.length > 0 ) {
					T.path2 = line;
					T.step2 = 0; // start at beginning
					T.pierceCount2 = M.pierce_tongue_level;
				}
				break;
			case 3:
				T.isTongue3Moving = true;
				if(T.step3 == 0){
					line = PS.line(T.tongueSrc[0], T.tongueSrc[1], x, y );
				}
				// If line is not empty,
				// make it the new path
				if ( line.length > 0 ) {
					T.path3 = line;
					T.step3 = 0; // start at beginning
					T.pierceCount3 = M.pierce_tongue_level;
				}
				break;
			case 4:
				T.isTongue4Moving = true;
				// Calc a line from current position
				// to touched position
				if(T.step4 == 0){
					line = PS.line(T.tongueSrc2[0], T.tongueSrc2[1], x, y );
				}
				// If line is not empty,
				// make it the new path
				if ( line.length > 0 ) {
					T.path4 = line;
					T.step4 = 0; // start at beginning
					T.pierceCount4 = M.pierce_tongue_level;
				}
				break;
		}

		//T.isTongueMoving = true;
/*
		// Calc a line from current position
		// to touched position
		if(T.step == 0){
			line = PS.line(T.tongueSrc[0], T.tongueSrc[1], x, y );
		}

		// If line is not empty,
		// make it the new path

		if ( line.length > 0 ) {
			T.path = line;
			T.step = 0; // start at beginning
		}
		*/
	},

	retract_tongue : function(tongue) {
		var thepath = 0;
		switch(tongue){
			case 1:
				thepath = T.path;
				break;
			case 2:
				thepath = T.path2;
				break;
			case 3:
				thepath = T.path3;
				break;
			case 4:
				thepath = T.path4;
				break;
		}
		PS.audioPlay(A.slurp);
		PS.gridPlane(G.tonguePlane);
		for(var i = 0; i < (thepath.length); i++){
			PS.alpha(thepath[i][0], thepath[i][1], 0);

			}

	},

	finish_tongue: function(tongue){
		T.retract_tongue(tongue);
		switch(tongue){
			case 1:
				T.path = null;
				T.isTongueMoving = false;
				T.step = 0;

				break;
			case 2:
				T.path2 = null;
				T.isTongue2Moving = false;
				T.step2 = 0;
				break;
			case 3:
				T.path3 = null;
				T.isTongue3Moving = false;
				T.step3 = 0;
				break;
			case 4:
				T.path4 = null;
				T.isTongue4Moving = false;
				T.step4 = 0;
				break;
		}

	},

	check_fly : function ( x, y){




		if((G.flies[x][y] != G.NO_FLY) && (G.flies[x][y] != G.USED) && (G.flies[x][y] != null)){
			//PS.debug("FLY FOUND1\n");
			return [x, y];
		}

		var yOne = false, xOne = false, xTwo;




		if((y - 1) >= 0){
			yOne = true;
		}
		if((yOne && (G.flies[x][y-1] != G.NO_FLY) && (G.flies[x][y-1] != G.USED) && (G.flies[x][y-1] != null))){
			//PS.debug("FLY FOUND2\n");
			return [x, y-1];
		}

		if((x - 1) >= 0) {
			xOne = true;
		}
		if(((xOne && yOne) &&(G.flies[x-1][y-1] != G.NO_FLY) && (G.flies[x-1][y-1] != G.USED) && (G.flies[x-1][y-1] != null))){
			//PS.debug("FLY FOUND3\n");
			return [x-1, y-1];
		}


		if((xOne && (G.flies[x-1][y] != G.NO_FLY)) && (G.flies[x-1][y] != G.USED) && (G.flies[x-1][y] != null)){
			//PS.debug("FLY FOUND4\n");
			return [x-1, y];
		}

		if((x - 2) >= 0) {
			xTwo = true;
		}
		if(((xTwo) && (G.flies[x-2][y] != G.NO_FLY)) && (G.flies[x-2][y] != G.USED) && (G.flies[x-2][y] != null)){
			//PS.debug("FLY FOUND5\n");
			return [x-2, y];
		}

		if(((xTwo && yOne) && (G.flies[x-2][y-1] != G.NO_FLY)) && (G.flies[x-2][y-1] != G.USED) && (G.flies[x-2][y-1] != null)){
			//PS.debug("FLY FOUND6\n");
			return [x-2, y-1];
		}
		return false;
	},

	eat_fly : function ( x, y) {
		var good2kill = true;
		var earnings = 0;
		//PS.debug("ATE THE FLY\n");
		if(G.flies[x][y] == "Ice Fly"){
			earnings = 1;
			if(T.tongueType != "fire"){
				PS.audioPlay(A.noIce);
				good2kill = false
			}
		}
		if(G.flies[x][y] == "Fire Fly"){
			earnings = 2;
			if(T.tongueType != "water"){
				PS.audioPlay(A.noFire);
				good2kill = false;
			}
		}
		if(good2kill == true){
			if(M.quake_level > 0){
				if(G.firstQuake) {
					PS.audioPlay(A.firstBlood, {path: A.QUAKE_PATH});
					G.firstQuake = false;
				}
				G.comboing = true;
				G.combo += 1;
			}
			G.points++;
			G.money = G.money + (1+earnings);
			//G.flies[x][y] = G.NO_FLY;
			//G.flyCount--;
			PS.statusText("Money: " + G.money);
			//S.kill_fly(x, y);

			var count;
			for(var i = 0; i < G.activeFlies.length; i+=2){
				if((G.activeFlies[i] == x) && (G.activeFlies[i+1] == y)){
					count = i;
				}
			}
			PS.audioPlay(A.flyKill);
			G.remove_fly(x, y, count);

			//TODO DELETE FLY SPRITE
		}

	},

	tick : function(){
		if ( T.path ) { // path ready (not null)?
			// Get next point on path
			PS.gridPlane(G.tonguePlane);

			var p = T.path[ T.step ];
			var nx = p[ 0 ]; // next x-pos
			var ny = p[ 1 ]; // next y-pos
			var isFly = false;

			if ( ( T.xpos == nx ) && ( T.ypos == ny ) ) {
				T.finish_tongue(1);
				//PS.debug("EXIT1\n");
				return;
			}

			// Move sprite to next position
			T.xpos = nx; // update xpos
			T.ypos = ny; // and ypos

			//PS.debug("X POS:   " + G.xpos + "\t\tY POS:   " + G.ypos + "\n");
			PS.color(T.xpos, T.ypos, T.COLOR_TONGUE);
			PS.alpha(T.xpos, T.ypos, 255);

			if((T.xpos <= G.flies.length) && (T.ypos <= G.flies[0].length)) {
				isFly = T.check_fly(T.xpos, T.ypos);
			}

			if(isFly == false) {
				T.step += 1; // point to next step
			} else {
				T.eat_fly(isFly[0], isFly[1]);
				//PS.debug("line end");
				if(T.pierceCount1 == 0) {
					T.finish_tongue(1);
					return;
				} else {
					T.step += 1;
					T.pierceCount1 -= 1;
				}
			}
			// If no more steps, nuke path
			if (T.step >= T.path.length ) {
				T.finish_tongue(1);
			}

		}
		if (T.path2 ) { // path ready (not null)?
			// Get next point on path
			PS.gridPlane(G.tonguePlane);

			var p = T.path2[T.step2 ];
			var nx = p[ 0 ]; // next x-pos
			var ny = p[ 1 ]; // next y-pos
			var isFly = false;

			if ( ( T.xpos2 == nx ) && ( T.ypos2 == ny ) ) {
				T.finish_tongue(2);
				//PS.debug("EXIT1\n");
				return;
			}

			// Move sprite to next position
			T.xpos2 = nx; // update xpos
			T.ypos2 = ny; // and ypos

			//PS.debug("X POS:   " + G.xpos + "\t\tY POS:   " + G.ypos + "\n");
			PS.color(T.xpos2, T.ypos2, T.COLOR_TONGUE);
			PS.alpha(T.xpos2, T.ypos2, 255);

			if((T.xpos2 <= G.flies.length) && (T.ypos2 <= G.flies[0].length)) {
				isFly = T.check_fly(T.xpos2, T.ypos2);
			}

			if(isFly == false) {
				T.step2 += 1; // point to next step
			} else {
				T.eat_fly(isFly[0], isFly[1]);
				//PS.debug("line end");
				if(T.pierceCount2 == 0) {
					T.finish_tongue(2);
					return;
				} else {
					T.step2 += 1;
					T.pierceCount2 -= 1;
				}
			}
			// If no more steps, nuke path
			if (T.step2 >= T.path2.length ) {
				T.finish_tongue(2);
			}

		}
		if ( T.path3 ) { // path ready (not null)?
			// Get next point on path
			PS.gridPlane(G.tonguePlane);

			var p = T.path3[ T.step3 ];
			var nx = p[ 0 ]; // next x-pos
			var ny = p[ 1 ]; // next y-pos
			var isFly = false;

			if ( ( T.xpos3 == nx ) && ( T.ypos3 == ny ) ) {
				T.finish_tongue(3);
				//PS.debug("EXIT1\n");
				return;
			}

			// Move sprite to next position
			T.xpos3 = nx; // update xpos
			T.ypos3 = ny; // and ypos

			//PS.debug("X POS:   " + G.xpos + "\t\tY POS:   " + G.ypos + "\n");
			PS.color(T.xpos3, T.ypos3, T.COLOR_TONGUE);
			PS.alpha(T.xpos3, T.ypos3, 255);

			if((T.xpos3 <= G.flies.length) && (T.ypos3 <= G.flies[0].length)) {
				isFly = T.check_fly(T.xpos3, T.ypos3);
			}

			if(isFly == false) {
				T.step3 += 1; // point to next step
			} else {
				T.eat_fly(isFly[0], isFly[1]);
				//PS.debug("line end");
				if(T.pierceCount2 == 0) {
					T.finish_tongue(2);
					return;
				} else {
					T.step2 += 1;
					T.pierceCount2 -= 1;
				}
				//PS.debug("EXIT2\n");
			}
			// If no more steps, nuke path
			if (T.step3 >= T.path3.length ) {
				T.finish_tongue(3);
			}

		}
		if ( T.path4 ) { // path ready (not null)?
			// Get next point on path
			PS.gridPlane(G.tonguePlane);

			var p = T.path4[ T.step4 ];
			var nx = p[ 0 ]; // next x-pos
			var ny = p[ 1 ]; // next y-pos
			var isFly = false;

			if ( ( T.xpos4 == nx ) && ( T.ypos4 == ny ) ) {
				T.finish_tongue(4);
				//PS.debug("EXIT1\n");
				return;
			}

			// Move sprite to next position
			T.xpos4 = nx; // update xpos
			T.ypos4 = ny; // and ypos

			//PS.debug("X POS:   " + G.xpos + "\t\tY POS:   " + G.ypos + "\n");
			PS.color(T.xpos4, T.ypos4, T.COLOR_TONGUE);
			PS.alpha(T.xpos4, T.ypos4, 255);

			if((T.xpos4 <= G.flies.length) && (T.ypos4 <= G.flies[0].length)) {
				isFly = T.check_fly(T.xpos4, T.ypos4);
			}

			if(isFly == false) {
				T.step4 += 1; // point to next step
			} else {
				T.eat_fly(isFly[0], isFly[1]);
				//PS.debug("line end");
				if(T.pierceCount4 == 0) {
					T.finish_tongue(4);
					return;
				} else {
					T.step4 += 1;
					T.pierceCount4 -= 1;
				}
				//PS.debug("EXIT2\n");
			}
			// If no more steps, nuke path
			if (T.step4 >= T.path4.length ) {
				T.finish_tongue(4);
			}

		}
	}
};

var M = {
	// Variables
	menuToggle : false,
	long_tongue_level : 0,
	fire_tongue_level : 0,
	water_tongue_level : 0,
	multi_tongue_level : 0,
	pierce_tongue_level: 0,
	shine_level : 0,
	dual_wield_level: 0,
	croak_level: 0, //TODO INTEGRATE
	real_level : 0,
	space_level : 0,
	quake_level : 0,
	song_level : 0,

	cheater : 0,

	toggle_cheater: function(){
		if(M.cheater == 0 ){
			PS.statusText("You Cheater.");
			M.cheater = 1;
		}else{
			PS.statusText("Cheating Disabled");
			M.cheater = 0;
		}
	},

	//TODO MAKE pierce tongue purchase
	load_menu_choice_pic: function(x, y, type, level, show){
		var choiceID = 0, str;
		loader = function(data){
			choiceID = PS.spriteImage(data);
			PS.spritePlane(choiceID, G.menuPlane);
			PS.spriteMove(choiceID, x, y);
			if(show){
				PS.spriteShow(choiceID, true);
			}else{
				PS.spriteShow(choiceID, false);
			}
		};
		switch(type){
			case "tongue boost" :
				str ="longtongue_" + level + ".png";
				break;
			case "fire tongue" :
				str = "firetongue_" + level + ".png";
				break;
			case "water tongue" :
				str = "watertongue_" + level + ".png";
				break;
			case "thick tongue" :
				str = "thicktongue_" + level + ".png";
				break;
			case "multi tongue" :
				str = "multitongue_" + level + ".png";
				break;
			case "toad pal" :
				str = "toadbuddy_" + level + ".png";
				break;
			case "shine" :
				str = "shine_" + level + ".png";
				break;
			case "croak" :
				str = "croak_" + level + ".png";
				break;
			case "real" :
				str = "real_" + level + ".png";
				break;
			case "space" :
				str = "spacey_" + level + ".png";
				break;
			case "quake" :
				str = "quake_" + level + ".png";
				break;
			case "music" :
				str = "music_" + level + ".png";
				break;
		}

		PS.imageLoad(str, loader);

	},

	init_menu : function(){
		PS.gridPlane(G.menuPlane);
		PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);

	},

	show_menu : function() {
		// 2, 7, 13, 19, 25
		PS.gridPlane(G.menuPlane);
		if (!M.menuToggle) {
			PS.audioPlay(A.shopOpen);
			PS.statusText("Money: " + G.money);
			PS.alpha(PS.ALL, PS.ALL, 200);
			for (var i = 0; i < G.GRID_WIDTH; i++) {
				for (var j = 0; j < G.GRID_HEIGHT; j++) {
					if ((i == 1) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "tongue boost", M.long_tongue_level, true);
					}
					if ((i == 7) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "fire tongue", M.fire_tongue_level, true);
					}
					if ((i == 13) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "water tongue", M.water_tongue_level, true);
					}
					if((i == 19) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "thick tongue", M.pierce_tongue_level, true);
					}
					if((i==25) && (j==1)){
						M.load_menu_choice_pic(i, j, "multi tongue", M.multi_tongue_level, true);
					}
					if((i==1) && (j==7)){
						M.load_menu_choice_pic(i, j, "toad pal", M.dual_wield_level, true);
					}
					if((i==7) && (j==7)){
						M.load_menu_choice_pic(i, j, "shine", M.shine_level, true);
					}
					if((i==13 && (j==7))){
						M.load_menu_choice_pic(i, j, "croak", M.croak_level, true);
					}
					if((i==19) && (j==7)){
						M.load_menu_choice_pic(i, j, "real", M.real_level, true);
					}
					if((i==25) && (j==7)){
						M.load_menu_choice_pic(i, j, "space", M.space_level, true);
					}
					if((i==1) && (j==13)){
						M.load_menu_choice_pic(i, j, "quake", M.quake_level, true);
					}
					if((i==7) && (j==13)){
						M.load_menu_choice_pic(i, j, "music", M.song_level, true);
					}

				}
			}
			M.menuToggle = true;

		}else{
			PS.alpha(PS.ALL, PS.ALL, 0);
			for(var i = 0; i < G.GRID_WIDTH; i++) {
				for (var j = 0; j < G.GRID_HEIGHT; j++) {
					if ((i == 1) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "tongue boost", 0, false);
					}
					if ((i == 7) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "fire tongue", 0, false);
					}
					if ((i == 13) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "water tongue", 0, false);
					}
					if((i == 19) && (j == 1)) {
						M.load_menu_choice_pic(i, j, "thick tongue", 0, false);
					}
					if((i==25) && (j==1)){
						M.load_menu_choice_pic(i, j, "multi tongue", 0, false);
					}
					if((i==1) && (j==7)){
						M.load_menu_choice_pic(i, j, "toad pal", M.dual_wield_level, false);
					}
					if((i==7) && (j==7)){
						M.load_menu_choice_pic(i, j, "shine", M.shine_level, false);
					}
					if((i==13 && (j==7))){
						M.load_menu_choice_pic(i, j, "croak", M.croak_level, false);
					}
					if((i==19) && (j==7)){
						M.load_menu_choice_pic(i, j, "real", M.real_level, false);
					}
					if((i==25) && (j==7)){
						M.load_menu_choice_pic(i, j, "space", M.space_level, false);
					}
					if((i==1) && (j==13)){
						M.load_menu_choice_pic(i, j, "quake", M.quake_level, false);
					}
					if((i==7) && (j==13)){
						M.load_menu_choice_pic(i, j, "music", M.song_level, false);

					}

				}
			}

			M.menuToggle = false;
		}


	},

	get_price : function(item, level){
		switch(item) {
			case("fire") :
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 8 * (level + 1);
				break;
			case("water") :
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 12 * (level + 1);
				break;
			case("long") :
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 5 * (level + 1);
				break;
			case("thick") :
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 15 * (level + 1);
				break;
			case("multi") :
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 20 * (level + 1);
				break;
			case("toad"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 14 * (level + 1);
				break;
			case("shine"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 30 * (level + 1);
				break;
			case("croak"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 14 * (level + 1);
				break;
			case("real"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 25 * (level + 1);
				break;
			case("space"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 21 * (level + 1);
				break;
			case("quake"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 27 * (level + 1);
				break;
			case("music"):
				if (M.cheater == 1) {
					return 0;
					break;
				}
				return 5 * (level + 1);
				break;
 		}
	},

	buy_item : function(item){
		switch(item){
			case "fire tongue" :
				if(G.money >= M.get_price("fire", M.fire_tongue_level)) {
					G.money = G.money - M.get_price("fire", M.fire_tongue_level);
					PS.audioPlay(A.purchase);
					M.fire_tongue_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "water tongue" :
				if(G.money >= M.get_price("water", M.water_tongue_level)) {
					G.money = G.money - M.get_price("water", M.water_tongue_level);
					PS.audioPlay(A.purchase);
					M.water_tongue_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "long tongue" :
				if(G.money >= M.get_price("long", M.long_tongue_level)) {
					G.money = G.money - M.get_price("long", M.long_tongue_level);
					M.long_tongue_level++;
					T.TONGUE_RATE = 4 - (M.long_tongue_level);
					PS.audioPlay(A.purchase);
					PS.timerStop(T.tonguetimer);
					T.tonguetimer = PS.timerStart(T.TONGUE_RATE, T.tick);
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "thick tongue":
				if(G.money >= M.get_price("thick", M.pierce_tongue_level)) {
					G.money = G.money - M.get_price("thick", M.pierce_tongue_level);
					PS.audioPlay(A.purchase);
					M.pierce_tongue_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "multi tongue":
				if(G.money >= M.get_price("multi", M.multi_tongue_level)) {
					G.money = G.money - M.get_price("multi", M.multi_tongue_level);
					PS.audioPlay(A.purchase);
					M.multi_tongue_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "toad pal":
				if(G.money >= M.get_price("toad", M.dual_wield_level)) {
					G.money = G.money - M.get_price("toad", M.dual_wield_level);
					PS.audioPlay(A.purchase);
					M.dual_wield_level++;
					S.place_toad();
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "shine":
				if(G.money >= M.get_price("shine", M.shine_level)) {
					G.money = G.money - M.get_price("shine", M.shine_level);
					PS.audioPlay(A.purchase);
					M.shine_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "croak":
				if(G.money >= M.get_price("croak", M.croak_level)) {
					G.money = G.money - M.get_price("croak", M.croak_level);
					PS.audioPlay(A.purchase);
					M.croak_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "real":
				if(G.money >= M.get_price("real", M.real_level)) {
					G.money = G.money - M.get_price("real", M.real_level);
					PS.audioPlay(A.purchase);
					M.real_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "space":
				if(G.money >= M.get_price("space", M.space_level)) {
					G.money = G.money - M.get_price("space", M.space_level);
					PS.audioPlay(A.purchase);
					M.space_level++;
					G.drawGrid();
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "quake":
				if(G.money >= M.get_price("quake", M.quake_level)) {
					G.money = G.money - M.get_price("quake", M.quake_level);
					M.quake_level++;
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
			case "music":
				if(G.money >= M.get_price("music", M.song_level)) {
					G.money = G.money - M.get_price("music", M.song_level);
					M.song_level++;
					PS.audioPlay(A.whistler, {loop : true, path: A.FROG_PATH, volume : 0.25});
				}else{
					PS.statusText("NOT ENOUGH MONEY!");
				}
				break;
		}
		var timer;
		menuHide = function(){
			M.show_menu();
			PS.timerStop(timer);
		};

		timer = PS.timerStart(50, menuHide);
	},

	tutorial_show : function(type){
		var str, timer;
		switch(type){
			case "Tongue Element" :
				str = "Use Q/E to change tongue attunement!";
				break;
			case "Toad Pal" :
				str = "Use A/D to move! W to fire!"
				break;
			case "Shine" :
				str = "Press DOWN Arrow Key and B!";
				break;
			case "Croak" :
				str = "Press SPACEBAR to sing!";
				break;
			default :
				str = G.GAME_NAME;
				break;
		}

		fading_tutorial = function(){
			PS.statusText(G.GAME_NAME);
			PS.timerStop(timer);
		}
		PS.statusText(str);
		timer = PS.timerStart(60, fading_tutorial);
	}

};						//  Menu Control

init_flies = function () {
	"use strict";

	for(var x = 0; x < G.FLY_REGION[0]; x++){
		G.flies[x] = [];
		S.fliesSprites[x] = [];
		S.fliesSprites2[x] = [];
		for(var y = 0; y < G.FLY_REGION[1]; y++){
			G.flies[x][y] = G.NO_FLY;
			S.fliesSprites[x][y] = 0;
			S.fliesSprites2[x][y] = 0;
		}
	}
	for(var i = 0; i < G.MAX_FLIES; i++){
		G.activeFlies[i] = -1;
	}



};

PS.init = function( system, options ) {
	"use strict";


	PS.gridSize( G.GRID_WIDTH, G.GRID_HEIGHT );
	PS.border(PS.ALL, PS.ALL, 0); // no borders
	G.drawGrid();
	M.init_menu();
	S.place_frog();
	A.init_sound();
	init_flies();

	PS.keyRepeat(false);

	/*
	PS.color(G.FLY_REGION[0], PS.ALL, PS.COLOR_WHITE);
	PS.color(PS.ALL, G.FLY_REGION[1], PS.COLOR_WHITE);
*/
/*
	G.place_fly(10, 10, "Normal Fly");
	G.place_fly(15, 15, "Fire Fly");
	G.place_fly(20, 20, "Ice Fly");
*/
	PS.gridColor(PS.COLOR_BLACK);
	PS.statusColor(PS.COLOR_WHITE);
	PS.statusText(G.GAME_NAME);
	PS.statusFade(20);

	PS.timerStart(30, S.tickF);
	PS.timerStart(5, S.tickFl);
	G.timer = PS.timerStart( G.FRAME_RATE, G.tick );

	//G.place_fly(5,5, G.FLY_NORMAL);
	//G.place_fly(8,8, G.FLY_NORMAL);
	//G.place_fly(12,12, G.FLY_NORMAL);
	//G.place_fly(15,15, G.FLY_NORMAL);
	//G.place_fly(18, 18, G.FLY_NORMAL);

	T.tonguetimer = PS.timerStart(T.TONGUE_RATE, T.tick);
};

var placemode;

PS.touch = function( x, y, data, options ) {
	"use strict";

	//if(x < G.FLY_REGION[0]){
	//	if(y < G.FLY_REGION[1]){
	//		G.place_fly(x, y, "Normal Fly");
    //
	//	}
	//}

	if((x >= 0) && (x<=3)){
		if((y >= 29) && (y<=32)){
			M.show_menu();
		}
	}

	if(!M.menuToggle){

		switch(T.tongueiterator){
			case 1:
				if((!(T.isTongueMoving)) && ((x < G.FLY_REGION[0]) && (y < G.FLY_REGION[1]))){
					T.reach_tongue(x, y, 1);
				}
				T.tongue_iterator();
				break;
			case 2:
				if((!(T.isTongue2Moving)) && ((x < G.FLY_REGION[0]) && (y < G.FLY_REGION[1]))){
					T.reach_tongue(x, y, 2);
				}
				T.tongue_iterator();
				break;
			case 3:
				if((!(T.isTongue3Moving)) && ((x < G.FLY_REGION[0]) && (y < G.FLY_REGION[1]))){
					T.reach_tongue(x, y, 3);
				}
				T.tongue_iterator();
				break;
		}

	}else{
		if(M.menuToggle){
			if((x >= 1) && (x <=6)){
				if((y>=1) && (y<=6)){
					if(M.long_tongue_level < 3){
						PS.statusText("Tongue Speed Bought!");
						M.buy_item("long tongue");
					}else{
						PS.statusText("Sold Out!");
					}
				}
			}
			if((x>=7) && (x<=12)){
				if((y>=1) && (y<=6)){
					if(M.fire_tongue_level < 1){
						PS.statusText("Firey Tongue Bought!");
						M.tutorial_show("Tongue Element");
						M.buy_item("fire tongue");
					}else{
						PS.statusText("Sold Out!");
					}
				}
			}
			if((x>=13) && (x<=18)){
				if((y>=1) && (y<=6)){
					if(M.water_tongue_level < 1){
						PS.statusText("Watery Tongue Bought!");
						M.tutorial_show("Tongue Element");
						M.buy_item("water tongue");
					}else{
						PS.statusText("Sold Out!");
					}
				}
			}
			if((x>=19) && (x<=24)){
				if((y>=1) && (y<=6)){
					if(M.pierce_tongue_level<3){
						PS.statusText("Piercing Tongue Bought!");
						M.buy_item("thick tongue");
					}else{
						PS.statusText("Sold Out!");
					}
				}
			}
			if((x>=25) && (x<=30)){
				if((y>=1) && (y<=6)){
					if(M.multi_tongue_level< 2){
						PS.statusText("Multi Tongue Bought!");
						M.buy_item("multi tongue");
					}else{
						PS.statusText("Sold Out!");
					}
				}
			}
		}
		if((x>=1) && (x<=6)){
			if((y>=7) && (y<=13)){
				if(M.dual_wield_level< 1){
					PS.statusText("Toad Pal Bought!");
					M.tutorial_show("Toad Pal");
					M.buy_item("toad pal");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=7) && (x<=12)){
			if((y>=7) && (y<=13)){
				if(M.shine_level< 1){
					PS.statusText("Shine Bought!");
					M.tutorial_show("Shine");
					M.buy_item("shine");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=13) && (x<=18)){
			if((y>=7) && (y<=13)){
				if(M.croak_level< 1){
					PS.statusText("Sing Bought!");
					M.tutorial_show("Croak");
					M.buy_item("croak");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=19) && (x<=24)){
			if((y>=7) && (y<=13)){
				if(M.real_level< 1){
					PS.statusText("Realness Bought!");
					M.buy_item("real");
					if(M.dual_wield_level > 0){
						S.update_toad();
					}
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=25) && (x<=30)){
			if((y>=7) && (y<=13)){
				if(M.space_level< 1){
					PS.statusText("Space Exploration Bought!");
					M.buy_item("space");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=1) && (x<=6)){
			if((y>=14) && (y<=19)){
				if(M.quake_level< 1){
					PS.statusText("Announcer Pack Bought!");
					M.buy_item("quake");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
		if((x>=7) && (x<=12)){
			if((y>=14) && (y<=19)){
				if(M.song_level< 1){
					PS.statusText("Background Music Unlocked!");
					M.buy_item("music");
				}else{
					PS.statusText("Sold Out!");
				}
			}
		}
	}


};

PS.release = function( x, y, data, options ) {
	"use strict";
};

PS.enter = function( x, y, data, options ) {
	"use strict";
	if(M.menuToggle){
		if((x >= 1) && (x <=6)){
			if((y>=1) && (y<=6)){
				if(M.long_tongue_level < 3){
					PS.statusText("Tongue Speed Rank " + (M.long_tongue_level+1) + " : $" + M.get_price("long", M.long_tongue_level));
				}
			}
		}
		if((x>=7) && (x<=12)){
			if((y>=1) && (y<=6)){
				if(M.fire_tongue_level < 1){
					PS.statusText("Firey Tongue Rank " + (M.fire_tongue_level+1)+ " : $" + M.get_price("fire", M.fire_tongue_level));
				}
			}
		}
		if((x>=13) && (x<=18)){
			if((y>=1) && (y<=6)){
				if(M.water_tongue_level < 1){
					PS.statusText("Watery Tongue Rank " + (M.water_tongue_level+1)+ " : $" + M.get_price("water", M.water_tongue_level));
				}
			}
		}
		if((x>=19) && (x<=24)){
			if((y>=1) && (y<=6)){
				if(M.pierce_tongue_level < 3){
					PS.statusText("Pierce Tongue Rank " + (M.pierce_tongue_level+1)+ " : $" + M.get_price("thick", M.pierce_tongue_level));
				}
			}
		}
		if((x>=25) && (x<=30)){
			if((y>=1) && (y<=6)){
				if(M.multi_tongue_level < 3){
					PS.statusText("Multi Tongue Rank " + (M.multi_tongue_level+1)+ " : $" + M.get_price("multi", M.multi_tongue_level));
				}
			}
		}
		if((x>=1) && (x<=6)){
			if((y>= 7) && (y<=13)){
				if(M.dual_wield_level < 1){
					PS.statusText("Toad Pal Rank " + (M.dual_wield_level+1)+ " : $" + M.get_price("toad", M.dual_wield_level));
				}
			}
		}
		if((x>=7) && (x<=12)){
			if((y>= 7) && (y<=13)){
				if(M.shine_level < 1){
					PS.statusText("Shine Rank " + (M.shine_level+1)+ " : $" + M.get_price("shine", M.shine_level));
				}
			}
		}
		if((x>=13) && (x<=18)){
			if((y>= 7) && (y<=13)){
				if(M.shine_level < 1){
					PS.statusText("Sing Rank " + (M.croak_level+1)+ " : $" + M.get_price("croak", M.croak_level));
				}
			}
		}
		if((x>=19) && (x<=24)){
			if((y>= 7) && (y<=13)){
				if(M.real_level < 1){
					PS.statusText("Realness Rank " + (M.real_level+1)+ " : $" + M.get_price("real", M.real_level));
				}
			}
		}
		if((x>=25) && (x<=30)){
			if((y>= 7) && (y<=13)){
				if(M.space_level < 1){
					PS.statusText("Space Exploration Rank " + (M.space_level+1)+ " : $" + M.get_price("space", M.space_level));
				}
			}
		}
		if((x>=1) && (x<=6)){
			if((y>= 14) && (y<=19)){
				if(M.quake_level < 1){
					PS.statusText("Voice Announcer Pack : $" + M.get_price("quake", M.quake_level));
				}
			}
		}
		if((x>=7) && (x<=12)){
			if((y>= 14) && (y<=19)){
				if(M.song_level < 1){
					PS.statusText("Background Music : $" + M.get_price("music", M.song_level));
				}
			}
		}
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
	if(key == 113){ // left arrow key

		switch(T.tongueType){
			case "normal" :
				if((M.water_tongue_level > 0) && !(M.fire_tongue_level >0)) T.tongueType = "water";
				if((M.fire_tongue_level > 0) && !(M.water_tongue_level >0)) T.tongueType= "fire";
				if((M.fire_tongue_level > 0) && (M.water_tongue_level > 0)) T.tongueType = "water";
				break;
			case "water" :
				if(M.fire_tongue_level > 0) T.tongueType = "fire";
				if(M.fire_tongue_level == 0) T.tongueType = "normal";
				break;
			case "fire" :
				T.tongueType = "normal";
				break;
		}
		T.recolor_tongue();
	}

	if(key == 32 && M.croak_level > 0){ //Space bar for croak
		PS.audioPlay(A.frog, {path: A.FROG_PATH});
		if(M.dual_wield_level > 0){
			PS.audioPlay(A.toad, {path: A.TOAD_PATH});
		}
	}
	if(key == 1008){
		G.downHeld = true;
	}
	if(key == 98 && G.downHeld){
		PS.audioPlay(A.shine, {path: A.SHINE_PATH, fileTypes: ["wav"]});
		S.showShine();
		//TODO Display shine graphic and make it go away quickly.  On next frame, even
	}

	if(key == 101){ // right arrow key
		switch(T.tongueType){
			case "normal" :
				if((M.water_tongue_level > 0) && !(M.fire_tongue_level >0)) T.tongueType = "water";
				if((M.fire_tongue_level > 0) && !(M.water_tongue_level >0)) T.tongueType= "fire";
				if((M.fire_tongue_level > 0) && (M.water_tongue_level > 0)) T.tongueType = "fire";
				break;
			case "fire" :
				if(M.water_tongue_level > 0) T.tongueType = "water";
				if(M.water_tongue_level == 0) T.tongueType = "normal";
				break;
			case "water" :
				T.tongueType = "normal";
				break;
		}
		T.recolor_tongue();
	}
	if(key == 97 && (M.dual_wield_level > 0)){ //A
		if(T.tongueSrc2[0] > T.MOUTH_LIMIT[0] && !(T.isTongue4Moving)){
			T.tongueSrc2[0] -= 1; // move it to the right by 1
			S.update_toad()
			//TODO visually update mouth2
		}
	}
	if(key == 100 && (M.dual_wield_level > 0)){ //D
		if(T.tongueSrc2[0] < T.MOUTH_LIMIT[1] && !(T.isTongue4Moving)){
			T.tongueSrc2[0] += 1; // move it to the right by 1
			S.update_toad()
			//TODO visually update mouth2
		}
	}
	if(key == 119 && (M.dual_wield_level) > 0){ //W
		if(!(T.isTongue4Moving)){
			T.reach_tongue(T.tongueSrc2[0], 0, 4);
		}
	}
	if((key==88) && (ctrl == true) && (shift == true)){
		M.toggle_cheater();
	}

};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
	if(key == 1008){
		G.downHeld = false;
	}
};

PS.swipe = function( data, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};


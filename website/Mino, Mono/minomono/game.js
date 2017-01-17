/**
 * mino / mono
 * Created by Henry Wheeler-Mackta and David Allen
 * April 2016
 *
 * Background music is "Promise (Reprise)" by Akira Yamaoka (2001)
 * All sound effects are taken from Konami's "Silent Hill 2" (2001)
 **/

var G = { //general game

    GRID_HEIGHT: 9,
    GRID_WIDTH: 9,

    COLOR_BG: PS.COLOR_BLACK,
    COLOR_MIDGRAY: 0x808080,
    COLOR_SHADOW: PS.COLOR_BLACK,
    COLOR_GRID: PS.COLOR_BLACK,

    clickable: true,

    currentPool: "zero",
    currentLevel: "",

    levelsComplete: 0,
    levelsComplete_0: [],
    levelsComplete_1: [],
    levelsComplete_2: [],
    levelsComplete_3: [],

    currentSpace: [0, 0],
    currentData: 1,
    currentTick: 0,
    currentBead: 0,
    timer: 0,
    darkTimer: 0,
    bTimer: 0,
    bTick: 1,
    difference: [],


    darkTime: false,

    isDragging: false,
    isBreathingRoom: true,
    isPlaying: true,

    paint_bead: function (x, y) {

        PS.borderColor(x, y, G.COLOR_BG);

        var color = ((255.00 / L.numSteps) * Math.abs((L.numSteps - PS.data(x, y)) + 1.00)); //This is gonna be how we do the colors
        PS.color(x, y, color, color, color);

    },

    borderify: function (x, y) {
        var borderleft = 10;
        var borderright = 10;
        var bordertop = 10;
        var borderbot = 10;


        // Color the border for first and last bead
        if ((PS.data(x, y) == 1) || (PS.data(x, y) == L.numSteps)) {
            if ((x != 0) && (PS.data(x - 1, y) != 0)) {
                borderleft = 0;
            }
            if ((x != 8) && (PS.data(x + 1, y) != 0)) {
                borderright = 0;
            }
            if ((y != 0) && (PS.data(x, y - 1) != 0)) {
                bordertop = 0;
            }
            if ((y != 8) && (PS.data(x, y + 1) != 0)) {
                borderbot = 0;
            }

            PS.borderColor(x, y, G.COLOR_BG);
        }

        PS.border(x, y, {
            top: bordertop,
            left: borderleft,
            bottom: borderbot,
            right: borderright
        })
    },

    repaint: function () {
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                PS.border(x, y, 0);
                if (PS.data(x, y) != 0) {
                    G.paint_bead(x, y);
                } else {
                    PS.color(x, y, G.COLOR_BG);
                }
            }
        }
    },

    calc_grays: function () {
        var halfSteps = Math.floor(L.numSteps / 2);
        var min = 127 - halfSteps;
        var startColor;
        for (var i = 0; i < L.level.length; i++) {
            if (L.level[i] == 0) {
                J.grays[i] = Math.floor((Math.random() * 5) + 125);  //Generate a gray value to work towards
                //J.direction[i] = J.UP;  //Assuming background is black, we're moving up towards the gray value
                startColor = 0;
            } else {
                J.grays[i] = Math.floor((Math.random() * 5) + 125);
                startColor = ((255.00 / L.numSteps) * Math.abs((L.numSteps - L.level[i]) + 1.00));
            }
            J.currentColor[i] = startColor;
            // PS.debug(startColor + "\n");
            if (J.currentColor[i] > 127) {
                J.rate[i] = -1 * Math.abs((J.grays[i] - startColor) / L.totalTicks);
                J.rategrays[i] = J.rate[i];
            } else if (J.currentColor[i] < 127) {
                J.rate[i] = (Math.abs((J.grays[i] - startColor) / L.totalTicks));
                J.rategrays[i] = J.rate[i];
            } else {
                J.rate[i] = 0;
                J.rategrays[i] = J.rate[i];
            }
            //PS.debug(J.currentColor[i] +"\tgray: " + J.grays[i] + "\trate: " + J.rate[i] + "\n");
        }
    },

    tick: function () { // brightener
        G.fade();

        if (G.currentTick == L.totalTicks) {
            //PS.debug("changing rate");
            for (var i = 0; i < J.rate.length; i++) {
                // PS.debug(J.currentColor[i] +"\tgray: " + J.grays[i] + "\trate: " + J.rate[i] + "\n");
                J.rate[i] = ((Math.random() * 2) / 10) + (J.PANIC_RATE - 0.1);

            }
            var bgcolors = [];
            PS.unmakeRGB(PS.gridColor(), bgcolors);

            J.rateBG = ( (90 - bgcolors[0]) / J.NUM_WAIT_TICKS );

            //PS.debug(J.rateBG);
            J.bgTick = G.currentTick;
            J.bgColor = bgcolors[0];
            //PS.debug(PS.gridColor());
            PS.audioPlay(A.spook, {volume: 0.25, path: A.SFX_PATH});
        }

        if (G.currentTick > L.totalTicks) {
            if (G.currentTick > J.bgTick) { //to prevent multiple calls during a single tick
                J.bgColor += J.rateBG;
                //if((rateBG < 0 && (bgColor < 127)) || (rateBG > 0 && (bgColor > 127))){
                //    bgColor = 127;
                //}
                PS.gridColor(J.bgColor, J.bgColor, J.bgColor);
                //PS.debug(G.currentTick + "\n");
                //PS.debug(J.bgColor + "\t" + J.rateBG + "\n");
                J.bgTick++;
            }

        }

        G.currentTick++;
        if (G.currentTick >= (L.totalTicks + J.NUM_WAIT_TICKS)) {
            if (!G.isDragging) {
                PS.timerStop(G.timer);
                G.darkTimer = PS.timerStart(30, G.resettimer);
                G.darkTime = true;
            }
        }
    },

    fade: function() {

        var pos, color, avgBg = 0, counter = 0;

        for (var x = 0; x < G.GRID_WIDTH; x++) {
            for (var y = 0; y < G.GRID_HEIGHT; y++) {
                if (PS.data(x, y) == 0) {
                    //PS.debug("yeah\n");
                    pos = x + (y * 9);
                    avgBg += J.currentColor[pos];
                    counter++;
                }
            }
        }
        //PS.debug(avgBg + "\n");
        avgBg = Math.floor(avgBg / counter);
        //PS.debug(avgBg + "\n");
        if (avgBg < 120 && (G.currentTick < L.totalTicks)) {
            J.bordercolor = avgBg;
        } else {
            J.bordercolor -= 1;
        }
        if (J.bordercolor < 0) {
            J.bordercolor = 0;
        }
        //PS.debug(G.currentTick + "\n");

        for (var x = 0; x < G.GRID_WIDTH; x++) {
            for (var y = 0; y < G.GRID_HEIGHT; y++) {
                pos = x + (y * 9);
                J.currentColor[pos] = J.currentColor[pos] + J.rate[pos];
                color = Math.floor(J.currentColor[pos]);

                PS.color(x, y, color, color, color);
                PS.borderColor(PS.ALL, PS.ALL, J.bordercolor, J.bordercolor, J.bordercolor);
                //}

            }
        }

    },

    resettimer: function () {
        PS.timerStop(G.darkTimer);
        G.fail();

    },

    reset: function () {
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                PS.data(x, y, 0);
                PS.color(x, y, PS.COLOR_BG);
            }
        }
    },

    consume_space: function (x, y) {
        if (G.isDragging) {
            if (PS.data(x, y) == G.currentData) {
                G.currentSpace[0] = x;
                G.currentSpace[1] = y;
                J.bead_shrinker(x, y);
                A.play_scale(x, y);
                G.currentData++;
                L.numSteps--;
                if (L.currentTutorial == 1) {
                    PS.gridPlane(2);
                    if (x < 8) {
                        PS.fade(x + 1, y, 40);
                        PS.alpha(x + 1, y, PS.ALPHA_TRANSPARENT);

                    }
                    PS.gridPlane(0);
                    if (!J.pulseTimerStopped && J.pulseTimerStarted) {
                        PS.radius(0, 4, 0);
                        PS.timerStop(J.pulseTimer);
                        J.pulseTimerStopped = true;
                    }
                }
            } else {
                if ((PS.data(x, y) > 0) && (PS.data(x, y) != G.currentData - 1)) {
                    if (G.isDragging) {
                        G.isDragging = false;
                        G.currentData = 1;
                        L.numSteps = L.origSteps;
                        if (G.darkTime) {
                            G.fail();
                        } else {
                            for (var y = 0; y < G.GRID_HEIGHT; y++) {
                                for (var x = 0; x < G.GRID_WIDTH; x++) {
                                    J.bead_grower(x, y);
                                }
                            }
                        }
                    }
                }
            }

            if (L.numSteps == 0) {
                G.win();
            }

        }

    },

    fail: function () {
        if(R.inOsu){
            J.radio_static();
        }else {
            PS.audioPlay(A.sfx_fail, {volume: 0.3, path: A.SFX_PATH});
            G.clickable = false;
            var level = G.currentLevel.charAt(G.currentLevel.length - 1);

            switch (G.currentPool) {
                case "zero":
                    break;
                case "one":
                    L.total_failed_1[level]++;
                    break;
                case "two":
                    L.total_failed_2[level]++;
                    break;
                case "three":
                    L.total_failed_3[level]++;
                    break;
                default:
                    break;
            }
            J.level_transition("fail");
        }
    },

    win: function () {
        G.clickable = false;
        if(R.inOsu){
            PS.audioPlay( A.sfx_win, {volume: 0.3, path : A.SFX_PATH});
            R.difficultyCounter++;
            if(R.difficultyCounter >= 3){
                if(R.PATH_LENGTH_MAX < 40){
                    R.PATH_LENGTH_MAX += 3;
                }
                R.difficultyCounter = 0;
            }
            R.load_osu();
        }else {
            if (G.currentLevel != "zero_1") {
                PS.timerStop(G.timer);
            }
            //PS.debug(G.currentLevel + "\n");
            if (G.currentLevel == "zero_1") {
                PS.audioPlay(A.sfx_win, {volume: 0.25, path: A.SFX_PATH, onEnd: A.start_bgm()});
            } else {
                PS.audioPlay(A.sfx_win, {volume: 0.25, path: A.SFX_PATH});
            }
            G.levelsComplete++;
            var pool, completes, nextpool;

            switch (G.currentPool) {
                case "zero":
                    G.levelsComplete_0.push(G.currentLevel);
                    completes = G.levelsComplete_0;
                    pool = L.POOL_O_COUNT;
                    nextpool = "one";
                    L.currentTutorial++;
                    break;
                case "one":
                    G.levelsComplete_1.push(G.currentLevel);
                    completes = G.levelsComplete_1;
                    pool = L.POOL_1_COUNT;
                    nextpool = "two";
                    break;
                case "two":
                    G.levelsComplete_2.push(G.currentLevel);
                    completes = G.levelsComplete_2;
                    pool = L.POOL_2_COUNT;
                    nextpool = "three";
                    break;
                case "three":
                    G.levelsComplete_3.push(G.currentLevel);
                    completes = G.levelsComplete_3;
                    pool = L.POOL_3_COUNT;
                    nextpool = "complete";
                    break;
            }

            if (completes.length >= pool) {
                G.currentPool = nextpool;
                // Modifications to grid/variables based on the pool
                switch (G.currentPool) {
                    case "one" :
                        G.COLOR_GRID = 100;
                        G.COLOR_SHADOW = PS.COLOR_BLACK;
                        L.breathingRoom = 50;
                        break;
                    case "two" :
                        G.COLOR_GRID = 50;
                        G.COLOR_SHADOW = 0xFFFFFF;
                        L.breathingRoom = 25;
                        break;
                    case "three":
                        G.COLOR_GRID = 0;
                        G.COLOR_SHADOW = 0xFFFFFF;
                        L.breathingRoom = 10;
                        break;
                    case "complete":
                        G.COLOR_GRID = 0;
                        break;
                }
                PS.gridColor(G.COLOR_GRID, G.COLOR_GRID, G.COLOR_GRID);
            }
            if (G.currentPool != "complete") {
                L.level_randomizer(G.currentPool);
            } else {
                G.victory();
            }
        }
    },

    victory: function () {
        PS.statusColor(PS.COLOR_WHITE);
        PS.color(PS.ALL, PS.ALL, J.bgColor, J.bgColor, J.bgColor);
        if(!R.inOsu){
            J.osu_transition();
        }
        //G.isPlaying = false;
    }
};

var L = { //levels

    POOL_O_COUNT: 5,
    POOL_1_COUNT: 20,
    POOL_2_COUNT: 20,
    POOL_3_COUNT: 25,

    TOTAL_LEVELS: 70,

    numSteps: 2,   	//Number of steps needed to complete the level
    origSteps: 2,  //Number of steps needed
    totalTicks: 60, //Number of ticks before the screen is a single colo
    tickRate: 6,	//How long between ticks

    currentTutorial: 1,
    breathingRoom: 0, //How long before the fader starts
    difficulty: 0,

    level: [],

    total_tick_1: 50,
    total_tick_2: 55,
    total_tick_3: 60,

    total_failed_1: [],
    total_failed_2: [],
    total_failed_3: [],

    zero_1: function () {
        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                1, 2, 3, 4, 5, 6, 7, 8, 9,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];


        L.numSteps = 9;
        L.totalTicks = 100;
        L.tickRate = 6;
        L.difficulty = 1;
        G.clickable = false;
        J.tutorial_shimmer();
    },
    zero_2: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 5, 4, 3, 2, 1,
                0, 0, 0, 0, 6, 0, 0, 0, 0,
                0, 0, 0, 0, 7, 0, 0, 0, 0,
                0, 0, 0, 0, 8, 0, 0, 0, 0,
                0, 0, 0, 0, 9, 0, 0, 0, 0];

        L.numSteps = 9;
        L.totalTicks = 100;
        L.tickRate = 6;
        L.difficulty = 1;
        PS.gridPlane(2);
        PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_TRANSPARENT);
        PS.fade(PS.ALL, PS.ALL, 0);
        PS.gridPlane(0);
        G.COLOR_GRID = 150;
        if (J.shimmerStarted) {
            J.shimmerStarted = false;
            PS.timerStop(J.startTimer);
        }


    },
    zero_3: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 9, 0, 0, 0, 0,
                0, 0, 0, 0, 8, 7, 0, 0, 0,
                0, 0, 0, 4, 5, 6, 0, 0, 0,
                0, 0, 0, 3, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 1, 0, 0, 0, 0];

        L.numSteps = 9;
        L.totalTicks = 200;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    zero_4: function () {

        L.level =
            [33, 34, 35, 36, 5, 6, 7, 8, 9,
                32, 0, 0, 0, 4, 0, 0, 0, 10,
                31, 0, 0, 0, 3, 0, 0, 0, 11,
                30, 0, 0, 0, 2, 0, 0, 0, 12,
                29, 0, 0, 0, 1, 0, 0, 0, 13,
                28, 0, 0, 0, 0, 0, 0, 0, 14,
                27, 0, 0, 0, 0, 0, 0, 0, 15,
                26, 0, 0, 0, 0, 0, 0, 0, 16,
                25, 24, 23, 22, 21, 20, 19, 18, 17];

        L.numSteps = 36;
        L.totalTicks = 75;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    zero_5: function () {

        L.level =
            [0, 0, 0, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 2, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 6, 7, 0, 0, 0,
                0, 0, 0, 4, 5, 8, 0, 0, 0,
                0, 0, 0, 0, 0, 9, 0, 0, 0,
                0, 0, 13, 12, 11, 10, 0, 0, 0,
                0, 0, 14, 0, 0, 0, 0, 0, 0,
                0, 0, 15, 16, 17, 18, 0, 0, 0,
                0, 0, 0, 0, 0, 19, 0, 0, 0];

        L.numSteps = 19;
        L.tickRate = 6;
        L.difficulty = 1;

    },

    one_1: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 9, 10, 11, 12, 13, 0, 0,
                0, 0, 8, 7, 6, 0, 0, 0, 0,
                1, 2, 3, 4, 5, 0, 0, 0, 0];

        L.numSteps = 13;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_2: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 10, 11, 0, 0, 0,
                0, 0, 0, 8, 9, 12, 13, 0, 0,
                0, 0, 6, 7, 0, 0, 14, 15, 0,
                0, 4, 5, 0, 0, 0, 0, 16, 17,
                2, 3, 0, 0, 0, 0, 0, 19, 18,
                1, 26, 25, 24, 23, 22, 21, 20, 0];

        L.numSteps = 26;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_3: function () {

        L.level =
            [0, 10, 0, 0, 0, 0, 0, 0, 0,
                0, 9, 0, 0, 0, 0, 0, 0, 0,
                0, 8, 0, 0, 0, 0, 0, 0, 0,
                0, 7, 0, 0, 0, 0, 0, 0, 0,
                0, 6, 0, 0, 0, 0, 0, 0, 0,
                0, 5, 0, 0, 0, 0, 0, 0, 0,
                0, 4, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 0, 0, 0, 0, 0, 0, 0,
                1, 2, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 10;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_4: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 14, 0,
                0, 0, 0, 0, 0, 11, 12, 13, 0,
                0, 0, 0, 0, 0, 10, 0, 0, 0,
                0, 0, 0, 0, 0, 9, 8, 7, 0,
                0, 0, 0, 0, 0, 0, 0, 6, 0,
                0, 0, 0, 0, 0, 0, 0, 5, 0,
                0, 0, 0, 0, 0, 0, 0, 4, 0,
                0, 0, 0, 0, 0, 0, 0, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 2, 1];

        L.numSteps = 14;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_5: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 4, 0, 0, 0, 0, 0,
                0, 0, 2, 3, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 4;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_6: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 9, 8, 7, 0, 0, 0, 0,
                0, 0, 10, 0, 6, 0, 0, 0, 0,
                0, 0, 11, 0, 5, 4, 3, 2, 1,
                0, 0, 12, 0, 0, 0, 0, 0, 0,
                15, 14, 13, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_7: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 6, 5, 4, 0, 0, 0, 0,
                0, 0, 7, 12, 3, 0, 0, 0, 0,
                0, 0, 8, 11, 2, 0, 0, 0, 0,
                0, 0, 9, 10, 1, 0, 0, 0, 0];

        L.numSteps = 12;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_8: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 4, 5, 0, 0, 0, 0, 0,
                1, 2, 3, 6, 0, 0, 0, 0, 0,
                0, 0, 0, 7, 8, 9, 0, 0, 0,
                0, 0, 0, 0, 0, 10, 11, 12, 13,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 13;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_9: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 11, 12, 13, 14, 15, 16, 0,
                0, 0, 10, 0, 0, 0, 0, 17, 0,
                0, 0, 9, 0, 23, 0, 0, 18, 0,
                0, 0, 8, 0, 22, 21, 20, 19, 0,
                0, 0, 7, 0, 0, 0, 0, 0, 0,
                0, 0, 6, 5, 4, 3, 2, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 23;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_10: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 19, 18, 17, 16, 0, 0, 1, 0,
                0, 20, 0, 0, 15, 0, 0, 2, 0,
                0, 21, 0, 0, 14, 0, 0, 3, 0,
                0, 22, 0, 0, 13, 0, 0, 4, 0,
                0, 23, 0, 0, 12, 0, 0, 5, 0,
                0, 24, 0, 0, 11, 0, 0, 6, 0,
                0, 25, 0, 0, 10, 9, 8, 7, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_11: function () {

        L.level =
            [0, 0, 13, 12, 11, 10, 0, 0, 0,
                0, 0, 14, 0, 0, 9, 0, 0, 0,
                0, 0, 15, 0, 0, 8, 0, 0, 0,
                0, 0, 16, 1, 0, 7, 0, 0, 0,
                0, 0, 0, 2, 0, 6, 0, 0, 0,
                0, 0, 0, 3, 4, 5, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 16;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_12: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 0, 7, 8, 9, 0, 15, 0,
                0, 2, 0, 6, 0, 10, 0, 14, 0,
                0, 3, 4, 5, 0, 11, 12, 13, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_13: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 13, 12, 11, 0, 5, 4, 3, 0,
                0, 14, 0, 10, 0, 6, 0, 2, 0,
                0, 15, 0, 9, 8, 7, 0, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_14: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 17, 16, 0, 0, 0, 0, 0, 0,
                0, 0, 15, 14, 13, 0, 0, 0, 0,
                0, 0, 0, 0, 12, 11, 10, 0, 0,
                0, 0, 0, 0, 0, 0, 9, 0, 0,
                0, 0, 0, 0, 6, 7, 8, 0, 0,
                0, 0, 3, 4, 5, 0, 0, 0, 0,
                0, 1, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 17;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_15: function () {

        L.level =
            [20, 19, 18, 17, 16, 15, 14, 13, 12,
                21, 0, 0, 0, 0, 0, 0, 0, 11,
                22, 0, 0, 0, 0, 0, 0, 0, 10,
                23, 0, 0, 0, 0, 0, 0, 0, 9,
                24, 0, 0, 0, 36, 0, 0, 0, 8,
                25, 0, 0, 0, 35, 0, 0, 0, 7,
                26, 0, 0, 0, 34, 0, 0, 0, 6,
                27, 0, 0, 0, 33, 0, 0, 0, 5,
                28, 29, 30, 31, 32, 1, 2, 3, 4];

        L.numSteps = 36;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_16: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 2, 3, 4, 0, 0, 0,
                0, 0, 0, 0, 0, 5, 0, 0, 0,
                19, 18, 17, 0, 0, 6, 0, 0, 0,
                0, 0, 16, 0, 0, 7, 8, 0, 0,
                0, 0, 15, 14, 13, 0, 9, 0, 0,
                0, 0, 0, 0, 12, 11, 10, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 19;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_17: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 0, 0, 21, 0,
                0, 0, 0, 2, 3, 4, 0, 20, 19,
                0, 0, 0, 0, 0, 5, 0, 0, 18,
                0, 0, 0, 8, 7, 6, 0, 16, 17,
                0, 0, 0, 9, 0, 0, 0, 15, 0,
                0, 0, 0, 10, 11, 12, 13, 14, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_18: function () {

        L.level =
            [0, 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 3, 0, 0, 0, 0, 0, 0,
                0, 0, 4, 5, 6, 7, 8, 0, 0,
                0, 0, 0, 0, 0, 0, 9, 0, 0,
                0, 0, 0, 0, 0, 0, 10, 0, 0,
                0, 0, 0, 0, 15, 0, 11, 0, 0,
                0, 0, 0, 0, 14, 13, 12, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_19: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 3, 4, 5, 6, 7, 0, 0,
                0, 0, 0, 0, 0, 0, 8, 0, 0,
                0, 0, 0, 0, 0, 0, 9, 10, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 10;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_20: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 4, 0,
                0, 0, 0, 0, 0, 0, 0, 5, 0,
                0, 0, 0, 0, 0, 0, 0, 6, 0,
                0, 0, 0, 0, 0, 0, 0, 7, 0,
                0, 0, 0, 0, 0, 0, 0, 8, 0,
                0, 0, 0, 0, 0, 0, 0, 9, 10];

        L.numSteps = 10;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_21: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 3, 4, 5, 6, 7, 0, 0,
                0, 0, 0, 0, 0, 0, 8, 0, 0,
                0, 0, 0, 0, 11, 10, 9, 0, 0,
                0, 0, 0, 0, 12, 0, 0, 0, 0,
                0, 0, 0, 0, 13, 14, 0, 0, 0];

        L.numSteps = 14;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_22: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 18, 17, 16, 15, 14, 13, 0, 0,
                0, 19, 0, 0, 0, 0, 12, 0, 0,
                0, 20, 0, 2, 1, 0, 11, 0, 0,
                0, 21, 0, 3, 0, 0, 10, 0, 0,
                0, 22, 0, 4, 0, 0, 9, 0, 0,
                0, 23, 0, 5, 6, 7, 8, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 22;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_23: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 19, 18, 17,
                0, 0, 0, 0, 0, 0, 0, 0, 16,
                0, 0, 0, 0, 0, 0, 0, 0, 15,
                0, 0, 0, 0, 0, 0, 0, 0, 14,
                0, 0, 0, 0, 0, 0, 0, 0, 13,
                0, 0, 0, 0, 0, 0, 0, 0, 12,
                0, 0, 0, 0, 0, 0, 0, 0, 11,
                0, 0, 0, 0, 0, 0, 0, 0, 10,
                1, 2, 3, 4, 5, 6, 7, 8, 9];

        L.numSteps = 19;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_24: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 19, 18, 17, 0, 0,
                0, 0, 2, 0, 20, 0, 16, 0, 0,
                0, 0, 3, 0, 21, 0, 15, 0, 0,
                0, 0, 4, 0, 22, 0, 14, 0, 0,
                0, 0, 5, 0, 23, 0, 13, 0, 0,
                0, 0, 6, 0, 0, 0, 12, 0, 0,
                0, 0, 7, 8, 9, 10, 11, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 23;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_25: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 11, 12, 13, 0, 0,
                0, 0, 2, 0, 10, 0, 14, 0, 0,
                0, 0, 3, 0, 9, 0, 15, 0, 0,
                0, 0, 4, 0, 8, 0, 16, 0, 0,
                0, 0, 5, 6, 7, 0, 17, 0, 0,
                0, 0, 0, 0, 0, 0, 18, 0, 0,
                0, 0, 0, 0, 0, 0, 19, 20, 21];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_26: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 0, 0, 0, 0, 0, 0, 0,
                0, 2, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 4, 5, 6, 7, 8, 9, 0,
                0, 0, 0, 0, 0, 0, 0, 10, 0,
                0, 25, 0, 19, 18, 17, 0, 11, 0,
                0, 24, 0, 20, 0, 16, 0, 12, 0,
                0, 23, 22, 21, 0, 15, 14, 13, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_27: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 7, 8, 9, 10, 11, 12, 13, 0,
                0, 6, 0, 0, 0, 0, 0, 14, 0,
                0, 5, 0, 29, 28, 27, 0, 15, 0,
                0, 4, 0, 30, 0, 26, 0, 16, 0,
                0, 3, 0, 0, 24, 25, 0, 17, 0,
                0, 2, 0, 0, 23, 0, 0, 18, 0,
                0, 1, 0, 0, 22, 21, 20, 19, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 30;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_28: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 23, 0, 1, 0, 7, 8, 9, 0,
                0, 22, 0, 2, 0, 6, 0, 10, 0,
                0, 21, 0, 3, 4, 5, 0, 11, 0,
                0, 20, 0, 0, 0, 0, 0, 12, 0,
                0, 19, 18, 17, 16, 15, 14, 13, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 23;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_29: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 3, 0, 0, 0, 0, 0,
                0, 0, 0, 4, 5, 0, 0, 0, 0,
                0, 0, 0, 0, 6, 7, 0, 0, 0,
                0, 0, 0, 0, 0, 8, 9, 0, 0,
                0, 0, 0, 0, 0, 0, 10, 0, 0,
                0, 0, 15, 14, 13, 12, 11, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    one_30: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 3, 0, 0, 0, 0, 0, 0,
                0, 5, 4, 0, 0, 0, 16, 15, 0,
                0, 6, 0, 0, 0, 0, 0, 14, 0,
                0, 7, 8, 9, 10, 11, 12, 13, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 16;
        L.tickRate = 6;
        L.difficulty = 1;

    },

    two_1: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 10, 11,
                0, 0, 0, 5, 6, 7, 8, 9, 0,
                0, 0, 0, 4, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 0, 0, 0, 0, 0,
                0, 0, 0, 2, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 0, 0, 0, 0];

        L.numSteps = 11;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_2: function () {

        L.level =
            [0, 0, 0, 2, 1, 24, 23, 22, 21,
                0, 0, 0, 3, 4, 5, 18, 19, 20,
                0, 0, 0, 8, 7, 6, 17, 16, 15,
                0, 0, 0, 9, 10, 11, 12, 13, 14,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_3: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                26, 25, 24, 23, 22, 21, 20, 19, 0,
                27, 0, 9, 10, 11, 12, 13, 18, 0,
                28, 0, 8, 5, 4, 3, 14, 17, 0,
                29, 0, 7, 6, 1, 2, 15, 16, 0];

        L.numSteps = 29;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_4: function () {

        L.level =
            [29, 28, 27, 26, 25, 24, 23, 22, 1,
                0, 0, 0, 0, 0, 0, 0, 21, 2,
                13, 14, 15, 16, 17, 18, 19, 20, 3,
                12, 11, 10, 9, 8, 7, 6, 5, 4,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 29;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_5: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                19, 20, 21, 22, 23, 0, 0, 0, 0,
                18, 17, 16, 15, 14, 13, 12, 11, 10,
                1, 2, 3, 4, 5, 6, 7, 8, 9,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 23;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_6: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 13, 0,
                0, 0, 0, 0, 0, 0, 11, 12, 0,
                0, 0, 0, 0, 0, 9, 10, 0, 0,
                0, 0, 0, 0, 7, 8, 0, 0, 0,
                0, 0, 0, 5, 6, 0, 0, 0, 0,
                0, 0, 3, 4, 0, 0, 0, 0, 0,
                0, 1, 2, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 13;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_7: function () {

        L.level =
            [1, 2, 3, 0, 0, 0, 0, 0, 0,
                6, 5, 4, 0, 0, 0, 0, 0, 0,
                7, 8, 9, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 9;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_8: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 5, 4, 0, 0, 0, 0,
                0, 0, 0, 6, 3, 0, 0, 0, 0,
                0, 0, 0, 7, 2, 0, 0, 0, 0,
                0, 0, 0, 8, 1, 0, 0, 0, 0,
                0, 0, 0, 9, 14, 0, 0, 0, 0,
                0, 0, 0, 10, 13, 0, 0, 0, 0,
                0, 0, 0, 11, 12, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 14;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_9: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 25,
                0, 0, 0, 0, 0, 0, 0, 0, 24,
                0, 0, 0, 0, 0, 0, 0, 0, 23,
                0, 0, 0, 0, 0, 0, 0, 0, 22,
                0, 0, 0, 0, 0, 0, 0, 0, 21,
                0, 0, 0, 0, 0, 0, 0, 0, 20,
                0, 0, 0, 0, 0, 0, 0, 0, 19,
                10, 11, 12, 13, 14, 15, 16, 17, 18,
                9, 8, 7, 6, 5, 4, 3, 2, 1];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_10: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 6, 5, 4, 0, 0, 0,
                0, 0, 0, 7, 2, 3, 0, 0, 0,
                0, 0, 0, 8, 1, 12, 0, 0, 0,
                0, 0, 0, 9, 10, 11, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 12;
        L.tickRate = 6;
        L.difficulty = 1;

    },
    two_11: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 14, 15, 16, 0,
                0, 5, 4, 3, 0, 13, 20, 17, 0,
                0, 6, 1, 2, 0, 12, 19, 18, 0,
                0, 7, 8, 9, 10, 11, 0, 0, 0];

        L.numSteps = 20;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_12: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 2, 5, 6, 0, 0, 0,
                0, 0, 0, 3, 4, 7, 0, 0, 0,
                0, 0, 0, 0, 9, 8, 0, 0, 0,
                0, 0, 0, 0, 10, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 10;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_13: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 3, 4, 5, 6, 7, 0,
                0, 0, 0, 0, 11, 10, 9, 8, 0,
                0, 0, 0, 0, 12, 13, 14, 15, 0,
                0, 22, 21, 20, 19, 18, 17, 16, 0,
                0, 23, 0, 0, 0, 0, 0, 0, 0,
                0, 24, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_14: function () {

        L.level =
            [0, 0, 0, 0, 9, 10, 11, 0, 0,
                0, 0, 0, 7, 8, 1, 12, 0, 0,
                0, 0, 0, 6, 0, 2, 13, 0, 0,
                0, 0, 0, 5, 4, 3, 14, 0, 0,
                0, 0, 0, 0, 0, 0, 15, 0, 0,
                0, 0, 0, 0, 0, 0, 16, 0, 0,
                0, 0, 0, 0, 0, 0, 17, 0, 0,
                0, 0, 0, 0, 0, 0, 18, 0, 0,
                0, 0, 0, 0, 0, 0, 19, 0, 0];

        L.numSteps = 19;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_15: function () {

        L.level =
            [1, 2, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 4, 0, 0, 0, 0, 0, 0,
                0, 0, 5, 0, 0, 0, 0, 0, 0,
                0, 0, 6, 0, 0, 0, 0, 0, 0,
                0, 0, 7, 0, 0, 0, 0, 0, 0,
                0, 0, 8, 0, 0, 0, 0, 0, 0,
                0, 10, 9, 0, 0, 0, 0, 0, 0,
                12, 11, 0, 0, 0, 0, 0, 0, 0,
                13, 14, 15, 16, 17, 0, 0, 0, 0];

        L.numSteps = 17;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_16: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 2, 3, 4, 0, 0, 0,
                0, 0, 0, 0, 0, 5, 0, 0, 0,
                0, 0, 0, 8, 7, 6, 0, 0, 0,
                0, 0, 0, 9, 0, 0, 0, 0, 0,
                0, 0, 0, 10, 15, 14, 0, 0, 0,
                0, 0, 0, 11, 12, 13, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_17: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 8, 9, 0, 0, 0,
                0, 0, 0, 0, 7, 10, 11, 0, 0,
                0, 0, 0, 0, 6, 13, 12, 0, 0,
                0, 0, 0, 0, 5, 14, 15, 0, 0,
                0, 0, 0, 0, 4, 17, 16, 0, 0,
                0, 0, 0, 0, 3, 18, 0, 0, 0,
                0, 0, 0, 0, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 1, 0, 0, 0, 0];

        L.numSteps = 18;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_18: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 15, 16, 17, 18, 19, 0, 0,
                0, 0, 14, 1, 2, 0, 20, 0, 0,
                0, 0, 13, 0, 3, 4, 21, 0, 0,
                0, 0, 12, 0, 0, 5, 22, 0, 0,
                0, 0, 11, 0, 7, 6, 0, 0, 0,
                0, 0, 10, 9, 8, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 22;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_19: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 0, 0, 0, 0, 0, 0, 0,
                0, 2, 3, 0, 0, 0, 0, 0, 0,
                0, 5, 4, 0, 0, 0, 0, 0, 0,
                0, 6, 7, 10, 0, 0, 0, 0, 0,
                0, 0, 8, 9, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 10;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_20: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 5, 4, 3, 0, 0, 0, 0,
                0, 7, 6, 1, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 7;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_21: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 9, 10, 0, 0, 0, 0,
                0, 4, 3, 8, 11, 0, 0, 0, 0,
                0, 5, 6, 7, 12, 0, 0, 0, 0,
                0, 16, 15, 14, 13, 0, 0, 0, 0,
                0, 17, 0, 0, 0, 0, 0, 0, 0,
                0, 18, 0, 0, 0, 0, 0, 0, 0,
                0, 19, 20, 21, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_22: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 20, 21, 0, 0, 0,
                0, 0, 0, 2, 19, 18, 0, 0, 0,
                0, 0, 0, 3, 16, 17, 0, 0, 0,
                0, 0, 0, 4, 15, 14, 0, 0, 0,
                0, 0, 0, 5, 12, 13, 0, 0, 0,
                0, 0, 0, 6, 11, 10, 0, 0, 0,
                0, 0, 0, 7, 8, 9, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_23: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 0, 0, 0, 20, 21, 0,
                0, 4, 3, 0, 0, 0, 19, 18, 0,
                0, 5, 6, 0, 0, 0, 16, 17, 0,
                0, 0, 7, 0, 0, 0, 15, 0, 0,
                0, 0, 8, 0, 0, 0, 14, 0, 0,
                0, 0, 9, 10, 11, 12, 13, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_24: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 25, 10, 11, 12, 13, 0, 0,
                0, 0, 24, 9, 2, 3, 14, 0, 0,
                0, 0, 23, 8, 1, 4, 15, 0, 0,
                0, 0, 22, 7, 6, 5, 16, 0, 0,
                0, 0, 21, 20, 19, 18, 17, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_25: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 1, 16, 15, 14, 13, 0, 0,
                0, 0, 2, 17, 24, 23, 12, 0, 0,
                0, 0, 3, 18, 25, 22, 11, 0, 0,
                0, 0, 4, 19, 20, 21, 10, 0, 0,
                0, 0, 5, 6, 7, 8, 9, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_26: function () {

        L.level =
            [1, 46, 0, 0, 0, 0, 0, 26, 25,
                2, 45, 0, 0, 0, 0, 0, 27, 24,
                3, 44, 0, 0, 0, 0, 0, 28, 23,
                4, 43, 0, 0, 0, 0, 0, 29, 22,
                5, 42, 0, 0, 0, 0, 0, 30, 21,
                6, 41, 0, 0, 0, 0, 0, 31, 20,
                7, 40, 0, 0, 0, 0, 0, 32, 19,
                8, 39, 38, 37, 36, 35, 34, 33, 18,
                9, 10, 11, 12, 13, 14, 15, 16, 17];

        L.numSteps = 46;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_27: function () {

        L.level =
            [0, 0, 0, 0, 15, 0, 0, 0, 0,
                0, 0, 0, 0, 14, 0, 0, 0, 0,
                0, 0, 0, 0, 13, 0, 0, 0, 0,
                0, 9, 10, 11, 12, 0, 0, 0, 0,
                0, 8, 7, 6, 5, 0, 0, 0, 0,
                0, 0, 0, 0, 4, 0, 0, 0, 0,
                0, 0, 0, 0, 3, 0, 0, 0, 0,
                0, 0, 0, 0, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 1, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_28: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 19, 18, 1,
                0, 0, 0, 0, 0, 0, 20, 17, 2,
                0, 0, 0, 28, 0, 0, 21, 16, 3,
                0, 0, 0, 27, 0, 0, 22, 15, 4,
                0, 0, 0, 26, 25, 24, 23, 14, 5,
                0, 0, 0, 0, 0, 0, 0, 13, 6,
                0, 0, 0, 0, 0, 0, 0, 12, 7,
                0, 0, 0, 0, 0, 0, 0, 11, 8,
                0, 0, 0, 0, 0, 0, 0, 10, 9];

        L.numSteps = 28;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_29: function () {

        L.level =
            [25, 24, 0, 0, 0, 0, 0, 0, 1,
                26, 23, 0, 0, 0, 0, 0, 0, 2,
                27, 22, 0, 0, 0, 0, 0, 0, 3,
                28, 21, 0, 0, 0, 0, 0, 0, 4,
                29, 20, 19, 18, 17, 16, 15, 14, 5,
                30, 0, 0, 0, 0, 0, 0, 13, 6,
                31, 0, 0, 0, 0, 0, 0, 12, 7,
                32, 0, 0, 0, 0, 0, 0, 11, 8,
                33, 0, 0, 0, 0, 0, 0, 10, 9];

        L.numSteps = 33;
        L.tickRate = 6;
        L.difficulty = 2;

    },
    two_30: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 1, 6, 7, 12, 13,
                0, 0, 0, 0, 2, 5, 8, 11, 14,
                0, 0, 0, 0, 3, 4, 9, 10, 15,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 15;
        L.tickRate = 6;
        L.difficulty = 2;

    },

    three_1: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 22, 21, 20, 19, 18, 17, 16, 15,
                0, 23, 8, 9, 10, 11, 12, 13, 14,
                0, 24, 7, 6, 5, 4, 3, 2, 1,
                0, 25, 26, 27, 28, 29, 30, 31, 32,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 32;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_2: function () {

        L.level =
            [0, 0, 15, 16, 17, 18, 19, 0, 0,
                0, 0, 14, 0, 0, 0, 20, 0, 0,
                0, 0, 13, 12, 11, 0, 21, 0, 0,
                0, 0, 0, 0, 10, 0, 22, 0, 0,
                0, 0, 0, 0, 9, 0, 23, 0, 0,
                0, 0, 6, 7, 8, 0, 24, 0, 0,
                0, 0, 5, 0, 0, 0, 25, 0, 0,
                0, 0, 4, 3, 2, 0, 26, 0, 0,
                0, 0, 0, 0, 1, 0, 27, 0, 0];

        L.numSteps = 27;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_3: function () {

        L.level =
            [1, 0, 0, 0, 0, 0, 0, 0, 0,
                2, 3, 4, 5, 6, 7, 8, 9, 0,
                0, 0, 0, 0, 0, 0, 0, 10, 0,
                28, 27, 26, 25, 0, 13, 12, 11, 0,
                29, 0, 0, 24, 0, 14, 0, 0, 0,
                30, 31, 0, 23, 0, 15, 0, 0, 0,
                0, 32, 0, 22, 0, 16, 0, 0, 0,
                0, 33, 0, 21, 0, 17, 0, 0, 0,
                0, 34, 0, 20, 19, 18, 0, 0, 0];

        L.numSteps = 34;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_4: function () {

        L.level =
            [0, 0, 0, 24, 0, 0, 0, 0, 0,
                0, 0, 0, 23, 0, 0, 0, 0, 0,
                0, 0, 0, 22, 0, 0, 0, 0, 0,
                18, 19, 20, 21, 0, 0, 0, 0, 0,
                17, 0, 0, 0, 0, 4, 3, 2, 1,
                16, 15, 14, 13, 0, 5, 0, 0, 0,
                0, 0, 0, 12, 0, 6, 0, 0, 0,
                0, 0, 0, 11, 0, 7, 0, 0, 0,
                0, 0, 0, 10, 9, 8, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_5: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 8, 7, 0,
                0, 0, 0, 0, 0, 0, 9, 6, 0,
                0, 0, 0, 0, 14, 13, 10, 5, 0,
                0, 0, 0, 0, 15, 12, 11, 4, 0,
                0, 0, 0, 0, 16, 17, 18, 3, 0,
                0, 0, 0, 0, 0, 0, 19, 2, 0,
                0, 0, 0, 0, 0, 0, 20, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 20;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_6: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 43,
                0, 0, 0, 0, 16, 15, 14, 13, 42,
                0, 0, 0, 0, 17, 0, 0, 12, 41,
                0, 0, 0, 0, 18, 0, 0, 11, 40,
                23, 22, 21, 20, 19, 0, 0, 10, 39,
                24, 0, 0, 0, 0, 0, 0, 9, 38,
                25, 0, 0, 0, 0, 0, 0, 8, 37,
                26, 1, 2, 3, 4, 5, 6, 7, 36,
                27, 28, 29, 30, 31, 32, 33, 34, 35];

        L.numSteps = 43;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_7: function () {

        L.level =
            [0, 0, 29, 28, 27, 26, 0, 0, 0,
                0, 0, 0, 0, 0, 25, 0, 0, 0,
                0, 0, 13, 14, 15, 24, 1, 0, 0,
                0, 0, 12, 17, 16, 23, 2, 0, 0,
                0, 0, 11, 18, 0, 22, 3, 0, 0,
                0, 0, 10, 19, 20, 21, 4, 0, 0,
                0, 0, 9, 8, 7, 6, 5, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 29;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_8: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 19, 18, 0, 14, 13, 12, 0, 0,
                0, 20, 17, 16, 15, 0, 11, 0, 0,
                0, 21, 0, 0, 0, 0, 10, 0, 0,
                0, 22, 0, 0, 0, 0, 9, 0, 0,
                0, 23, 0, 0, 0, 0, 8, 0, 0,
                0, 2, 3, 4, 5, 6, 7, 0, 0,
                0, 1, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 23;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_9: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 2, 3, 4, 5, 6, 7, 8,
                0, 0, 0, 0, 0, 0, 0, 0, 9,
                0, 0, 16, 15, 14, 13, 12, 11, 10,
                0, 0, 17, 0, 0, 0, 0, 0, 0,
                0, 0, 18, 19, 20, 0, 0, 0, 0,
                0, 0, 0, 24, 21, 0, 0, 0, 0,
                0, 0, 0, 23, 22, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_10: function () {

        L.level =
            [1, 2, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 4, 0, 0, 0, 0, 0, 0,
                0, 0, 5, 6, 0, 0, 0, 0, 0,
                0, 0, 0, 7, 8, 0, 0, 0, 0,
                0, 0, 0, 0, 9, 10, 0, 0, 0,
                0, 21, 20, 19, 18, 11, 0, 0, 0,
                0, 22, 0, 0, 17, 12, 0, 0, 0,
                0, 23, 0, 0, 16, 13, 0, 0, 0,
                0, 24, 25, 0, 15, 14, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_11: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 13, 12, 11, 0, 0,
                0, 0, 0, 15, 14, 1, 10, 0, 0,
                0, 0, 0, 16, 17, 2, 9, 0, 0,
                0, 0, 0, 0, 4, 3, 8, 0, 0,
                0, 0, 0, 0, 5, 6, 7, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 17;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_12: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 10, 11, 12, 13, 0,
                0, 0, 0, 0, 9, 8, 7, 14, 0,
                0, 0, 0, 0, 0, 0, 6, 15, 0,
                0, 0, 1, 2, 3, 4, 5, 16, 0,
                24, 23, 22, 21, 20, 19, 18, 17, 0,
                25, 26, 27, 28, 29, 30, 31, 0, 0];

        L.numSteps = 31;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_13: function () {

        L.level =
            [1, 2, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 4, 0, 0, 0, 0, 0, 0,
                0, 6, 5, 0, 0, 0, 0, 0, 0,
                0, 7, 8, 9, 0, 0, 0, 0, 0,
                0, 0, 0, 10, 0, 0, 0, 0, 0,
                0, 0, 12, 11, 16, 17, 0, 0, 0,
                0, 0, 13, 14, 15, 18, 0, 0, 0,
                0, 0, 0, 0, 20, 19, 0, 0, 0,
                0, 0, 0, 0, 21, 22, 0, 0, 0];

        L.numSteps = 22;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_14: function () {

        L.level =
            [0, 0, 0, 1, 0, 0, 0, 0, 0,
                0, 8, 7, 2, 3, 0, 0, 0, 0,
                0, 9, 6, 5, 4, 0, 0, 0, 0,
                0, 10, 11, 0, 0, 0, 0, 0, 0,
                0, 0, 12, 15, 16, 0, 0, 0, 0,
                0, 0, 13, 14, 17, 0, 0, 0, 0,
                0, 0, 22, 21, 18, 0, 0, 0, 0,
                0, 0, 23, 20, 19, 0, 0, 0, 0,
                0, 0, 24, 0, 0, 0, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_15: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 22, 0, 0, 0, 0,
                0, 0, 0, 0, 21, 20, 19, 0, 0,
                0, 0, 8, 7, 6, 5, 18, 0, 0,
                0, 0, 9, 0, 0, 4, 17, 0, 0,
                0, 0, 10, 1, 2, 3, 16, 0, 0,
                0, 0, 11, 12, 13, 14, 15, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 22;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_16: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 1, 0, 0, 0, 0, 0,
                0, 0, 0, 2, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 4, 5, 0, 0, 0,
                0, 0, 0, 10, 9, 6, 0, 0, 0,
                0, 0, 0, 11, 8, 7, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 11;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_17: function () {

        L.level =
            [1, 2, 9, 10, 25, 26, 0, 0, 0,
                4, 3, 8, 11, 24, 0, 0, 0, 0,
                5, 6, 7, 12, 23, 0, 0, 0, 0,
                16, 15, 14, 13, 22, 0, 0, 0, 0,
                17, 18, 19, 20, 21, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 26;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_18: function () {

        L.level =
            [0, 0, 0, 0, 1, 0, 0, 0, 0,
                0, 0, 0, 0, 2, 0, 0, 0, 0,
                0, 0, 0, 0, 3, 0, 0, 0, 0,
                0, 0, 0, 0, 4, 0, 0, 0, 0,
                0, 0, 0, 0, 5, 0, 0, 0, 0,
                0, 0, 0, 0, 6, 0, 0, 0, 0,
                0, 0, 0, 0, 7, 0, 0, 0, 0,
                16, 15, 12, 11, 8, 0, 0, 0, 0,
                17, 14, 13, 10, 9, 0, 0, 0, 0];

        L.numSteps = 17;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_19: function () {

        L.level =
            [0, 0, 0, 0, 24, 0, 0, 0, 0,
                0, 0, 0, 0, 23, 0, 0, 0, 0,
                0, 0, 0, 21, 22, 0, 0, 0, 0,
                0, 0, 19, 20, 7, 8, 9, 0, 0,
                0, 0, 18, 1, 6, 5, 10, 0, 0,
                0, 0, 17, 2, 3, 4, 11, 0, 0,
                0, 0, 16, 15, 14, 13, 12, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 24;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_20: function () {

        L.level =
            [0, 0, 0, 0, 5, 6, 7, 8, 9,
                0, 0, 0, 0, 4, 37, 36, 35, 10,
                0, 0, 0, 0, 3, 38, 41, 34, 11,
                0, 0, 0, 0, 2, 39, 40, 33, 12,
                0, 0, 0, 0, 1, 24, 25, 32, 13,
                0, 0, 0, 0, 0, 23, 26, 31, 14,
                0, 0, 0, 0, 0, 22, 27, 30, 15,
                0, 0, 0, 0, 0, 21, 28, 29, 16,
                0, 0, 0, 0, 0, 20, 19, 18, 17];

        L.numSteps = 41;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_21: function () {

        L.level =
            [31, 32, 33, 0, 0, 0, 0, 0, 0,
                30, 27, 26, 0, 0, 0, 0, 0, 0,
                29, 28, 25, 10, 11, 12, 13, 0, 0,
                0, 0, 24, 9, 2, 3, 14, 0, 0,
                0, 0, 23, 8, 1, 4, 15, 0, 0,
                0, 0, 22, 7, 6, 5, 16, 0, 0,
                0, 0, 21, 20, 19, 18, 17, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 33;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_22: function () {

        L.level =
            [1, 2, 9, 10, 11, 0, 0, 0, 0,
                4, 3, 8, 25, 12, 0, 0, 0, 0,
                5, 6, 7, 24, 13, 0, 0, 0, 0,
                20, 21, 22, 23, 14, 0, 0, 0, 0,
                19, 18, 17, 16, 15, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 25;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_23: function () {

        L.level =
            [1, 0, 43, 44, 45, 46, 47, 48, 49,
                2, 0, 42, 0, 0, 0, 0, 0, 0,
                3, 0, 41, 40, 39, 38, 37, 36, 35,
                4, 0, 0, 0, 0, 0, 0, 0, 34,
                5, 0, 15, 16, 17, 0, 31, 32, 33,
                6, 0, 14, 0, 18, 0, 30, 0, 0,
                7, 0, 13, 0, 19, 0, 29, 28, 27,
                8, 0, 12, 0, 20, 0, 0, 0, 26,
                9, 10, 11, 0, 21, 22, 23, 24, 25];

        L.numSteps = 49;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_24: function () {

        L.level =
            [1, 2, 0, 0, 0, 0, 0, 0, 0,
                4, 3, 0, 0, 0, 0, 0, 0, 0,
                5, 0, 0, 0, 0, 0, 0, 0, 0,
                6, 0, 0, 0, 0, 0, 0, 0, 0,
                7, 0, 0, 0, 0, 0, 0, 0, 0,
                8, 0, 0, 0, 0, 0, 0, 0, 0,
                9, 0, 0, 0, 0, 0, 0, 0, 0,
                10, 0, 0, 0, 0, 0, 0, 21, 20,
                11, 12, 13, 14, 15, 16, 17, 18, 19];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_25: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 15, 16, 17, 0, 0, 0,
                0, 0, 0, 14, 3, 4, 0, 0, 0,
                0, 0, 0, 13, 2, 5, 0, 0, 0,
                0, 0, 0, 12, 1, 6, 0, 0, 0,
                0, 0, 0, 11, 0, 7, 0, 0, 0,
                0, 0, 0, 10, 9, 8, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 17;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_26: function () {

        L.level =
            [1, 2, 3, 4, 5, 6, 7, 8, 9,
                32, 33, 34, 35, 36, 0, 0, 0, 10,
                31, 44, 45, 46, 37, 0, 0, 0, 11,
                30, 43, 48, 47, 38, 0, 0, 0, 12,
                29, 42, 41, 40, 39, 0, 0, 0, 13,
                28, 0, 0, 0, 0, 0, 0, 0, 14,
                27, 0, 0, 0, 0, 0, 0, 0, 15,
                26, 0, 0, 0, 0, 0, 0, 0, 16,
                25, 24, 23, 22, 21, 20, 19, 18, 17];

        L.numSteps = 48;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_27: function () {

        L.level =
            [1, 4, 5, 16, 17, 0, 0, 0, 0,
                2, 3, 6, 15, 18, 0, 0, 0, 0,
                9, 8, 7, 14, 19, 0, 0, 0, 0,
                10, 11, 12, 13, 20, 0, 0, 0, 0,
                25, 24, 23, 22, 21, 0, 0, 0, 0,
                26, 39, 38, 37, 36, 0, 0, 0, 0,
                27, 40, 45, 44, 35, 0, 0, 0, 0,
                28, 41, 42, 43, 34, 0, 0, 0, 0,
                29, 30, 31, 32, 33, 0, 0, 0, 0];

        L.numSteps = 45;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_28: function () {

        L.level =
            [0, 0, 0, 12, 11, 10, 0, 0, 0,
                0, 0, 0, 13, 0, 9, 0, 0, 0,
                0, 0, 0, 14, 0, 8, 0, 0, 0,
                0, 0, 0, 15, 0, 7, 0, 0, 0,
                0, 0, 0, 16, 5, 6, 0, 0, 0,
                0, 0, 0, 17, 4, 0, 0, 0, 0,
                25, 26, 0, 18, 3, 0, 0, 0, 0,
                24, 0, 0, 19, 2, 0, 0, 0, 0,
                23, 22, 21, 20, 1, 0, 0, 0, 0];

        L.numSteps = 26;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_29: function () {

        L.level =
            [9, 10, 0, 0, 0, 0, 0, 0, 0,
                8, 11, 12, 0, 0, 0, 0, 23, 24,
                7, 0, 13, 14, 0, 0, 21, 22, 25,
                6, 0, 0, 15, 16, 19, 20, 0, 26,
                5, 0, 0, 0, 17, 18, 0, 0, 27,
                4, 0, 0, 0, 0, 0, 0, 0, 28,
                3, 0, 0, 0, 0, 0, 0, 0, 29,
                2, 0, 0, 0, 0, 0, 0, 0, 30,
                1, 0, 0, 0, 0, 0, 0, 0, 31];

        L.numSteps = 31;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_30: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 20, 19, 0, 0, 0, 0, 0,
                0, 2, 21, 18, 17, 0, 0, 0, 0,
                0, 3, 0, 0, 16, 15, 0, 0, 0,
                0, 4, 0, 0, 13, 14, 0, 0, 0,
                0, 5, 0, 11, 12, 0, 0, 0, 0,
                0, 6, 9, 10, 0, 0, 0, 0, 0,
                0, 7, 8, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 21;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_31: function () {

        L.level =
            [25, 24, 23, 22, 21, 20, 19, 18, 17,
                26, 0, 0, 0, 0, 0, 0, 0, 16,
                27, 0, 0, 0, 0, 0, 0, 0, 15,
                28, 0, 0, 41, 42, 43, 0, 0, 14,
                29, 0, 0, 40, 1, 44, 0, 0, 13,
                30, 0, 0, 39, 2, 45, 0, 0, 12,
                31, 0, 0, 38, 3, 46, 0, 0, 11,
                32, 0, 0, 37, 4, 47, 0, 0, 10,
                33, 34, 35, 36, 5, 6, 7, 8, 9];

        L.numSteps = 47;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_32: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 4, 5, 6, 7, 8, 9, 0,
                0, 2, 1, 30, 13, 12, 11, 10, 0,
                0, 0, 0, 29, 14, 0, 0, 0, 0,
                0, 0, 0, 28, 15, 0, 0, 0, 0,
                0, 23, 24, 27, 16, 0, 0, 0, 0,
                0, 22, 25, 26, 17, 0, 0, 0, 0,
                0, 21, 20, 19, 18, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 30;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_33: function () {

        L.level =
            [0, 24, 23, 22, 1, 0, 0, 0, 0,
                0, 25, 0, 21, 2, 0, 0, 0, 0,
                0, 26, 19, 20, 3, 0, 0, 0, 0,
                0, 27, 18, 0, 4, 0, 0, 0, 0,
                0, 28, 17, 16, 5, 0, 0, 0, 0,
                0, 29, 0, 15, 6, 0, 0, 0, 0,
                0, 30, 13, 14, 7, 0, 0, 0, 0,
                0, 31, 12, 0, 8, 0, 0, 0, 0,
                0, 32, 11, 10, 9, 0, 0, 0, 0];

        L.numSteps = 32;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_34: function () {

        L.level =
            [18, 17, 0, 1, 2, 0, 0, 0, 0,
                19, 16, 15, 0, 3, 4, 0, 0, 0,
                20, 0, 14, 13, 0, 5, 6, 0, 0,
                21, 0, 0, 12, 11, 0, 7, 0, 0,
                22, 0, 0, 0, 10, 9, 8, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0];

        L.numSteps = 22;
        L.tickRate = 6;
        L.difficulty = 3;

    },
    three_35: function () {

        L.level =
            [0, 0, 0, 0, 0, 0, 0, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 4, 0,
                0, 0, 0, 25, 24, 23, 22, 5, 0,
                0, 0, 0, 26, 19, 20, 21, 6, 0,
                0, 0, 0, 27, 18, 17, 16, 7, 0,
                0, 0, 0, 28, 13, 14, 15, 8, 0,
                32, 31, 30, 29, 12, 11, 10, 9, 0];

        L.numSteps = 32;
        L.tickRate = 6;
        L.difficulty = 3;

    },


    load_level: function (level) {
        G.reset();
        G.currentLevel = level;
        L[level]();
        G.currentData = 1;
        L.origSteps = L.numSteps;

        var level = G.currentLevel.charAt(G.currentLevel.length - 1);
        switch (G.currentPool) {
            case "zero":
                break;
            case "one":
                L.totalTicks = L.total_tick_1 + L.total_failed_1[level] * 15;
                break;
            case "two":
                L.totalTicks = L.total_tick_2 + L.total_failed_2[level] * 15;
                break;
            case "three":
                L.totalTicks = L.total_tick_3 + L.total_failed_3[level] * 15;
                break;
            default:
                break;
        }
        G.isDragging = false;
        PS.gridShadow(false);
        G.isBreathingRoom = true;
        PS.borderColor(PS.ALL, PS.ALL, 0, 0, 0);
        if (G.bTimer != 0) {
            try {
                PS.timerStop(G.bTimer);
            }
            catch (err) {
            }
        }


        var i = 0; // counter for level populator
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                PS.data(x, y, L.level[i]);
                J.bead_grower(x, y);
                i++;
            }
        }
        G.repaint();
        G.calc_grays();
        G.currentTick = 0;
        G.darkTime = false;
        PS.gridColor(G.COLOR_GRID, G.COLOR_GRID, G.COLOR_GRID);

        breather = function () {
            if (G.bTick == 1) {
                G.isBreathingRoom = false;
            }
            G.bTick++;
        }
        G.bTick = 1;
        //G.bTimer = PS.timerStart(L.breathingRoom, breather);
        if (G.currentLevel != "zero_1") {
            G.clickable = true;
            G.timer = PS.timerStart(L.tickRate, G.tick);
        }
    },

    level_randomizer: function (pool) {
        var level; // the level to load
        var levelpool;
        var levelpoolcontainer;
        var levelscomplete;
        switch (pool) {
            case "zero":
                levelpool = L.POOL_O_COUNT;
                levelpoolcontainer = G.levelsComplete_0;
                levelscomplete = G.levelsComplete_0.length;
                break;
            case "one":
                levelpool = L.POOL_1_COUNT;
                levelpoolcontainer = G.levelsComplete_1;
                levelscomplete = G.levelsComplete_1.length;
                break;
            case "two":
                levelpool = L.POOL_2_COUNT;
                levelpoolcontainer = G.levelsComplete_2;
                levelscomplete = G.levelsComplete_2.length;
                break;
            case "three":
                levelpool = L.POOL_3_COUNT;
                levelpoolcontainer = G.levelsComplete_3;
                levelscomplete = G.levelsComplete_3.length;
                break;
        }
        if (pool != "zero") {

            var valid = false;
            while (!valid) {
                var alreadydone = false;
                var repeat = false;

                var rando = Math.floor(Math.random() * levelpool + 1);

                level = "" + pool + "_" + rando;
                for (var i = 0; i < levelpoolcontainer.length; i++) {
                    if (levelpoolcontainer[i] === level) {
                        alreadydone = true;
                    }
                }
                if (!(levelscomplete == levelpool - 1)) {
                    if (level == G.currentLevel) {
                        repeat = true;
                    }
                }
                if (!repeat && !alreadydone) {
                    valid = true;
                }
            }
            L.load_level(level);
            /*
             if (!alreadydone && !repeat) {
             L.load_level(level);
             } else {
             L.level_randomizer(pool);
             }
             */

        } else {
            level = "" + pool + "_" + L.currentTutorial;
            L.load_level(level);
        }


    },

    populate_fail_count: function () {
        for (var i = 0; i < L.POOL_3_COUNT; i++) {
            L.total_failed_1[i] = 0;
            L.total_failed_2[i] = 0;
            L.total_failed_3[i] = 0;
        }
    }
};

var J = { // juice

    grays: [],
    pathgrays: [],
    currentColor: [],
    rate: [],
    rategrays: [],
    rateBG: 0,
    bgTick: 0,

    borderColor: 0,
    bgColor: 0,
    NUM_WAIT_TICKS: 50,
    PANIC_RATE: -1.2,

    pulseDirection: "up",
    pulseTimer: 0,
    pulseTimerStopped: false,
    pulseTimerStarted: false,
    shimmerStarted: false,
    shimmerWaitPeriod: false,
    startTimer: 0,
    startTimerStage : 0,

    isOsuTransition: false,

    level_transition: function (type) {
        switch (type) {
            case "fail":
                break;
            case "pool":
                break;
        }

        var timerT;
        tickT = function () {
            PS.color(PS.ALL, PS.ALL, G.COLOR_BG);
            PS.fade(PS.ALL, PS.ALL, 0);
            L.level_randomizer(G.currentPool);
            PS.timerStop(timerT);
        }
        PS.border(PS.ALL, PS.ALL, 0);
        PS.fade(PS.ALL, PS.ALL, 50);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);

        timerT = PS.timerStart(50, tickT);

    },

    bead_shrinker: function (x, y) {
        var shrinker;
        var shrinkerkiller = 0;
        var width = 1;
        var shrinkerlevel = G.currentLevel;

        var randoX = x;
        var randoY = y;

        var posorig = x + (y * 9);

        while (PS.data(randoX, randoY) != 0) {
            randoX = PS.random(G.GRID_WIDTH - 1);
            randoY = PS.random(G.GRID_HEIGHT - 1);
        }
        var pos = randoX + (randoY * 9);
        var color = J.currentColor[pos];

        PS.borderColor(x, y, color, color, color);
        J.rategrays[posorig] = J.rate[pos];

        shrinkerticker = function () {
            shrinkerkiller++;
            width = width + 5;
            PS.border(x, y, {
                top: width,
                left: width,
                bottom: width,
                right: width
            });

            if ((shrinkerkiller == 5) || (shrinkerlevel != G.currentLevel)) {
                PS.timerStop(shrinker);
            }
        }

        shrinker = PS.timerStart(2, shrinkerticker);
    },

    bead_grower: function (x, y) {
        var grower;
        var growerkiller = 0;
        var width = 25;
        //PS.borderColor(x, y, );

        growerticker = function () {
            growerkiller++;
            width = width - 2;
            PS.border(x, y, {
                top: width,
                left: width,
                bottom: width,
                right: width
            });

            if (growerkiller == 15) {
                if ((PS.data(x, y) == 1) || (PS.data(x, y) == L.numSteps)) {
                    //G.borderify(x, y);
                }
                PS.timerStop(grower);
            }
        }


        grower = PS.timerStart(1, growerticker);


    },

    tutorial_shimmer: function () {
        var shimmerTimer = 0;
        var bgTimer = 0;
        var growerTimer = 0;
        var hiderTimer = 0;
        var clickableTimer = 0;
        var currentX = 0;
        var currentY = 4;

        PS.gridPlane(2);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
        PS.alpha(PS.ALL, PS.ALL, 255);
        PS.fade(PS.ALL, PS.ALL, 100);
        PS.gridPlane(0);

        bg_fader = function () {
            PS.gridPlane(2);
            PS.alpha(PS.ALL, PS.ALL, 0);
            PS.gridPlane(0);
            PS.timerStop(bgTimer);
            G.clickable = true;
            J.shimmerStarted = true;
            J.startTimer = PS.timerStart(150, shimmer_start);
        }

        bgTimer = PS.timerStart(20, bg_fader);

        shimmer_start = function () {
            if (J.startTimerStage == 1) {
                J.shimmerWaitPeriod = true;
                G.clickable = false;
                for (var y = 0; y < G.GRID_HEIGHT; y++) {
                    for (var x = 0; x < G.GRID_WIDTH; x++) {
                        if (x < G.currentData - 1) {
                            J.bead_grower(x, y);
                        }
                    }
                }
            }
            if (J.startTimerStage == 2) {
                shimmerTimer = PS.timerStart(5, bead_pulse);
                J.shimmerStarted = false;
                PS.timerStop(J.startTimer);
            }
            J.startTimerStage++;
        }

        bead_pulse = function () {
            /** What should happen to the beads? **/
            PS.audioPlay(A.sfx_step, {volume: 0.075, path: A.SFX_PATH});

            if (currentX < G.GRID_WIDTH) {
                PS.gridPlane(0);
                J.bead_shrinker(currentX, currentY);
            }
            PS.gridPlane(0);
            currentX++;
            if (currentX > G.GRID_WIDTH) {
                PS.timerStop(shimmerTimer);
                growerTimer = PS.timerStart(50, grower_timer);
            }
        }

        grower_timer = function () {
            for (var y = 0; y < G.GRID_HEIGHT; y++) {
                for (var x = 0; x < G.GRID_WIDTH; x++) {
                    J.bead_grower(x, y);
                }
            }
            PS.timerStop(growerTimer);
            hiderTimer = PS.timerStart(50, hide_timer);
        }

        hide_timer = function () {

            PS.gridPlane(2);
            PS.fade(PS.ALL, PS.ALL, 50);
            PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_OPAQUE);
            PS.color(PS.ALL, PS.ALL, J.bgColor);
            PS.alpha(0, 4, PS.ALPHA_TRANSPARENT);
            PS.gridPlane(0);
            PS.timerStop(hiderTimer);
            J.pulseTimerStarted = true;
            J.shimmerWaitPeriod = false;
            G.clickable = true;
            J.pulseTimer = PS.timerStart(3, J.bead_pulser);
        }
    },

    bead_pulser: function () {
        var x = 0;
        var y = 4;
        var size = PS.radius(x, y);
        if (J.pulseDirection == "up") {
            size++;
        }
        if (J.pulseDirection == "down") {
            size--;
        }
        if (size == 30) {
            J.pulseDirection = "down";
        }
        if (size == 0) {
            J.pulseDirection = "up";
        }
        PS.radius(x, y, size);
    },

    osu_transition: function(){
        var osuInitTimer = 0;
        var osuInitTimerStage = 0;
        R.isOsuTransition = true;
        PS.audioStop(A.loopChannel);
        PS.audioPlay(A.sfx_trans, {volume: 0.25, path: A.SFX_PATH});

        osu_init = function() {
            if(osuInitTimerStage == 1){

                PS.statusText("mino/mono");
                PS.gridPlane(5);
                PS.fade(PS.ALL, PS.ALL, 100);
                PS.gridFade(100);
                PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_TRANSPARENT);
                PS.gridColor(PS.COLOR_BLACK);
                PS.gridPlane(0);
            }
            if(osuInitTimerStage == 2){
                PS.fade(PS.ALL, PS.ALL, 0);
                PS.gridFade(0);
                PS.timerStop(osuInitTimer);

                R.isOsuTransition = false;
                R.init_osu();
            }
            osuInitTimerStage++;
        }
        osuInitTimer = PS.timerStart(100, osu_init);

        PS.gridPlane(5);
        PS.fade(PS.ALL, PS.ALL, PS.COLOR_WHITE);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_WHITE);
        PS.fade(PS.ALL, PS.ALL, 100);
        PS.gridFade(100)
        PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_OPAQUE);
        PS.gridColor(PS.COLOR_WHITE);
        PS.gridPlane(0);

    },

    radio_static: function(){
        var radio_timer = 0;
        var radio_timer_2 = 0;
        var s_paused = false;
        var timercounter = 0;
        G.isPlaying = false;

        A.osu_start_radio();

        s_static = function(){
            PS.audioPause(A.rLoopChannel);
            if(timercounter == 6){
                PS.timerStop(radio_timer_2);
            }
            timercounter++;
        }

        r_static = function(){
            for(var x = 0; x < G.GRID_WIDTH; x++){
                for(var y = 0; y < G.GRID_HEIGHT; y++){
                    var sign = PS.random(2);
                    var bgcolors = [];
                    PS.unmakeRGB(PS.color(x, y), bgcolors);
                    if(sign == 1){
                        var newcolor = bgcolors[1] + 1;
                    }else{
                        var newcolor = bgcolors[1] - 1;
                    }
                    PS.color(x, y, newcolor, newcolor, newcolor);
                }
            }
        }
        radio_timer = PS.timerStart(2, r_static);
        //radio_timer_2 = PS.timerStart(10, s_static);

    }
}

var A = { //audio

    SCALE_PATH: "http://alpheus.wpi.edu/~bmoriarty/ps/audio/",
    BGM_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Mino,%20Mono/minomono/bgm/",
    SFX_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Mino,%20Mono/minomono/sfx/",

    UP: "up",
    DOWN: "down",
    direction: "up",

    spook: "spook",
    scale: [
        "piano_g1",
        "piano_bb1",
        "piano_c2",
        "piano_d2",
        "piano_f2",
        "piano_g2",
        "piano_bb2",
        "piano_c3",
        "piano_d3",
        "piano_f3",
        "piano_g3",
        "piano_bb3",
        "piano_c4",
        "piano_d4",
        "piano_f4",
        "piano_g4",
        "piano_bb4",
        "piano_c5",
        "piano_d5",
        "piano_f5",
        "piano_g5"
    ],

    sfx_win: "win",
    sfx_fail: "failure",
    sfx_step: "step",
    sfx_trans: "trans",

    t_loop: 0,
    t_rloop: 0,

    //For the song
    intro: "intro",
    loop: "loop",

    rIntro: "r_intro",
    rLoop: "r_loop",

    radio: "static",

    introChannel: 0,
    loopChannel: 0,
    rIntroChannel: 0,
    rLoopChannel: 0,

    play_scale: function (x, y) {
        PS.audioPlay(A.sfx_step, {volume: 0.075, path: A.SFX_PATH});
        //var spaceCount = PS.data(x, y);
        //spaceCount -= 1;
        //while(spaceCount >= A.scale.length){
        //    spaceCount -= A.scale.length;
        //    if(A.direction == A.UP){
        //        A.direction = A.DOWN;
        //    } else {
        //        A.direction = A.UP;
        //    }
        //}
        //if(A.direction == A.UP){
        //    PS.audioPlay(A.scale[spaceCount], {path : A.SCALE_PATH, volume: 0.1});
        //} else {
        //    PS.audioPlay(A.scale[A.scale.length - 1 - spaceCount], {path : A.SCALE_PATH, volume: 0.1});
        //}
        //A.direction = A.UP;
    },

    start_bgm: function () {
        A.introChannel = PS.audioPlay(A.intro, {volume: 0.20, path: A.BGM_PATH});
        setTimeout(A.start_loop, 12790);
    },

    start_loop: function () {
        //PS.debug("first\n");
        A.play_loop();
        A.t_loop = PS.timerStart(9211, A.play_loop);

    },

    play_loop: function () {
        //PS.debug("loop\n");
        A.loopChannel = PS.audioPlay(A.loop, {volume: 0.20, path: A.BGM_PATH});
    },

    osu_start_bgm: function () {
        A.rLoopChannel = PS.audioPlay(A.rLoop, {volume: 0.20, path: A.BGM_PATH, loop: true});
    },

    osu_start_radio: function(){
        PS.audioPlay(A.radio, {volume:0.75, path: A.BGM_PATH});
    },

    init_sound: function () {

        for (var i = 0; i < A.scale.length; i++) {
            PS.audioLoad(A.scale[i], {lock: true, path: A.SCALE_PATH});
        }

        PS.audioLoad(A.spook, {lock: true, path: A.SFX_PATH});
        PS.audioLoad(A.sfx_fail, {lock: true, path: A.SFX_PATH});
        PS.audioLoad(A.sfx_win, {lock: true, path: A.SFX_PATH});
        PS.audioLoad(A.intro, {lock: true, path: A.BGM_PATH});
        PS.audioLoad(A.loop, {lock: true, path: A.BGM_PATH});
        //PS.audioLoad(A.rIntro, {lock: true, path: A.BGM_PATH});
        PS.audioLoad(A.rLoop, {lock: true, path: A.BGM_PATH});
        PS.audioLoad(A.sfx_step, {lock: true, path: A.SFX_PATH});
        PS.audioLoad(A.radio, {lock:true, path: A.BGM_PATH});
        PS.audioLoad(A.sfx_trans, {lock:true, path: A.SFX_PATH});

    }

};

var E = { //editor
    editMode: false,
    currentCount: 1,  //What will be assigned to a bead upon next click

    save: function () {
        var stepCount = 0;
        PS.debug("ID: function() {\n\n");
        PS.debug("\tL.level = \n\t    [");
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                PS.debug(PS.data(x, y));

                if (PS.data(x, y) != 0) {
                    stepCount++;
                }
                if ((x * y) == 64) {
                    PS.debug("];");
                } else {
                    PS.debug(", ");
                }
            }
            PS.debug("\n ");
        }

        PS.debug("\n\tL.numSteps = " + stepCount + ";\n");
        PS.debug("\tL.totalTicks = " + "PLACEHOLDER" + ";\n");
        PS.debug("\tL.tickRate = " + "PLACEHOLDER" + ";\n");
        PS.debug("\tL.difficulty = " + "PLACEHOLDER" + ";\n");
        PS.debug("\n},");

    },

    repaint: function () {
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                if (PS.data(x, y) != 0) {
                    L.numSteps = E.currentCount;
                    G.paint_bead(x, y);
                } else {
                    PS.color(x, y, G.COLOR_BG);
                }
            }
        }
    },

    toggle: function () {
        if (E.editMode) { //if on turn off
            PS.statusText("");
            E.editMode = false;
            PS.border(PS.ALL, PS.ALL, 0);

        } else { //if off, turn on
            PS.gridPlane(2);
            PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_TRANSPARENT);
            PS.gridPlane(0);
            PS.statusText("Editor Enabled");
            E.editMode = true;
            E.currentCount = 1;
            PS.borderColor(PS.ALL, PS.ALL, PS.COLOR_GRAY_LIGHT);
            PS.border(PS.ALL, PS.ALL, 1);

            PS.borderColor(PS.ALL, 4, PS.COLOR_VIOLET);
            PS.borderColor(4, PS.ALL, PS.COLOR_VIOLET);
            PS.border(4, PS.ALL, 3);
            PS.border(PS.ALL, 4, 3);


        }
    }
};

var R = { //Random mode at the end

    STARTING_TICKS: 200,
    TICK_REFRESH: 20,

    PATH_LENGTH_MIN: 8,
    PATH_LENGTH_MAX: 12,


    pathLength: 0,
    inOsu: false,
    penX: 0,
    penY: 0,
    score: 0,
    originX: 0,
    originY: 0,

    difficultyCounter: 0,

    currentTick: 0,

    rate: [],

    startColor: 0,
    timer: 0,

    pick_origin: function(){
        var x, y, valid = false;
        while(!valid){
            x = Math.floor(Math.random() * 9);
            if((x < R.originX - 2) || (x > R.originX + 2)){
                R.originX = x;
                valid = true;
            }
        }
        valid = false;
        while(!valid){
            y = Math.floor(Math.random() * 9);
            if((y < R.originY - 2) || (y > R.originY + 2)){
                R.originY = y;
                valid = true;
            }
        }
    },

    draw_path: function(){
        var dir = 1, valid = false, x = 0, y = 0;

        PS.data(PS.ALL, PS.ALL, 0);
        for(var i = 0; i < 81; i++){
            L.level[i] = 0;
        }
        R.pathLength = Math.floor(Math.random() * (R.PATH_LENGTH_MAX - R.PATH_LENGTH_MIN) + R.PATH_LENGTH_MIN);
        R.penX = R.originX;
        R.penY = R.originY;

        for(var i = 1; i <= R.pathLength; i++){
            x = R.penX;
            y = R.penY;

            L.level[R.calculate_pos(R.penX, R.penY)] = i;
            PS.data(R.penX, R.penY, i);


            valid = false;
            var invalidCounter = 0;
            while(!valid) {
                x = R.penX;
                y = R.penY;
                if (Math.floor(Math.random() * 2) == 0) {
                    dir = 1;
                } else {
                    dir = -1;
                }
                if(Math.floor(Math.random() * 2) == 0){
                    x += dir;
                } else {
                    y += dir;
                }
                if((x >= 0 && x <= 8) && (y >= 0 && y <= 8)){
                    if(L.level[R.calculate_pos(x, y)] == 0){
                        R.penX = x;
                        R.penY = y;
                        valid = true;
                    }
                }
                invalidCounter++;
                if(invalidCounter > 4){
                    valid = true;
                    R.pathLength = i;
                }
            }
        }
        //PS.debug( )
        L.numSteps = R.pathLength;
        L.origSteps = L.numSteps;

    },

    calculate_pos: function(x, y) {
        return (x + (y * 9));
    },

    init_osu: function(){
        //PS.audioStop("loop");
        PS.timerStop(A.t_loop);
        A.osu_start_bgm();
        L.currentTutorial = 0;
        L.totalTicks = R.STARTING_TICKS;
        R.currentTick = 0;
        G.currentTick = R.currentTick;

        R.inOsu = true;
        R.timer = PS.timerStart(L.tickRate, R.tick);
        R.load_osu();
    },

    load_osu: function(){
        G.reset();
        if (G.bTimer != 0) {
            try {
                PS.timerStop(G.bTimer);
            }
            catch (err) {
            }
        }
        G.clickable = true;
        G.isDragging = false;
        G.darkTime = false;
        G.currentData = 1;
        PS.borderColor(PS.ALL, PS.ALL, 0, 0, 0);
        PS.gridShadow(false);
        //G.reset();

        G.currentTick = R.currentTick;
        R.pick_origin();
        R.draw_path();

        G.repaint();

        G.calc_grays();
        R.refresh_time();

        var i = 0;
        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                PS.data(x, y, L.level[i]);
                J.bead_grower(x, y);
                i++;
            }
        }
    },

    refresh_time: function(){

        if(R.currentTick >= R.STARTING_TICKS){
            R.currentTick = R.STARTING_TICKS - R.TICK_REFRESH;
        }
        if(R.currentTick - R.TICK_REFRESH >= 0){ //do this if adding the refresh would not push the ticks over the boundary
            R.currentTick = R.currentTick - R.TICK_REFRESH;
        } else {
            R.currentTick = 0;
        }
        for(var i = 0; i < R.currentTick; i++){
            G.fade();
            //PS.debug(R.currentTick + "\n");
        }
        //PS.debug("refresh done\n");
    },

    tick: function () { // brightener
        G.currentTick = R.currentTick;
        G.fade();

        if (G.currentTick == L.totalTicks) {
            //PS.debug("changing rate");
            for (var i = 0; i < J.rate.length; i++) {
                // PS.debug(J.currentColor[i] +"\tgray: " + J.grays[i] + "\trate: " + J.rate[i] + "\n");
                J.rate[i] = ((Math.random() * 2) / 10) + (J.PANIC_RATE - 0.1);

            }
            var bgcolors = [];
            PS.unmakeRGB(PS.gridColor(), bgcolors);

            J.rateBG = ( (90 - bgcolors[0]) / J.NUM_WAIT_TICKS );

            //PS.debug(J.rateBG);
            J.bgTick = G.currentTick;
            J.bgColor = bgcolors[0];
            //PS.debug(PS.gridColor());
            //PS.audioPlay(A.spook, {volume: 0.25, path: A.SFX_PATH});
        }
        //
        //if (G.currentTick > L.totalTicks) {
        //    if (G.currentTick > J.bgTick) { //to prevent multiple calls during a single tick
        //        J.bgColor += J.rateBG;
        //        //if((rateBG < 0 && (bgColor < 127)) || (rateBG > 0 && (bgColor > 127))){
        //        //    bgColor = 127;
        //        //}
        //        PS.gridColor(J.bgColor, J.bgColor, J.bgColor);
        //        //PS.debug(G.currentTick + "\n");
        //        //PS.debug(J.bgColor + "\t" + J.rateBG + "\n");
        //        J.bgTick++;
        //    }
        //
        //}

        R.currentTick++;
        G.currentTick = R.currentTick;
        if (G.currentTick >= (L.totalTicks + J.NUM_WAIT_TICKS)) {
            if (!G.isDragging) {
                PS.timerStop(R.timer);
                G.darkTimer = PS.timerStart(30, G.resettimer);
                G.darkTime = true;
            }
        }
    }

};

PS.init = function (system, options) {
    "use strict";

    PS.gridSize(G.GRID_WIDTH, G.GRID_HEIGHT);
    PS.data(PS.ALL, PS.ALL, 0);   //init all beads to 0
    PS.gridColor(J.bgColor);
    PS.gridFade(50);
    PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.border(PS.ALL, PS.ALL, 0);


    A.init_sound();
    L.populate_fail_count();

    PS.statusText("");
    L.load_level("zero_1");
    //A.start_bgm();

};

PS.touch = function (x, y, data, options) {
    "use strict";

    if (E.editMode) { //Click controls for in edit mode
        PS.data(x, y, E.currentCount++);
        E.repaint();
    } else {
        if (G.currentTick >= (L.totalTicks + J.NUM_WAIT_TICKS)) {
            G.clickable = false;
        }
        if (G.clickable) {

            if (!G.isDragging && G.isPlaying) {
                if (G.darkTime) {
                    if (PS.data(x, y) != 1) {
                        G.fail();
                    }
                }
                if (PS.data(x, y) == 1) {
                    G.isDragging = true;
                    PS.gridShadow(true, G.COLOR_SHADOW);
                    G.consume_space(x, y);
                }
            }
        }
    }


};

PS.release = function (x, y, data, options) {
    "use strict";
    if (E.editMode) {
        // Just in case we want some editor functionality, here
    } else {
        if (G.isDragging) {
            G.isDragging = false;
            PS.gridShadow(false);
            G.currentData = 1;
            L.numSteps = L.origSteps;

            if (!J.shimmerWaitPeriod) {
                for (var y = 0; y < G.GRID_HEIGHT; y++) {
                    for (var x = 0; x < G.GRID_WIDTH; x++) {

                        J.bead_grower(x, y);
                    }
                }
            }
        }
    }
};

PS.enter = function (x, y, data, options) {
    "use strict";
    if (G.isDragging) {
        G.consume_space(x, y);
    }
};

PS.exit = function (x, y, data, options) {
    "use strict";

};

PS.exitGrid = function (options) {
    "use strict";
    if (G.isDragging) {
        G.isDragging = false;
        PS.gridShadow(false);
        G.currentData = 1;
        L.numSteps = L.origSteps;

        for (var y = 0; y < G.GRID_HEIGHT; y++) {
            for (var x = 0; x < G.GRID_WIDTH; x++) {
                J.bead_grower(x, y);
            }
        }
        if (G.currentTick >= (L.totalTicks + J.NUM_WAIT_TICKS)) {
            if (!G.isDragging && !R.inOsu) {
                PS.timerStop(G.timer);
                G.darkTimer = PS.timerStart(30, G.resettimer);
                G.darkTime = true;
            }
        }
    }
};

PS.keyDown = function (key, shift, ctrl, options) {
    "use strict";
    //PS.debug(key + "\tshift: " + shift + "\tctrl:  " + ctrl + "\n");
    if ((key == 32) && shift) {

        if (G.isPlaying && !R.isOsuTransition) {
            G.win();
        }
    }

    if ((key == 69) && (shift == true) && (ctrl == true)) {    //Press 'E' for edit mode
        E.toggle();

    }

    if (E.editMode && key == 115) { //If 'S' is pressed during edit mode, save the thing (By printing code to debug)
        E.save();
    }

    if (E.editMode && key == 114) { //If 'R' is pressed during edit mode, reset all beads
        G.reset();
        E.repaint();
    }
};

PS.keyUp = function (key, shift, ctrl, options) {
    "use strict";
};

PS.swipe = function (data, options) {
    "use strict";
};

PS.input = function (sensors, options) {
    "use strict";
};

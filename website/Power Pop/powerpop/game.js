var colorNoteBG, colorGumBG, colorDrumBG, colorGumL, colorGumM, colorGumS, colorDrum, colorWalls, colorBorder, colorBG, colorBG2, colorBG3, colorBG4, colorMetro, colorDivide, colorShadow, colorLock, colorMissile;
var notes;
var colorNotes;
var edit = false;
var clicksEdit = 1;
var clickRemaining;
var gumToPop = 1;

var time = 1;  //Have time start at max time
var timeX = 2;
var timeY = 0;
var timer;

var metroAlpha = 10;

var beats;
var clickTimerTempo = 50; // Ticker for clicklimiter
var clickTimer;
var isBreathingSpace = true; // Can't game-over if this is true

var canClick = true;
var canPlayAgain = false;
var time2beat;



//Simple names for drums
var kick, snare, lTom, hTom, oHH, cHH, mTom;

var unclickablesX = [];
var unclickablesY = [];
var unclickX;
var unclickY;


const TEMPO = 20;
const SMALL = 3;
const MED = 2;
const BIG = 1;

const NUM_GUM = 4;
const NUM_NOTES = 6;
const NOTE_OFF = 5;

const  REVEAL_LEVEL = 3;

const fps = 5;

var sizePlayspace;

/** STARTING LEVEL INFO **/
var hasBegun = false; // set to true of currentLevel is anything but 1, false otherwise
var currentLevel = 1; // should be 1
/**                **/

var A = {
    notes: [],
    NOTE_PATH: "http://users.wpi.edu/~hjwheelermackta/Frauds/Power%20Pop/powerpop/audio/",
    fx_click: "fx_drip2",
    fx_pop: "fx_pop",
    fx_unclickable: "fx_blip",

    init_audio: function(){
        PS.audioLoad( A.fx_click, {lock : true} );
        PS.audioLoad( A.fx_pop, {lock : true} );
        PS.audioLoad( A.fx_unclickable, {lock : true} );

        PS.audioLoad( "1_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "1_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "1_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "1_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "1_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "1_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "2_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "2_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "2_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "2_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "2_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "2_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "3_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "3_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "3_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "3_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "3_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "3_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "4_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "4_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "4_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "4_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "4_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "4_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "5_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "5_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "5_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "5_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "5_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "5_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "6_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "6_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "6_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "6_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "6_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "6_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "7_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "7_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "7_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "7_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "7_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "7_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "8_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "8_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "8_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "8_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "8_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "8_C2", {lock : true, path : A.NOTE_PATH} );

        PS.audioLoad( "9_C1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "9_Eb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "9_F1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "9_G1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "9_Bb1", {lock : true, path : A.NOTE_PATH} );
        PS.audioLoad( "9_C2", {lock : true, path : A.NOTE_PATH} );

        notes = [
                ["1_C1", "1_Eb1", "1_F1", "1_G1", "1_Bb1", "1_C2"],
                ["2_C1", "2_Eb1", "2_F1", "2_G1", "2_Bb1", "2_C2"],
                ["3_C1", "3_Eb1", "3_F1", "3_G1", "3_Bb1", "3_C2"],
                ["4_C1", "4_Eb1", "4_F1", "4_G1", "4_Bb1", "4_C2"],
                ["5_C1", "5_Eb1", "5_F1", "5_G1", "5_Bb1", "5_C2"],
                ["6_C1", "6_Eb1", "6_F1", "6_G1", "6_Bb1", "6_C2"],
                ["7_C1", "7_Eb1", "7_F1", "7_G1", "7_Bb1", "7_C2"],
                ["8_C1", "8_Eb1", "8_F1", "8_G1", "8_Bb1", "8_C2"],
                ["9_C1", "9_Eb1", "9_F1", "9_G1", "9_Bb1", "9_C2"]
            ];

    }


};

var metro = {
    next_beat: function () { //advances the time and plays sound
        advance_time();
        play();
        hasBegun = true;
    }
};

advance_time = function () {
    if (hasBegun) {
        var offset;

        //COLOR OLD ONE
        PS.border(timeX, timeY, 0);
        PS.borderColor(timeX, timeY, colorBorder);
        //PS.radius(timeX, timeY, 0);

        ////color old drum
        //if ((time) % 2 == 0) {
        //    if (time < 9) {
        //        offset = 1;
        //    } else {
        //        offset = 3;
        //    }
        //PS.border((time + offset) / 2, 12, 0);
        //PS.border((time + offset) / 2, 13, 0);
        //    PS.borderColor((time + offset) / 2, 12, colorBorder);
        //    PS.borderColor((time + offset) / 2, 13, colorBorder);
        //    //PS.radius((time + offset) / 2, 12, 0);
        //    //PS.radius((time + offset) / 2, 13, 0);
        //}
        if (time == 16) { //If reset is needed
            time = 1;
            timeX = 2;
            timeY = 0;
        } else {
            time++;
            if (time < 5) { //If on top
                timeX += 2;
            } else {
                if (time < 9) { //If on right
                    if (time == 5) { //turn
                        timeX = 10;
                        timeY = 2;
                    } else {
                        timeY += 2;
                    }
                } else {
                    if (time < 13) { //If on bottom
                        if (time == 9) { //turn
                            timeX = 8;
                            timeY = 10;
                        } else {
                            timeX -= 2;
                        }
                    } else { //If on left
                        if (time == 13) { //turn
                            timeX = 0;
                            timeY = 8;
                        } else {
                            timeY -= 2;
                        }
                    }
                }
            }
        }
    }
    //Color current time gray
    //PS.color(time + COLUMN_OFFSET, DIVIDE_HEIGHT, borderColor);
    //COLOR NEW ONE
    //PS.color(timeX, timeY) + 25  color function
    PS.border(timeX, timeY, metroAlpha);
    PS.borderColor(timeX, timeY, colorMetro);
    //PS.radius(timeX, timeY, 30);

    drum_shadow();

};

play = function () {
    var note = PS.data(timeX, timeY) - 6;
    var beat, version, synth, vol;
    if (note >= 0) {
        if(currentLevel < 9){  //play version 1 of synth
            synth = 0;
        } else {
            if (currentLevel < 14){ //play version 2 of synth
                synth = 3;
            } else { //play version 3 of synth
                synth = 6;
            }
        }
        version = Math.floor((Math.random() * 3) + synth);
        vol = Math.floor((Math.random() * 15) + 45);
        PS.audioPlay(notes[version][note], {path: A.NOTE_PATH, volume: (vol / 100)});
    }

    if ((time + 1) % 2 == 0) {
        beat = ((time + 1) / 2) - 1;
        for (var i = 0; i < beats[beat].length; i++) {
            if (beats[beat][i] != NOTE_OFF) {
                if(beats[beat][i] == snare){
                    PS.audioPlay(beats[beat][i], {volume: 0.6});
                } else {
                    PS.audioPlay(beats[beat][i]);
                }
            }
        }
    }

};

drum_shadow = function () {
    var light;
    switch(time){
        case 1:
        case 5:
        case 9:
        case 13:
            light = 0;
            break;
        case 2:
        case 6:
        case 10:
        case 14:
            light = 25;
            break;
        case 3:
        case 7:
        case 11:
        case 15:
            light = 50;
            break;
        case 4:
        case 8:
        case 12:
        case 16:
            light = 75;
            break;
    }
    //PS.debug((colorShadow[0] + light) + "\n" + (colorShadow[1] + light) + "\n" +(colorShadow[2] + light) + "\n");
    PS.gridShadow(true, (colorShadow[0] + light), (colorShadow[1] + light), (colorShadow[2] + light));
};

define_colors = function () {

    colorGumBG = 0xFFFFBF;
    colorGumL = 0xFF9EC9;
    colorGumM = 0xF53CAE;
    colorGumS = 0xA6355D;


    colorBG = 0xB2C5FF;
    colorBG2 = 0x02143D;
    colorBG3 = 0x4e2166;
    colorBG4 = 0xA72166;
    colorMetro = 0xFFFFBF;

    colorNoteBG = 0xFFE41C;

    colorDivide = 0xE3E3E3;

    colorWalls = 0xFFA000;
    colorBorder = PS.COLOR_YELLOW;

    colorMissile = 0xF02C9A;

    colorLock = 0x380A24;

    colorShadow = [
        22, //Red
        22, //Green
        41  //Blue
    ];

    colorNotes = [
        0xFF0051, // note 1 color
        0xFF007B, // note 2 color
        0xFF00A0, // note 3 color
        0xFF00BF, // note 4 color
        0xFF00DB, // note 5 color
        0xFF00FA  // note 6 color
    ];
};

init_playspace = function (color) {
    sizePlayspace = (NUM_GUM * 2) + 1;
    for (var i = 1; i < sizePlayspace + 1; i++) {
        for (var j = 1; j < sizePlayspace + 1; j++) {
            if ((PS.data(i, j) == 1) || (PS.data(i, j) == 2) || (PS.data(i, j) == 3)) {
            } else {
                PS.color(i, j, color);
                PS.data(i, j, 0);
            }
        }
    }
};

init_noteOff = function () {
    for (var i = 2; i < sizePlayspace; i++) {
        //PS.color(i, 0, colorNoteBG);
        //PS.color(0, i, colorNoteBG);
        //PS.color(i, sizePlayspace + 1, colorNoteBG);
        //PS.color(sizePlayspace + 1, i, colorNoteBG);

        PS.fade(i, 0, 20);
        PS.fade(0, i, 20);
        //PS.borderFade(i, sizePlayspace + 1, 20);
        //PS.borderFade(sizePlayspace + 1, i, 20);

        PS.data(i, 0, NOTE_OFF);
        PS.data(0, i, NOTE_OFF);
        PS.data(i, sizePlayspace + 1, NOTE_OFF);
        PS.data(sizePlayspace + 1, i, NOTE_OFF);
    }
};

init_notes = function () {
    for (var i = 2; i < sizePlayspace; i++) {
        PS.color(i, 0, colorNoteBG);
        PS.color(0, i, colorNoteBG);
        PS.color(i, sizePlayspace + 1, colorNoteBG);
        PS.color(sizePlayspace + 1, i, colorNoteBG);
        PS.gridColor(colorBG2);


        PS.fade(i, 0, 20);
        PS.fade(0, i, 20);
        //PS.borderFade(i, sizePlayspace + 1, 20);
        //PS.borderFade(sizePlayspace + 1, i, 20);

        PS.statusColor(colorGumBG);
        PS.data(i, 0, NOTE_OFF);
        PS.data(0, i, NOTE_OFF);
        PS.data(i, sizePlayspace + 1, NOTE_OFF);
        PS.data(sizePlayspace + 1, i, NOTE_OFF);
    }
};

//init_drums = function () {
//    for (var i = 1; i < sizePlayspace + 1; i++) {
//        PS.color(i, sizePlayspace + 3, colorDrumBG);
//        PS.color(i, sizePlayspace + 4, colorDrumBG);
//		//PS.borderFade(i, sizePlayspace + 3, 20);
//		//PS.borderFade(i, sizePlayspace + 4, 20);
//    }
//};

init_walls = function () {
    //top left
    PS.color(0, 0, colorWalls);
    PS.color(0, 1, colorWalls);
    PS.color(1, 0, colorWalls);
    //top right
    PS.color(sizePlayspace + 1, 0, colorWalls);
    PS.color(sizePlayspace + 1, 1, colorWalls);
    PS.color(sizePlayspace, 0, colorWalls);
    //bottom left
    PS.color(0, sizePlayspace, colorWalls);
    PS.color(0, sizePlayspace + 1, colorWalls);
    PS.color(1, sizePlayspace + 1, colorWalls);
    //bottom right
    PS.color(sizePlayspace + 1, sizePlayspace + 1, colorWalls);
    PS.color(sizePlayspace + 1, sizePlayspace, colorWalls);
    PS.color(sizePlayspace, sizePlayspace + 1, colorWalls);


    //old drum code
    //for (var i = 1; i < sizePlayspace + 1; i++) {
    //    PS.color(i, sizePlayspace + 2, colorWalls);
    //}
    ////PS.color(0, sizePlayspace + 3, colorWalls);
    ////PS.color(sizePlayspace + 1, sizePlayspace + 3, colorWalls);
    ////PS.color(0, sizePlayspace + 4, colorWalls);
    ////PS.color(sizePlayspace + 1, sizePlayspace + 4, colorWalls);
    //
    //PS.color(5, sizePlayspace + 3, colorBG);
    //PS.color(5, sizePlayspace + 4, colorBG);
    //
    //PS.color(1, 1, colorNoteBG);
    //PS.color(1, sizePlayspace, colorNoteBG);
    //PS.color(sizePlayspace, 1, colorNoteBG);
    //PS.color(sizePlayspace, sizePlayspace, colorNoteBG);

};

init_sound = function () {

    //assign simple names to all instruments
    kick = "perc_drum_bass";
    snare = "perc_drum_snare";
    lTom = "perc_drum_tom3";
    mTom = "perc_drum_tom2";
    hTom = "perc_drum_tom1";
    oHH = "perc_hihat_pedal";
    cHH = "perc_hihat_closed";



    PS.audioLoad(kick, {lock: true});
    PS.audioLoad(snare, {lock: true});
    PS.audioLoad(lTom, {lock: true});
    PS.audioLoad(hTom, {lock: true});
    PS.audioLoad(oHH, {lock: true});
    PS.audioLoad(cHH, {lock: true});
    PS.audioLoad(mTom, {lock: true});
};

grow = function (x, y) {
    var data = PS.data(x, y);
    if (data < NOTE_OFF) { //If it's a bubble, make it grow (subtract from data)
        if (!(edit)) {
            PS.data(x, y, (data - 1));
        }
        if (edit) {
            if (data == 0) {
                PS.data(x, y, 3);
            } else {
                PS.data(x, y, (data - 1));
            }
        }
        data = PS.data(x, y); //update the data var
        if ((data == 0) && !(edit)) {
            pop(x, y);
        }
        update_bubble(x, y, data);
    } else {
        if (hasBegun){
            if (data == NOTE_OFF + NUM_NOTES) {
                PS.data(x, y, NOTE_OFF);
                data = PS.data(x, y);
            } else {
                PS.data(x, y, data + 1);
            }
            update_bubble(x, y);
        }
    }
};

pop = function (x, y) {

    var on = true;
    var off = false;

    var upC = y - 1;
    var downC = y + 1;
    var rightC = x + 1;
    var leftC = x - 1;

    var up = on;
    var down = on;
    var left = on;
    var right = on;

    var popTimer;


    PS.gridPlane(8);
    PS.borderColor(x, y, colorGumBG);
    PS.gridPlane(0);

    //vertical fader
    missile_fader_V = function (C, visible) {
        PS.gridPlane(1);
        if (visible == true) {
            PS.alpha(x, C, PS.ALPHA_OPAQUE);
            PS.color(x, C, colorMissile);
        }
        if (visible == false) {
            PS.alpha(x, C, PS.ALPHA_TRANSPARENT);
        }
        PS.gridPlane(0);
    };

    //horizontal fader
    missile_fader_H = function (C, visible) {
        PS.gridPlane(1);
        if (visible == true) {
            PS.alpha(C, y, PS.ALPHA_OPAQUE);
            PS.color(C, y, colorMissile);
        }
        if (visible == false) {
            PS.alpha(C, y, PS.ALPHA_TRANSPARENT);
        }
        PS.gridPlane(0);
    };

    missile_kill = function () {
        PS.gridPlane(1);
        PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_TRANSPARENT);
        PS.gridPlane(0);
    };

    missiles = function () {
        //while (finished != true) {
        if (up == on) {
            //Move the missile upwards
            missile_fader_V(upC, true);
            missile_fader_V(upC + 1, false);

            if (PS.data(x, upC) == 0) {
                upC -= 1;   //If it's an empty space, move the check-er upwards
            } else {  //If it collides, turn off the missile and grow the space
                grow(x, upC);
                up = off;
                missile_fader_V(upC, false);
            }

        }
        if (down == on) {
            //Move the missile downwards
            //missile_fader(downC, true);
            missile_fader_V(downC, true);
            missile_fader_V(downC - 1, false);

            if (PS.data(x, downC) == 0) {
                downC += 1;   //If it's an empty space, move the check-er downward
            } else {  //If it collides, turn off the missile and grow the space
                grow(x, downC);
                down = off;
                missile_fader_V(downC, false);
            }

        }
        if (left == on) {
            //Move the missile leftwards
            missile_fader_H(leftC, true);
            missile_fader_H(leftC + 1, false);

            if (PS.data(leftC, y) == 0) {
                leftC -= 1;   //If it's an empty space, move the check-er left
            } else {  //If it collides, turn off the missile and grow the space
                grow(leftC, y);
                left = off;
                missile_fader_H(leftC, false);
            }

        }
        if (right == on) {
            //Move the missile rightwards
            missile_fader_H(rightC, true);
            missile_fader_H(rightC - 1, false);

            if (PS.data(rightC, y) == 0) {
                rightC += 1;   //If it's an empty space, move the check-er right
            } else {  //If it collides, turn off the missile and grow the space
                grow(rightC, y);
                right = off;
                missile_fader_H(rightC, false);

            }

        }
        if ((!(right) && !(left)) && (!(down) && !(up))) {
            //finished = true;
            missile_kill();
            PS.timerStop(popTimer);
        }
        //}
    };


    popTimer = PS.timerStart(fps, missiles);

    gumToPop = gumToPop - 1;

    PS.audioPlay(A.fx_pop);

    if (gumToPop == 0) {

        victory();

    }

};

update_bubble = function (x, y) {
    var data = PS.data(x, y);
    if (data < 5) {
        switch (data) {
            case 0:  //A popped bubble
                PS.color(x, y, colorGumBG);
                PS.radius(x, y, 0);
                break;
            case 1: //A Large (ready to be popped) bubble
                PS.color(x, y, colorGumL);
                PS.bgColor(x, y, colorGumBG);
                PS.bgAlpha(x, y, PS.ALPHA_OPAQUE);
                PS.radius(x, y, 20);
                break;
            case 2: //A Medium bubble
                PS.color(x, y, colorGumM);
                PS.bgColor(x, y, colorGumBG);
                PS.bgAlpha(x, y, PS.ALPHA_OPAQUE);
                PS.radius(x, y, 40);
                break;
            case 3: //A Small bubble
                PS.color(x, y, colorGumS);
                PS.bgColor(x, y, colorGumBG);
                PS.bgAlpha(x, y, PS.ALPHA_OPAQUE);
                PS.radius(x, y, 50);
                break;
        }
    } else {

        //Code for causing notes to pulse on interaction
        var borderKillerTimer;

        function borderKiller(){
            PS.border(x, y, 0);
            PS.border(x, y, PS.ALPHA_TRANSPARENT);
            PS.timerStop(borderKillerTimer);
        }

        PS.border(x, y, 5);
        PS.borderAlpha(x, y, PS.ALPHA_OPAQUE);
        PS.borderColor(x, y, colorNoteBG);

        borderKillerTimer = PS.timerStart(20, borderKiller);

        if (data == NOTE_OFF) {
            PS.color(x, y, colorNoteBG);
        } else {
            PS.color(x, y, colorNotes[data - 6]);
        }
    }
};

place_bubble = function (x, y, size) {
    x *= 2;
    y *= 2;
    PS.data(x, y, size);
    update_bubble(x, y, size);
};

game_over = function () {
    var deathTimerCounter = 0;
    var deathTimerCounter2 = 3;
    var deathTimer = PS.timerStart(30, deathShow);
    var deathTimer2;

    function deathShow() {
        "use strict";
        if (deathTimerCounter == 1) {
            PS.statusText("Try Again!");
            PS.gridFade(30);
            PS.gridColor(PS.COLOR_BLACK);
            PS.timerStop(deathTimer);
            deathTimer2 = PS.timerStart(60, deathShow2);

        }
        deathTimerCounter++;
    }

    function deathShow2() {
        "use strict";
        if (deathTimerCounter2 > 0) {
            //PS.statusText("Resetting in... " + deathTimerCounter2);
            deathTimerCounter2--;

        } else {
            if(currentLevel < 9){
                PS.gridColor(colorBG2);
            }
            if((currentLevel > 9) && (currentLevel < 14)){
                PS.gridColor(colorBG3);
            }
            if((currentLevel >= 14)){
                PS.gridColor(colorBG4);
            }
            load_level(currentLevel);
            PS.timerStop(deathTimer2);
        }
    }

};

title = function () {
    PS.statusText("LEVEL " + currentLevel + "  //  " + clickRemaining + " clicks left!");
};

victory = function () {
    PS.statusText("Level Complete!");
    isBreathingSpace = true;
    var vTimer;
    if(!hasBegun){
        currentLevel++;
        switch(currentLevel){
            case 2:
                setTimeout(level_two, 2100);
                setTimeout(title, 2500);
                break;
            case 3:
                setTimeout(level_three, 2100);
                setTimeout(title, 2500);
                break;
            case 4:
                var vTimer4;
                function start_four_timer(){
                    vTimer4 = PS.timerStart(20, is_phrase_four_done);
                }
                function is_phrase_four_done(){
                    if(time==16) {
                        load_level(4);
                        PS.timerStop(vTimer4);
                    }
                }

                setTimeout(start_four_timer, 2100);
                //setTimeout(level_four, 2100);
                //setTimeout(title, 2500);

                break;
        }
    } else {
        function start_v_timer() {
            vTimer = PS.timerStart(20, is_phrase_done);
        }


        setTimeout(start_v_timer, 500);


        function is_phrase_done() {
            if (time == 16) {
                    load_level(currentLevel + 1);

                PS.timerStop(vTimer);
            }
        }

        //var winTimerCounter = 0;
        //var winTimer = PS.timerStart(60, winShow);
        //var winTimer2;
        //
        //function winShow(){
        //    "use strict";
        //    if(winTimerCounter == 1){
        //        PS.statusText("LEVEL COMPLETE!");
        //        PS.timerStop(winTimer);
        //        winTimerCounter = 0;
        //	nextLevel();
        //        winTimer2 = PS.timerStart(60, nextLevel);
        //    }
        //    winTimerCounter++;
        //}
        //function nextLevel(){
        //    if(winTimerCounter == 1){
        //        load_level(currentLevel+1);
        //        PS.timerStop(winTimer2);
        //    }
        //    winTimerCounter++;
        //}
    }
};

lock_gum = function(x, y){
    unclickablesX.push(x);
    unclickablesY.push(y);
    PS.gridPlane(8);
    PS.border(x*2, y*2, 10);
    PS.borderColor(x*2, y*2, colorLock);
    PS.borderAlpha(x*2, y*2, PS.ALPHA_OPAQUE);
    PS.gridPlane(0);
};

clear_locked_gum = function(){
    unclickablesX = [];
    unclickablesY = [];
    PS.gridPlane(8);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.gridPlane(0);
};

stop_breathing_room = function(){
    isBreathingSpace = false;
};

load_level = function (level) {
    clear_locked_gum();
    setTimeout(stop_breathing_room, 1500);
    var over = false;
    currentLevel = level;
    switch (level) {
        case 0:
            level_test();
            break;
        case 1:
            level_one();
            break;
        case 2:
            level_two();
            break;
        case 3:
            level_three();
            break;
        case 4:
            level_four();
            break;
        case 5:
            level_five();
            break;
        case 6:
            level_six();
            break;
        case 7:
            level_seven();
            break;
        case 8:
            level_eight();
            break;
        case 9:
            init_notes();
            //TODO NEW BG COLOR
            PS.gridColor(colorBG3);
            level_nine();
            break;
        case 10:
            level_ten();
            break;
        case 11:
            level_eleven();
            break;
        case 12:
            level_twelve();
            break;
        case 13:
            level_thirteen();
            break;
        case 14:
            init_notes();
            PS.gridColor(colorBG4);
            //TODO NEW BG COLOR
            level_fourteen();
            break;
        case 15:
            level_fifteen();
            break;
        case 16:
            level_sixteen();
            break;
        case 17:
            level_seventeen();
            break;
        case 18:
            level_eighteen();
            break;
        case 19:
            level_nineteen();
            break;
        case 20:
            level_twenty();
            break;

        default:
            over = true;
            break;
    }

    if (over) {
        var beatentime = Math.round(new Date().getTime() / 1000) - time2beat;
        var minutes = 0;
        while ((beatentime - 60) >= 0) {
            beatentime -= 60;
            minutes++;
        }
        if(beatentime < 10){
            beatentime = "0" + beatentime;
        }
        PS.statusText("YOU WON IT!    Completion Time: " + minutes + ":" + beatentime);
        lesley_memory = function(){
            PS.statusText("In memory of Lesley Gore (1946 - 2015)");
            PS.gridSize(32, 32);
            PS.border(PS.ALL, PS.ALL, 0);
            PS.gridColor(PS.COLOR_BLACK);
            PS.statusColor(PS.COLOR_WHITE);
            metroAlpha = 0;
            var plane = 10;
            load_gore = function(){
                loader = function (data) {
                    var gore = PS.spriteImage(data);
                    PS.spritePlane(gore, plane);
                    PS.spriteMove(gore, 0, 0);
                };

                PS.imageLoad("lesley_0.png", loader);
            }

            load_gore();
        };

        play_again = function(){
            PS.statusText("Refresh the page to play again!");
            PS.statusFade(0);
        };
        setTimeout(lesley_memory, 5000);
        setTimeout(play_again, 10000);

    } else {
        PS.statusText("LEVEL " + currentLevel + "  //  " + clickRemaining + " clicks left!");
    }

    //paint_drums();
};

check_complete = function () {
    var solved = true;

    for (var x = 2; x < sizePlayspace; x += 2) {
        for (var y = 2; y < sizePlayspace; y += 2) {
            if (PS.data(x, y) != 0) {
                //x = sizePlayspace;
                //y = sizePlayspace;
                solved = false;
            }
        }
    }
    if (!solved && !isBreathingSpace) {
        game_over();
    }
};

save_level = function () {
    var size;
    var bubbles = 0;
    PS.debug("\nlevel_NUMBER = function() {\n");
    PS.debug("\tclickRemaining = " + clicksEdit + ";\n\n");

    for (var x = 2; x < sizePlayspace; x++) {
        for (var y = 2; y < sizePlayspace; y++) {
            size = PS.data(x, y);
            switch (size) {
                case 0: //for empty
                    break;
                case 1: //for big
                    bubbles++;
                    PS.debug("\tplace_bubble(" + (x / 2) + ", " + (y / 2) + ", BIG);\n");
                    break;
                case 2: //for medium
                    bubbles++;
                    PS.debug("\tplace_bubble(" + (x / 2) + ", " + (y / 2) + ", MED);\n");
                    break;
                case 3: //for small
                    bubbles++;
                    PS.debug("\tplace_bubble(" + (x / 2) + ", " + (y / 2) + ", SMALL);\n");
                    break;
            }
        }
    }
    PS.debug("\n\tgumToPop = " + bubbles + ";\n");
    PS.debug("\nbeats = [\n\t\t\t[kick], 			//beat 1\n\t\t\t[cHH, snare], 		//beat 2\n\t\t\t[kick],  			" +
        "//beat 3\n\t\t\t[cHH, snare, kick], //beat 4\n\t\t\t[kick],  			//beat 5\n\t\t\t[cHH, snare], 		" +
        "//beat 6\n\t\t\t[NOTE_OFF],  		//beat 7\n\t\t\t[lTom, snare] 		//beat 8\n\t\t]\n};");
};

toggle_editor = function () {
    var color;
    if (edit == false) {
        canClick = true;
        PS.statusText("Editor Enabled");
        edit = true;
        color = PS.COLOR_WHITE;
        PS.glyph(10, 10, clicksEdit);
        PS.glyphColor(10, 10, PS.COLOR_BLACK);
        PS.color(10, 10, color);

    } else {
        PS.statusText("Editor Disabled");
        edit = false;
        color = colorGumBG;
        PS.glyph(10, 10, clicksEdit);
        PS.color(10, 10, colorWalls);
        PS.glyphColor(10, 10, colorWalls);
        clickRemaining = clicksEdit;
    }

    init_playspace(color);

    if (edit) {
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 4; j++) {
                if (PS.data(i * 2, j * 2) == 0) {
                    place_bubble(i, j, 0);
                }
            }
        }
    }

    PS.color(1, 1, colorNoteBG);
    PS.color(1, sizePlayspace, colorNoteBG);
    PS.color(sizePlayspace, 1, colorNoteBG);
    PS.color(sizePlayspace, sizePlayspace, colorNoteBG);
};

increment_edit = function () {
    if (clicksEdit == 9) {
        clicksEdit = 0;
    }
    clicksEdit++;
    PS.glyph(10, 10, String(clicksEdit));
};

//paint_drums = function () {
//    for (var i = 1; i <= 4; i++) {
//        if (beats[i - 1][0] != NOTE_OFF) {
//            PS.color(i, 12, colorDrum);
//            PS.color(i, 13, colorDrum);
//        }
//    }
//
//    for (var i = 5; i <= 8; i++) {
//        if (beats[i - 1][0] != NOTE_OFF) {
//            PS.color(i + 1, 12, colorDrum);
//            PS.color(i + 1, 13, colorDrum);
//        }
//    }
//};

music_reveal = function () {

};

level_test = function() {
    clickRemaining = 1;

    place_bubble(2, 1, BIG);
    place_bubble(2, 2, BIG);
    place_bubble(3, 1, MED);
    place_bubble(3, 2, MED);
    place_bubble(4, 1, SMALL);
    place_bubble(4, 2, SMALL);

    lock_gum(2, 2);
    lock_gum(3, 2);
    lock_gum(4, 2);

    gumToPop = 6;

    beats = [
        [NOTE_OFF], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [NOTE_OFF],  			//beat 3
        [NOTE_OFF], //beat 4
        [NOTE_OFF],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [NOTE_OFF],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};
level_one = function () {

    clickRemaining = 2;
    gumToPop = 2;

    place_bubble(2, 3, BIG);
    place_bubble(3, 2, BIG);



    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [NOTE_OFF],  			//beat 3
        [NOTE_OFF], //beat 4
        [NOTE_OFF],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [NOTE_OFF],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_two = function () {
    clickRemaining = 1;
    gumToPop = 3;

    place_bubble(1, 1, BIG);
    place_bubble(1, 4, BIG);
    place_bubble(4, 4, BIG);


    beats = [
        [NOTE_OFF], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [NOTE_OFF],  			//beat 3
        [NOTE_OFF], //beat 4
        [NOTE_OFF],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [NOTE_OFF],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_three = function () {
    clickRemaining = 1;
    gumToPop = 1;

    place_bubble(2, 3, BIG);

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [NOTE_OFF],  			//beat 3
        [NOTE_OFF], //beat 4
        [NOTE_OFF],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [NOTE_OFF],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_four = function () {
    clickRemaining = 2;
    gumToPop = 4;

    place_bubble(2, 1, BIG);
    place_bubble(1, 3, BIG);
    place_bubble(2, 3, MED);
    place_bubble(4, 3, BIG);

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [NOTE_OFF],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [NOTE_OFF],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_five = function () {
    clickRemaining = 2;
    gumToPop = 8;
    place_bubble(1, 3, BIG);
    place_bubble(2, 2, BIG);
    place_bubble(2, 4, BIG);
    place_bubble(3, 1, MED);
    place_bubble(3, 3, MED);
    place_bubble(4, 1, BIG);
    place_bubble(4, 3, BIG);
    place_bubble(4, 4, MED);

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [kick],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [kick],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_six = function () {
    clickRemaining = 2;
    gumToPop = 4;
    place_bubble(2, 1, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(2, 3, SMALL);
    place_bubble(4, 3, BIG);

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [snare],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [snare],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_seven = function() {
    clickRemaining = 3;

    place_bubble(1, 2, BIG);
    place_bubble(1, 3, SMALL);
    place_bubble(1, 4, BIG);
    place_bubble(2, 3, MED);
    place_bubble(2, 4, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 4, BIG);

    gumToPop = 7;

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [snare, kick],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [snare, kick],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_eight = function() {
    clickRemaining = 1;

    place_bubble(1, 2, MED);
    place_bubble(2, 2, BIG);
    place_bubble(4, 2, BIG);

    gumToPop = 3;

    beats = [
        [kick], 			//beat 1
        [oHH], 		//beat 2
        [snare],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [kick],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_nine = function() {
    clickRemaining = 2;

    place_bubble(1, 1, MED);
    place_bubble(1, 3, BIG);
    place_bubble(2, 3, BIG);
    place_bubble(3, 1, BIG);
    place_bubble(3, 2, BIG);
    place_bubble(3, 4, MED);
    place_bubble(4, 3, MED);

    gumToPop = 7;

    beats = [
        [kick], 			//beat 1
        [oHH], 		//beat 2
        [snare],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [kick, snare],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_ten = function() {
    clickRemaining = 1;

    place_bubble(1, 2, BIG);
    place_bubble(2, 1, BIG);
    place_bubble(2, 2, BIG);
    place_bubble(3, 2, SMALL);
    place_bubble(3, 4, BIG);
    place_bubble(4, 1, SMALL);
    place_bubble(4, 2, BIG);
    place_bubble(4, 3, BIG);
    place_bubble(4, 4, BIG);

    gumToPop = 9;

    beats = [
        [kick], 			//beat 1
        [oHH, kick], 		//beat 2
        [snare],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [kick, snare],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_eleven = function() {
    clickRemaining = 3;

    place_bubble(1, 1, MED);
    place_bubble(4, 1, BIG);
    place_bubble(4, 4, MED);
    lock_gum(4, 1);

    gumToPop = 3;

    beats = [
        [kick], 			//beat 1
        [oHH, kick], 		//beat 2
        [snare],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [oHH], 		//beat 6
        [kick, snare],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_twelve = function() {
    clickRemaining = 3;

    place_bubble(1, 3, BIG);
    place_bubble(2, 1, BIG);
    place_bubble(2, 2, MED);
    place_bubble(2, 4, BIG);
    place_bubble(3, 3, MED);
    place_bubble(3, 4, MED);
    place_bubble(4, 1, BIG);
    place_bubble(4, 3, BIG);

    lock_gum(2, 2);
    lock_gum(3, 3);
    gumToPop = 8;

    beats = [
        [kick], 			//beat 1
        [oHH, kick], 		//beat 2
        [snare],  			//beat 3
        [oHH], //beat 4
        [kick],  			//beat 5
        [oHH], 		//beat 6
        [kick, snare],  		//beat 7
        [oHH] 		//beat 8
    ]
};

level_thirteen = function() {
    clickRemaining = 3;

    place_bubble(1, 2, MED);
    place_bubble(1, 3, BIG);
    place_bubble(2, 2, BIG);
    place_bubble(3, 2, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 3, MED);
    place_bubble(4, 4, MED);

    lock_gum(4, 3);

    gumToPop = 7;

    beats = [
        [kick], 			//beat 1
        [NOTE_OFF], 		//beat 2
        [kick],  			//beat 3
        [NOTE_OFF], //beat 4
        [kick],  			//beat 5
        [NOTE_OFF], 		//beat 6
        [kick],  		//beat 7
        [NOTE_OFF] 		//beat 8
    ]
};

level_fourteen = function() {
    clickRemaining = 1;

    place_bubble(1, 2, BIG);
    place_bubble(2, 2, BIG);
    place_bubble(2, 3, BIG);
    place_bubble(4, 2, MED);
    place_bubble(4, 3, MED);

    lock_gum(4, 3);
    gumToPop = 5;

    beats = [
        [kick], 			//beat 1
        [snare], 		//beat 2
        [kick],  			//beat 3
        [snare], //beat 4
        [kick],  			//beat 5
        [snare], 		//beat 6
        [kick],  		//beat 7
        [snare] 		//beat 8
    ]
};

level_fifteen = function() {
    clickRemaining = 2;

    place_bubble(1, 2, SMALL);
    place_bubble(1, 3, BIG);
    place_bubble(3, 1, BIG);
    place_bubble(3, 2, BIG);
    place_bubble(3, 3, BIG);
    place_bubble(4, 2, SMALL);
    place_bubble(4, 3, BIG);

    gumToPop = 7;

    beats = [
        [kick], 			//beat 1
        [snare, hTom], 		//beat 2
        [kick, mTom],  			//beat 3
        [snare, lTom], //beat 4
        [kick],  			//beat 5
        [snare, hTom], 		//beat 6
        [kick, mTom],  		//beat 7
        [snare, lTom] 		//beat 8
    ]
};

level_sixteen = function() {
    clickRemaining = 2;

    place_bubble(1, 3, BIG);
    place_bubble(1, 4, BIG);
    place_bubble(2, 1, SMALL);
    place_bubble(2, 2, MED);
    place_bubble(2, 4, BIG);
    place_bubble(3, 1, MED);
    place_bubble(3, 3, BIG);
    place_bubble(3, 4, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 3, BIG);

    lock_gum(3, 1);
    lock_gum(4, 3);
    lock_gum(2, 4);
    gumToPop = 10;

    beats = [
        [kick, oHH], 			//beat 1
        [snare, hTom], 		//beat 2
        [kick, mTom],  			//beat 3
        [snare, lTom], //beat 4
        [kick, oHH],  			//beat 5
        [snare, hTom], 		//beat 6
        [kick, mTom],  		//beat 7
        [snare, lTom] 		//beat 8
    ]
};

level_seventeen = function() {
    clickRemaining = 2;

    place_bubble(1, 1, MED);
    place_bubble(1, 4, BIG);
    place_bubble(2, 3, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 2, MED);
    place_bubble(4, 3, BIG);
    place_bubble(4, 4, MED);

    lock_gum(4, 2);
    lock_gum(4, 3);

    gumToPop = 7;

    beats = [
        [kick, oHH], 			//beat 1
        [snare, hTom], 		//beat 2
        [kick, mTom, oHH],  			//beat 3
        [snare, lTom], //beat 4
        [kick, oHH],  			//beat 5
        [snare, hTom], 		//beat 6
        [kick, mTom, oHH],  		//beat 7
        [snare, lTom] 		//beat 8
    ]
};

level_eighteen = function() {
    clickRemaining = 3;

    place_bubble(1, 1, BIG);
    place_bubble(1, 2, MED);
    place_bubble(1, 4, BIG);
    place_bubble(2, 2, SMALL);
    place_bubble(2, 3, BIG);
    place_bubble(3, 3, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 2, MED);
    place_bubble(4, 4, BIG);

    lock_gum(1, 4);
    lock_gum(4, 4);

    gumToPop = 9;

    beats = [
        [kick, oHH], 			//beat 1
        [kick, snare, hTom, cHH], 		//beat 2
        [mTom, oHH],  			//beat 3
        [kick, snare, lTom, cHH], //beat 4
        [oHH],  			//beat 5
        [kick, snare, hTom, cHH], 		//beat 6
        [kick, mTom, oHH],  		//beat 7
        [snare, lTom, cHH] 		//beat 8
    ]
};

level_nineteen = function() {
    clickRemaining = 1;

    place_bubble(1, 2, BIG);
    place_bubble(2, 1, BIG);
    place_bubble(2, 2, MED);
    place_bubble(2, 3, MED);
    place_bubble(3, 2, BIG);
    place_bubble(4, 1, BIG);
    place_bubble(4, 2, BIG);
    place_bubble(4, 4, BIG);

    lock_gum(2, 2);
    lock_gum(2, 3);

    gumToPop = 8;

    beats = [
        [kick, oHH], 			//beat 1
        [kick, snare, hTom, oHH], 		//beat 2
        [mTom, oHH],  			//beat 3
        [kick, snare, lTom, oHH], //beat 4
        [oHH],  			//beat 5
        [kick, snare, hTom, oHH], 		//beat 6
        [kick, mTom, oHH],  		//beat 7
        [snare, lTom, oHH] 		//beat 8
    ]
};

level_twenty = function() {
    clickRemaining = 5;

    place_bubble(1, 1, MED);
    place_bubble(1, 2, MED);
    place_bubble(1, 3, MED);
    place_bubble(1, 4, MED);
    place_bubble(2, 2, BIG);
    place_bubble(2, 4, MED);
    place_bubble(3, 1, BIG);
    place_bubble(3, 3, MED);
    place_bubble(4, 1, MED);
    place_bubble(4, 2, MED);
    place_bubble(4, 3, MED);
    place_bubble(4, 4, MED);

    lock_gum(1, 2);
    lock_gum(1, 3);
    lock_gum(1, 4);
    lock_gum(4, 2);
    lock_gum(4, 3);
    lock_gum(4, 4);

    gumToPop = 12;

    beats = [
        [kick, oHH], 			//beat 1
        [kick, snare, hTom, oHH], 		//beat 2
        [mTom, oHH, kick],  			//beat 3
        [kick, snare, lTom, oHH], //beat 4
        [oHH, mTom],  			//beat 5
        [kick, snare, hTom, oHH], 		//beat 6
        [kick, mTom, oHH],  		//beat 7
        [snare, lTom, oHH] 		//beat 8
    ]
};

clickEnabler = function(){
    canClick = true;
};

PS.init = function (system, options) {
    "use strict";


    PS.gridSize(11, 11);

    PS.border(PS.ALL, PS.ALL, 0);

    define_colors();


    PS.color(PS.ALL, PS.ALL, colorBG);
    PS.gridColor(colorBG);
    PS.gridFade(20);

    init_sound();
    init_playspace(colorGumBG);
    init_noteOff();
    init_walls();
    A.init_audio();

    PS.fade(PS.ALL, PS.ALL, 20);
    PS.gridPlane(1);
    PS.fade(PS.ALL, PS.ALL, 20);
    PS.gridPlane(0);

    PS.border(PS.ALL, PS.ALL, 0);

    clickTimer = PS.timerStart(clickTimerTempo, clickEnabler);
    load_level(currentLevel);


    time2beat = Math.round(new Date().getTime() / 1000);
    PS.statusText("LEVEL " + currentLevel + "  //  " + clickRemaining + " clicks left!");

};

PS.touch = function (x, y, data, options) {
    var locked = false;

    if(canPlayAgain){
        canPlayAgain = false;
        PS.gridSize(11, 11);
        PS.init();
        load_level(4);
        return;
    }
    //If the click is within the applicable playspace AND the space is not empty, grow the bubble
    if (canClick) {
        if(!edit){
            canClick = false;
        }
        if (((x > 1) && (x < sizePlayspace)) && ((y > 1) && (y < sizePlayspace))) {
            if (edit) {
                if ((x % 2 == 0) && (y % 2 == 0)) {
                    grow(x, y);
                }
            } else {
                if ((PS.data(x, y)  != 0) && clickRemaining > 0) {
                    if ((!(hasBegun)) && (currentLevel == REVEAL_LEVEL)) {
                        init_notes();
                        timer = PS.timerStart(TEMPO, metro.next_beat);
                    }

                    // Check if it is locked
                    for(var i = 0; i<unclickablesX.length; i++){
                        if(unclickablesX[i] == x/2){
                            if(unclickablesY[i] == y/2){
                                locked = true;
                            }
                        }
                    }

                    if(!locked){
                        grow(x, y);
                        PS.audioPlay(A.fx_click);
                        clickRemaining--;
                    }else{
                        PS.audioPlay(A.fx_unclickable);
                    }
                    /**/
                    if(gumToPop != 0){
                        PS.statusText("LEVEL " + currentLevel + "  //  " + clickRemaining + " clicks left!");
                    }
                    if (clickRemaining == 0) {
                        setTimeout(check_complete, 2000);
                    }
                }
            }
        }

        if ((x == 10 && y == 10) && edit) {
            increment_edit();
        }

    }
    //PS.debug(PS.data(x, y));
};


PS.release = function (x, y, data, options) {
    "use strict";
};


PS.enter = function (x, y, data, options) {
    if(edit){
        unclickX = x;
        unclickY = y;
    }
    "use strict";
};


PS.exit = function (x, y, data, options) {
    "use strict";
};


PS.exitGrid = function (options) {
    "use strict";
};

PS.keyDown = function (key, shift, ctrl, options) {
    "use strict";

    /*
     if (key == 32) {
     toggle_editor();
     PS.glyph(10, 10, String(clicksEdit));
     }
     if ((key == 115) && edit) {
     save_level();
     }
     */

    /* a cheat: */
    if ((key == 72) && !edit && shift && ctrl){
        currentLevel = 19;
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


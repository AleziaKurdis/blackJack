"use strict";
//
//  displayer.js
//
//  Created by Alezia Kurdis on November 30th, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Black Jack game - displayer script.
//  display cards, actions and money.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
    var channelComm = "ak.blackJack.ac.communication"; 
  
    var jsMainFileName = "displayer.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;

    this.preload = function(entityID) {
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;

        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);

    }
    

    function onMessageReceived(channel, message, sender, localOnly) {
        var playerNo;
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "#######" && data.avatarID === MyAvatar.sessionUUID) {
                playerNo = parseInt(data.playerNo, 10);
            } else if (data.action === "DISPLAY_CARDS") {
                playerNo = parseInt(data.playerNo, 10); //player 1 to 4, 0 being the croupier
                displayHand(playerNo, data.hand);
            } else if (data.action === "CLEAR_ALL_CARDS") {
                clearAllCards();
            } else if (data.action === "DISPLAY_PLAYER_MONEY") {
                playerNo = parseInt(data.playerNo, 10);
                drawPlayerMoney(playerNo, data.amount, data.avatarID);
            } else if (data.action === "CLEAR_PLAYER_MONEY") {
                playerNo = parseInt(data.playerNo, 10);
                clearPlayerMoney(playerNo);
            }
        }
    }

    var playersCardsIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var cardHandlerPosition = [
        {"localPosition": {"x": 0.1343, "y": 1.0664, "z": -0.4646}, "rotation": 0}, //croupier
        {"localPosition": {"x": 0.7583, "y": 1.0664, "z": -0.4363}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.3689, "y": 1.0664, "z": -0.8022}, "rotation": 18}, //player 2 
        {"localPosition": {"x": -0.1467, "y": 1.0664, "z": -0.8686}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.6194, "y": 1.0664, "z": -0.6026}, "rotation": -54}, //player 4
    ];

    function displayHand(playerNo, handArray) {
        if (playersCardsIDs[playerNo] !== Uuid.NULL) {
            Entities.deleteEntity(playersCardsIDs[playerNo]);
            playersCardsIDs[playerNo] = Uuid.NULL;
        }
        //create handler
        playersCardsIDs[playerNo] = Entities.addEntity({
            "parentID": thisEntityID,
            "renderWithZones": thisRenderWithZones,
            "localPosition": cardHandlerPosition[playerNo].localPosition,
            "localRotation": Quat.fromVec3Degrees({"x": 90, "y": cardHandlerPosition[playerNo].rotation, "z": 180}),
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {"x": 0.01, "y": 0.01, "z": 0.01},
            "name": "Player_" + playerNo + "_cardsHandler",
            "visible": false,
            "grab": {
                "grabbable": false
            }
        },"local");
        var position, id;
        if (handArray.length !== 0) {
            for (var i = 0; i < handArray.length; i++) {
                position = {"x": (i * 0.07), "y": 0, "z": 0};
                if (handArray[i].suit !== "SPLIT") {
                    id = Entities.addEntity({
                        "parentID": playersCardsIDs[playerNo],
                        "renderWithZones": thisRenderWithZones,
                        "name": "Player_" + playerNo + "_Card_" + (i+1),
                        "localPosition": position,
                        "localRotation": Quat.fromVec3Degrees({"x": 0, "y": 0, "z": (Math.random() * 8) - 4}),
                        "dimensions": {"x": 0.06, "y": 0.10, "z": 0.01},
                        "grab": {
                            "grabbable": false
                        },
                        "imageURL": ROOT +  "cards/" + handArray[i].value + "_of_" + handArray[i].suit.toLowerCase() + ".svg",
                        "emissive": false,
                        "type": "Image"
                    },"local");
                }
            }
            if (handArray.length === 1) {
                position = {"x": 0.07, "y": 0, "z": 0};
                id = Entities.addEntity({
                    "parentID": playersCardsIDs[playerNo],
                    "renderWithZones": thisRenderWithZones,
                    "name": "Player_" + playerNo + "_Back",
                    "localPosition": position,
                    "localRotation": Quat.fromVec3Degrees({"x": 0, "y": 0, "z": (Math.random() * 8) - 4}),
                    "dimensions": {"x": 0.06, "y": 0.10, "z": 0.01},
                    "grab": {
                        "grabbable": false
                    },
                    "imageURL": ROOT +  "cards/back.svg",
                    "emissive": false,
                    "type": "Image"
                },"local");
            }
        }
    }

    function clearAllCards() {
        for (var i = 0; i < playersCardsIDs.length; i++) {
            if (playersCardsIDs[i] !== Uuid.NULL) {
                Entities.deleteEntity(playersCardsIDs[i]);
                playersCardsIDs[i] = Uuid.NULL;
            }
        }
    }

    var playersMoneyIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var playersMoneyHandlerPosition = [
        {"localPosition": {"x": 0, "y": 0, "z": 0}, "rotation": 0}, //croupier, NEVER USED
        {"localPosition": {"x": 0.6445, "y": 1.0664, "z": -0.7723}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.1106, "y": 1.0664, "z": -0.9917}, "rotation": 18}, //player 2 
        {"localPosition": {"x":-0.4990, "y": 1.0664, "z": -0.8618}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.9533, "y": 1.0664, "z": -0.3847}, "rotation": -54}, //player 4
    ];

    function drawPlayerMoney(playerNo, amount, avatarID) {
        clearPlayerMoney(playerNo);
        //create handler
        playersMoneyIDs[playerNo] = Entities.addEntity({
            "parentID": thisEntityID,
            "renderWithZones": thisRenderWithZones,
            "localPosition": playersMoneyHandlerPosition[playerNo].localPosition,
            "localRotation": Quat.fromVec3Degrees({"x": 90, "y": playersMoneyHandlerPosition[playerNo].rotation, "z": 180}),
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {"x": 0.01, "y": 0.01, "z": 0.01},
            "name": "Player_" + playerNo + "_MoneyHandler",
            "visible": false,
            "grab": {
                "grabbable": false
            }
        },"local");
        var autoChange = amountToAutoChange(amount);
        var actionScript = "";
        if (avatarID === MyAvatar.sessionUUID) {
            actionScript = ROOT + "betOneToken.js";
        }
        var nbrTokenInStack, stack, exponent, position;
        for (var i = autoChange.length - 1; i >= 0; i--) {
            stack = autoChange.substr(i, 1);
            if (stack === "T") {
                nbrTokenInStack = 10;
            } else {
                nbrTokenInStack = parseInt(stack, 10);
            }
            exponent = i - autoChange.length - 1;
            position = {"x": (-i * 0.055), "y": 0, "z": 0};
            genMoneyStack(playersMoneyIDs[playerNo], nbrTokenInStack, position, exponent, actionScript);
        }
    }

    function genMoneyStack(parentID, nbrTokenInStack, localPosition, exponent, actionScript) {
        var id = Entities.addEntity({
            "parentID": parentID,
            "renderWithZones": thisRenderWithZones,
            "name": "Money",
            "localPosition": localPosition,
            "localRotation": Quat.fromVec3Degrees({"x": 90, "y": 0, "z": 0}),
            "dimensions": {"x": 0.0508, "y": 0.007 * nbrTokenInStack, "z": 0.0508},
            "grab": {
                "grabbable": false
            },
            "modelURL": ROOT +  "tokens/token.fbx",
            "script": actionScript,
            "description": "" + (10^exponent),
            "useOriginalPivot": true,
            "type": "Model"
        },"local");
    }

    function clearPlayerMoney(playerNo) {
        if (playersMoneyIDs[playerNo] !== Uuid.NULL) {
            Entities.deleteEntity(playersMoneyIDs[playerNo]);
            playersMoneyIDs[playerNo] = Uuid.NULL;
        }
    }

    function amountToAutoChange(amount) {
        var strAmount = "" + amount;
        var autoChange = "";
        var mustDecrease = false;
        var strChar = "";
        var num = 0;
        for (var i = strAmount.length - 1; i >= 0; i--) {
            strChar = strAmount.substr(i, 1);
            if (mustDecrease) {
            	num = parseInt(strChar,10);
                num = num - 1;
                if (num === 0) {
                    if (i === 0) {
                        strChar = "";
                    } else {
                        strChar = "T";
                        mustDecrease = true;
                    }
                } else if (num === -1) {
                    if (i === 0) {
                        strChar = "";
                    } else {
                        strChar = "9";
                        mustDecrease = true; 
                    }
                } else {
                	strChar = "" + num;
                    mustDecrease = false;
                }
            } else {
                if (strChar === "0") {
                    strChar = "T";
                    mustDecrease = true;
                } else {
                    mustDecrease = false;
                }
            }
            autoChange = strChar + autoChange;
        }
        return autoChange;
    }

    this.unload = function(entityID) {
        /*
        if (Id !== Uuid.NULL) {
            Entities.deleteEntity(Id);
            Id = Uuid.NULL;
        }
        */
        clearAllCards();
        
        for (var i = 1; i < playersMoneyIDs.length; i++) {
            clearPlayerMoney(i);
        }
        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);

    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });    


    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

})

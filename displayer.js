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
    var SOUND_FLIP, SOUND_COINS;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;

        SOUND_FLIP = SoundCache.getSound(ROOT + "sounds/flip.wav");
        SOUND_COINS = SoundCache.getSound(ROOT + "sounds/coins.wav");

        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        Script.update.connect(myTimer);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        var playerNo;
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "DISPLAY_ACTIONS" && data.avatarID === MyAvatar.sessionUUID) {
                playerNo = parseInt(data.playerNo, 10);
                drawPlayerActions(playerNo, data.actionsList);
            } else if (data.action === "CLEAR_ACTIONS" && data.avatarID === MyAvatar.sessionUUID) {
                clearPlayerActions();
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
            } else if (data.action === "DISPLAY_PLAYER_BET") {
                playerNo = parseInt(data.playerNo, 10);
                drawPlayerBet(playerNo, data.amount, data.avatarID);
            } else if (data.action === "CLEAR_PLAYER_BET") {
                playerNo = parseInt(data.playerNo, 10);
                clearPlayerBet(playerNo);
            } else if (data.action === "DISPLAY_PLAYER_INSURANCE") {
                playerNo = parseInt(data.playerNo, 10);
                drawPlayerInsurance(playerNo, data.amount, data.avatarID);
            } else if (data.action === "CLEAR_PLAYER_INSURANCE") {
                playerNo = parseInt(data.playerNo, 10);
                clearPlayerInsurance(playerNo);
            } else if (data.action === "SOUND_FLIP") {
                var injectorOptions = {
                    "position": Entities.getEntityProperties(thisEntityID,["position"]).position,
                    "volume": 0.35,
                    "loop": false,
                    "localOnly": true
                };
                var injector = Audio.playSound(SOUND_FLIP, injectorOptions);
            } else if (data.action === "SOUND_COINS") {
                var injectorOptions2 = {
                    "position": MyAvatar.position,
                    "volume": 0.35,
                    "loop": false,
                    "localOnly": true
                };
                var injector2 = Audio.playSound(SOUND_COINS, injectorOptions2);
            }
        }
    }

    var playerActionsID = Uuid.NULL;
    var actionsHandlerPosition = [
        {"localPosition": {"x": 0, "y": 0, "z": 0}, "rotation": 0}, //croupier, NEVER USED.
        {"localPosition": {"x": 0.9995, "y": 1.073, "z": -0.4274}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.6020, "y": 1.073, "z": -0.9209}, "rotation": 18}, //player 2 
        {"localPosition": {"x": -0.0698, "y": 1.073, "z": -1.0932}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.7250, "y": 1.073, "z": -0.8095}, "rotation": -54}, //player 4
    ];
    
    function drawPlayerActions(playerNo, actionsList) {
        clearPlayerActions();
        playerActionsID = Entities.addEntity({
            "parentID": thisEntityID,
            "renderWithZones": thisRenderWithZones,
            "localPosition": actionsHandlerPosition[playerNo].localPosition,
            "localRotation": Quat.fromVec3Degrees({"x": 90, "y": actionsHandlerPosition[playerNo].rotation, "z": 180}),
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {"x": 0.01, "y": 0.01, "z": 0.01},
            "name": "Actions Handler",
            "visible": false,
            "grab": {
                "grabbable": false
            }
        },"local");
        
        var position, id, actionScript;
        if (actionsList.length > 0) {
            for (var i = 0; i < actionsList.length; i++) {
                position = {"x": (i * 0.07), "y": 0, "z": 0};
                actionScript = ROOT + "action_" + actionsList[i].toLowerCase() + ".js";
                id = Entities.addEntity({
                    "parentID": playerActionsID,
                    "renderWithZones": thisRenderWithZones,
                    "name": "Action_" + actionsList[i],
                    "localPosition": position,
                    "dimensions": {"x": 0.065, "y": 0.032, "z": 0.01},
                    "grab": {
                        "grabbable": false
                    },
                    "imageURL": ROOT +  "actions/" + actionsList[i].toLowerCase() + ".jpg",
                    "emissive": true,
                    "script": actionScript,
                    "type": "Image"
                },"local");
            }
        }
        //Countdown here!
        countDownPrefix = "";
        if (actionsList.length === 0) {
            countDownPrefix = "TIME TO BET: ";
        }
        countDown = 30;
        countDownID = Entities.addEntity({
            "parentID": playerActionsID,
            "renderWithZones": thisRenderWithZones,
            "name": "Action_Timer",
            "localPosition": {"x": (actionsList.length * 0.07) + 0.08, "y": 0, "z": -0.01},
            "dimensions": {"x": 0.15, "y": 0.025, "z": 0.01},
            "grab": {
                "grabbable": false
            },
            "text": countDownPrefix + countDown + " sec.",
            "textColor": {"red": 132, "green": 128, "blue": 255},
            "lineHeight": 0.015,
            "backgroundAlpha": 0,
            "unlit": true,
            "alignment": "left",
            "topMargin": 0.01,
            "type": "Text"
        },"local");
    }
    
    var countDown = 0;
    var countDownPrefix = "";
    var countDownID = Uuid.Null;
    var TIMER_INTERVAL = 1000; //1sec
    var processTimer = 0;
    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            countDown = countDown -1;
            if (countDown < 0) {
                countDown = 0;
            }
            if (countDownID !== Uuid.Null) {
                Entities.editEntity(countDownID, {"text": countDownPrefix + countDown + " sec."});
            }
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function clearPlayerActions() {
        if (playerActionsID !== Uuid.NULL) {
            Entities.deleteEntity(playerActionsID);
            playerActionsID = Uuid.NULL;
            countDownID = Uuid.Null;
        }
    }

    var playersCardsIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var cardHandlerPosition = [
        {"localPosition": {"x": 0.1343, "y": 1.0644, "z": -0.4646}, "rotation": 0}, //croupier
        {"localPosition": {"x": 0.7583, "y": 1.0644, "z": -0.4363}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.3689, "y": 1.0644, "z": -0.8022}, "rotation": 18}, //player 2 
        {"localPosition": {"x": -0.1467, "y": 1.0644, "z": -0.8686}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.6194, "y": 1.0644, "z": -0.6026}, "rotation": -54}, //player 4
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
        {"localPosition": {"x": 0.6445, "y": 1.063, "z": -0.7723}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.1106, "y": 1.063, "z": -0.9917}, "rotation": 18}, //player 2 
        {"localPosition": {"x":-0.4990, "y": 1.063, "z": -0.8618}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.9533, "y": 1.063, "z": -0.3847}, "rotation": -54}, //player 4
    ];

    function drawPlayerMoney(playerNo, amount, avatarID) {
        clearPlayerMoney(playerNo);
        //create handler
        if (amount > 0) {
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
                exponent = (autoChange.length - 1) - i;
                position = {"x": (-exponent * 0.055), "y": 0, "z": 0};
                genMoneyStack(playersMoneyIDs[playerNo], nbrTokenInStack, position, exponent, actionScript);
            }
        }
    }

    var playersBetIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var playersBetHandlerPosition = [
        {"localPosition": {"x": 0, "y": 0, "z": 0}, "rotation": 0}, //croupier, NEVER USED
        {"localPosition": {"x": 0.4706, "y": 1.049, "z": -0.4733}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.1160, "y": 1.049, "z": -0.6607}, "rotation": 18}, //player 2 
        {"localPosition": {"x":-0.2886, "y": 1.049, "z": -0.6022}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.6056, "y": 1.049, "z": -0.2858}, "rotation": -54}, //player 4
    ];

    function drawPlayerBet(playerNo, amount, avatarID) {
        clearPlayerBet(playerNo);
        //create handler
        if (amount > 0) {
            playersBetIDs[playerNo] = Entities.addEntity({
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": playersBetHandlerPosition[playerNo].localPosition,
                "localRotation": Quat.fromVec3Degrees({"x": 90, "y": playersBetHandlerPosition[playerNo].rotation, "z": 180}),
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
                actionScript = ROOT + "unbetOneToken.js";
            }
            var nbrTokenInStack, stack, exponent, position;
            for (var i = autoChange.length - 1; i >= 0; i--) {
                stack = autoChange.substr(i, 1);
                if (stack === "T") {
                    nbrTokenInStack = 10;
                } else {
                    nbrTokenInStack = parseInt(stack, 10);
                }
                exponent = (autoChange.length - 1) - i;
                position = {"x": (-exponent * 0.055), "y": 0, "z": 0};
                genMoneyStack(playersBetIDs[playerNo], nbrTokenInStack, position, exponent, actionScript);
            }
        }
    }

    var playersInsuranceIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var playersInsuranceHandlerPosition = [
        {"localPosition": {"x": 0, "y": 0, "z": 0}, "rotation": 0}, //croupier, NEVER USED
        {"localPosition": {"x": 0.5478, "y": 1.063, "z":-0.5086}, "rotation": 54}, //player 1
        {"localPosition": {"x": 0.1084, "y": 1.063, "z": -0.7463}, "rotation": 18}, //player 2 
        {"localPosition": {"x": -0.3501, "y": 1.063, "z": -0.6680}, "rotation": -18}, //player 3
        {"localPosition": {"x": -0.6857, "y": 1.063, "z": -0.3405}, "rotation": -54}, //player 4
    ];

    function drawPlayerInsurance(playerNo, amount, avatarID) {
        clearPlayerInsurance(playerNo);
        //create handler
        if (amount > 0) {
            playersInsuranceIDs[playerNo] = Entities.addEntity({
                "parentID": thisEntityID,
                "renderWithZones": thisRenderWithZones,
                "localPosition": playersInsuranceHandlerPosition[playerNo].localPosition,
                "localRotation": Quat.fromVec3Degrees({"x": 90, "y": playersInsuranceHandlerPosition[playerNo].rotation, "z": 180}),
                "type": "Shape",
                "shape": "Cube",
                "dimensions": {"x": 0.01, "y": 0.01, "z": 0.01},
                "name": "Player_" + playerNo + "_InsuranceHandler",
                "visible": false,
                "grab": {
                    "grabbable": false
                }
            },"local");
            var autoChange = amountToAutoChange(amount);
            var actionScript = "";
            var nbrTokenInStack, stack, exponent, position;
            for (var i = autoChange.length - 1; i >= 0; i--) {
                stack = autoChange.substr(i, 1);
                if (stack === "T") {
                    nbrTokenInStack = 10;
                } else {
                    nbrTokenInStack = parseInt(stack, 10);
                }
                exponent = (autoChange.length - 1) - i;
                position = {"x": (-exponent * 0.055), "y": 0, "z": 0};
                genMoneyStack(playersInsuranceIDs[playerNo], nbrTokenInStack, position, exponent, actionScript);
            }
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
            "description": "" + Math.pow(10, exponent),
            "useOriginalPivot": true,
            "type": "Model"
        },"local");

        var tokenDisplay = [
            {"hue": 0, "faceUrl": ROOT + "tokens/token_1_normal.jpg"},
            {"hue": 120, "faceUrl": ROOT + "tokens/token_10_normal.jpg"},
            {"hue": 240, "faceUrl": ROOT + "tokens/token_100_normal.jpg"},
            {"hue": 60, "faceUrl": ROOT + "tokens/token_1K_normal.jpg"},
            {"hue": 180, "faceUrl": ROOT + "tokens/token_10K_normal.jpg"},
            {"hue": 300, "faceUrl": ROOT + "tokens/token_100K_normal.jpg"},
            {"hue": 30, "faceUrl": ROOT + "tokens/token_1M_normal.jpg"},
            {"hue": 210, "faceUrl": ROOT + "tokens/token_10M_normal.jpg"},
            {"hue": 270, "faceUrl": ROOT + "tokens/token_100M_normal.jpg"},
            {"hue": 90, "faceUrl": ROOT + "tokens/token_1G_normal.jpg"}
        ];
        
        var color = hslToRgb(tokenDisplay[exponent].hue/360, 1, 0.5);
        
        var materialData = {
            "materialVersion": 1,
            "materials": [
                {
                  "albedo": [color[0]/255, color[1]/255, color[2]/255 ],
                  "metallic": 1,
                  "roughness": 0.1,
                  "normalMap": tokenDisplay[exponent].faceUrl,
                  "cullFaceMode": "CULL_BACK"
                }
            ]
        };
        
        var matId = Entities.addEntity({
            "parentID": id,
            "renderWithZones": thisRenderWithZones,
            "name": "Face Material",
            "localPosition": {"x": 0, "y": 1, "z": 0},
            "grab": {
                "grabbable": false
            },
            "materialURL": "materialData",
            "materialData": JSON.stringify(materialData),
            "type": "Material",
            "priority": 2,
            "parentMaterialName": "mat::FACE",
            "materialMappingScale": { "x": 1, "y": 1 },
            "materialRepeat": true
        },"local");
        
        materialData = {
            "materialVersion": 1,
            "materials": [
                {
                  "albedo": [color[0]/255, color[1]/255, color[2]/255 ],
                  "metallic": 1,
                  "roughness": 0.1,
                  "normalMap": ROOT + "tokens/side_normal.jpg",
                  "cullFaceMode": "CULL_BACK"
                }
            ]
        };        
        matId = Entities.addEntity({
            "parentID": id,
            "renderWithZones": thisRenderWithZones,
            "name": "Side Material",
            "localPosition": {"x": 0, "y": 1.4, "z": 0},
            "grab": {
                "grabbable": false
            },
            "materialData": JSON.stringify(materialData),
            "materialURL": "materialData",
            "type": "Material",
            "priority": 2,
            "parentMaterialName": "mat::SIDE",
            "materialMappingScale": { "x": 1, "y": nbrTokenInStack },
            "materialRepeat": true
        },"local");
    }

    function clearPlayerMoney(playerNo) {
        if (playersMoneyIDs[playerNo] !== Uuid.NULL) {
            Entities.deleteEntity(playersMoneyIDs[playerNo]);
            playersMoneyIDs[playerNo] = Uuid.NULL;
        }
    }

    function clearPlayerBet(playerNo) {
        if (playersBetIDs[playerNo] !== Uuid.NULL) {
            Entities.deleteEntity(playersBetIDs[playerNo]);
            playersBetIDs[playerNo] = Uuid.NULL;
        }
    }

    function clearPlayerInsurance(playerNo) {
        if (playersInsuranceIDs[playerNo] !== Uuid.NULL) {
            Entities.deleteEntity(playersInsuranceIDs[playerNo]);
            playersInsuranceIDs[playerNo] = Uuid.NULL;
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
        clearPlayerActions();
        clearAllCards();
        
        for (var i = 1; i < playersMoneyIDs.length; i++) {
            clearPlayerMoney(i);
            clearPlayerBet(i);
            clearPlayerInsurance(i);
        }
        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        Script.update.disconnect(myTimer);
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

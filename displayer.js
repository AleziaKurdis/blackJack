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
            }
        }
    }

    var playersCardsIDs = [Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL, Uuid.NULL];
    
    var cardHandlerPosition = [
        {"localPosition": {"x": 0.1343, "y": 1.1464, "z": -0.4646}, "rotation": -90}, //croupier
        {"localPosition": {"x": 0.7583, "y": 1.1464, "z": -0.4363}, "rotation": 36}, //player 1
        {"localPosition": {"x": 0.3689, "y": 1.1464, "z": -0.8022}, "rotation": 72}, //player 2 
        {"localPosition": {"x": -0.1467, "y": 1.1464, "z": -0.8686}, "rotation": -72}, //player 3
        {"localPosition": {"x": -0.6194, "y": 1.1464, "z": -0.6026}, "rotation": -36}, //player 4
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
            "localRotation": Quat.fromVec3Degrees({"x": 90, "y": cardHandlerPosition[playerNo].rotation - 90, "z": 0}),
            "type": "Shape",
            "shape": "Cube",
            "dimensions": {"x": 0.01, "y": 0.01, "z": 0.01},
            "name": "Player_" + playerNo + "_cardsHandler",
            "visible": true, //################################################# SHOULD BE FALSE
            "grab": {
                "grabbable": false
            }
        },"local");
        var position, id;
        if (handArray.length !== 0) {
            for (var i = 0; i < handArray.length; i++) {
                position = {"x": (i * 0.07), "y": 0, "z": 0};
                id = Entities.addEntity({
                    "parentID": playersCardsIDs[playerNo],
                    "renderWithZones": thisRenderWithZones,
                    "name": "Player_" + playerNo + "_Card_" + (i+1),
                    "localPosition": position,
                    "dimensions": {"x": 0.06, "y": 0.10, "z": 0.01},
                    "grab": {
                        "grabbable": false
                    },
                    "imageURL": ROOT +  "cards/" + handArray[i].value + "_of_" + handArray[i].suit.toLowerCase() + ".svg",
                    "emissive": false,
                    "type": "Image"
                },"local") 
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
    
    this.unload = function(entityID) {
        /*
        if (Id !== Uuid.NULL) {
            Entities.deleteEntity(Id);
            Id = Uuid.NULL;
        }
        */
        clearAllCards();
 
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);

    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });    


})

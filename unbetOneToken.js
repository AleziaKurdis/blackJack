//"use strict";
//
//  unbetOneToken.js
//
//  Created by Alezia Kurdis, December 4th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Black Jack Game for Overte - trigger to remove bet one tokens.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var jsMainFileName = "unbetOneToken.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];    
    var channelComm = "ak.blackJack.ac.communication"; 
    var oneTimeOnly = false;
    var SOUND_COIN = SoundCache.getSound(ROOT + "sounds/coins.wav");
    
    function pay(entityID) {
        if (oneTimeOnly === false) {
            var amount = parseInt(Entities.getEntityProperties(entityID,["description"]).description, 10);            
            var message = {
                "action": "UNBET",
                "avatarID": MyAvatar.sessionUUID,
                "amount": amount
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            
            var injectorOptions = {
                "position": Entities.getEntityProperties(entityID,["position"]).position,
                "volume": 0.25,
                "loop": false,
                "localOnly": true
            };
            var injector = Audio.playSound(SOUND_COIN, injectorOptions);            
            
            oneTimeOnly = true;
        }

    }; 

    var MAX_CLICKABLE_DISTANCE_M = 2;

    // Constructor
    var _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }

    // Entity methods
    clickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                //Nothing
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_CLICKABLE_DISTANCE_M) {
                    pay(_this.entityID);
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new clickableUI();


})

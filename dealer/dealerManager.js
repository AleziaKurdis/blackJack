"use strict";
//
//  dealerManager.js
//
//  Created by Alezia Kurdis on December 8th, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Black Jack game - dealer Manager script.
//  generate a dealer representation reacting to events.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
    var channelComm = "ak.blackJack.ac.communication"; 
  
    var jsMainFileName = "dealerManager.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;
    var SURRENDERED;
    var PLAYER_BUSTED;
    var EQUALITY;
    var CLAIM_INSURANCE;
    var BLACKJACK_FROM_DEALER;
    var BLACKJACK_FROM_PLAYER;
    var DEALER_BUSTED;
    var PLAYER_WINS;
    var PLAYER_LOSES;
    var DEALER_DISTRIBUTION;
    var DEALER_BETTING;
    var DEALER_BETTING_NEWBE;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID,["renderWithZones"]);
        thisRenderWithZones = properties.renderWithZones;

        SURRENDERED = SoundCache.getSound(ROOT + "voice/SURRENDERED.mp3");
        PLAYER_BUSTED = SoundCache.getSound(ROOT + "voice/PLAYER_BUSTED.mp3");
        EQUALITY = SoundCache.getSound(ROOT + "voice/EQUALITY.mp3");
        CLAIM_INSURANCE = SoundCache.getSound(ROOT + "voice/CLAIM_INSURANCE.mp3");
        BLACKJACK_FROM_DEALER = SoundCache.getSound(ROOT + "voice/BLACKJACK_FROM_DEALER.mp3");
        BLACKJACK_FROM_PLAYER = SoundCache.getSound(ROOT + "voice/BLACKJACK_FROM_PLAYER.mp3");
        DEALER_BUSTED = SoundCache.getSound(ROOT + "voice/DEALER_BUSTED.mp3");
        PLAYER_WINS = SoundCache.getSound(ROOT + "voice/DEALER_BUSTED.mp3");
        PLAYER_LOSES = SoundCache.getSound(ROOT + "voice/PLAYER_LOSES.mp3");
        DEALER_DISTRIBUTION = SoundCache.getSound(ROOT + "voice/DEALER_DISTRIBUTION.mp3");
        DEALER_BETTING = SoundCache.getSound(ROOT + "voice/DEALER_BETTING.mp3");
        DEALER_BETTING_NEWBE = SoundCache.getSound(ROOT + "voice/DEALER_BETTING_NEWBE.mp3");

        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
    }

    function talk(audioSentence) {
        var position = Entities.getEntityProperties(thisEntityID,["position"]).position;
        var injectorOptions = {
            "position": Vec3.sum(position, {"x": 0, "y": 1.65, "z": 0}),
            "volume": 0.8,
            "loop": false,
            "localOnly": true
        };
        var injector = Audio.playSound(audioSentence, injectorOptions);
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "DEALER_VERDICT") {
                //player specific verdict
                playerNo = parseInt(data.playerNo, 10);
                expressVerdict(data.playerNo, data.conclusion);
            } else if (data.action === "DEALER_DISTRIBUTION") {
                //When cards are going to be drawn
                talk(DEALER_DISTRIBUTION);
            } else if (data.action === "DEALER_BETTING") {
                //Betting time announce
                talk(DEALER_BETTING);
            } else if (data.action === "DEALER_BETTING_NEWBE") {
                //Betting time welcome & Announce
                talk(DEALER_BETTING_NEWBE);
            }
        }
    }

    function expressVerdict(playerNo, conclusion) {
        switch(conclusion) {
            case "SURRENDERED":
                talk(SURRENDERED);
                break;
            case "PLAYER_BUSTED":
                talk(PLAYER_BUSTED);
                break;            
            case "EQUALITY":
                talk(EQUALITY);
                break;
            case "CLAIM_INSURANCE":
                talk(CLAIM_INSURANCE);
                break;            
            case "BLACKJACK_FROM_DEALER":
                talk(BLACKJACK_FROM_DEALER);
                break;
            case "BLACKJACK_FROM_PLAYER":
                talk(BLACKJACK_FROM_PLAYER);
                break;
            case "DEALER_BUSTED":
                talk(DEALER_BUSTED);
                break;
            case "PLAYER_WINS":
                talk(PLAYER_WINS);
                break;
            case "PLAYER_LOSES":
                talk(PLAYER_LOSES);
                break;            
        }
 
    }

    this.unload = function(entityID) {

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

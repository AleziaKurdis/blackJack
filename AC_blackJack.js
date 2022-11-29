"use strict";
//
//  AC_blackJack.js
//
//  Created by Alezia Kurdis on November 27th, 2022
//  Copyright 2022 Alezia Kurdis.
//
//  Server side game manager for Black Jack game.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("BLACKJACK: start running.");
var jsMainFileName = "AC_blackJack.js";
var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

var channelComm = "ak.blackJack.ac.communication";
var ORIGIN_POSITION = {"x":8000,"y":8000,"z":8000};

var PROCESS_INTERVAL = 1000; //1 sec

var NEW_CARDS_PACK = [
    {"value": "A", "suit": "HEARTS"},
    {"value": "2", "suit": "HEARTS"},
    {"value": "3", "suit": "HEARTS"},
    {"value": "4", "suit": "HEARTS"},
    {"value": "5", "suit": "HEARTS"},
    {"value": "6", "suit": "HEARTS"},
    {"value": "7", "suit": "HEARTS"},
    {"value": "8", "suit": "HEARTS"},
    {"value": "9", "suit": "HEARTS"},
    {"value": "10", "suit": "HEARTS"},
    {"value": "J", "suit": "HEARTS"},
    {"value": "Q", "suit": "HEARTS"},
    {"value": "K", "suit": "HEARTS"},
    {"value": "A", "suit": "CLUBS"},
    {"value": "2", "suit": "CLUBS"},
    {"value": "3", "suit": "CLUBS"},
    {"value": "4", "suit": "CLUBS"},
    {"value": "5", "suit": "CLUBS"},
    {"value": "6", "suit": "CLUBS"},
    {"value": "7", "suit": "CLUBS"},
    {"value": "8", "suit": "CLUBS"},
    {"value": "9", "suit": "CLUBS"},
    {"value": "10", "suit": "CLUBS"},
    {"value": "J", "suit": "CLUBS"},
    {"value": "Q", "suit": "CLUBS"},
    {"value": "K", "suit": "CLUBS"},
    {"value": "A", "suit": "DIAMONDS"},
    {"value": "2", "suit": "DIAMONDS"},
    {"value": "3", "suit": "DIAMONDS"},
    {"value": "4", "suit": "DIAMONDS"},
    {"value": "5", "suit": "DIAMONDS"},
    {"value": "6", "suit": "DIAMONDS"},
    {"value": "7", "suit": "DIAMONDS"},
    {"value": "8", "suit": "DIAMONDS"},
    {"value": "9", "suit": "DIAMONDS"},
    {"value": "10", "suit": "DIAMONDS"},
    {"value": "J", "suit": "DIAMONDS"},
    {"value": "Q", "suit": "DIAMONDS"},
    {"value": "K", "suit": "DIAMONDS"},
    {"value": "A", "suit": "SPADES"},
    {"value": "2", "suit": "SPADES"},
    {"value": "3", "suit": "SPADES"},
    {"value": "4", "suit": "SPADES"},
    {"value": "5", "suit": "SPADES"},
    {"value": "6", "suit": "SPADES"},
    {"value": "7", "suit": "SPADES"},
    {"value": "8", "suit": "SPADES"},
    {"value": "9", "suit": "SPADES"},
    {"value": "10", "suit": "SPADES"},
    {"value": "J", "suit": "SPADES"},
    {"value": "Q", "suit": "SPADES"},
    {"value": "K", "suit": "SPADES"}
];

var cards = [];

function shuffleCards() {
    cards = [];
    cards = shuffle(NEW_CARDS_PACK.slice());
}

var shuffle = function(array) {
   temp = [];
   originalLength = array.length;
   for (var i = 0; i < originalLength; i++) {
     temp.push(array.splice(Math.floor(Math.random()*array.length),1));
   }
   return temp;
};

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "XXX") {
            //instructions
        } else if  (data.action === "YYY") {
            //instructions
        }
    }
}

/* 
var message = {
    "action": "I_DIED",
    "avatarID": avatarID       
};
Messages.sendMessage(channelComm, JSON.stringify(message));
 */

function myTimer(deltaTime) {
    var today = new Date();
    if ((today.getTime() - processTimer) > PROCESS_INTERVAL ) {
        //instructions
        todayAgain = new Date();
        processTimer = todayAgain.getTime();
    }
}

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);

//TESTING
shuffleCards();
print("BLACKJACK: " + JSON.stringify(cards));
print("BLACKJACK ORIGINAL: " + JSON.stringify(NEW_CARDS_PACK));

Script.scriptEnding.connect(function () {

    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    //Script.update.disconnect(myTimer);
});

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
var processTimer = 0;

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
var cardDrawing = 0;


var cards = [];

var persons = [];
var players = [
    {"void": "void"},
    {"person": -1, "state": "OUT", "bet": 0},
    {"person": -1, "state": "OUT", "bet": 0},
    {"person": -1, "state": "OUT", "bet": 0},
    {"person": -1, "state": "OUT", "bet": 0}
];

var gameLoopOn = false;
var gameflowState = "OFF"; //OFF - BETTING - DISTRIBUTION - ACTIONS - PLAY_AND_PAY
var playerInProcess = 0;

function playerSit(playerNo, avatarID){
    personNo = -1;
    for (var i = 0; i < persons.length; i++) {
        if (persons[i].avatarID === avatarID) {
            personNo = i;
            break;
        }
    }
    if (personNo !== -1) {
        //Connu
        players[playerNo].person = personNo;
        players[playerNo].state = "JOINED";
        players[playerNo].bet = 0;
    } else {
        //New person
        var newPerson = {};
        newPerson.avatarID = avatarID;
        newPerson.name = getName(avatarID);
        newPerson.cash = 50;
        var length = persons.push(newPerson);
        players[playerNo].person = length - 1;
        players[playerNo].state = "JOINED";
        players[playerNo].bet = 0;
    }
    if (gameflowState === "OFF") {
        Script.update.connect(myTimer);
        gameflowState = "BETTING";
    }
    print("BLACKJACK Players: " + JSON.stringify(players)); //##################################################################DEBUG
    print("BLACKJACK Persons: " + JSON.stringify(persons)); //##################################################################DEBUG
}

function getName(avatarID) {
    var avatar = AvatarList.getAvatar(avatarID);
    return avatar.sessionDisplayName;
}

function shuffleCards() {
    cards = [];
    var fourPack = NEW_CARDS_PACK.concat(NEW_CARDS_PACK, NEW_CARDS_PACK, NEW_CARDS_PACK);
    cards = shuffle(fourPack.slice());
    cardDrawing = 5; //we remove the 5 first cards of the pack.
}

var shuffle = function(array) {
   temp = [];
   originalLength = array.length;
   for (var i = 0; i < originalLength; i++) {
     temp.push(array.splice(Math.floor(Math.random()*array.length),1));
   }
   return temp;
};

function isAllPlayerOff() {
    var allOff = true;
    for (var i = 1; i > players.length; i++) {
        if (players[i].state !== "OUT") {
            allOff = false;
            break;
        }
    }
    return allOff;
}

function isAllPlayerHaveBet() {
    var allbet = true;
    for (var i = 1; i > players.length; i++) {
        if (players[i].bet === 0) {
            allbet = false;
            break;
        }
    }
    return allbet;
}

function onMessageReceived(channel, message, sender, localOnly) {
    var playerNo;
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "PLAYER_SIT") {
            playerNo = parseInt(data.playerNo, 10);
            playerSit(playerNo, data.avatarID);
        } else if  (data.action === "PLAYER_LEAVE") {
            playerNo = parseInt(data.playerNo, 10);
            players[playerNo] = {"person": -1, "state": "OUT", "bet": 0};
            if (isAllPlayerOff()) {
                Script.update.disconnect(myTimer);
                gameflowState = "OFF";
            }
        } else if  (data.action === "BET_CONFIRMED") {
            playerNo = parseInt(data.playerNo, 10);
            players[playerNo].bet = data.bet;
            if (isAllPlayerHaveBet()) {
                cardsDistribution();
                gameflowState = "ACTIONS";
                playerInProcess = 1;
                sendActions();
            }
        } else if  (data.action === "STAND") {
                playerInProcess = playerInProcess + 1;
                if (playerInProcess === 5) {
                    croupierTurn();
                }            
        } else if  (data.action === "HIT") {
            playerNo = parseInt(data.playerNo, 10);
            players[playerNo].hand.push(drawAcard());
            if (checkCount(players[playerNo].hand) > 21) {
                playerInProcess = playerInProcess + 1;
                if (playerInProcess === 5) {
                    croupierTurn();
                }
            }
        } else if  (data.action === "SURRENDER") {
            playerNo = parseInt(data.playerNo, 10);
            players[playerNo].hand = [];    
        } else if  (data.action === "INSURANCE") {
            playerNo = parseInt(data.playerNo, 10);
            players[playerNo].insurance = true;
        }
    }
}
var hand = [];
function cardsDistribution() {
    for (var i = 1; i > players.length; i++) {
        if (players[i].state === "PLAYING") {
            players[i].insurance = false;
            players[i].hand = [];
            players[i].hand.push(drawAcard());
            players[i].hand.push(drawAcard());
        }
        //Send Card disply for each user
    }
    hand = [];
    hand.push(drawAcard());
    //Send Card display for croupier
}

function croupierTurn() {
    hand.push(drawAcard());
    var croupierScore = checkCount(hand);
    var playerScore = 0;
    for (vari = 1; i < players.length; i++) {
        if (players[i].state === "PLAYING") {
            if (players[i].hand.length === 0) {
                //surrendered (lose half bet)
            } else {
                playerScore = checkCount(players[i].hand);
                if (playerScore > 21) {
                    if (isThisABlackJack(hand) &&  players[i].insurance) {
                        //lose nothing
                    } else {
                        //loose full bet
                    }
                } else {
                    if (playerScore > croupierScore) {
                        if (isThisABlackJack(players[i].hand)) {
                            //win 1.5 X bet 
                        } else {
                            //win 1 X bet  
                        }
                    }
                }
            }
        }
        players[i].state === "JOINED";    
    }
    //update rendering
    gameflowState = "BETTING";
    playerInProcess = 1;
}

function drawAcard() {
    var drawn = cards[cardDrawing];
    cardDrawing = cardDrawing + 1;
    if (cardDrawing === cards.length) {
        shuffleCards();
    }
    return drawn;
}

function sendActions() {
    //playerInProcess
    var actionList = ["STAND"];
    if (!isThisABlackJack(players[playerInProcess].hand)) {
        actionList.push("HIT");
        actionList.push("SURRENDER");
    }

    if (hand[0].value === "A") {
        actionList.push("INSURANCE");
    }
    //Sent Action to user
}

function isThisABlackJack(handArray) {
    if (handArray.length !== 2) { 
        return false;
    } else {
        if ((getCardValue(handArray[0].value) + getCardValue(handArray[1].value)) === 21 ) {
            return true;
        } else {
            return false;
        }
    }
}

function checkCount(handArray) {
    var score = 0;
    var card;
    var hasAce = false;
    for (var i = 0; i < handArray.length; i++) {
        card = getCardValue(handArray[i].value);
        if (card === 11) {
            card = 1;
            hasAce = true;
        }
        score = score + card;       
    }
    if (hasAce && score + 10 <= 21) {
        score = score + 10;
    }
    return score;
}

function getCardValue(strValue) {
    var value = 0;
    switch(strValue) {
        case "2":
            value = 2;
            break;
        case "3":
            value = 3;
            break;
        case "4":
            value = 4;
            break;
        case "5":
            value = 5;
            break;
        case "6":
            value = 6;
            break;
        case "7":
            value = 7;
            break;
        case "8":
            value = 8;
            break;
        case "9":
            value = 9;
            break;
        case "10":
            value = 10;
            break;
        case "J":
            value = 10;
            break;
        case "Q":
            value = 10;
            break;
        case "K":
            value = 10;
            break;
        case "A":
            value = 11;
            break;
    }
    return value;
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
        
        switch(gameflowState) {
            case "BETTING":
                for (var i = 1; i < players.length; i++) {
                    if (players[i].state === "JOINED") {
                        //send cash display update
                        //send betting action
                        players[i].state === "PLAYING";
                    }
                }
                break;
        }
        
        todayAgain = new Date();
        processTimer = todayAgain.getTime();
    }
}

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);

shuffleCards();
print("BLACKJACK: " + JSON.stringify(cards)); //###########################################################################DEBUG

Script.scriptEnding.connect(function () {

    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    Script.update.disconnect(myTimer);
    gameflowState = "OFF";
});

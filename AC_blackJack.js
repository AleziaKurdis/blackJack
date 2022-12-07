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
//var ORIGIN_POSITION = {"x":8000,"y":8000,"z":8000}; //################################################################

var PROCESS_INTERVAL = 1000; //1 sec
var processTimer = 0;
var countDown = 0;

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
        countDown = -1;
        gameflowState = "BETTING";
        Script.update.connect(myTimer);
    }
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
    for (var i = 1; i < players.length; i++) {
        if (players[i].state !== "OUT") {
            allOff = false;
            break;
        }
    }
    return allOff;
}

function onMessageReceived(channel, message, sender, localOnly) {
    print("BLACKJACK MESSAGE: ##################### BEGINNING #####################"); //######################################## TO REMOVE
    print("BLACKJACK MESSAGE: " + message); //################################################################################### TO REMOVE
    print("BLACKJACK MESSAGE: #####################   END     #####################"); //######################################## TO REMOVE
    var playerNo, messageToSend;
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "PLAYER_SIT") {
            playerNo = parseInt(data.playerNo, 10);
            playerSit(playerNo, data.avatarID);
        } else if  (data.action === "PLAYER_LEAVE") {
            playerNo = parseInt(data.playerNo, 10);
            messageToSend = {
                "action": "CLEAR_ACTIONS",
                "avatarID": persons[players[playerNo].person].avatarID
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
            messageToSend = {
                "action": "CLEAR_PLAYER_MONEY",
                "playerNo": playerNo
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
            messageToSend = {
                "action": "CLEAR_PLAYER_BET",
                "playerNo": playerNo
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
            messageToSend = {
                "action": "CLEAR_PLAYER_INSURANCE",
                "playerNo": playerNo
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));             
            players[playerNo] = {"person": -1, "state": "OUT", "bet": 0};            
            if (isAllPlayerOff()) {
                Script.update.disconnect(myTimer);
                gameflowState = "OFF";
            }
        } else if  (data.action === "BET") {
            playerNo = getPlayerNoFromAvatarID(data.avatarID);
            var bet = data.amount;
            if (data.amount === 1 & players[playerNo].bet === 0) {
                bet = 2;
            }
            players[playerNo].bet = players[playerNo].bet + bet;
            persons[players[playerNo].person].cash = persons[players[playerNo].person].cash - bet;
            updateCash(playerNo, true);
        } else if  (data.action === "UNBET") {
            playerNo = getPlayerNoFromAvatarID(data.avatarID);
            var unbet = data.amount;
            if (data.amount === 1 & players[playerNo].bet === 2) {
                unbet = 2;
            }
            players[playerNo].bet = players[playerNo].bet - unbet;
            persons[players[playerNo].person].cash = persons[players[playerNo].person].cash + unbet;
            updateCash(playerNo, true);
        } else if  (data.action === "ACTION_STAND") {
            messageToSend = {
                "action": "CLEAR_ACTIONS",
                "avatarID": data.avatarID
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));            
            playerInProcess = playerInProcess + 1;
            if (playerInProcess === 5) {
                dealerTurn();
            } else {
                countDown = 30;
                sendActions();  
            }     
        } else if (data.action === "ACTION_HIT") {
            messageToSend = {
                "action": "CLEAR_ACTIONS",
                "avatarID": data.avatarID
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));              
            playerNo = getPlayerNoFromAvatarID(data.avatarID);
            players[playerNo].hand.push(drawAcard());
            messageToSend = {
                "action": "DISPLAY_CARDS",
                "playerNo": playerNo,
                "hand": players[playerNo].hand
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));             
            if (checkCount(players[playerNo].hand) > 21) {
                playerInProcess = playerInProcess + 1;
                if (playerInProcess === 5) {
                    dealerTurn();
                } else {
                    countDown = 30;
                    sendActions();  
                }
            } else {
                countDown = 30;
                sendActions();                
            }
        } else if  (data.action === "ACTION_SURRENDER") {
            messageToSend = {
                "action": "CLEAR_ACTIONS",
                "avatarID": data.avatarID
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));              
            playerNo = getPlayerNoFromAvatarID(data.avatarID);
            players[playerNo].hand = []; //this means that he has surrendered.
            messageToSend = {
                "action": "DISPLAY_CARDS",
                "playerNo": playerNo,
                "hand": players[playerNo].hand
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
            playerInProcess = playerInProcess + 1;
            if (playerInProcess === 5) {
                dealerTurn();
            } else {
                countDown = 30;
                sendActions();  
            }            
        } else if  (data.action === "ACTION_INSURANCE") {
            messageToSend = {
                "action": "CLEAR_ACTIONS",
                "avatarID": data.avatarID
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSend));              
            playerNo = getPlayerNoFromAvatarID(data.avatarID);            
            players[playerNo].insurance = true;
            persons[players[playerNo].person].cash = persons[players[playerNo].person].cash - Math.floor(players[playerNo].bet / 2);
            updateCash(playerNo, true);            
            countDown = 30;
            sendActions();
        }
    }
}

function getPlayerNoFromAvatarID(avatarID) {
    var playerNo = 0;
    for (var i = 1; i < players.length; i++) {
        if (players[i].person !== -1) { 
            if (persons[players[i].person].avatarID === avatarID) {
                playerNo = i;
                break;
            }
        }
    }
    return playerNo;    
}

function updateCash(playerNo, isInteractive) {
    var avatarID = "";
    if (isInteractive) {
        avatarID = persons[players[playerNo].person].avatarID;
    }
    var message = {
        "action": "DISPLAY_PLAYER_MONEY",
        "playerNo": playerNo,
        "amount": persons[players[playerNo].person].cash,
        "avatarID": avatarID
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));   
    message = {
        "action": "DISPLAY_PLAYER_BET",
        "playerNo": playerNo,
        "amount": players[playerNo].bet,
        "avatarID": avatarID
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));
    if (players[playerNo].insurance) {
        message = {
            "action": "DISPLAY_PLAYER_INSURANCE",
            "playerNo": playerNo,
            "amount": Math.floor(players[playerNo].bet / 2),
            "avatarID": ""
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
    }
}

var hand = [];
function cardsDistribution() {
    var message;
    for (var i = 1; i < players.length; i++) {
        if (players[i].state === "PLAYING") {
            players[i].insurance = false;
            players[i].hand = [];
            print("BLACKJACK drawAcard = " + JSON.stringify(drawAcard())); //############################################################################ TO REMOVE
            players[i].hand.push(drawAcard());
            players[i].hand.push(drawAcard());
            message = {
                "action": "DISPLAY_CARDS",
                "playerNo": i,
                "hand": players[i].hand
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }        
    }
    hand = [];
    hand.push(drawAcard());
    message = {
        "action": "DISPLAY_CARDS",
        "playerNo": 0,
        "hand": hand
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));     
}

function dealerTurn() {
    hand.push(drawAcard());
    var message = {
        "action": "SOUND_FLIP"
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));
    message = {
        "action": "DISPLAY_CARDS",
        "playerNo": 0,
        "hand": hand
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));
    var dealerScore = checkCount(hand);
    var playerScore = 0;
    var hasPaid;
    for (vari = 1; i < players.length; i++) {
        if (players[i].state === "PLAYING") {
            hasPaid = false;
            if (players[i].hand.length === 0) {
                //surrendered (lose half bet)
                persons[players[i].person].cash = persons[players[i].person].cash + Math.floor(players[i].bet/2);
                players[i].bet = 0;
                hasPaid = true;
            } else {
                playerScore = checkCount(players[i].hand);
                if (playerScore > 21) {
                    if (isThisABlackJack(hand) &&  players[i].insurance) {
                        //paid insurance garantie 2 time the bet
                        persons[players[i].person].cash = persons[players[i].person].cash + (players[i].bet * 2);
                        players[i].bet = 0;
                        hasPaid = true;
                    } else {
                        //loose full bet
                        players[i].bet = 0;
                    }
                } else {
                    if (playerScore > dealerScore) {
                        if (isThisABlackJack(players[i].hand)) {
                            //win 1.5 X bet + keep the bet
                            persons[players[i].person].cash = persons[players[i].person].cash + players[i].bet + (players[i].bet * 1.5);
                            players[i].bet = 0;
                            hasPaid = true;
                        } else {
                            //win 1 X bet + keep the bet
                            persons[players[i].person].cash = persons[players[i].person].cash + (players[i].bet * 2);
                            players[i].bet = 0;
                            hasPaid = true;                            
                        }
                    } else if (playerScore === dealerScore) {
                        //safe: keep your bet
                        persons[players[i].person].cash = persons[players[i].person].cash + players[i].bet;
                        players[i].bet = 0;
                        hasPaid = true;                        
                    } else {
                        //loose
                        players[i].bet = 0;
                    }
                }
            }
            if (hasPaid) {
                message = {
                    "action": "SOUND_COINS"
                };
                Messages.sendMessage(channelComm, JSON.stringify(message));
            }
            players[i].insurance = false;
            updateCash(playerNo, false); 
            players[i].state === "JOINED";
        }    
    }
    //Cleanup the board.
    message = {
        "action": "CLEAR_ALL_CARDS"
    };
    Messages.sendMessage(channelComm, JSON.stringify(message));    
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
    if (players[playerInProcess].state === "PLAYING") {
        var actionList = ["STAND"];
        if (!isThisABlackJack(players[playerInProcess].hand)) {
            actionList.push("HIT");
            if (players[playerInProcess].isFirstAction) {
                actionList.push("SURRENDER");
            }
        }
        if (hand[0].value === "A") {
            actionList.push("INSURANCE");
        }
        var message = {
            "action": "DISPLAY_ACTIONS",
            "playerNo": playerInProcess,
            "avatarID": persons[players[playerInProcess].person].avatarID,
            "actionsList": actionList
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
        players[playerInProcess].isFirstAction = false;
    } else {
        playerInProcess = playerInProcess + 1;
        if (playerInProcess === 5) {
            dealerTurn();
        } else {
            countDown = 30;
            sendActions();  
        }
    }
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

function myTimer(deltaTime) {
    var message, i;
    var today = new Date();
    if ((today.getTime() - processTimer) > PROCESS_INTERVAL ) {
        
        switch(gameflowState) {
            case "BETTING":
                if (countDown === -1) {
                    for (i = 1; i < players.length; i++) {
                        if (players[i].state === "JOINED") {
                            message = {
                                "action": "DISPLAY_PLAYER_MONEY",
                                "playerNo": i,
                                "amount": persons[players[i].person].cash,
                                "avatarID": persons[players[i].person].avatarID
                            };
                            Messages.sendMessage(channelComm, JSON.stringify(message));                            

                            message = {
                                "action": "DISPLAY_ACTIONS",
                                "playerNo": i,
                                "avatarID": persons[players[i].person].avatarID,
                                "actionsList": []
                            };
                            Messages.sendMessage(channelComm, JSON.stringify(message));
                            
                            countDown = 30;
                            players[i].state = "PLAYING";
                        }
                    }
                } else {
                    countDown = countDown -1;
                    if (countDown === 0) {
                        var atLeastOnePlayerPlaying = false;
                        for (i = 1; i < players.length; i++) {
                            if (players[i].state === "PLAYING") {
                                if (players[i].bet === 0) {
                                    players[i].state = "JOINED";
                                } else {
                                    updateCash(i ,false);
                                    atLeastOnePlayerPlaying = true;
                                }
                            }
                        }
                        if (atLeastOnePlayerPlaying) {
                            cardsDistribution();
                            countDown = 30;
                            gameflowState = "ACTIONS";
                            playerInProcess = 1;
                            players[playerInProcess].isFirstAction = true;
                            sendActions();
                        } else {
                            if (isAllPlayerOff()) {
                                Script.update.disconnect(myTimer);
                                gameflowState = "OFF";
                            } else {
                                gameflowState = "BETTING";
                                countDown = -1;                                
                            }
                        }
                    }
                }
                break;
            case "ACTIONS":
                countDown = countDown -1;
                if (countDown === 0) {
                    message = {
                        "action": "CLEAR_ACTIONS",
                        "avatarID": persons[players[playerInProcess].person].avatarID
                    };
                    Messages.sendMessage(channelComm, JSON.stringify(message));            
                    playerInProcess = playerInProcess + 1;
                    if (playerInProcess === 5) {
                        dealerTurn();
                    } else {
                        countDown = 30;
                        sendActions();  
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

Script.scriptEnding.connect(function () {

    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    Script.update.disconnect(myTimer);
    gameflowState = "OFF";
});

(function(){

var channelComm = "ak.blackJack.ac.communication";

message = {
    "action": "DISPLAY_PLAYER_MONEY",
    "playerNo": 1,
    "amount": 2343,
    "avatarID": ""
};
Messages.sendMessage(channelComm, JSON.stringify(message));


message = {
    "action": "DISPLAY_PLAYER_MONEY",
    "playerNo": 2,
    "amount": 1000,
    "avatarID": ""
};
Messages.sendMessage(channelComm, JSON.stringify(message));

message = {
    "action": "DISPLAY_PLAYER_MONEY",
    "playerNo": 3,
    "amount": 145,
    "avatarID": ""
};
Messages.sendMessage(channelComm, JSON.stringify(message));

message = {
    "action": "DISPLAY_PLAYER_MONEY",
    "playerNo": 4,
    "amount": 208,
    "avatarID": ""
};
Messages.sendMessage(channelComm, JSON.stringify(message));

});
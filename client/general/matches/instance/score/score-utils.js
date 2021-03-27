/**
 * Created by rramachandra on 2016-06-29.
 */
function idToPlayer(id, playerList) {
    playerList = playerList || [];
    for (var i = 0; i < playerList.length; ++i) {
        if (playerList[i].id === id) {
            return playerList[i];
        }
    }
    return '';
}

function playerToId(p) {
    return p && p.id || '';
}

function concatPlayerName(players) {
    if (!angular.isArray(players)) {
        players = [players];
    }
    for (var i = 0; i < players.length; ++i) {
        players[i].name = players[i].firstName + ' ' + players[i].lastName;
    }
}

module.exports = {
    idToPlayer: idToPlayer,
    playerToId: playerToId,
    concatPlayerName: concatPlayerName
};

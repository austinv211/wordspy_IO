//variables needed to host site and sockets
//save express and set up app to equal function call
var express = require('express');
var app = express();
//set up http
var http = require('http').Server(app);
//set up socket.io
var io = require('socket.io')(http);
//set up filesystem
var fs = require('fs');
//read the text file of nouns into an arrau
var nouns = fs.readFileSync('nounlist.txt').toString().split("\n");

//class for a list of rooms
class RoomList {
    //no-arg constructor
    constructor () {
        this.rooms = new Object();
    }

    //function to add a room
    addRoom(roomName, cards) {
        this.rooms[roomName] = new Room(roomName, cards);
    }
}

//class for a room
class Room {
    //costructor takes the name of the room and an array of cards
    constructor (roomName, cards) {
        this.name = roomName;
        this.mode = "lobby";
        this.cards = cards;
        this.gameStarted = false;
        this.winner = null;
        this.players = new Object();
        this.playerCount = 0;
    }

    //function to add a player to the room
    addPlayer(playerName, playerId, room, team, isSpyMaster) {
        this.players[playerId] = (new Player(playerId, playerName, room, team, isSpyMaster));
        this.playerCount++;
    }

    //function to remove a player from the list
    removePlayer(playerID) {
        delete this.players[playerID];
        this.playerCount--;
    }

    //function to reset game
    resetGame(cards) {
        this.cards = createCardsServer();
        this.mode = "lobby"
        this.gameStarted = false;
        this.winner = null;
    }
}

class Player {
    constructor(playerId, playerName, room, team, isSpyMaster) {
        this.playerId = playerId;
        this.name = playerName;
        this.room = room;
        this.team = team;
        this.isSpyMaster = isSpyMaster;
    }
}

//create instance of roomlist
var roomList = new RoomList();



//card class made for server
class CardServer {

    //constructor for the class, takes a x, y, word value, and whether the card is red or is blue
    constructor(x, y, word, isRed, isBlue, col, textCol, isFlipped) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.col = col;
        this.isFlipped = isFlipped;
        this.textCol = textCol;
        this.isBlue = isBlue;
        this.isRed = isRed;
        this.word = word;
    }
}

//function to create cards
function createCardsServer() {

    //create an array to store cards
    var numberOfCards = 25;
    var cards = [];
  
    //create the number of cards and space them accordingly
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        var c = new CardServer(j * 150 + 45, 108 * i + 8,nouns[Math.floor(Math.random() * nouns.length - 1)] , false, false, [255, 100], [0, 0, 0], false);
        cards.push(c);
      }
    }
  
    //create sequence of card numbers and then shuffle them
    var cardNumbers = Array.from(new Array(numberOfCards), (x, i) => i);
    cardNumbers = shuffle(cardNumbers);
  
  
    //randomlt assign red and blue cards
    for (var i = 0; i < numberOfCards; i++) {
      var r = cardNumbers[i];
  
      if (i < ((numberOfCards - 1) / 2)) {
        cards[r].isBlue = true;
      }
      else if (i >= ((numberOfCards - 1) / 2) && i != numberOfCards - 1) {
        cards[r].isRed = true;
      }
    }

    //return the array of cards
    return cards;
}

//function to shuffle an array
function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


//directory to send to public
app.use(express.static('public'));

//on connection function
io.on('connection', function(socket) {
    console.log("ID connected: " + socket.id);

    socket.roomName = {
        room: null
    };
    //on newPlayer, if the room is already created, add the player and send them room data, else create new room data
    socket.on('newPlayer', function(playerName, roomName) {

        if (roomList.rooms[roomName]) {
            //log already created
            console.log(roomName + " already created");
            console.log(socket.id + " joining room: " + roomName);

            if (roomList.rooms[roomName].playerCount % 2 == 0) {
                team = "red";
                console.log(team);
            }
            else {
                team = "blue";
                console.log(team);
            }

            //add the player to the room
            roomList.rooms[roomName].addPlayer(playerName, socket.id, roomName, team, false);
            socket.join(roomName);
            socket.roomName.room = roomName;
            
            //if the game is started send them the cards
            if (roomList.rooms[roomName].gameStarted) {
                socket.emit('createCards', roomList.rooms[roomName].cards, roomList.rooms[roomName].mode, roomList.rooms[roomName].winner);
            }
        }
        //if room is not created, create new room data
        else {
            //add the new room
            roomList.addRoom(roomName, createCardsServer());

            socket.roomName.room = roomName;

            //log joining
            console.log(socket.id + " joining room: " + roomName);

            //add the player to the room
            roomList.rooms[roomName].addPlayer(playerName, socket.id, roomName, "red", false);
            socket.join(roomName);        
        }
    });
    //function to handle what happens when modeupdate is sent
    socket.on('modeUpdate', function(roomName, mode) {
        //update room data mode
        roomList.rooms[roomName].mode = mode;
        console.log("change mode to: " + roomList.rooms[roomName].mode);
    });
    //function to handle what happens when card update is sent
    socket.on('cardUpdate', function(data) {
        //save the room and update the card for that room
        var room = String(data.room);
        var card = roomList.rooms[room].cards[data.index];
        card.col = data.col;
        card.textCol = data.textCol;
        card.isFlipped = data.isFlipped;

        var cardData = {
            col: card.col,
            textCol: card.textCol,
            isFlipped: card.isFlipped,
            index: data.index
        };

        //emit the new card data to everyone in the room
        io.in(room).emit('cardUpdate', cardData);
    });
    //function to handle what to do when a start game is asked for
    socket.on('startGame', function(data) {
        //save the room name
        var roomName = String(data);
        console.log(roomName);
        //change the mode and gameStarted values
        roomList.rooms[roomName].mode = "game";
        roomList.rooms[roomName].gameStarted = true;

        //emit the change to everyone in the room to be able to start the game
        io.in(roomName).emit('createCards', roomList.rooms[roomName].cards, roomList.rooms[roomName].mode, roomList.rooms[roomName].winner);
        roomList.rooms[roomName].gameStarted = true;
    });

    //what to do when a win condtiion is asked ofr
    socket.on('win', function(color, room) {
        //set the mode for the room to win
        roomList.rooms[room].mode = "win";
        //save the winner color
        roomList.rooms[room].winner = color;
        //emit the data to everyone in the room
        io.in(room).emit('win', color);
    });

    //function to handle what to do when new game is called
    socket.on('newGame', function(room) {
        roomList.rooms[room].resetGame();

        //make no one spymaster
        for (var key in roomList.rooms[room].players) {
            roomList.rooms[room].players[key].isSpyMaster = false;
        }
        
        //emit the new room to everyone in the room
        io.in(room).emit('newGame');
    });
    //function to handle what to do when next turn is called
    socket.on('nextTurn', function(room) {
        io.in(room).emit('nextTurn');
    });

    //function on what to do when getplayers is asked for
    socket.on('getPlayers', function(room){
        console.log("sending players");
        console.log("number of players " + roomList.rooms[room].playerCount);

        //send the players to everyone in the room
        io.in(room).emit('getPlayers', roomList.rooms[room].players);
    });

    //function to handle when a player wants to be spyMaster
    socket.on('makeSpyMaster', function(room) {
        console.log("making player: " + socket.id + " spyMaster");

        for (var key in roomList.rooms[room].players) {
            if (roomList.rooms[room].players[key].team === roomList.rooms[room].players[socket.id].team) {
                console.log("setting false for player: " + roomList.rooms[room].players[key].name);
                roomList.rooms[room].players[key].isSpyMaster = false;
            }
        }

        roomList.rooms[room].players[socket.id].isSpyMaster = true;
        io.in(room).emit('makeSpyMaster', socket.id);
    });

    //function to handle when a player disconnects
    socket.on('disconnect', function() {
        if (roomList.rooms[socket.roomName.room] != null) {
            roomList.rooms[socket.roomName.room].removePlayer(socket.id);
            io.in(socket.roomName.room).emit('removePlayer', socket.id);

            if (roomList.rooms[socket.roomName.room].playerCount == 0) {
                console.log("room " + socket.roomName.room + " deleted");
                delete roomList.rooms[socket.roomName.room];
            }
        }
        else {
            console.log("room not found");
        }
        console.log("ID disconnected: " + socket.id);
    });
});

//listen on port 3000 via http
http.listen(3000,'0.0.0.0', function() {
    console.log("listening on 3000");
});

//variables needed to host site and sockets
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var nouns = fs.readFileSync('nounlist.txt').toString().split("\n");


var lastPlayerID = 0;

class RoomList {
    constructor () {
        this.rooms = new Object();
    }

    addRoom(roomName, cards) {
        this.rooms[roomName] = new Room(roomName, cards);
    }
}

class Room {
    constructor (roomName, cards) {
        this.name = roomName;
        this.mode = "lobby";
        this.cards = cards;
        this.gameStarted = false;
    }
}

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
    var numberOfCards = 20;
    var cards = [];
  
    //create the number of cards and space them accordingly
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 5; j++) {
        var c = new CardServer(j * 150 + 45, 115 * i + 45,nouns[Math.floor(Math.random() * nouns.length - 1)] , false, false, [255, 100], [0, 0, 0], false);
        cards.push(c);
      }
    }
  
    var cardNumbers = Array.from(new Array(numberOfCards), (x, i) => i);
    cardNumbers = shuffle(cardNumbers);
  
  
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
    socket.on('disconnect', function() {
        console.log("ID disconnected: " + socket.id);
    });
    socket.on('newPlayer', function(roomName) {
        socket.player = {
            room: roomName,
            playerId: lastPlayerID++,
        };

        if (roomList.rooms[roomName]) {
            console.log(roomName + " already created");
            console.log(socket.player.playerId + " joining room: " + socket.player.room);
            socket.join(socket.player.room);
            
            if (roomList.rooms[roomName].gameStarted) {
                socket.emit('createCards', roomList.rooms[roomName].cards);
            }
        }
        else {
            roomList.addRoom(roomName, createCardsServer());

            console.log(socket.player.playerId + " joining room: " + socket.player.room);
            socket.join(socket.player.room);
        }
    });
    socket.on('modeUpdate', function(roomName, mode) {
        roomList.rooms[roomName].mode = mode;
        console.log("change mode to: " + roomList.rooms[roomName].mode);
    });
    socket.on('cardUpdate', function(data) {
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

        io.in(room).emit('cardUpdate', cardData);
    });
    socket.on('startGame', function(data) {
        var roomName = String(data);
        console.log(roomName);
        io.in(roomName).emit('createCards', roomList.rooms[roomName].cards);
        roomList.rooms[roomName].gameStarted = true;
    });

    socket.on('win', function(color, room) {
        io.in(room).emit('win', color);
    });
});


http.listen(3000,'0.0.0.0', function() {
    console.log("listening on 3000");
});

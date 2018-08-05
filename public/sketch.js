//variables for fireworks
var gravity;
var firework;

//Game class to represent the game
class Game {
  constructor () {
    this.room = Client.room;
    this.turnNumber = 1,
    this.cards = [],
    this.mode = "lobby";
    this.winner = null;
    this.players = new Object();
  }

  //function to add a player
  addPlayer(playerId, name, team, isSpyMaster) {
    this.players[playerId] = new Player(playerId, name, team, isSpyMaster);
  }
}

//Player class to represent a player
class Player {
  constructor(playerId, name, team, isSpyMaster) {
    this.playerId = playerId;
    this.name = name;
    this.team = team;
    this.isSpyMaster = isSpyMaster;
  }
}

//create an instance of the game object
var game = new Game();

//function to change the game mode
function changeMode(mode) {
  game.mode = mode;
  Client.socket.emit('modeUpdate', game.room, game.mode);
}

//setup function to create the canvas and set the canvas to the correct div
function setup() {
  var cnv = createCanvas(800, 550);
  background(100);
  cnv.parent('sketch-holder');

  //firework variables
  gravity = createVector(0, 0.2);
  firework = new Particle(width / 2, height, createVector(1, -15));

  //handler on what to do when cards are sent
  Client.socket.on('createCards', function(data, mode, winner) {

    console.log("received cards");
    
    //set the background back to the original value
    background(100);

    //hide the spyMaster button
    document.getElementById("spyMasterButton").style.display = "none";

    //show the turn button
    document.getElementById("nextTurn").style.display = "inline-block";

    //change to the correct display based on turn
    if (game.turnNumber % 2 == 0 ) {
      document.getElementById("nextTurn").textContent = "end red's turn";
      document.getElementById("nextTurn").style.backgroundColor = "#FF4447";
    }
    else {
      document.getElementById("nextTurn").textContent = "end blue's turn";
      document.getElementById("nextTurn").style.backgroundColor = "#5CCFF2";
    }

    //set the game mode and winner
    game.mode = mode;
    game.winner = winner;

    //add the cards to the game cards
    for (var i = 0; i < data.length; i++) {
      game.cards.push(new Card(data[i].x, data[i].y, data[i].word, data[i].isRed, data[i].isBlue, data[i].isBlack, data[i].isNon, data[i].col, data[i].textCol, data[i].isFlipped));
    }
  });

    //handler to handle next turn
  Client.socket.on('nextTurn', function() {

    //increase the turn number
    game.turnNumber++;

    //set the turn button style based on the turn number
    if (game.turnNumber % 2 == 0 ) {
      document.getElementById("nextTurn").textContent = "end red's turn";
      document.getElementById("nextTurn").style.backgroundColor = "#FF4447";
    }
    else {
      document.getElementById("nextTurn").textContent = "end blue's turn";
      document.getElementById("nextTurn").style.backgroundColor = "#5CCFF2";
    }
  });

  //handler to handle players in the room
  Client.socket.on('getPlayers', function(clients) {

    //loop through each key and add to the user list accordingly
    for (var key in clients) {

      //save the userList element to a variable
      var userList = document.getElementById("userList");

      //if the list item doesn't exist, create it
      if (document.getElementById("listItem" + key) === null) {

        //create a div to hold row
        var row = document.createElement("div");

        //create the list item and get the team
        var li = document.createElement("li");
        var team = clients[key].team;
      
        //append elements and set attributes
        li.appendChild(document.createTextNode(clients[key].name));
        li.setAttribute("id", "listItem" + key);

        //style based on team
        if (team === "red") {
          li.style.color = "#FF4447";
        }
        else {
          li.style.color = "#5CCFF2";
        }

        //append to row and user list
        row.appendChild(li);
        userList.appendChild(row);

        //add the player to the game
        game.addPlayer(key, clients[key].name, team, clients[key].isSpyMaster);
      }
    }

    //set the team for the client
    Client.setTeam(game.players[Client.socket.id].team);
  });

  //handler on what to do when a spymaster is requested
  Client.socket.on('makeSpyMaster', function(playerId) {
    
    //make all players on the same team not spymaster
    for (var p in game.players) {
      if (game.players[playerId].team === game.players[p].team) {
        game.players[p].isSpyMaster = false;
      }
    }

    //set the spymaster
    game.players[playerId].isSpyMaster = true;

    //show the button
    if (Client.socket.id !== playerId && game.players[playerId].team === Client.team) {
      document.getElementById("spyMasterButton").style.display = "inline-block";
    }
  });

  //handler on what to do when a player leaves
  Client.socket.on('removePlayer', function(playerId) {
    delete game.players[playerId];
    document.getElementById("listItem" + playerId).remove();
  });

  //handler on what to do when a new game is sent
  Client.socket.on('newGame', function() {

    //set the background
    background(100);

    //show the ready button and hide the nextTurn button
    document.getElementById("readyBtn").style.display = "inline-block";
    document.getElementById("nextTurn").style.display = "none";

    //set the game attributes back to defaults
    game.mode = "lobby"
    game.cards = [];
    game.winner = null;
    game.room = Client.room;
    game.turnNumber = 1;

    //make no one spymaster
    for (var key in game.players) {
      game.players[key].isSpyMaster = false;
    }

    //show the spymaster button
    document.getElementById("spyMasterButton").style.display = "inline-block";

  });

  //handler on what to do when a win event is sent
  Client.socket.on('win', function(data) {
    //change the mode to win
    changeMode("win");

    //hide the next turn button
    document.getElementById("nextTurn").style.display = "none";

    //set the winner
    game.winner = data;
  });

  //handler on what to do when a card update is sent
  Client.socket.on('cardUpdate', function(data) {
    game.cards[data.index].col = data.col;
    game.cards[data.index].textCol = data.textCol;
    game.cards[data.index].isFlipped = data.isFlipped;
  });
}

Client.socket.emit('loaded');

//function to draw the game
function draw() {

  //if the game mode is in lobby, show the waiting screen
  if (game.mode === "lobby") {
    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Waiting for players to ready up...", 150, 200, 500, 100);
  }

  //if in game mode, show the game
  else if (game.mode === "game") {
    if (game.players[Client.socket.id] != null) {
      if (!game.players[Client.socket.id].isSpyMaster) {
        for (var i = 0; i < game.cards.length; i++) {
          game.cards[i].display();
        }
      }
      else {
        for (var i = 0; i < game.cards.length; i++) {
          game.cards[i].spyDisplay();
        }
      }
    }
    else {
      for (var i = 0; i < game.cards.length; i++) {
        game.cards[i].display();
      }
    }
  }

  //if in win mode, display the fireworks
  else if (game.mode === "win") {
    background(0);
    firework.applyForce(gravity);
    firework.update();
    firework.show();

    if (firework.vel.y > 0) {
      firework.explode();
    }

    if (offScreen(firework.pos)) {
      firework = new Particle(width / 2 + random(-250,250), height, createVector(random(-6,6), random(-19,-10)));
    }
    
    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text(game.winner + " team won!", 150, 200, 500, 100);
    fill(105, 117, 119, 5);
    rect(245, 200, 300, 100);
  }

  //unrecognized if option
  else {
    console.log("ERROR: unrecognized game mode" + game.mode);
  }
}

//function to check if a team has won
function checkWin(teamColor) {

  if (teamColor === "red") {
    for (var i = 0; i < game.cards.length; i++) {
      if (game.cards[i].isRed) {
        if (!game.cards[i].isFlipped) {
          return false;
        }
      }
    }

    return true;
  }
  else {
    for (var i = 0; i < game.cards.length; i++) {
      if (game.cards[i].isBlue) {
        if (!game.cards[i].isFlipped) {
          return false;
        }
      }
    }

    return true;
  }
}

//function to check whether the cards were clicked when the mous was pressed
function mousePressed() {
  if (game.players[Client.socket.id] != null && !game.players[Client.socket.id].isSpyMaster) {

    //if its red turn, only red can click
    if (Client.team == "red" && game.turnNumber % 2 == 0) {
      for (var i = 0; i < game.cards.length; i++) {
        if (game.cards[i].click(mouseX, mouseY)) {

          var cardData = {
            room: Client.room,
            index: i,
            col: game.cards[i].col,
            textCol: game.cards[i].textCol,
            isFlipped: game.cards[i].isFlipped
          };
      
          Client.socket.emit('cardUpdate', cardData);

          if (checkWin("red") && game.mode != "win") {
            Client.socket.emit('win', "red", Client.room);
          }

          if (checkWin("blue") && game.mode != "win") {
            Client.socket.emit('win', "blue", Client.room);
          }
        }
      }
    }
    //if its blue turn, only blue can click
    else if (Client.team === "blue" && game.turnNumber % 2 != 0) {
      for (var i = 0; i < game.cards.length; i++) {
        if (game.cards[i].click(mouseX, mouseY)) {

          var cardData = {
            room: Client.room,
            index: i,
            col: game.cards[i].col,
            textCol: game.cards[i].textCol,
            isFlipped: game.cards[i].isFlipped
          };

      
          Client.socket.emit('cardUpdate', cardData);

          if (checkWin("red") && game.mode != "win") {
            Client.socket.emit('win', "red", Client.room);
          }

          if (checkWin("blue") && game.mode != "win") {
            Client.socket.emit('win', "blue", Client.room);
          }
        }
      }
    }
  }
}

//submitfunction, changes to next turn
function submit() {
  changeMode("game");
  Client.socket.emit('startGame', game.room);
}

//function to ask for a new game
function newGame() {
  Client.socket.emit('newGame', game.room);
}

//nextTurn function
function nextTurn() {
  Client.socket.emit('nextTurn', game.room);
}

//function to make a player spyMaster
function makeSpyMaster() {
  Client.socket.emit('makeSpyMaster', game.room);
  document.getElementById("spyMasterButton").style.display = "none";
}

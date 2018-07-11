//variables to start with

class Game {
  constructor () {
    this.room = Client.room;
    this.turnNumber = 1,
    this.cards = [],
    this.mode = "lobby";
    this.winner = null;
  }
}

var game = new Game();

function changeMode(mode) {
  game.mode = mode;
  Client.socket.emit('modeUpdate', game.room, game.mode);
}

Client.socket.on('win', function(data) {
  changeMode("win");
  game.winner = data;
});

Client.socket.on('createCards', function(data, mode, winner) {
  game.mode = mode;
  game.winner = winner;
  for (var i = 0; i < data.length; i++) {
    background(100);
    document.getElementById("readyBtn").style.display = "none";
    game.cards.push(new Card(data[i].x, data[i].y, data[i].word, data[i].isRed, data[i].isBlue, data[i].col, data[i].textCol, data[i].isFlipped));
  }
});

Client.socket.on('cardUpdate', function(data) {
  game.cards[data.index].col = data.col;
  game.cards[data.index].textCol = data.textCol;
  game.cards[data.index].isFlipped = data.isFlipped;
});

//variables for fireworks
var gravity;
var firework;



//setup function to create the canvas and set the canvas to the correct div
function setup() {
  var cnv = createCanvas(800, 530);
  background(100);
  cnv.parent('sketch-holder');
  gravity = createVector(0, 0.2);
  firework = new Particle(width / 2, height, createVector(1, -15));
}

//function to draw the cards
function draw() {
  if (game.mode === "lobby") {
    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Waiting for players to ready up...", 150, 200, 500, 100);
  }
  else if (game.mode === "game") {
    for (var i = 0; i < game.cards.length; i++) {
      game.cards[i].display();
    }
  }
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
  else {
    console.log("unrecognized game mode" + game.mode);
  }
}

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

  for (var i = 0; i < game.cards.length; i++) {
    if (game.cards[i].click(mouseX, mouseY)) {

      var cardData = {
        room: Client.room,
        index: i,
        col: game.cards[i].col,
        textCol: game.cards[i].textCol,
        isFlipped: game.cards[i].isFlipped
      };

      console.log(cardData);
  
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

//submitfunction, changes to next turn
function submit() {
  console.log("button clicked!");
  console.log(game.room);
  changeMode("game");
  Client.socket.emit('startGame', game.room);
}


//function to check the turn number, returns true if it is the next turn
function checkTurnNumber() {
  //get the previous turn
  var previousTurn = turnStack.peek();
  //add the current turn to the Stack
  turnStack.push(turnNumber);

  //if the current turn is greater than the previous turn, return true
  if (turnStack.peek() > previousTurn) {
    return true;
  }
  //else return false and log 'not your turn' to the console
  else {
    console.log("not your turn");
    return false;
  }
  
}
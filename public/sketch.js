//variables to start with
var Game = {
  room: Client.room,
  turnNumber: 1,
  cards: [],
  mode: "lobby",
  winner: null
};

Client.socket.on('win', function(data) {
  Game.mode = "win";
  Game.winner = data;
});

Client.socket.on('createCards', function(data) {
  for (var i = 0; i < data.length; i++) {
    background(100);
    Game.mode = "game";
    document.getElementById("readyBtn").style.display = "none";
    Game.cards.push(new Card(data[i].x, data[i].y, data[i].word, data[i].isRed, data[i].isBlue, data[i].col, data[i].textCol, data[i].isFlipped));
  }
});

Client.socket.on('cardUpdate', function(data) {
  Game.cards[data.index].col = data.col;
  Game.cards[data.index].textCol = data.textCol;
  Game.cards[data.index].isFlipped = data.isFlipped;
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
  if (Game.mode === "lobby") {
    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Waiting for players to ready up...", 150, 200, 500, 100);
  }
  else if (Game.mode === "game") {
    for (var i = 0; i < Game.cards.length; i++) {
      Game.cards[i].display();
    }
  }
  else if (Game.mode === "win") {
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
    text(Game.winner + " team won!", 150, 200, 500, 100);
    fill(105, 117, 119, 5);
    rect(245, 200, 300, 100);
  }
  else {
    console.log("unrecognized game mode");
  }
}

function checkWin(teamColor) {

  if (teamColor === "red") {
    for (var i = 0; i < Game.cards.length; i++) {
      if (Game.cards[i].isRed) {
        if (!Game.cards[i].isFlipped) {
          return false;
        }
      }
    }

    return true;
  }
  else {
    for (var i = 0; i < Game.cards.length; i++) {
      if (Game.cards[i].isBlue) {
        if (!Game.cards[i].isFlipped) {
          return false;
        }
      }
    }

    return true;
  }
}

//function to check whether the cards were clicked when the mous was pressed
function mousePressed() {

  for (var i = 0; i < Game.cards.length; i++) {
    if (Game.cards[i].click(mouseX, mouseY)) {

      var cardData = {
        room: Client.room,
        index: i,
        col: Game.cards[i].col,
        textCol: Game.cards[i].textCol,
        isFlipped: Game.cards[i].isFlipped
      };

      console.log(cardData);
  
      Client.socket.emit('cardUpdate', cardData);

      if (checkWin("red") && Game.mode != "win") {
        Client.socket.emit('win', "red", Client.room);
      }

      if (checkWin("blue") && Game.mode != "win") {
        Client.socket.emit('win', "blue", Client.room);
      }
    }
  }
}

//submitfunction, changes to next turn
function submit() {
  console.log("button clicked!");
  console.log(Game.room);
  Client.socket.emit('startGame', Game.room);
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
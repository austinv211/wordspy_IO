//variables to start with
var Game = {
  turnNumber: 1,
  cards: []
};

Client.socket.on('createCards', function(data) {
  for (var i = 0; i < data.length; i++) {
    Game.cards.push(new Card(data[i].x, data[i].y, data[i].word, data[i].isRed, data[i].isBlue, data[i].col, data[i].textCol, data[i].isFlipped));
  }
});

Client.socket.on('cardUpdate', function(data) {
  Game.cards[data.index].col = data.col;
  Game.cards[data.index].textCol = data.textCol;
  Game.cards[data.index].isFlipped = data.isFlipped;
});

//setup function to create the canvas and set the canvas to the correct div
function setup() {
  var cnv = createCanvas(800, 500);
  background(100);
  cnv.parent('sketch-holder');
}

//function to draw the cards
function draw() {
  for (var i = 0; i < Game.cards.length; i++) {
    Game.cards[i].display();
  }
}

//function to check whether the cards were clicked when the mous was pressed
function mousePressed() {

  for (var i = 0; i < Game.cards.length; i++) {
    if (Game.cards[i].click(mouseX, mouseY)) {

      console.log(Client.room);
      var cardData = {
        room: Client.room,
        index: i,
        col: Game.cards[i].col,
        textCol: Game.cards[i].textCol,
        isFlipped: Game.cards[i].isFlipped
      };

      console.log(cardData);
  
      Client.socket.emit('cardUpdate', cardData);
    }
  }
}

//submitfunction, changes to next turn
function submit() {
  console.log("button clicked!");
  Game.turnNumber++;
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
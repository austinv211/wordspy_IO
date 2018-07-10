//function to create cards
function createCards() {
    //create an array to store cards
    var numberOfCards = 20;
    var cards = [];
  
    //create the number of cards and space them accordingly
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 5; j++) {
        var c = new Card(j * 150 + 45, 115 * i + 25, "test", false, false);
        console.log("card starting x: " + c.x);
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
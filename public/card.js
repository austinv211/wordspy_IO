//card class
class Card {

    //constructor for the class, takes a x, y, word value, and whether the card is red or is blue
    constructor(x, y, word, isRed, isBlue, col, textCol, isFlipped) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.col = col;
        this.textCol = textCol;
        this.isFlipped = isFlipped;
        this.isBlue = isBlue;
        this.isRed = isRed;
        this.word = word;
    }
  
    //function to perform when a card is clicked
    click(posX, posY) {
        var isInXBounds = (posX >= this.x && posX <= (this.x + this.size));
        var isInYBounds = (posY >= this.y && posY <= (this.y + this.size));
        
        if (isInXBounds && isInYBounds) {
            if (this.isFlipped) {
                console.log("already flipped");
            }
            else {
                console.log("card flipped");
            }
            
            if (this.isRed) {
                this.col = [255, 68, 71];
                this.textCol = [255, 255, 255];
            }
            else if (this.isBlue) {
                this.col = [92, 207, 242];
                this.textCol = [255, 255, 255];
            }
            else {
                this.col = [200, 200, 200];
                this.textCol = [0, 0, 0];
            }

            this.isFlipped = true;

            return true;
        }
        return false;
    }
  
    //function to display the card
    display() {
        // strokeWeight(1);
        // stroke(0);
        noStroke();
        fill(this.col);
        rect(this.x, this.y, this.size, this.size, 10, 10, 10, 10);
        fill(this.textCol);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(this.word, this.x, this.y, this.size, this.size);
    }
}
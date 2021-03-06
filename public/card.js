//card class
class Card {

    //constructor for the class, takes a x, y, word value, and whether the card is red or is blue
    constructor(x, y, word, isRed, isBlue, isBlack, isNon, col, textCol, isFlipped) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.col = col;
        this.textCol = textCol;
        this.isFlipped = isFlipped;
        this.isBlue = isBlue;
        this.isRed = isRed;
        this.isBlack = isBlack;
        this.isNon = isNon;
        this.word = word;
    }
  
    //function to perform when a card is clicked
    click(posX, posY) {
        var isInXBounds = (posX >= this.x && posX <= (this.x + this.size));
        var isInYBounds = (posY >= this.y && posY <= (this.y + this.size));
        
        if (isInXBounds && isInYBounds) {
            
            if (this.isRed) {
                this.col = [255, 68, 71];
                this.textCol = [255, 255, 255];
            }
            else if (this.isBlue) {
                this.col = [35, 127, 224];
                this.textCol = [255, 255, 255];
            }
            else if (this.isBlack) {
                this.col = [200, 200, 200];
                this.textCol = [0, 0, 0];
            }
            else if (this.isNon) {
                this.col = [240, 255, 181];
                this.textCol = [60, 61, 59];
            }

            this.isFlipped = true;

            return true;
        }
        return false;
    }
  
    //function to display the card
    display() {
        noStroke();
        fill(this.col);
        rect(this.x, this.y, 120, 100, 5, 5, 5, 5);
        fill(this.textCol);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(this.word, this.x, this.y, 120, 100);
    }

    //function for spymaster display
    spyDisplay() {
        noStroke();
        fill(this.col);
        rect(this.x, this.y, 120, 100, 5, 5, 5, 5);
        if (this.isRed && !this.isFlipped) {
            fill(255, 68, 71);
        }
        else if(this.isBlue && !this.isFlipped) {
            fill(35, 127, 224);
        }
        else if (this.isBlack && !this.isFlipped) {
            fill(0, 0, 0);
        }
        else if (this.isNon && !this.isFlipped) {
            fill(127, 127, 127);
        }
        else {
            fill(this.textCol);
        }
        textSize(18);
        textAlign(CENTER, CENTER);
        text(this.word, this.x, this.y, 120, 100);
    }
}
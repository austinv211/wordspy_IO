//Stack Class to keep track of player turns
class Stack {
    constructor() {
      this.items = [];
    }
  
    //functions used by class
    push(element) {
      this.items.push(element);
    }
  
    pop() {
      if (this.isEmpty) {
        return "underflow";
      }
      return this.items.pop();
    }
  
    size() {
      return this.items.length;
    }
  
    peek() {
      if (this.isEmpty()) {
        return "null";
      }
      return this.items[this.size() - 1];
    }
  
    isEmpty() {
      return this.items.length == 0;
    }

    printStack() {
        for (var i = 0; i < this.size(); i++) {
            console.log(this.items[i]);
        }
    }
}
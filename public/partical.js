class Particle {
    constructor(x, y, vel = createVector(0, 0)) {
      this.pos = createVector(x, y);
      this.vel = vel;
      this.accel = createVector(0, 0);
  
      this.exploded = false;
      this.bits = [];
  
      var colourChoices = ['pink', 'blue', 'purple', 'green', 'orange', 'yellow', 'red'];
      var randomChoice = floor(random(colourChoices.length));
      this.colour = colourChoices[randomChoice];
    }
  
    explode() {
      if (!this.exploded) {
        this.exploded = true;
  
        for (var i = 0; i < 200; i++) {
          this.bits.push(new Particle(this.pos.x, this.pos.y, p5.Vector.random2D().mult(random(4)).add(this.vel)));
        }
      }
    }
  
    show() {
      if (!this.exploded) {
        fill(255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 5, 5);
      } else {
        for (var i = 0; i < this.bits.length; i++) {
          fill(this.colour);
          noStroke();
          ellipse(this.bits[i].pos.x, this.bits[i].pos.y, 3, 3);
        }
      }
    }
  
    update() {
      this.vel.add(this.accel);
      this.pos.add(this.vel);
      this.accel.mult(0);
      for (var i = 0; i < this.bits.length; i++) {
        this.bits[i].update();
      }
    }
  
    applyForce(F) {
      this.accel.add(F);
      for (var i = 0; i < this.bits.length; i++) {
        this.bits[i].applyForce(F);
      }
    }
}
  
function offScreen(posVect) {
    var x = posVect.x;
    var y = posVect.y;
    return (y > height);
}

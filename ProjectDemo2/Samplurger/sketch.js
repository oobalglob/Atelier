let ButtonTapped = false; // Has the player tapped to unlock the sound?

function userSetupComplete() {
  ButtonTapped = true;
}

// Let statements
let SomeoneGreatFile = 'SomeoneGreat.mp3';
let slowest = 0.25; 
let fastest = 3;
let tick;
let looping = false;
let speed = 1;      
let volume = 0.8;   
let VHS;
let x;
let y;

// Sprite Animation
function Sprite(sheet, x, y, scl){
  this.sheet = sheet;
  this.scale = scl;
  this.spriteX = x;
  this.spriteY = y;
  this.spriteH = sheet.height;
  this.frame = 0;
  this.frames = sheet.width / sheet.height
  
  this.draw = function() {
    image(this.sheet, this.spriteX, this.spriteY, this.spriteH*this.scale, this.spriteH*this.scale, this.spriteH*floor(this.frame), 0, this.spriteH, this.spriteH)
    
    this.frame += 0.06;
    if(this.frame > this.frames){
        this.frame = 0;
    }
  }
}

// Async function, load images, sprite and sound
async function setup() {
  createCanvas(windowWidth, windowHeight);

  shadow =  await loadImage("assets/Shadow.png");
  GloopFrame = await loadImage("assets/GloopFrame.png");
  VHS = await loadImage("assets/VHS.png");
  dude = await loadImage("assets/dude.png");

  lockGestures();
  shadowWalk = new Sprite(shadow, 0, 300, 1) 

  enableSoundTap('Tap to hear magic');
  tick = await loadSound(SomeoneGreatFile);
}

// Draw function for whole game
function draw() {
  if (ButtonTapped) {
    if (speed > 2.0 && volume > 0.5) {
    drawScene2();
    }
    else{
        drawScene1();
    }
  } 
}

// Draw function for scene 1
function drawScene1() {
  background(20);
  shadowWalk.spriteX = mouseX;
  shadowWalk.spriteY = mouseY;
  shadowWalk.draw()
  
  // Loop starts as soon as the sound is on
  if (ButtonTapped && !looping) {
    tick.loop();
    tick.play();
    looping = true;
  }

  // Read mouse/finger input 
  if (ButtonTapped && mouseIsPressed) {
    speed = map(mouseX, 0, width, slowest, fastest, true);
    volume = map(mouseY, height, 70, 0, 1, true);
    tick.rate(speed);
    tick.amp(volume, 0.05);
  }

  // Grid/Lines - where the finger is, or was last
  let x = map(speed, slowest, fastest, 0, width);
  let y = map(volume, 0, 1, height, 70);
  stroke(500);
  line(x, 5, x, height);
  line(5, y, width, y);
  
  // UI
  image(GloopFrame, 0, 1, windowWidth, windowHeight) //frame around the game
  image(VHS,x-(VHS.width/2),y-(VHS.height/2)); //VHS tape

  // Text Labels
  noStroke();
  fill(250);
  textSize(15);
  text('p5.sound · speed ' + nf(speed, 1, 2) + '   volume ' + nf(volume, 1, 2), 100, 100);
  fill(250);
  textSize(15);
  text('Someone Great - LCD Soundsystem.', 100, height - 80);

  // Button Text
  if (ButtonTapped) {
    text('drag VHS to get funky', 100, 70);
  }
}

// Draw function for scene 2
function drawScene2() {
  background(20);
  shadowWalk.draw()

  let x = map(speed, slowest, fastest, 0, width);
  let y = map(volume, 0, 1, height, 70);
  stroke(500);
  line(x, 70, x, height);
  line(0, y, width, y);

  // UI
  image(GloopFrame, 0, 1, windowWidth, windowHeight) //frame around the game
  image(VHS,x-(VHS.width/2),y-(VHS.height/2)); //VHS tape

  image (dude, 700, 100) //evil monster getting you

  noStroke();
  fill(500);
  // font()
  textSize(15);
  text('create a tune to please it', 150, 450);
}

// Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
const SHARE_HOST = 'https://oobalglob.github.io/Atelier/ProjectDemo2/Samplurger/';   // the class server
const ROOM = 'class';    // your room
const MY_NAME = '';      // your name

function userSetupComplete() {
  ButtonTapped = true;
}

// Let statements
const ANIMALS = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow', 'hare', 'wren', 'seal', 'lynx',
  'owl', 'bee', 'deer', 'frog', 'mole', 'swan', 'duck', 'goat', 'crab', 'toad',
  'lark', 'robin', 'finch', 'panda', 'koala', 'llama', 'puffin', 'badger', 'beaver', 'tiger'];
let ButtonTapped = false; // Has the player tapped to unlock the sound?
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

window.addEventListener('deviceorientation', function (e) {
  if (e.beta !== null) gotTilt = true;
});

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
  angleMode(DEGREES);
  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'send-several-things',
    // a word, a number set once, and two numbers that change. Add more names here
    me: { name: MY_NAME || random(ANIMALS), hue: floor(random(360)), x: 0, y: 0 }
  });
  enablePermissionsTap(['gyro', 'sound', 'share'], 'Tap to join');   // tilt and sound before the room
  showDesktopQr();
  osc = new p5.Oscillator(330, 'triangle');
  osc.amp(0);

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
  textSize(14);
  text('Speed ' + nf(speed, 1, 2) + '   Volume ' + nf(volume, 1, 2), 110, 100);
  fill(250);
  textSize(14);
  text('Someone Great - LCD Soundsystem.', 110, height - 70);

  // Button Text
  if (ButtonTapped) {
    textSize(14);
    text('drag VHS to get funky', 110, 70);
  }
}

// Draw function for scene 2
function drawScene2() {
  background(20);

  shadowWalk.draw()

  // let x = map(speed, slowest, fastest, 0, width);
  // let y = map(volume, 0, 1, height, 70);
  // stroke(500);
  // line(x, 5, x, height);
  // line(0, y, width, y);

  // UI
  image(GloopFrame, 0, 1, windowWidth, windowHeight) //frame around the game
  image(VHS,x-(VHS.width/2),y-(VHS.height/2)); //VHS tape

  // image (dude, 400, 20) //evil monster getting you

  // noStroke();
  // fill(500);
  // // font()
  // textSize(15);
  // text('create a tune to please it', 150, 450);

  const k = min(width / 390, height / 700);
  colorMode(HSB);

  // two numbers from -1 to 1, in steps of 0.05
  if (gotTilt) {
    me.x = round(constrain(rotationY / 30, -1, 1) * 20) / 20;   // left and right
    me.y = round(constrain(rotationX / 30, -1, 1) * 20) / 20;   // towards you and away
  } else {
    me.x = round(constrain(map(mouseX, 0, width, -1, 1), -1, 1) * 20) / 20;
    me.y = round(constrain(map(mouseY, 0, height, -1, 1), -1, 1) * 20) / 20;
  }

  // the field. A dot is a part of the field, so dots touch at the same moment on every screen
  const r = min(width, height) * 0.4;
  const d = r * 0.22;
  noFill();
  stroke(0, 0, 30);
  strokeWeight(2 * k);
  square(width / 2 - r, height / 2 - r, r * 2);

  // everyone with a name: me last, so I am drawn on top.
  // guestsWith('name') skips a phone whose name has not arrived yet
  const everyone = guestsWith('name').concat([me]);
  textAlign(CENTER, BOTTOM);
  textSize(16 * k);
  for (const person of everyone) {
    const px = width / 2 + person.x * r;
    const py = height / 2 + person.y * r;
    noStroke();
    fill(person.hue, 70, 100);
    circle(px, py, d);
    fill(0, 0, 100);
    text(person.name, px, py - d / 2 - 4 * k);
  }

  // a ring round my own dot
  noFill();
  stroke(me.hue, 70, 100);
  strokeWeight(3 * k);
  circle(width / 2 + me.x * r, height / 2 + me.y * r, d + 16 * k);

  checkTouches(everyone, d / r);
  drawBursts(r, k);
  drawWhoIAm(k);

  textAlign(CENTER, CENTER);
  fill(0, 0, 60);
  textSize(16 * k);
  text(shareStatusText(), width / 2, height - 66 * k);
  text('you send ' + JSON.stringify(me), 10 * k, height - 50 * k, width - 20 * k, 44 * k);   // a box, so a long line wraps
  
}


// Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


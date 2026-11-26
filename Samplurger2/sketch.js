// Your room: change ROOM to the room you were given. Phones with the same ROOM meet.
// Hold the phone flat, then tilt it like a tray. On a laptop, move the mouse.
// Key data: me.name, me.hue, me.x, me.y (yours), the same names in guests[i] (theirs)

const SHARE_HOST = 'https://oobalglob.github.io/Atelier/Other';   // the class server
const ROOM = 'a1-lagoon';    // Host room
const MY_NAME = '';      // Characters name
const sprites = [];

const ANIMALS = ['Simba', 'Shadow', 'Frank', 'Paul', 'Coco', 'Scooby'];

function userSetupComplete() {
  ButtonTapped = true;
}

// Let statements
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
let gotTilt = false;
let osc;                 // the bump: an oscillator that runs silent until two dots touch
let touching = {};       // the pairs of dots that touch now, so each touch bumps once
let bursts = [];         // the bursts on screen now

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

async function setup() {
  createCanvas(windowWidth, windowHeight);

  dude = await loadImage("assets/dude.png");
  shadow =  await loadImage("assets/Shadow.png");
  GloopFrame = await loadImage("assets/GloopFrame.png");
 
  lockGestures();
  sprites.push(new Sprite(shadow, 0, 300, 1) );
  sprites.push(new Sprite(shadow, 0, 300, 1) );
  sprites.push(new Sprite(shadow, 0, 300, 1) );
  sprites.push(new Sprite(shadow, 0, 300, 1) );
  
  angleMode(DEGREES);
  textFont('system-ui');
  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'Samplurger',
    // a word, a number set once, and two numbers that change. Add more names here
    me: { name: MY_NAME || random(ANIMALS), hue: floor(random(360)), x: 0, y: 0 }
  });

  enablePermissionsTap(['gyro', 'sound', 'share'], 'Tap to join');   // tilt and sound before the room
  showDesktopQr();

  osc = new p5.Oscillator(330, 'triangle');
  osc.amp(0);
}

// the tap has turned the sound on, so the oscillator can start (silent)
function userSetupComplete() {
  osc.start();
}

function draw() {
  const k = min(width / 390, height / 700);
  background(10);
  colorMode(HSB);

  // two numbers from -1 to 1, in steps of 0.05
  if (gotTilt) {
    me.x = round(constrain(rotationY / 30, -1, 1) * 20) / 20;   // left and right
    me.y = round(constrain(rotationX / 30, -1, 1) * 20) / 20;   // towards you and away
  } else {
    me.x = round(constrain(map(mouseX, 0, width, -1, 1), -1, 1) * 20) / 20;
    me.y = round(constrain(map(mouseY, 0, height, -1, 1), -1, 1) * 20) / 20;
  }

  // Grid/Lines - where the finger is, or was last
  let x = map(speed, slowest, fastest, 0, width);
  let y = map(volume, 0, 1, height, 70);

  // UI
  image(GloopFrame, 0, 1, windowWidth, windowHeight) //frame around the game
  sprites[1].spriteX = x - (shadow.width/4);
  sprites[1].spriteY = y - (shadow.height/2);
  sprites[1].draw(); //Shadow

  // the field
  const r = min(width, height) * 0.4;
  const d = r * 0.22;
  noFill();
  stroke(0, 0, 0);
  strokeWeight(0 * k);
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
    image(dude, width / 2.5 + me.x * r, height / 3 + me.y * r, d + 80 * k);
    fill(0, 0, 100);
    text(person.name, px, py - d / 2 - 4 * k);
  }

  // a ring round my own dot
  // noFill();
  // stroke(me.hue, 70, 100);
  // strokeWeight(3 * k);
  // circle(width / 2 + me.x * r, height / 2 + me.y * r, d + 16 * k);

  checkTouches(everyone, d / r);
  drawBursts(r, k);
  drawWhoIAm(k);

  // bottom text
  textAlign(CENTER, CENTER);
  fill(0, 0, 500);
  textSize(16 * k);
  text(shareStatusText(), width / 2, height - 66 * k);
}

// Two dots touch when they are closer than one dot across
// Every phone works this out from the x and y it already has, so nothing new is sent.
function checkTouches(everyone, size) {
  for (let i = 0; i < everyone.length; i++) {
    for (let j = i + 1; j < everyone.length; j++) {
      const a = everyone[i];
      const b = everyone[j];
      const pair = [a.id || 'me', b.id || 'me'].sort().join('+');
      const apart = dist(a.x, a.y, b.x, b.y);
      if (apart < size && !touching[pair]) {
        touching[pair] = true;
        bursts.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, hues: [a.hue, b.hue], born: millis() });
        bump();
      } else if (apart > size * 1.2) {
        delete touching[pair];   // apart again. The small gap stops a shaky hand bumping twice
      }
    }
  }
}

// a short bump: turn the oscillator up, then straight back down
function bump() {
  osc.amp(0.4, 0.01);
  setTimeout(function () {
    osc.amp(0, 0.15);
  }, 80);
}

// each burst is two rings, one in each colour, that grow and fade over half a second
function drawBursts(r, k) {
  noFill();
  strokeWeight(5 * k);
  for (const b of bursts) {
    const age = (millis() - b.born) / 500;
    stroke(b.hues[0], 70, 100, 1 - age);
    circle(width / 2 + b.x * r, height / 2 + b.y * r, age * r * 0.6);
    stroke(b.hues[1], 70, 100, 1 - age);
    circle(width / 2 + b.x * r, height / 2 + b.y * r, age * r * 0.9);
  }
  bursts = bursts.filter(function (b) { return millis() - b.born < 500; });
}

// who I am: a border round the screen in my colour, and my name at the top
function drawWhoIAm(k) {
  noFill();
  stroke(me.hue, 70, 100);
  strokeWeight(12 * k);
  rect(0, 0, width, height);
  noStroke();
  fill(280, 100, 90);
  textAlign(CENTER, CENTER);
  textSize(30 * k);
  text('Samplurger', width / 2, 26 * k);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
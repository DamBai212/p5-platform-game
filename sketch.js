/* Skyline Sprint
 * Side-scrolling platform game built with p5.js
 * Base features: world scrolling, canyons, collectables, score/lives, game states
 * Extensions: platforms (factory), enemies (constructor), procedural sound effects
 */

'use strict';

let floorPosY;
let gameCharX;
let gameCharY;
let scrollPos;
let gameCharWorldX;

let isLeft = false;
let isRight = false;
let isFalling = false;
let isPlummeting = false;

let trees = [];
let mountains = [];
let clouds = [];
let canyons = [];
let collectables = [];
let platforms = [];
let enemies = [];
let stars = [];

let flagpole;
let lives = 3;
let score = 0;
let gameState = 'start'; // start | playing | level-clear | game-over

let sounds;

function setup()
{
  const canvas = createCanvas(1024, 576);
  canvas.parent('app');

  floorPosY = height * 0.75;
  initSounds();
  startGame(true);
  gameState = 'start';
}

function startGame(resetScore)
{
  gameCharX = width * 0.2;
  gameCharY = floorPosY;
  scrollPos = 0;
  gameCharWorldX = gameCharX - scrollPos;

  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

  if (resetScore)
  {
    score = 0;
    lives = 3;
  }

  createLevel();
  gameState = 'playing';
}

function createLevel()
{
  const worldLength = 4200;

  stars = Array.from({ length: 80 }, (_, i) => ({
    x: random(0, worldLength),
    y: random(15, 220),
    size: random(1.5, 3.5),
    twinkleOffset: random(TWO_PI),
    speed: random(0.01, 0.03)
  }));

  trees = [
    { x: 260, scale: 1.0 },
    { x: 680, scale: 1.25 },
    { x: 1120, scale: 0.9 },
    { x: 1500, scale: 1.1 },
    { x: 1900, scale: 1.0 },
    { x: 2350, scale: 1.2 },
    { x: 2780, scale: 1.05 },
    { x: 3220, scale: 1.1 },
    { x: 3620, scale: 0.95 }
  ];

  mountains = [
    { x: 120, width: 380, height: 260 },
    { x: 860, width: 420, height: 280 },
    { x: 1760, width: 460, height: 300 },
    { x: 2720, width: 380, height: 250 },
    { x: 3380, width: 420, height: 275 }
  ];

  clouds = [
    { x: 140, y: 120, size: 0.9 },
    { x: 560, y: 95, size: 1.3 },
    { x: 1010, y: 130, size: 1.05 },
    { x: 1490, y: 80, size: 1.45 },
    { x: 2100, y: 115, size: 1.2 },
    { x: 2580, y: 90, size: 1.0 },
    { x: 3070, y: 110, size: 1.35 },
    { x: 3670, y: 85, size: 1.05 }
  ];

  canyons = [
    { x: 520, width: 130 },
    { x: 1260, width: 170 },
    { x: 2060, width: 140 },
    { x: 2940, width: 185 }
  ];

  collectables = [
    makeCollectable(360, floorPosY - 40),
    makeCollectable(810, floorPosY - 40),
    makeCollectable(990, floorPosY - 130),
    makeCollectable(1330, floorPosY - 180),
    makeCollectable(1690, floorPosY - 40),
    makeCollectable(2180, floorPosY - 40),
    makeCollectable(2480, floorPosY - 110),
    makeCollectable(3005, floorPosY - 200),
    makeCollectable(3490, floorPosY - 40),
    makeCollectable(3900, floorPosY - 70)
  ];

  platforms = [];
  platforms.push(createPlatform(900, floorPosY - 70, 160));
  platforms.push(createPlatform(1220, floorPosY - 120, 130));
  platforms.push(createPlatform(1360, floorPosY - 185, 110));
  platforms.push(createPlatform(2440, floorPosY - 80, 130));
  platforms.push(createPlatform(2890, floorPosY - 160, 120));
  platforms.push(createPlatform(3020, floorPosY - 220, 120));

  enemies = [
    new Enemy(1580, floorPosY - 8, 240),
    new Enemy(2250, floorPosY - 8, 190),
    new Enemy(3320, floorPosY - 8, 240)
  ];

  flagpole = {
    x: worldLength - 250,
    isReached: false
  };
}

function draw()
{
  gameCharWorldX = gameCharX - scrollPos;
  const isPlaying = gameState === 'playing';

  drawSkyGradient();
  drawParallaxStars();

  fill(57, 172, 105);
  noStroke();
  rect(0, floorPosY, width, height - floorPosY);

  push();
  translate(scrollPos, 0);

  drawMountains();
  drawClouds();
  drawTrees();
  drawGroundDetail();

  for (const canyon of canyons)
  {
    drawCanyon(canyon);
    if (isPlaying)
    {
      checkCanyon(canyon);
    }
  }

  for (const platform of platforms)
  {
    platform.draw();
  }

  for (const item of collectables)
  {
    if (!item.isFound)
    {
      drawCollectable(item);
      if (isPlaying)
      {
        checkCollectable(item);
      }
    }
  }

  for (const enemy of enemies)
  {
    enemy.draw();
    if (isPlaying)
    {
      enemy.update();

      if (enemy.checkContact(gameCharWorldX, gameCharY))
      {
        loseLife();
        break;
      }
    }
  }

  renderFlagpole();
  if (isPlaying)
  {
    checkFlagpole();
  }

  pop();

  drawGameChar();
  drawHud();
  runGameLogic();
}

function runGameLogic()
{
  if (gameState !== 'playing')
  {
    return;
  }

  if (isLeft)
  {
    if (gameCharX > width * 0.35)
    {
      gameCharX -= 5;
    }
    else
    {
      scrollPos += 5;
    }
  }

  if (isRight)
  {
    if (gameCharX < width * 0.65)
    {
      gameCharX += 5;
    }
    else
    {
      scrollPos -= 5;
    }
  }

  let isSupportedByPlatform = false;
  for (const platform of platforms)
  {
    if (platform.checkContact(gameCharWorldX, gameCharY))
    {
      isSupportedByPlatform = true;
      break;
    }
  }

  if (gameCharY < floorPosY && !isSupportedByPlatform)
  {
    gameCharY += 3.4;
    isFalling = true;
  }
  else
  {
    isFalling = false;
  }

  if (isPlummeting)
  {
    gameCharY += 7;
  }

  if (gameCharY > height + 90)
  {
    loseLife();
  }

  gameCharWorldX = gameCharX - scrollPos;
}

function keyPressed()
{
  if (keyCode === 32)
  {
    userStartAudio();

    if (gameState === 'start')
    {
      gameState = 'playing';
      return;
    }

    if (gameState === 'game-over' || gameState === 'level-clear')
    {
      startGame(true);
      return;
    }

    if (gameState === 'playing' && !isPlummeting && !isFalling)
    {
      gameCharY -= 120;
      playSound(sounds.jump);
    }
  }

  if (gameState !== 'playing')
  {
    return;
  }

  if (keyCode === LEFT_ARROW || key.toLowerCase() === 'a')
  {
    isLeft = true;
  }

  if (keyCode === RIGHT_ARROW || key.toLowerCase() === 'd')
  {
    isRight = true;
  }
}

function keyReleased()
{
  if (keyCode === LEFT_ARROW || key.toLowerCase() === 'a')
  {
    isLeft = false;
  }

  if (keyCode === RIGHT_ARROW || key.toLowerCase() === 'd')
  {
    isRight = false;
  }
}

function drawSkyGradient()
{
  for (let y = 0; y < floorPosY; y++)
  {
    const mix = map(y, 0, floorPosY, 0, 1);
    const c = lerpColor(color(24, 31, 56), color(74, 121, 168), mix);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawParallaxStars()
{
  push();
  translate(scrollPos * 0.2, 0);

  for (const star of stars)
  {
    const alpha = 150 + 100 * sin(frameCount * star.speed + star.twinkleOffset);
    noStroke();
    fill(255, 255, 230, alpha);
    circle(star.x, star.y, star.size);
  }

  pop();
}

function drawClouds()
{
  for (const cloud of clouds)
  {
    push();
    translate(cloud.x, cloud.y);
    scale(cloud.size);
    noStroke();
    fill(245, 248, 255, 220);
    ellipse(-35, 6, 70, 42);
    ellipse(0, -4, 80, 50);
    ellipse(38, 7, 74, 46);
    pop();
  }
}

function drawMountains()
{
  for (const mountain of mountains)
  {
    noStroke();
    fill(58, 87, 120);
    triangle(
      mountain.x,
      floorPosY,
      mountain.x + mountain.width * 0.4,
      floorPosY - mountain.height,
      mountain.x + mountain.width,
      floorPosY
    );

    fill(69, 103, 140);
    triangle(
      mountain.x + 30,
      floorPosY,
      mountain.x + mountain.width * 0.62,
      floorPosY - mountain.height * 0.8,
      mountain.x + mountain.width + 20,
      floorPosY
    );

    fill(215, 226, 241, 170);
    triangle(
      mountain.x + mountain.width * 0.41,
      floorPosY - mountain.height * 0.98,
      mountain.x + mountain.width * 0.53,
      floorPosY - mountain.height * 0.72,
      mountain.x + mountain.width * 0.31,
      floorPosY - mountain.height * 0.72
    );
  }
}

function drawTrees()
{
  for (const tree of trees)
  {
    push();
    translate(tree.x, floorPosY);
    scale(tree.scale);

    noStroke();
    fill(96, 58, 38);
    rect(-10, -100, 20, 100, 4);

    fill(41, 130, 75);
    circle(0, -130, 72);
    circle(-24, -97, 60);
    circle(24, -96, 56);
    circle(-2, -158, 54);

    pop();
  }
}

function drawGroundDetail()
{
  for (let x = -200; x < 4500; x += 45)
  {
    stroke(43, 125, 74, 140);
    line(x, floorPosY, x + 8, floorPosY - 10);
  }
}

function drawCanyon(canyon)
{
  noStroke();
  fill(28, 54, 80);
  rect(canyon.x, floorPosY, canyon.width, height - floorPosY);

  fill(18, 35, 52);
  rect(canyon.x + 8, floorPosY, canyon.width - 16, height - floorPosY);
}

function checkCanyon(canyon)
{
  const onGround = gameCharY >= floorPosY - 1;
  const within = gameCharWorldX > canyon.x + 12 && gameCharWorldX < canyon.x + canyon.width - 12;

  if (onGround && within)
  {
    isPlummeting = true;
    isLeft = false;
    isRight = false;
  }
}

function makeCollectable(x, y)
{
  return {
    x,
    y,
    size: 28,
    isFound: false,
    bobOffset: random(TWO_PI)
  };
}

function drawCollectable(item)
{
  const bob = 4 * sin(frameCount * 0.08 + item.bobOffset);

  push();
  translate(item.x, item.y + bob);
  noStroke();

  fill(242, 186, 52);
  ellipse(0, 0, item.size + 8, item.size + 8);

  fill(252, 214, 120);
  ellipse(0, 0, item.size, item.size);

  fill(255, 242, 182, 160);
  ellipse(-4, -4, item.size * 0.35, item.size * 0.35);

  pop();
}

function checkCollectable(item)
{
  const d = dist(gameCharWorldX, gameCharY, item.x, item.y);
  if (d < 35)
  {
    item.isFound = true;
    score += 1;
    playSound(sounds.collect);
  }
}

function renderFlagpole()
{
  stroke(230);
  strokeWeight(5);
  line(flagpole.x, floorPosY, flagpole.x, floorPosY - 230);

  noStroke();
  fill(240, 74, 74);

  if (flagpole.isReached)
  {
    triangle(flagpole.x, floorPosY - 230, flagpole.x + 75, floorPosY - 205, flagpole.x, floorPosY - 180);
  }
  else
  {
    triangle(flagpole.x, floorPosY - 132, flagpole.x + 75, floorPosY - 108, flagpole.x, floorPosY - 84);
  }
}

function checkFlagpole()
{
  if (!flagpole.isReached && abs(gameCharWorldX - flagpole.x) < 20)
  {
    flagpole.isReached = true;
    gameState = 'level-clear';
    isLeft = false;
    isRight = false;
    playSound(sounds.win);
  }
}

function drawGameChar()
{
  push();
  translate(gameCharX, gameCharY);

  const movingLeft = isLeft && !isFalling;
  const movingRight = isRight && !isFalling;
  const jumpingLeft = isLeft && isFalling;
  const jumpingRight = isRight && isFalling;

  stroke(30, 35, 48);
  strokeWeight(2);

  if (jumpingLeft || jumpingRight)
  {
    drawCharacterBody();
    line(-8, -18, -19, -8);
    line(8, -18, 19, -8);
    line(-6, -2, -16, 13);
    line(6, -2, 16, 13);
  }
  else if (movingLeft)
  {
    drawCharacterBody();
    line(-8, -18, -18, -10);
    line(8, -18, 10, -8);
    line(-7, -2, -12, 16);
    line(7, -2, 2, 16);
  }
  else if (movingRight)
  {
    drawCharacterBody();
    line(-8, -18, -10, -8);
    line(8, -18, 18, -10);
    line(-7, -2, -2, 16);
    line(7, -2, 12, 16);
  }
  else if (isFalling || isPlummeting)
  {
    drawCharacterBody();
    line(-8, -18, -16, -5);
    line(8, -18, 16, -5);
    line(-7, -2, -12, 16);
    line(7, -2, 12, 16);
  }
  else
  {
    drawCharacterBody();
    line(-8, -18, -13, -8);
    line(8, -18, 13, -8);
    line(-7, -2, -8, 16);
    line(7, -2, 8, 16);
  }

  pop();
}

function drawCharacterBody()
{
  fill(240, 214, 184);
  ellipse(0, -35, 22, 22);

  fill(46, 68, 153);
  rect(-10, -28, 20, 24, 4);

  fill(31, 45, 105);
  rect(-10, -4, 20, 8, 3);

  fill(18, 22, 36);
  ellipse(-4, -36, 2.5, 2.5);
  ellipse(4, -36, 2.5, 2.5);
}

function drawHud()
{
  noStroke();
  fill(19, 23, 38, 180);
  rect(14, 14, 230, 78, 10);

  fill(250);
  textSize(22);
  textStyle(BOLD);
  text(`Score: ${score}`, 28, 45);
  text(`Lives: ${lives}`, 28, 76);

  textSize(28);
  textAlign(CENTER);

  if (gameState === 'start')
  {
    fill(255);
    text('Skyline Sprint', width / 2, height * 0.28);
    textSize(18);
    text('Reach the flag, avoid canyons and enemies, collect every orb.', width / 2, height * 0.34);
    text('Press SPACE to start and jump. Use A/D or arrow keys to move.', width / 2, height * 0.39);
  }
  else if (gameState === 'level-clear')
  {
    fill(205, 255, 205);
    text('Level Complete!', width / 2, height * 0.30);
    textSize(18);
    text('Press SPACE to play again.', width / 2, height * 0.36);
  }
  else if (gameState === 'game-over')
  {
    fill(255, 198, 198);
    text('Game Over', width / 2, height * 0.30);
    textSize(18);
    text('Press SPACE to restart.', width / 2, height * 0.36);
  }

  textAlign(LEFT);
}

function loseLife()
{
  if (gameState !== 'playing')
  {
    return;
  }

  lives -= 1;
  playSound(sounds.hit);

  if (lives < 1)
  {
    gameState = 'game-over';
    isLeft = false;
    isRight = false;
  }
  else
  {
    const preservedScore = score;
    createLevel();
    score = preservedScore;

    gameCharX = width * 0.2;
    gameCharY = floorPosY;
    scrollPos = 0;
    gameCharWorldX = gameCharX - scrollPos;
    isLeft = false;
    isRight = false;
    isPlummeting = false;
    isFalling = false;
  }
}

function createPlatform(x, y, length)
{
  return {
    x,
    y,
    length,
    draw()
    {
      noStroke();
      fill(128, 92, 63);
      rect(this.x, this.y, this.length, 16, 5);
      fill(102, 150, 92);
      rect(this.x, this.y - 8, this.length, 10, 5);
    },
    checkContact(charX, charY)
    {
      const withinX = charX > this.x && charX < this.x + this.length;
      const d = this.y - charY;
      return withinX && d >= 0 && d < 6;
    }
  };
}

function Enemy(x, y, range)
{
  this.startX = x;
  this.x = x;
  this.y = y;
  this.range = range;
  this.speed = 1.4;
  this.direction = 1;

  this.update = function()
  {
    this.x += this.speed * this.direction;

    if (this.x >= this.startX + this.range)
    {
      this.direction = -1;
    }
    else if (this.x <= this.startX)
    {
      this.direction = 1;
    }
  };

  this.draw = function()
  {
    push();
    translate(this.x, this.y);

    noStroke();
    fill(173, 53, 68);
    ellipse(0, 0, 32, 22);

    fill(235, 212, 170);
    ellipse(0, -14, 21, 21);

    fill(24, 28, 42);
    ellipse(-4, -15, 3, 3);
    ellipse(4, -15, 3, 3);

    stroke(24, 28, 42);
    strokeWeight(2);
    line(-10, 8, -15, 16);
    line(10, 8, 15, 16);

    pop();
  };

  this.checkContact = function(charX, charY)
  {
    return dist(charX, charY, this.x, this.y) < 25;
  };
}

function initSounds()
{
  sounds = {
    jump: createTone(510, 0.09, 'triangle', 0.015, 0.07),
    collect: createTone(780, 0.08, 'sine', 0.005, 0.08),
    hit: createTone(140, 0.2, 'square', 0.005, 0.12),
    win: createTone(620, 0.3, 'sine', 0.01, 0.2)
  };
}

function createTone(freq, duration, wave, attack, release)
{
  const osc = new p5.Oscillator(wave);
  const env = new p5.Envelope();

  env.setADSR(attack, 0.05, 0.3, release);
  env.setRange(0.28, 0);

  osc.freq(freq);
  osc.amp(0);
  osc.start();

  return {
    osc,
    env,
    duration,
    trigger()
    {
      env.play(osc, 0, duration);
    }
  };
}

function playSound(sound)
{
  if (!sound)
  {
    return;
  }

  sound.trigger();
}

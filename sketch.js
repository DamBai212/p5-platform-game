/* Skyline Sprint
 * Side-scrolling platform game built with p5.js
 * Campaign update: multi-level progression, checkpoints, and crumble platforms
 * by Damany Bailey
 * Date 03/22/2026
 */

'use strict';

let floorPosY;
let gameCharX;
let gameCharY;
let scrollPos;
let gameCharWorldX;
const MAX_JUMPS = 2;
const GROUND_JUMP_STRENGTH = 120;
const AIR_JUMP_STRENGTH = 105;

let isLeft = false;
let isRight = false;
let isFalling = false;
let isPlummeting = false;
let jumpsUsed = 0;

let trees = [];
let mountains = [];
let clouds = [];
let canyons = [];
let collectables = [];
let platforms = [];
let enemies = [];
let stars = [];

let currentLevel;
let checkpoint;
let flagpole;
let gameState = 'start'; // start | playing | level-transition | victory | game-over
let campaignState;
let hudMessage = '';
let hudMessageTimer = 0;

let sounds;

function setup()
{
  const canvas = createCanvas(1024, 576);
  canvas.parent('app');

  floorPosY = height * 0.75;
  initSounds();
  resetCampaign();
  loadLevel(0);
  gameState = 'start';
}

function resetCampaign()
{
  campaignState = {
    currentLevelIndex: 0,
    lives: 3,
    score: 0,
    collectedItemIds: new Set(),
    checkpointActive: false,
    checkpointSpawn: null
  };

  hudMessage = '';
  hudMessageTimer = 0;
}

function beginCampaign()
{
  resetCampaign();
  loadLevel(0);
  gameState = 'playing';
}

function loadLevel(levelIndex)
{
  currentLevel = LEVELS[levelIndex];
  campaignState.currentLevelIndex = levelIndex;

  resetMovementFlags();
  buildSceneFromLevel(currentLevel);

  flagpole = {
    x: currentLevel.flagpoleX,
    isReached: false
  };

  checkpoint = createCheckpoint(currentLevel.checkpoint);
  checkpoint.isReached = campaignState.checkpointActive;

  const spawnPoint = campaignState.checkpointActive && campaignState.checkpointSpawn
    ? campaignState.checkpointSpawn
    : currentLevel.spawn;

  placeCharacterAtWorldPosition(spawnPoint);
}

function buildSceneFromLevel(level)
{
  stars = generateStars(level.worldLength, level.scenery.starCount);
  trees = level.scenery.trees.map((tree) => ({ ...tree }));
  mountains = level.scenery.mountains.map((mountain) => ({ ...mountain }));
  clouds = level.scenery.clouds.map((cloud) => ({ ...cloud }));
  canyons = level.canyons.map((canyon) => ({ ...canyon }));
  collectables = level.collectables.map((item) => makeCollectable(item));
  platforms = level.platforms.map((platform) => createPlatform(platform));
  enemies = level.enemies.map((enemy) => new Enemy(enemy.x, enemy.y, enemy.range, enemy.speed));
}

function generateStars(worldLength, count)
{
  return Array.from({ length: count }, () => ({
    x: random(0, worldLength),
    y: random(15, 220),
    size: random(1.5, 3.5),
    twinkleOffset: random(TWO_PI),
    speed: random(0.01, 0.03)
  }));
}

function placeCharacterAtWorldPosition(spawnPoint)
{
  const anchorX = width * 0.2;
  const minScroll = min(0, width - currentLevel.worldLength);

  scrollPos = constrain(anchorX - spawnPoint.x, minScroll, 0);
  gameCharX = spawnPoint.x + scrollPos;
  gameCharY = spawnPoint.y;
  gameCharWorldX = spawnPoint.x;

  resetMovementFlags();
}

function resetMovementFlags()
{
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;
  jumpsUsed = 0;
}

function clearCheckpointProgress()
{
  campaignState.checkpointActive = false;
  campaignState.checkpointSpawn = null;
  hudMessage = '';
  hudMessageTimer = 0;
}

function advanceToNextLevel()
{
  clearCheckpointProgress();

  const nextLevelIndex = campaignState.currentLevelIndex + 1;
  if (nextLevelIndex >= LEVELS.length)
  {
    gameState = 'victory';
    return;
  }

  loadLevel(nextLevelIndex);
  gameState = 'playing';
}

function draw()
{
  gameCharWorldX = gameCharX - scrollPos;

  if (hudMessageTimer > 0)
  {
    hudMessageTimer -= 1;

    if (hudMessageTimer === 0)
    {
      hudMessage = '';
    }
  }

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
    if (isPlaying)
    {
      platform.update();
    }

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

  renderCheckpoint();

  if (isPlaying)
  {
    checkCheckpoint();
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

  handleHorizontalMovement();

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
    if (!isSupportedByPlatform)
    {
      gameCharY = floorPosY;
    }

    isFalling = false;
  }

  if (!isPlummeting && (isSupportedByPlatform || gameCharY >= floorPosY))
  {
    jumpsUsed = 0;
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

function handleHorizontalMovement()
{
  const speed = 5;
  const minScroll = min(0, width - currentLevel.worldLength);

  if (isLeft)
  {
    if (gameCharX > width * 0.35 || scrollPos >= 0)
    {
      gameCharX -= speed;
    }
    else
    {
      scrollPos += speed;
    }
  }

  if (isRight)
  {
    if (gameCharX < width * 0.65 || scrollPos <= minScroll)
    {
      gameCharX += speed;
    }
    else
    {
      scrollPos -= speed;
    }
  }

  scrollPos = constrain(scrollPos, minScroll, 0);

  const minScreenX = scrollPos === 0 ? 0 : width * 0.35;
  const maxScreenX = scrollPos === minScroll ? width : width * 0.65;
  gameCharX = constrain(gameCharX, minScreenX, maxScreenX);
}

function keyPressed()
{
  if (keyCode === 32)
  {
    userStartAudio();

    if (gameState === 'start')
    {
      beginCampaign();
      return;
    }

    if (gameState === 'level-transition')
    {
      advanceToNextLevel();
      return;
    }

    if (gameState === 'game-over' || gameState === 'victory')
    {
      beginCampaign();
      return;
    }

    if (gameState === 'playing' && canJump())
    {
      performJump();
    }
  }

  if (gameState !== 'playing')
  {
    return;
  }

  if (isLeftInput())
  {
    isLeft = true;
  }

  if (isRightInput())
  {
    isRight = true;
  }
}

function keyReleased()
{
  if (isLeftInput())
  {
    isLeft = false;
  }

  if (isRightInput())
  {
    isRight = false;
  }
}

function isLeftInput()
{
  return keyCode === LEFT_ARROW || (typeof key === 'string' && key.toLowerCase() === 'a');
}

function isRightInput()
{
  return keyCode === RIGHT_ARROW || (typeof key === 'string' && key.toLowerCase() === 'd');
}

function canJump()
{
  return !isPlummeting && jumpsUsed < MAX_JUMPS;
}

function performJump()
{
  const jumpStrength = jumpsUsed === 0 ? GROUND_JUMP_STRENGTH : AIR_JUMP_STRENGTH;
  gameCharY -= jumpStrength;
  isFalling = true;
  jumpsUsed += 1;
  playSound(sounds.jump);
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
  const worldLength = currentLevel ? currentLevel.worldLength : 4500;

  for (let x = -200; x < worldLength + 260; x += 45)
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

function makeCollectable(item)
{
  return {
    id: item.id,
    x: item.x,
    y: item.y,
    size: 28,
    isFound: campaignState.collectedItemIds.has(item.id),
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
    campaignState.collectedItemIds.add(item.id);
    campaignState.score += 1;
    playSound(sounds.collect);
  }
}

function createCheckpoint(data)
{
  return {
    x: data.x,
    y: data.y,
    width: data.width,
    spawn: { ...data.spawn },
    isReached: false
  };
}

function renderCheckpoint()
{
  if (!checkpoint)
  {
    return;
  }

  stroke(230);
  strokeWeight(4);
  line(checkpoint.x, floorPosY, checkpoint.x, floorPosY - 120);

  noStroke();
  fill(checkpoint.isReached ? color(81, 218, 197) : color(103, 142, 227));
  triangle(
    checkpoint.x,
    floorPosY - 118,
    checkpoint.x + 46,
    floorPosY - 101,
    checkpoint.x,
    floorPosY - 84
  );

  fill(checkpoint.isReached ? color(121, 245, 226, 180) : color(141, 176, 255, 170));
  ellipse(checkpoint.x + 4, floorPosY - 98, 26, 26);
}

function checkCheckpoint()
{
  if (checkpoint.isReached)
  {
    return;
  }

  if (abs(gameCharWorldX - checkpoint.x) < checkpoint.width * 0.5)
  {
    checkpoint.isReached = true;
    campaignState.checkpointActive = true;
    campaignState.checkpointSpawn = { ...checkpoint.spawn };
    showHudMessage('Checkpoint activated');
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
    isLeft = false;
    isRight = false;
    playSound(sounds.win);

    if (campaignState.currentLevelIndex === LEVELS.length - 1)
    {
      gameState = 'victory';
    }
    else
    {
      gameState = 'level-transition';
    }
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
  rect(14, 14, 380, 98, 10);

  fill(250);
  textAlign(LEFT);
  textStyle(BOLD);
  textSize(21);
  text(`Score: ${campaignState.score}`, 28, 44);
  text(`Lives: ${campaignState.lives}`, 28, 74);
  textSize(18);
  text(`${getLevelLabel()}  ${currentLevel.name}`, 160, 44);

  textStyle(NORMAL);
  textSize(15);
  const checkpointStatus = campaignState.checkpointActive ? 'Checkpoint: active' : 'Checkpoint: not reached';
  text(checkpointStatus, 160, 72);

  if (hudMessage)
  {
    rectMode(CENTER);
    noStroke();
    fill(19, 23, 38, 210);
    rect(width / 2, 54, 250, 38, 10);
    fill(248);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(16);
    text(hudMessage, width / 2, 60);
    rectMode(CORNER);
  }

  textAlign(CENTER);
  textStyle(BOLD);
  textSize(28);

  if (gameState === 'start')
  {
    fill(255);
    text('Skyline Sprint Campaign', width / 2, height * 0.26);
    textSize(18);
    text(`${getLevelLabel()} - ${currentLevel.name}`, width / 2, height * 0.32);
    textStyle(NORMAL);
    text(currentLevel.introText, width / 2 - 260, height * 0.37, 520, 80);
    text('Press SPACE to start. Use A/D or arrow keys to move.', width / 2, height * 0.47);
    text('Press SPACE again in mid-air for a double jump over wider gaps.', width / 2, height * 0.52);
    text('Reach each flag, activate checkpoints, and keep your lives alive.', width / 2, height * 0.57);
  }
  else if (gameState === 'level-transition')
  {
    const nextLevel = LEVELS[campaignState.currentLevelIndex + 1];
    fill(205, 255, 205);
    text(`${currentLevel.name} Clear!`, width / 2, height * 0.30);
    textSize(18);
    text(`Score: ${campaignState.score}  Lives: ${campaignState.lives}`, width / 2, height * 0.36);
    text(`Next up: ${nextLevel.name}`, width / 2, height * 0.42);
    textStyle(NORMAL);
    text(nextLevel.introText, width / 2 - 260, height * 0.47, 520, 80);
    text('Press SPACE to continue.', width / 2, height * 0.59);
  }
  else if (gameState === 'victory')
  {
    fill(217, 255, 214);
    text('Campaign Complete!', width / 2, height * 0.29);
    textSize(18);
    text(`Final Score: ${campaignState.score}`, width / 2, height * 0.35);
    text(`Lives Remaining: ${campaignState.lives}`, width / 2, height * 0.40);
    textStyle(NORMAL);
    text('You made it across every skyline route.', width / 2, height * 0.47);
    text('Press SPACE to start a fresh run.', width / 2, height * 0.53);
  }
  else if (gameState === 'game-over')
  {
    fill(255, 198, 198);
    text('Game Over', width / 2, height * 0.30);
    textSize(18);
    text(`Final Score: ${campaignState.score}`, width / 2, height * 0.36);
    textStyle(NORMAL);
    text('Press SPACE to restart the campaign.', width / 2, height * 0.43);
  }

  textAlign(LEFT);
  textStyle(NORMAL);
}

function getLevelLabel()
{
  return `Level ${campaignState.currentLevelIndex + 1}/${LEVELS.length}`;
}

function showHudMessage(message)
{
  hudMessage = message;
  hudMessageTimer = 150;
}

function loseLife()
{
  if (gameState !== 'playing')
  {
    return;
  }

  campaignState.lives -= 1;
  playSound(sounds.hit);
  resetMovementFlags();

  if (campaignState.lives < 1)
  {
    gameState = 'game-over';
    clearCheckpointProgress();
  }
  else
  {
    loadLevel(campaignState.currentLevelIndex);
  }
}

function createPlatform(data)
{
  return {
    id: data.id,
    type: data.type || 'static',
    x: data.x,
    y: data.y,
    length: data.length,
    delayFrames: data.delayFrames || 42,
    triggeredAt: null,
    fallOffset: 0,
    fallSpeed: 0,
    update()
    {
      if (this.type !== 'crumble' || this.triggeredAt === null)
      {
        return;
      }

      if (frameCount - this.triggeredAt >= this.delayFrames)
      {
        this.fallSpeed += 0.38;
        this.fallOffset += this.fallSpeed;
      }
    },
    draw()
    {
      const renderY = this.y + this.fallOffset;
      if (renderY > height + 40)
      {
        return;
      }

      const shaking = this.type === 'crumble' && this.triggeredAt !== null && frameCount - this.triggeredAt < this.delayFrames;
      const shakeOffset = shaking ? sin(frameCount * 0.8) * 1.8 : 0;

      push();
      translate(shakeOffset, 0);
      noStroke();

      if (this.type === 'crumble')
      {
        fill(166, 98, 65);
        rect(this.x, renderY, this.length, 16, 5);
        fill(211, 152, 101);
        rect(this.x, renderY - 8, this.length, 10, 5);

        stroke(117, 60, 44);
        strokeWeight(2);
        line(this.x + 18, renderY - 3, this.x + 30, renderY + 7);
        line(this.x + this.length * 0.55, renderY - 6, this.x + this.length * 0.62, renderY + 8);
        line(this.x + this.length - 28, renderY - 5, this.x + this.length - 16, renderY + 7);
      }
      else
      {
        fill(128, 92, 63);
        rect(this.x, renderY, this.length, 16, 5);
        fill(102, 150, 92);
        rect(this.x, renderY - 8, this.length, 10, 5);
      }

      pop();
    },
    checkContact(charX, charY)
    {
      const withinX = charX > this.x && charX < this.x + this.length;
      const platformY = this.y + this.fallOffset;
      const delayElapsed = this.type === 'crumble' && this.triggeredAt !== null && frameCount - this.triggeredAt >= this.delayFrames;

      if (delayElapsed)
      {
        return false;
      }

      const d = platformY - charY;
      const touching = withinX && d >= 0 && d < 6;

      if (touching && this.type === 'crumble' && this.triggeredAt === null)
      {
        this.triggeredAt = frameCount;
      }

      return touching;
    }
  };
}

function Enemy(x, y, range, speed)
{
  this.startX = x;
  this.x = x;
  this.y = y;
  this.range = range;
  this.speed = speed || 1.4;
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

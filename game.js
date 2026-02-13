const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("start-menu");
const storyPanel = document.getElementById("story-panel");
const endPanel = document.getElementById("end-panel");
const winPanel = document.getElementById("win-panel");
const storyTitle = document.getElementById("story-title");
const storyText = document.getElementById("story-text");
const endTitle = document.getElementById("end-title");
const endText = document.getElementById("end-text");
const levelLabel = document.getElementById("level-label");
const collectLabel = document.getElementById("collect-label");
const lettersLabel = document.getElementById("letters-label");

const startBtn = document.getElementById("start-btn");
const continueBtn = document.getElementById("continue-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const replayBtn = document.getElementById("replay-btn");
const musicBtn = document.getElementById("music-btn");

const mobileControls = document.getElementById("mobile-controls");
const joystick = document.getElementById("joystick");
const joystickThumb = document.getElementById("joystick-thumb");

const world = {
  gravity: 0.6,
  friction: 0.85,
  cameraX: 0,
};

const player = {
  x: 80,
  y: 0,
  w: 78,
  h: 52,
  vx: 0,
  vy: 0,
  speed: 3.2,
  jumpPower: 11,
  grounded: false,
  hearts: 3,
  facing: 1,
};

const keys = {
  left: false,
  right: false,
  up: false,
  attack: false,
};

const audio = {
  enabled: false,
  context: null,
  gain: null,
  loopId: null,
};

const faceImages = {
  me: new Image(),
  partner: new Image(),
};

faceImages.me.src = "assets/P1.jpg";
faceImages.partner.src = "assets/P2.jpg";

const bossImage = new Image();
bossImage.src = "assets/boss.jpg";

const levels = [
  {
    id: 1,
    title: "Ngày đầu 2 con chó béo gặp nhau",
    date: "1/1/2024",
    story: "Một buổi sáng đầu năm thật đẹp",
    background: "spring",
    collectibles: ["flower", "message", "calendar"],
    message: "Ngày chúng ta bắt đầu – 1/1/2024 ❤️",
    letters: null,
    boss: null,
  },
  {
    id: 2,
    title: "Valentine đầu tiên",
    date: "2/14/2024",
    story: "Trao nhau những món quà dễ thương",
    background: "night",
    collectibles: ["heart", "chocolate", "rose"],
    message: "Valentine đầu tiên của chúng ta 💖",
    letters: ["Y", "Ê", "U", "E", "M"],
    boss: null,
  },
  {
    id: 3,
    title: "Mùa Valentine thứ 3",
    date: "2/14/2026",
    story: "Mai nè chó mập",
    background: "sunset",
    collectibles: ["memory", "heart"],
    message: "Valentine thứ ba của chúng ta ❤️",
    letters: null,
    boss: "Distance",
  },
];

let currentLevelIndex = 0;
let levelState = null;
let gameState = "menu"; // menu, story, playing, end, win
let fireworks = [];
let heartParticles = [];
let tick = 0;

const joystickState = {
  active: false,
  pointerId: null,
  originX: 0,
  originY: 0,
  dx: 0,
};

const startGame = () => {
  currentLevelIndex = 0;
  setupLevel();
  showStory();
};

const setupLevel = () => {
  const level = levels[currentLevelIndex];
  levelState = {
    width: 3200,
    height: 540,
    platforms: buildPlatforms(level.id),
    gaps: buildGaps(level.id),
    collectibles: buildCollectibles(level.id),
    enemies: buildEnemies(level.id),
    letters: level.letters ? buildLetters(level.letters) : [],
    exit: { x: 3000, y: 360, w: 60, h: 120, unlocked: level.letters === null },
    collected: 0,
  };
  resetPlayer();
  updateHud();
};

const resetPlayer = () => {
  player.x = 80;
  player.y = 260;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  world.cameraX = 0;
};

const buildPlatforms = (id) => {
  if (id === 1) {
    return [
      { x: 0, y: 430, w: 800, h: 120, type: "ground" },
      { x: 880, y: 460, w: 420, h: 90, type: "ground" },
      { x: 1350, y: 400, w: 520, h: 120, type: "ground" },
      { x: 1950, y: 360, w: 480, h: 160, type: "ground" },
      { x: 2500, y: 420, w: 700, h: 120, type: "ground" },
      { x: 620, y: 320, w: 120, h: 28, type: "brick" },
      { x: 1050, y: 300, w: 160, h: 28, type: "brick" },
      { x: 2200, y: 300, w: 140, h: 28, type: "brick" },
    ];
  }
  if (id === 2) {
    return [
      { x: 0, y: 430, w: 700, h: 120, type: "ground" },
      { x: 780, y: 380, w: 320, h: 160, type: "ground" },
      { x: 1180, y: 440, w: 320, h: 100, type: "ground" },
      { x: 1550, y: 360, w: 350, h: 180, type: "ground" },
      { x: 2000, y: 420, w: 350, h: 120, type: "ground" },
      { x: 2450, y: 320, w: 280, h: 220, type: "ground" },
      { x: 2800, y: 440, w: 380, h: 100, type: "ground" },
      { x: 980, y: 300, w: 160, h: 26, type: "moving", vx: 1.1, minX: 900, maxX: 1200 },
      { x: 1900, y: 280, w: 150, h: 26, type: "moving", vx: -1, minX: 1750, maxX: 2100 },
      { x: 2350, y: 250, w: 120, h: 26, type: "brick" },
    ];
  }
  return [
    { x: 0, y: 430, w: 720, h: 120, type: "ground" },
    { x: 820, y: 370, w: 360, h: 200, type: "ground" },
    { x: 1280, y: 340, w: 360, h: 200, type: "ground" },
    { x: 1750, y: 390, w: 420, h: 150, type: "ground" },
    { x: 2250, y: 320, w: 420, h: 220, type: "ground" },
    { x: 2750, y: 420, w: 400, h: 120, type: "ground" },
    { x: 1100, y: 280, w: 140, h: 26, type: "brick" },
    { x: 2050, y: 260, w: 160, h: 26, type: "brick" },
  ];
};

const buildGaps = (id) => {
  if (id === 1) {
    return [
      { start: 800, end: 880 },
      { start: 1870, end: 1950 },
    ];
  }
  if (id === 2) {
    return [
      { start: 700, end: 780 },
      { start: 1500, end: 1550 },
      { start: 2350, end: 2450 },
    ];
  }
  return [
    { start: 720, end: 820 },
    { start: 1650, end: 1750 },
    { start: 2170, end: 2250 },
  ];
};

const buildCollectibles = (id) => {
  const items = [];
  const base = [250, 520, 860, 1100, 1450, 1760, 2100, 2480, 2850];
  base.forEach((x, i) => {
    items.push({
      x,
      y: 320 - (i % 3) * 40,
      type: id === 1 ? (i === 2 ? "calendar" : i % 2 ? "message" : "flower") : id === 2 ? (i % 2 ? "heart" : "chocolate") : i % 2 ? "memory" : "heart",
      collected: false,
    });
  });
  return items;
};

const buildEnemies = (id) => {
  if (id === 1) {
    return [
      { x: 500, y: 390, w: 40, h: 30, vx: 0.5, type: "Shyness" },
      { x: 1550, y: 360, w: 40, h: 30, vx: -0.5, type: "Shyness" },
    ];
  }
  if (id === 2) {
    return [
      { x: 950, y: 340, w: 42, h: 32, vx: 0.8, type: "Busy" },
      { x: 2100, y: 380, w: 42, h: 32, vx: -0.8, type: "Busy" },
    ];
  }
  return [
    { x: 1900, y: 350, w: 60, h: 50, vx: 1.1, type: "Distance", hp: 3 },
  ];
};

const buildLetters = (letters) => {
  return letters.map((letter, i) => ({
    x: 850 + i * 300,
    y: 280 - (i % 2) * 40,
    letter,
    collected: false,
  }));
};

const updateHud = () => {
  levelLabel.textContent = `Level ${levels[currentLevelIndex].id}`;
  collectLabel.textContent = `Collect: ${levelState.collected}`;
  if (levels[currentLevelIndex].letters) {
    const collectedLetters = levelState.letters.map((l) => (l.collected ? l.letter : "_"));
    lettersLabel.textContent = `LOVE: ${collectedLetters.join(" ")}`;
  } else {
    lettersLabel.textContent = "";
  }
};

const showStory = () => {
  const level = levels[currentLevelIndex];
  storyTitle.textContent = `Level ${level.id} — ${level.title}`;
  storyText.textContent = level.story;
  setPanel(storyPanel);
  gameState = "story";
};

const showEnd = () => {
  const level = levels[currentLevelIndex];
  endTitle.textContent = `Level ${level.id} Complete`;
  endText.textContent = level.message;
  setPanel(endPanel);
  gameState = "end";
};

const showWin = () => {
  setPanel(winPanel);
  gameState = "win";
  startFireworks();
};

const setPanel = (panel) => {
  [startMenu, storyPanel, endPanel, winPanel].forEach((p) => p.classList.remove("active"));
  if (panel) {
    panel.classList.add("active");
  }
};

const handleInput = () => {
  if (keys.left) {
    player.vx = Math.max(player.vx - player.speed, -6);
    player.facing = -1;
  }
  if (keys.right) {
    player.vx = Math.min(player.vx + player.speed, 6);
    player.facing = 1;
  }
  if (keys.up && player.grounded) {
    player.vy = -player.jumpPower;
    player.grounded = false;
  }
};

const updatePlayer = () => {
  handleInput();
  player.vy += world.gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.vx *= world.friction;

  player.grounded = false;
  levelState.platforms.forEach((platform) => {
    if (rectIntersect(player, platform)) {
      const overlapY = player.y + player.h - platform.y;
      if (player.vy >= 0 && overlapY < 30) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
        if (platform.type === "moving") {
          player.x += platform.vx;
        }
      }
    }
  });

  if (player.y > canvas.height + 200) {
    resetPlayer();
  }

  world.cameraX = Math.min(Math.max(player.x - canvas.width / 2, 0), levelState.width - canvas.width);
};

const updateEnemies = () => {
  levelState.enemies.forEach((enemy) => {
    enemy.x += enemy.vx;
    if (enemy.x < 300 || enemy.x > levelState.width - 300) {
      enemy.vx *= -1;
    }

    if (rectIntersect(player, enemy)) {
      if (player.vy > 1) {
        player.vy = -8;
        if (enemy.type === "Distance") {
          enemy.hp -= 1;
          if (enemy.hp <= 0) {
            enemy.defeated = true;
          }
        } else {
          enemy.defeated = true;
        }
      } else {
        resetPlayer();
      }
    }
  });

  levelState.enemies = levelState.enemies.filter((enemy) => !enemy.defeated);
};

const updateCollectibles = () => {
  levelState.collectibles.forEach((item) => {
    if (!item.collected && rectIntersect(player, { x: item.x, y: item.y, w: 30, h: 30 })) {
      item.collected = true;
      levelState.collected += 1;
      spawnHeartParticles(item.x, item.y, 6);
      updateHud();
    }
  });

  levelState.letters.forEach((letter) => {
    if (!letter.collected && rectIntersect(player, { x: letter.x, y: letter.y, w: 32, h: 32 })) {
      letter.collected = true;
      spawnHeartParticles(letter.x, letter.y, 5);
      if (levelState.letters.every((l) => l.collected)) {
        levelState.exit.unlocked = true;
      }
      updateHud();
    }
  });
};

const updateExit = () => {
  if (levelState.exit.unlocked && rectIntersect(player, levelState.exit)) {
    showEnd();
  }
};

const rectIntersect = (a, b) => {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
};

const drawBackground = (type) => {
  if (type === "spring") {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#c7f7ff");
    gradient.addColorStop(1, "#fef9e7");
    ctx.fillStyle = gradient;
  } else if (type === "night") {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1b1c3a");
    gradient.addColorStop(1, "#3b1d52");
    ctx.fillStyle = gradient;
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ffcfb2");
    gradient.addColorStop(1, "#f06a8b");
    ctx.fillStyle = gradient;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === "spring") {
    drawClouds("#ffffff", 0.2);
    drawGround("#79c267", "#5ca64c");
  } else if (type === "night") {
    drawCityLights();
    drawFireworks(0.3);
    drawGround("#34364f", "#24253b");
  } else {
    drawCastle();
    drawClouds("#fff3e6", 0.25);
    drawGround("#9c6b4c", "#6b4b3a");
  }
  drawAmbientHearts();
};

const drawClouds = (color, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i += 1) {
    const x = (i * 180 - world.cameraX * 0.2) % (canvas.width + 200);
    const y = 60 + (i % 2) * 30;
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 45, y + 10, 40, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawCityLights = () => {
  ctx.save();
  ctx.fillStyle = "#281038";
  ctx.fillRect(0, 320, canvas.width, 220);
  ctx.fillStyle = "#ff7aa2";
  for (let i = 0; i < 9; i += 1) {
    const x = (i * 120 - world.cameraX * 0.35) % (canvas.width + 140);
    ctx.fillRect(x, 260, 70, 60);
    ctx.fillRect(x + 15, 330, 40, 30);
  }
  ctx.restore();
};

const drawCastle = () => {
  ctx.save();
  ctx.fillStyle = "#6e3b6e";
  ctx.fillRect(200 - world.cameraX * 0.1, 240, 160, 160);
  ctx.fillRect(370 - world.cameraX * 0.1, 200, 90, 200);
  ctx.fillStyle = "#ffd1dc";
  ctx.fillRect(240 - world.cameraX * 0.1, 300, 70, 100);
  ctx.restore();
};

const drawGround = (main, shade) => {
  ctx.save();
  ctx.fillStyle = main;
  ctx.fillRect(0, 430, canvas.width, 110);
  ctx.fillStyle = shade;
  ctx.fillRect(0, 430, canvas.width, 16);
  ctx.restore();
};

const drawPlayer = () => {
  const baseX = player.x - world.cameraX;
  const baseY = player.y;
  const personGap = 6;
  const personWidth = (player.w - personGap) / 2;
  const personHeight = player.h;

  drawPerson(baseX, baseY, personWidth, personHeight, "#ff6b8b", faceImages.me);
  drawPerson(baseX + personWidth + personGap, baseY, personWidth, personHeight, "#ff93b0", faceImages.partner);

  ctx.save();
  ctx.strokeStyle = "#ffb3c8";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(baseX + personWidth - 2, baseY + personHeight - 18);
  ctx.lineTo(baseX + personWidth + personGap + 2, baseY + personHeight - 18);
  ctx.stroke();
  ctx.restore();
};

const drawPerson = (x, y, w, h, outfitColor, faceImage) => {
  const headSize = Math.min(26, w - 4);
  const headX = x + w / 2;
  const headY = y + 10;

  ctx.save();
  ctx.fillStyle = outfitColor;
  ctx.fillRect(x + 4, y + 18, w - 8, h - 18);
  ctx.fillStyle = "#ffe5ec";
  ctx.fillRect(x + 10, y + h - 14, w - 20, 10);

  ctx.beginPath();
  ctx.arc(headX, headY, headSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (faceImage.complete && faceImage.naturalWidth) {
    ctx.drawImage(faceImage, headX - headSize / 2, headY - headSize / 2, headSize, headSize);
  } else {
    ctx.fillStyle = "#ffd6e7";
    ctx.fillRect(headX - headSize / 2, headY - headSize / 2, headSize, headSize);
  }

  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(headX, headY, headSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawPlatforms = () => {
  levelState.platforms.forEach((platform) => {
    drawPlatformTiles(platform);
  });
};

const drawCollectibles = () => {
  levelState.collectibles.forEach((item) => {
    if (item.collected) return;
    ctx.save();
    const bob = Math.sin((tick + item.x) * 0.02) * 4;
    if (item.type === "flower") ctx.fillStyle = "#ffb703";
    if (item.type === "message") ctx.fillStyle = "#ff7a93";
    if (item.type === "calendar") ctx.fillStyle = "#5ab0ff";
    if (item.type === "heart") ctx.fillStyle = "#ff4d6d";
    if (item.type === "chocolate") ctx.fillStyle = "#7f5539";
    if (item.type === "rose") ctx.fillStyle = "#f25f5c";
    if (item.type === "memory") ctx.fillStyle = "#ffd166";
    ctx.fillRect(item.x - world.cameraX, item.y + bob, 26, 26);
    ctx.restore();
  });

  levelState.letters.forEach((letter) => {
    if (letter.collected) return;
    ctx.save();
    const bob = Math.sin((tick + letter.x) * 0.02) * 4;
    ctx.fillStyle = "#ffe066";
    ctx.fillRect(letter.x - world.cameraX, letter.y + bob, 28, 28);
    ctx.fillStyle = "#7a1f3d";
    ctx.font = "bold 16px Nunito";
    ctx.fillText(letter.letter, letter.x - world.cameraX + 8, letter.y + bob + 20);
    ctx.restore();
  });
};

const drawEnemies = () => {
  levelState.enemies.forEach((enemy) => {
    ctx.save();
    if (enemy.type === "Distance" && bossImage.complete && bossImage.naturalWidth) {
      const size = Math.max(enemy.w, enemy.h) + 14;
      const centerX = enemy.x - world.cameraX + enemy.w / 2;
      const centerY = enemy.y + enemy.h / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(bossImage, centerX - size / 2, centerY - size / 2, size, size);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = enemy.type === "Distance" ? "#4d194d" : "#6a4c93";
      ctx.fillRect(enemy.x - world.cameraX, enemy.y, enemy.w, enemy.h);
      ctx.fillStyle = "#fff";
      ctx.fillRect(enemy.x - world.cameraX + 8, enemy.y + 10, 6, 6);
      ctx.fillRect(enemy.x - world.cameraX + enemy.w - 14, enemy.y + 10, 6, 6);
    }
    ctx.restore();
  });
};

const drawExit = () => {
  ctx.save();
  ctx.fillStyle = levelState.exit.unlocked ? "#ff85a1" : "#555";
  ctx.fillRect(levelState.exit.x - world.cameraX, levelState.exit.y, levelState.exit.w, levelState.exit.h);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Nunito";
  ctx.fillText(levelState.exit.unlocked ? "EXIT" : "LOCK", levelState.exit.x - world.cameraX + 6, levelState.exit.y + 20);
  ctx.restore();
};

const drawPlatformTiles = (platform) => {
  const tile = 32;
  const offsetX = platform.x - world.cameraX;
  const rows = Math.max(1, Math.floor(platform.h / tile));
  const cols = Math.max(1, Math.floor(platform.w / tile));
  const topColor = platform.type === "ground" ? "#ffb3c8" : "#ffd6e7";
  const fillColor = platform.type === "ground" ? "#f08fae" : platform.type === "moving" ? "#ff9fb5" : "#f5b5c8";

  ctx.save();
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      ctx.fillStyle = y === 0 ? topColor : fillColor;
      ctx.fillRect(offsetX + x * tile, platform.y + y * tile, tile - 2, tile - 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.strokeRect(offsetX + x * tile, platform.y + y * tile, tile - 2, tile - 2);
    }
  }
  ctx.restore();
};

const updatePlatforms = () => {
  levelState.platforms.forEach((platform) => {
    if (platform.type === "moving") {
      platform.x += platform.vx;
      if (platform.x < platform.minX || platform.x + platform.w > platform.maxX) {
        platform.vx *= -1;
      }
    }
  });
};

const updateFireworks = () => {
  fireworks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life -= 1;
  });
  fireworks = fireworks.filter((spark) => spark.life > 0);
};

const spawnHeartParticles = (x, y, count) => {
  for (let i = 0; i < count; i += 1) {
    heartParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -1 - Math.random() * 2,
      life: 60 + Math.random() * 30,
      size: 6 + Math.random() * 6,
      color: Math.random() > 0.5 ? "#ff6b8b" : "#ffd166",
    });
  }
};

const updateHeartParticles = () => {
  heartParticles.forEach((heart) => {
    heart.x += heart.vx;
    heart.y += heart.vy;
    heart.vy += 0.03;
    heart.life -= 1;
  });
  heartParticles = heartParticles.filter((heart) => heart.life > 0);
};

const drawHeartParticles = () => {
  heartParticles.forEach((heart) => {
    drawHeart(heart.x - world.cameraX, heart.y, heart.size, heart.color, heart.life / 90);
  });
};

const drawHeart = (x, y, size, color, alpha = 1) => {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size, y - size, x - size * 1.4, y + size * 0.6, x, y + size * 1.6);
  ctx.bezierCurveTo(x + size * 1.4, y + size * 0.6, x + size, y - size, x, y);
  ctx.fill();
  ctx.restore();
};

const drawAmbientHearts = () => {
  const spacing = 220;
  for (let i = 0; i < 6; i += 1) {
    const x = (i * spacing + 120 - world.cameraX * 0.15) % (canvas.width + 200);
    const y = 90 + Math.sin((tick + i * 30) * 0.03) * 16;
    drawHeart(x, y, 12, "rgba(255, 110, 140, 0.55)", 0.9);
  }
};

const drawFireworks = (alpha = 1) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  fireworks.forEach((spark) => {
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const startFireworks = () => {
  fireworks = [];
  for (let i = 0; i < 120; i += 1) {
    fireworks.push({
      x: canvas.width / 2 + Math.cos(i) * 120,
      y: 120 + Math.sin(i) * 60,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.2) * 2,
      life: 80 + Math.random() * 60,
      color: i % 2 ? "#ffd166" : "#ff6b8b",
    });
  }
};

const update = () => {
  tick += 1;
  if (gameState === "playing") {
    updatePlatforms();
    updatePlayer();
    updateEnemies();
    updateCollectibles();
    updateExit();
    updateHeartParticles();
  }
  if (gameState === "win") {
    updateFireworks();
    updateHeartParticles();
  }
};

const draw = () => {
  const level = levels[currentLevelIndex];
  drawBackground(level.background);
  drawPlatforms();
  drawCollectibles();
  drawHeartParticles();
  drawEnemies();
  drawExit();
  drawPlayer();
  if (gameState === "win") {
    drawFireworks();
  }
};

const loop = () => {
  update();
  draw();
  requestAnimationFrame(loop);
};

const createMusic = () => {
  if (audio.context) return;
  audio.context = new AudioContext();
  audio.gain = audio.context.createGain();
  audio.gain.gain.value = 0.08;
  audio.gain.connect(audio.context.destination);

  const melody = [
    440, 494, 523, 587, 523, 494, 440, 392,
    392, 440, 494, 523, 494, 440, 392, 349,
  ];
  let index = 0;

  const playNote = () => {
    if (!audio.enabled) return;
    const osc = audio.context.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = melody[index % melody.length];
    osc.connect(audio.gain);
    osc.start();
    osc.stop(audio.context.currentTime + 0.22);
    index += 1;
    audio.loopId = setTimeout(playNote, 260);
  };

  playNote();
};

const toggleMusic = () => {
  audio.enabled = !audio.enabled;
  if (audio.enabled) {
    createMusic();
  } else if (audio.loopId) {
    clearTimeout(audio.loopId);
    audio.loopId = null;
  }
};

const handleKey = (event, value) => {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
      keys.left = value;
      break;
    case "ArrowRight":
    case "KeyD":
      keys.right = value;
      break;
    case "ArrowUp":
    case "KeyW":
    case "Space":
      keys.up = value;
      break;
    case "KeyJ":
      keys.attack = value;
      break;
    default:
      break;
  }
};

const bindControls = () => {
  document.addEventListener("keydown", (event) => {
    handleKey(event, true);
  });
  document.addEventListener("keyup", (event) => {
    handleKey(event, false);
  });

  mobileControls.querySelectorAll("button").forEach((btn) => {
    const action = btn.dataset.action;
    const setAction = (value) => {
      if (action === "left") keys.left = value;
      if (action === "right") keys.right = value;
      if (action === "jump") keys.up = value;
      if (action === "attack") keys.attack = value;
    };

    btn.addEventListener("touchstart", (event) => {
      event.preventDefault();
      setAction(true);
    });
    btn.addEventListener("touchend", () => setAction(false));
    btn.addEventListener("mousedown", () => setAction(true));
    btn.addEventListener("mouseup", () => setAction(false));
    btn.addEventListener("mouseleave", () => setAction(false));
  });
};

const bindJoystick = () => {
  if (!joystick || !joystickThumb) return;

  const moveThumb = (x, y) => {
    joystickThumb.style.left = `${x}px`;
    joystickThumb.style.top = `${y}px`;
  };

  const resetThumb = () => {
    joystickThumb.style.left = "50%";
    joystickThumb.style.top = "50%";
  };

  joystick.addEventListener("pointerdown", (event) => {
    joystickState.active = true;
    joystickState.pointerId = event.pointerId;
    const rect = joystick.getBoundingClientRect();
    joystickState.originX = rect.left + rect.width / 2;
    joystickState.originY = rect.top + rect.height / 2;
    joystick.setPointerCapture(event.pointerId);
  });

  joystick.addEventListener("pointermove", (event) => {
    if (!joystickState.active || event.pointerId !== joystickState.pointerId) return;
    const dx = event.clientX - joystickState.originX;
    const dy = event.clientY - joystickState.originY;
    const distance = Math.min(50, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    joystickState.dx = x / 50;
    keys.left = joystickState.dx < -0.25;
    keys.right = joystickState.dx > 0.25;
    moveThumb(x + joystick.offsetWidth / 2, y + joystick.offsetHeight / 2);
  });

  const endDrag = () => {
    joystickState.active = false;
    joystickState.pointerId = null;
    joystickState.dx = 0;
    keys.left = false;
    keys.right = false;
    resetThumb();
  };

  joystick.addEventListener("pointerup", endDrag);
  joystick.addEventListener("pointercancel", endDrag);
  joystick.addEventListener("pointerleave", endDrag);
};

startBtn.addEventListener("click", () => {
  setPanel(null);
  gameState = "playing";
  startGame();
});

continueBtn.addEventListener("click", () => {
  setPanel(null);
  gameState = "playing";
});

nextLevelBtn.addEventListener("click", () => {
  if (currentLevelIndex < levels.length - 1) {
    currentLevelIndex += 1;
    setupLevel();
    showStory();
  } else {
    showWin();
  }
});

replayBtn.addEventListener("click", () => {
  setPanel(null);
  startGame();
  gameState = "playing";
});

musicBtn.addEventListener("click", () => {
  toggleMusic();
});

const init = () => {
  bindControls();
  bindJoystick();
  setPanel(startMenu);
  setupLevel();
  loop();
};

init();

const header = document.getElementById("header");
const canvas = document.getElementById("headerCanvas");
const ctx = canvas.getContext("2d");
canvas.height = header.offsetHeight;
canvas.width = header.offsetWidth;

const ch = canvas.height;
const cw = canvas.width;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, cw, ch);

let mouse = {
  x: 0,
  y: 0,
  pressed: false,
};

const special_characters = [
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
];
const japanese_characters = [
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
  "を",
  "ん",
];
const techno_jargon = [
  "BASW AUDIO",
  "BUY PRODUCT",
  "CONSUME",
  "WE LOVE YOU",
  "GOD IS HERE",
];

const asciiArray = [
  ...special_characters,
  ...japanese_characters,
  ...techno_jargon,
].sort(() => Math.random() - 0.5);

// const asciiArray = Array.from({ length: 95 }, (_, i) =>
//   String.fromCharCode(i + 32)
// );
const colorsTable = [
  [0, 255, 170],
  [195, 0, 255],
  [255, 247, 0],
  [255, 0, 208],
];
let lastColor = colorsTable[0];
console.log(lastColor);
let iColor = 0;
// Print the array to see the ASCII characters

window.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});
window.addEventListener("mousedown", () => {
  mouse.pressed = true;
});

window.addEventListener("mouseup", () => {
  mouse.pressed = false;
});
function countCircles(w, h, cr, cm) {
  // Calculate the effective diameter of each circle including the margin
  const d = 2 * cr + cm;

  // Calculate the number of circles that fit along the width and height
  const circlesAlongWidth = Math.floor(w / d);
  const circlesAlongHeight = Math.floor(h / d);

  // Calculate the total number of circles
  const totalCircles = circlesAlongWidth * circlesAlongHeight;

  return {
    totalCircles,
    circlesAlongWidth,
    circlesAlongHeight,
  };
}

function createGrid(w, h, cr, cm) {
  const { totalCircles, circlesAlongWidth, circlesAlongHeight } = countCircles(
    w,
    h,
    cr,
    cm
  );

  // Initialize the grid array
  let grid = Array.from({ length: totalCircles });

  // Calculate the effective diameter of each circle including the margin
  const d = 2 * cr + cm;

  // Fill the grid with points
  grid = grid.map((point, index) => {
    // Calculate the row and column for the current index
    const row = Math.floor(index / circlesAlongWidth);
    const col = index % circlesAlongWidth;

    // Calculate the x and y coordinates
    const x = col * d + cr + cm / 2;
    const y = row * d + cr + cm / 2;

    return { x, y, r: cr };
  });

  return grid;
}
function lerp(start, end, t) {
  return start + t * (end - start);
}
function easeOutBack(start, end, t, overshoot = 1.70158) {
  const delta = end - start;
  return (
    start +
    delta *
      (1 +
        overshoot * Math.pow(t - 1, 3) +
        (1 - t) * Math.sin((1 - t) * Math.PI))
  );
}

function elasticInterpolation(start, end, t) {
  // Elastic easing function
  function elasticEaseOut(t) {
    return Math.sin(-13 * (t + 1) * (Math.PI / 2)) * Math.pow(2, -10 * t) + 1;
  }

  // Interpolate between start and end using elastic easing
  return start + (end - start) * elasticEaseOut(t);
}

function gridPoint({
  x = 0,
  y = 0,
  r = 0.1,
  color = "white",
  originalX,
  originalY,
} = {}) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
  this.originalX = originalX;
  this.originalY = originalY;
  this.threshold = 200;
  this.startR = this.r;
  this.update = (dt) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    let mouseDist = Math.hypot(mouse.x - this.x, mouse.y - this.y);
    this.threshold = lerp(
      this.threshold,
      Math.floor(Math.random() * (250 - 1 + 1)) + 1,
      0.005
    );
    if (mouseDist < this.threshold) {
      // Apply a force to move the particle away from the mouse
      const force = 500 / (mouseDist + 1); // You can adjust the force as needed
      this.x += (force * (this.x - mouse.x)) / mouseDist;
      this.y += (force * (this.y - mouse.y)) / mouseDist;
      this.r = lerp(this.r, 0.4, 0.1);
    } else {
      // If the mouse is not near, move the particle back to its original position
      const speed = 0.009; // You can adjust the speed as needed
      this.x += (this.originalX - this.x) * speed;
      this.y += (this.originalY - this.y) * speed;
      this.r = lerp(this.r, this.startR, 0.005);
    }
  };
}

function subGridPoint({
  x = 0,
  y = 0,
  r = 0.1,
  color = "black",
  originalX,
  originalY,
} = {}) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
  this.originalX = originalX;
  this.originalY = originalY;
  this.threshold = Math.floor(Math.random() * (100 - 5 + 1)) + 5;
  this.flipCharacterDuration = Math.floor(Math.random() * (250 - 50 + 1)) + 50;
  this.currentChar = 0;
  this.textSize = 9;
  this.start = performance.now();
  this.red = lastColor[0];
  this.green = lastColor[1];
  this.blue = lastColor[2];
  this.shrink = false;
  this.update = (dt) => {
    let now = performance.now();
    ctx.save();
    ctx.font = `${this.textSize}px serif`;
    (this.red = lerp(this.red, colorsTable[iColor][0], 0.01)),
      (this.green = lerp(this.green, colorsTable[iColor][1], 0.01)),
      (this.blue = lerp(this.blue, colorsTable[iColor][2], 0.01)),
      (ctx.fillStyle = `rgb(${this.red},${this.green},${this.blue})`);
    ctx.fillText(asciiArray[this.currentChar], this.x, this.y);
    // ctx.fillText(`rgb(${nextColor.r},${nextColor.g},${nextColor.b})`, this.x, this.y);
    ctx.restore();
    let mouseDist = Math.hypot(mouse.x - this.x, mouse.y - this.y);
    let timer = now - this.start;
    if (mouseDist < this.threshold) {
      if (this.shrink === true) {
        this.textSize = lerp(this.textSize, 1, 0.005);
      } else {
        this.textSize = lerp(this.textSize, 9, 1);
        this.shrink = true;
      }
      if (timer > this.flipCharacterDuration) {
        this.start = performance.now();
        this.currentChar =
          this.currentChar === asciiArray.length
            ? (this.currentChar = 0)
            : (this.currentChar += 1);
      }
    } else {
      this.textSize = lerp(this.textSize, 1, 0.03);
      if (this.textSize >= 1) {
        this.shrink = false;
      }
    }
  };
}

const margin = 50;

let grid = createGrid(cw, ch, 1.5, 60);
let subGrid = createGrid(cw, ch, 5, 18);
let entities = [];

console.log(grid.length);
console.log(subGrid.length);
grid = grid.map((point, index) => {
  // fill grid here
  return new gridPoint({ ...point, originalX: point.x, originalY: point.y });
});
subGrid = subGrid.map((point, index) => {
  // fill grid here
  return new subGridPoint({ ...point, originalX: point.x, originalY: point.y });
});

let lastTime = 0;
const targetFPS = 60;
const frameDuration = 1000 / targetFPS;
let start = Date.now();
const update = (timestamp) => {
  let now = Date.now();
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  //   ctx.clear = "black";
  ctx.clearRect(0, 0, cw, ch);

  grid.forEach((point) => {
    point.update(deltaTime);
  });

  subGrid.forEach((point) => {
    point.update(deltaTime);
  });

  if (now - start > 2000) {
    iColor = iColor === colorsTable.length - 1 ? (iColor = 0) : (iColor += 1);
    if (iColor === 0) {
      lastColor = colorsTable[colorsTable.length - 1];
    } else {
      lastColor = colorsTable[iColor - 1];
    }
    start = Date.now();
  }
  requestAnimationFrame(update);
};

// Start the loop
requestAnimationFrame(update);

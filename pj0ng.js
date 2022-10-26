//HELPERS
var levels = {};

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
}

function clear(ctx, h, w) {
  ctx.clearRect(0, 0, h, w);
}

function path_sin(ctx) {
  // sine path from 0 to rads radians scales by sx

  var N = 29; //number of steps
  var dx = (2 * Math.PI) / N; //number of rounds per frame (full round for 30 fps
  var x = 0; //starting straight (or wtf)
  var px = 150; //x pos in canvas
  var py = 100; //y pos in canvas

  // var p0 = "M"+ px +","+ py;
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(px, py);

  for (var i = 0; i < N; i++) {
    x += dx;
    y = Math.sin(x);

    px += (180.0 / Math.PI) * dx;
    py = 100 - 50 * y;

    ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.closePath();
}

//game main
var pj;

var initGame = function () {
  pj = new pj0ng();

  //stop
  document.querySelector("#stop").addEventListener("click", stopBtn, false);

  //restart
  document
    .querySelector("#restart")
    .addEventListener("click", restartBtn, false);

  //ball launch listener
  pj.canvas.addEventListener("click", launch, false);

  //mouse listener
  document.addEventListener("mousemove", pj.paddleListener, false);
  document.addEventListener("touchmove", pj.paddleListener, false);

  //draw & animate start menu
  pj.init();
  pj.drawEvent = setInterval("pj.menu()", 1000 / pj.fps);
};

var stopBtn = function () {
  clearInterval(pj.drawEvent);
};

function startGame() {
  //SINGLETON PROTOTYPE CLASS INSTANCE
  pj = new pj0ng();
  pj.init().drawAll();
}
//APP

var pj0ng = function () {
  //canvas element & drawing context
  this.fps = 32;

  this.currentTime = 0;

  this.canvas = document.getElementById("pj0ng");
  this.ctx = this.canvas.getContext("2d");
  this.canvas.height = 400;
  this.canvas.width = 600;

  this.sprite = new Image();
  this.sprite.src = "pj0ngsprite.png";

  this.menubg = new Image();
  this.menubg.src = "splash.png";

  //canvas dimensions
  this.xLimit;
  this.yLimit;

  //ball
  this.ballX;
  this.ballY;
  this.ballSpeed = 1.1;
  this.dX = 10;
  this.dY = 10;
  this.ballRadius = 9;
  this.ballW = 18;
  this.ballH = 18;

  this.drawEvent = null;

  //paddle
  this.paddleH = 23;
  this.paddleW = 108;
  this.paddleX;
  this.paddleY;
  this.ballCount;
  this.mouseMin;
  this.mouseMax;

  //bricks
  this.bricks = [];
  this.brickCount;
  this.brickRows = 6;
  this.brickCols = 8;

  this.brickH = 20;
  this.brickW = 0;
  this.brickS = 1;

  this.brickSpriteTop = 23;
  this.brickSpriteRight = 128;
  this.brickSpriteBottom = 85;
  this.brickSpriteLeft = 0;

  this.running = 0;

  //snaik
  this.snaikIsRunning = 0;
  this.snaikW = 200;
  this.snaikY = this.canvas.height / 2;
  this.snaikX = 0;
  this.snaikR = 15;
  this.snaikH = this.snaikR * 2;
  this.snaikBB = { t: null, r: null, b: null, l: null };

  this.snaikSeed = 10;
  this.snaikSpeed = 15;

  //ufo
  this.ufor = 10;
  this.ufodx = 2;
  this.ufody = 2;
  this.ufos = 2;
  this.ufox = this.canvas.height / 2;
  this.ufoy = this.canvas.width / 2;

  this.debug = 0;
};

//kickstart
pj0ng.prototype.menu = function () {
  this.snaikIsRunning = 1;
  this.drawBg();
  this.ctx.drawImage(this.menubg, 0, 0, this.canvas.width, this.canvas.height);

  this.drawSnaik();
  path_sin(this.ctx);

  //.drawUfo();

  return this;
};

pj0ng.prototype.resetSnaik = function () {
  this.snaikX = 0;
  this.snaikY = Math.floor((Math.random() * this.canvas.height) / 1.2) + 1;
  this.snaikIsRunning = 0;
  return this;
};

pj0ng.prototype.resetPad = function () {
  this.paddleY = this.canvas.height - this.paddleH;
  this.paddleX = this.canvas.width / 2 - this.paddleW / 2;
  return this;
};

pj0ng.prototype.resetBall = function () {
  this.ballX = this.canvas.width / 2 - this.ballRadius / 2;
  this.ballY = this.canvas.height - this.paddleH;
  return this;
};

var restartBtn = function () {
  clearInterval(pj.drawEvent);
  startGame();
};

var launch = function (e) {
  if (pj.running == 0) pj.start();
};

pj0ng.prototype.init = function () {
  document.querySelector("body").appendChild(this.canvas);
  //this.canvas.height = window.innerHeight;
  //this.canvas.width = window.innerWidth;
  this.ballCount = 3;

  this.xLimit = this.canvas.width - this.ballRadius;
  this.yLimit = this.canvas.height - this.paddleH;

  this.mouseMin = this.canvas.offsetLeft;
  this.mouseMax = this.mouseMin + this.canvas.width;
  this.brickW = this.canvas.width / this.brickCols - 1;

  this.resetBall().resetPad();

  var w = this.brickW;
  var h = this.brickH;
  var s = this.brickS;
  var spX;
  var spY;

  this.brickCount = 0;

  //build brick array
  for (i = 0; i < this.brickRows; i++) {
    this.bricks.push([]);
    for (j = 0; j < this.brickCols; j++) {
      spX = Math.floor(Math.random() * (this.brickSpriteRight - this.brickW));
      spY =
        Math.floor(Math.random() * (this.brickSpriteBottom - this.brickH)) +
        this.paddleH;
      this.bricks[i].push({ hitcount: 1, spriteX: spX, spriteY: spY });
      this.brickCount++;
    }
  }

  return this;
};

pj0ng.prototype.start = function () {
  this.resetSnaik().resetPad().resetBall();
  this.ballSpeed = 1.1;
  clearInterval(this.drawEvent);
  if (!this.ballCount) return this;

  this.drawEvent = setInterval("pj.drawAll()", 1024 / this.fps);
  this.running = 1;
  this.snaikIsRunning = 1;
  return this;
};

pj0ng.prototype.ballOut = function () {
  clearInterval(this.drawEvent);
  --this.ballCount;
  this.running = 0;

  if (this.ballCount == 0) {
    this.drawBg();
    this.ctx.font = "bold 30px sans-serif";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("Game Over", 180, 160);
    setTimeout(initGame, 2000);
  }
};

pj0ng.prototype.drawBg = function () {
  var ctx = this.ctx;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  var starCount = Math.floor(Math.random() * 1000);
  for (i = 0; i < starCount; i++) {
    var x = Math.floor(Math.random() * this.canvas.width);
    var y = Math.floor(Math.random() * this.canvas.height);
    var r = Math.random() * 2;
    var colors = [];
    colors.push(Math.floor(Math.random() * 50) + 205); //red
    colors.push(Math.floor(Math.random() * 50) + 205); // green
    colors.push(Math.floor(Math.random() * 50) + 205); //blue
    colors.push(Math.floor(Math.random() * 10) + 245); //alpha
    ctx.fillStyle = "rgba(" + colors.join(",") + ")";
    circle(this.ctx, x, y, r);
  }

  return this;
};

pj0ng.prototype.drawBall = function () {
  var ctx = this.ctx;
  //ctx.globalCompositeOperation = 'destination-over';
  var colors = [0, 40, 200, 1];
  var x = this.ballX;
  var y = this.ballY;
  var ra = this.ballRadius;
  var w = this.ballW;
  var h = this.ballH;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.drawImage(
    this.sprite,
    0,
    0,
    w,
    h,
    x - w / 2,

    y - h / 2,
    w,
    h
  );
  //  ctx.rotate(sineWave * Math.PI * 2);

  return this;
  //
  for (i = 0; i < 8; i++) {
    ctx.fillStyle = "rgba(" + colors.join(",") + ")";
    ctx.beginPath();
    ctx.arc(x, y, ra, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    x = this.dX > 0 ? x - 2 : x + 2;
    y = this.dY > 0 ? y - 2 : y + 2;
    ra = ra * Math.sin(0.8);
    /*colors[0] +=20;
		colors[1] +=20;
		colors[2] -=20;*/
    colors[3] = colors[3] * Math.sin(0.95);
  }

  return this;
};

pj0ng.prototype.drawPad = function () {
  var ctx = this.ctx;
  ctx.drawImage(
    this.sprite,
    this.ballW,
    0,
    this.paddleW,
    this.paddleH,
    this.paddleX,
    this.paddleY,
    this.paddleW,
    this.paddleH
  );

  return this;
};

pj0ng.prototype.drawSnaik = function () {
  var ctx = this.ctx;
  var colors = [140, 20, 140, 1];
  var r = this.snaikR;
  var w = this.snaikW;
  var x = this.snaikX;
  var y = this.snaikY;
  var h = this.snaikH;
  /*
	if(this.debug) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect((x-w)+r,y-r ,w,h);		
	}
	*/

  //current snaik bouding box coords for collision detection: top right bottom left;
  this.snaikBB.t = y - r;
  this.snaikBB.r = x + r;
  this.snaikBB.b = y - r + h;
  this.snaikBB.l = x - w;

  for (i = 0; i < 20; i++) {
    ctx.fillStyle = "rgba(" + colors.join(",") + ")";
    circle(ctx, x, y, r);

    //colors[0] = Math.floor(Math.random() * 254) +1;
    colors[1] = Math.floor(Math.random() * 254) + 1;
    //colors[2] = Math.floor(Math.random() * 254) +1;
    if (colors[3] > 0) colors[3] -= 0.02;

    if (r > 0) r = r * Math.sin(90);

    x -= 10;
  }

  this.snaikX += Math.floor(Math.random() * this.snaikSpeed);
  this.snaikY = y;
  if (x - w > this.canvas.width) {
    this.resetSnaik();
  }
  return this;
};

pj0ng.prototype.drawUfo = function () {
  var ctx = this.ctx;
  ctx.fillStyle = "white";
  var x = this.ufox;
  var y = this.ufoy;
  var dx = this.ufodx;
  var d = this.ufody;
  var r = this.ufor;
  circle(ctx, x, y, r);

  x += dx;
  this.ufox = Math.sin(dx) * Math.PI * 180;
  return this;
};

pj0ng.prototype.drawDashboard = function () {
  this.ctx.fillStyle = "rgba(240,240,240,0.8)";
  this.ctx.font = "bold 10px sans-serif";
  this.ctx.textBaseline = "top";
  this.ctx.fillText("Balls:" + this.ballCount, 10, this.canvas.height - 10);
  this.ctx.fillText("Bricks:" + this.brickCount, 50, this.canvas.height - 10);
  this.ctx.fillText(
    "Time (frames):" + this.currentTime,
    100,
    this.canvas.height - 10
  );

  if (this.debug) {
    //this.ctx.fillText  ('Snaik:'+this.snaikIsRunning,100, this.canvas.height- 10);
    this.ctx.fillText(
      "SnaikTopBottom:" + this.snaikBB.t + " " + this.snaikBB.b,
      10,
      this.canvas.height - 120
    );
    this.ctx.fillText(
      "SnaikLeftRiht:" + this.snaikBB.l + " " + this.snaikBB.r,
      10,
      this.canvas.height - 100
    );

    this.ctx.fillText("ballX:" + this.ballX, 10, this.canvas.height - 80);
    this.ctx.fillText("ballY:" + this.ballY, 10, this.canvas.height - 60);
    // this.ctx.fillText("Time:" + this.currentTime, 10, this.canvas.height - 80);
  }
  return this;
};

pj0ng.prototype.drawBricks = function () {
  var ctx = this.ctx;
  var w = this.brickW;
  var h = this.brickH;
  var s = this.brickS;
  ctx.fillStyle = "rgba(20,40,60,0.8)";
  for (i = 0; i < this.brickRows; i++) {
    for (j = 0; j < this.brickCols; j++) {
      if (this.bricks[i][j].hitcount > 0) {
        var b = this.bricks[i][j];
        ctx.drawImage(
          this.sprite,
          b.spriteX,
          b.spriteY,
          w,
          h,
          j * (w + s) + s,
          i * (h + s) + s,
          w,
          h
        );
      }
    }
  }
};

pj0ng.prototype.paddleListener = function (e) {
  if (e.pageX > pj.mouseMin && e.pageX < pj.mouseMax)
    pj.paddleX = e.pageX - pj.mouseMin;
};

pj0ng.prototype.clear = function () {
  clear(this.ctx, this.canvas.width, this.canvas.height);
  return this;
};

pj0ng.prototype.levelComplete = function () {
  clearInterval(this.drawEvent);
  this.drawBg();
  this.ctx.font = "bold 30px sans-serif";
  this.ctx.textBaseline = "top";
  this.ctx.fillText("Level Complete", 140, 160);
  setTimeout(initGame, 2000);
};
pj0ng.prototype.tick = function () {
  this.currentTime = this.currentTime + 1;
  return this;
};
//draw things
pj0ng.prototype.drawAll = function () {
  this.ballSpeed *= 1.00001;
  //console.log(this.ballSpeed);
  if (this.brickCount == 0) {
    this.levelComplete();
    return this;
  }

  var rowH, colW, row, col;
  this.clear()
    .tick()
    .drawBg()
    .drawDashboard()
    .drawBall()
    .drawPad()
    .drawBricks();

  if (this.snaikIsRunning) {
    this.drawSnaik();
  } else {
    if (Math.floor(Math.random() * this.snaikSeed + 1) == 1)
      this.snaikIsRunning = 1;
  }
  //detect brick collision
  rowH = this.brickH + this.brickS;
  colW = this.brickW + this.brickS;
  row = Math.floor(this.ballY / rowH);
  col = Math.floor(this.ballX / colW);
  //remove brick if it was hit.
  if (
    this.ballY < this.brickRows * rowH &&
    row >= 0 &&
    col >= 0 &&
    this.bricks[row][col].hitcount > 0
  ) {
    this.dY = -this.dY;
    this.bricks[row][col].hitcount--;
    if (!this.bricks[row][col].hitcount) this.brickCount--;
  }

  //if ball meets snaik, snaik throws ball;
  if (
    this.ballX < this.snaikBB.r &&
    this.ballX > this.snaikBB.l &&
    this.ballY < this.snaikBB.b &&
    this.ballY > this.snaikBB.t
  ) {
    this.dX = -Math.floor(Math.random() * 15) + 1;
    this.dY = -Math.floor(Math.random() * 15) + 1;
  }

  //boundary collision detection
  //reverse X-direction if ball is about to hit the left or right wall
  if (
    this.ballX + this.dX > this.xLimit ||
    this.ballX + this.dX < this.ballRadius
  )
    this.dX = -this.dX;

  //reverse Y-direction if ball is hitting top wall
  if (this.ballY + this.dY < this.ballRadius) this.dY = -this.dY;
  //if ball is about to hit bottom limit
  else if (this.ballY + this.dY > this.yLimit) {
    //see if it is hitting the paddle
    if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleW) {
      this.dX = Math.floor(
        15 * ((this.ballX - (this.paddleX + this.paddleW / 2)) / this.paddleW)
      );
      //
      //console.log(this.dX);
      this.dY = -this.dY;
    } else {
      this.ballOut();
    }
  }

  this.ballX += this.dX;
  this.ballY += this.dY;
};

window.onload = initGame;

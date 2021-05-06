let mouse = {x:0,y:0,leftButton:0,rightButton:2,centerButton:1,leftClick:false,leftClickable:true,visible:true};
let key = {pressed:{},space:32,enter:13,left:37,up:38,right:39,down:40};
//Font Object
class Font{
  constructor(size = "18pt",family = "Arial" ,color = "black" ,shadow = null){
    this.size = size
    this.family = family
    this.color = color
    this.shadow = shadow
  }
}
//Sound Object
class Sound{
  constructor(audio){
    this.audio = audio;
  }
  play(){
    this.audio.play();
  }

}

let processMouseButton = (button,bool) =>{
  switch(button){
    case 0:
      mouse.leftButton = bool;break;
    case 1:
      mouse.centerButton = bool;break;
    case 0:
      mouse.rightButton = bool;break;
  } 
}
let processMouseMove = (source,rect) =>{
  mouse.x = source.clientX - rect.left;
  mouse.y = source.clientY - rect.top;
  mouse.left = mouse.x;
  mouse.right = mouse.x;
  mouse.top = mouse.y;
  mouse.bottom = mouse.y;
  //Update for touch?
}
class Game{
  constructor(canvas){
    this.canvas = document.getElementById(canvas);
    this.canvas.tabIndex = 1;
    this.canvas.oncontextmenu = function(e) {return false;}  //Override context menu
    this.canvas.addEventListener('mousedown', function(e) { processMouseButton(e.button,true) },false);
    this.canvas.addEventListener('mouseup', function(e) { processMouseButton(e.button,false) },false);
    this.canvas.addEventListener('mousemove', function(e) { processMouseMove(e, this.getBoundingClientRect()) },false);
    this.canvas.addEventListener("touchstart", function (e) { processMouseMove(e.touches[0], this.getBoundingClientRect()) },false);
    this.canvas.addEventListener("touchmove", function (e) { processMouseMove(e.touches[0], this.getBoundingClientRect()) },false);
    window.addEventListener('keydown', function(e) { key.pressed[e.keyCode]=true; },false);
    window.addEventListener('keyup', function(e) { key.pressed[e.keyCode]=false; },false);
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.left = 0;
    this.right = this.width;
    this.top = 0;
    this.bottom = this.height;
    this.over = false;
    this.pause = false;
    this.ready = false;
    this.state = null;
    this.score = 0;
    this.fps = 50;
    this.pace = 1000/this.fps;
    this.showBoundingBoxes = false;
    this.images = {};
    this.audios = {};
  }

  processInput(){
    if(mouse.leftClickable && mouse.leftButton){
      mouse.leftClick = true
      mouse.leftClickable = false
    }
    if(! mouse.leftClickable && !mouse.leftButton){
      mouse.leftClickable = true
    }
  }
  update(){
      this.t -= 1.0 / this.fps;
      mouse.leftClick = false;
  }
  preload(sources){
    var ct = 0;
    this.time = 0;
    for(let i = 65; i <= 90; i++){
      key[String.fromCharCode(i)] = i;
    }
    console.log("Preloading");
    for(let i = 0; i < sources.images.length; i++) {
        this.images[sources.images[i].id] = new Image();
        this.images[sources.images[i].id].onload = () => {
            if(++ct >= sources.images.length + sources.audios.length) {
                this.ready = true;
            }
        }
        this.images[sources.images[i].id].src = sources.images[i].src;
    }
    for(let i = 0; i < sources.audios.length; i++) {
        this.audios[sources.audios[i].id] = new Audio();
        this.audios[sources.audios[i].id].oncanplaythrough = () =>  {
            if(++ct >= sources.images.length + sources.audios.length) {
                this.ready = true;
            }
        }
        this.audios[sources.audios[i].id].src = sources.audios[i].src;
        this.audios[sources.audios[i].id].load();
    }
  }
  drawText(msg,x,y,font = new Font()){
    this.context.font = font.size + " " + font.family;
    if(font.shadow){
      this.context.fillStyle = font.shadow
      this.context.fillText(msg, x + 2, y + 2);
    }
    this.context.fillStyle = font.color;
    this.context.fillText(msg, x, y);
  }
  setBackground(bkGraphics){
    this.background = bkGraphics;
    this.backgroundXY = [[],[],[]]
    for(let r = 0; r < 3; r++){
      for(let c = 0; c < 3; c++){
        this.backgroundXY[r].push({"x":this.width * (c-1) + this.width / 2,"y":this.height * (r-1) + this.height / 2})
      }
    }
  }
  drawBackground(){
    if(this.background){
      this.background.draw();
    }else{
      this.clearBackground("black");
    }
  }
  clearBackground(color){
    let c = (color == undefined)?"white":color;
    this.context.fillStyle = c;
    this.context.fillRect(0,0,this.width,this.height);
  }
  scrollBackground(direction,amt = 2){
    if(direction == "left")
      for(let r = 0; r < 3; r++)
        for(let c = 0; c < 3; c++){
          this.backgroundXY[r][c]["x"] -= amt
          if(this.backgroundXY[r][c]["x"] + this.background.width  / 2 <= 0)
              this.backgroundXY[r][c]["x"] = this.backgroundXY[r][(c+2)%3]["x"] + this.background.width - amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "right")
      for(let r = 0; r < 3; r++)
        for(let c = 2; c >= 0; c--){
          this.backgroundXY[r][c]["x"] += amt
          if(this.backgroundXY[r][c]["x"] - this.background.width  / 2 >= this.width)
              this.backgroundXY[r][c]["x"] = this.backgroundXY[r][(c-2)%3]["x"] - this.background.width + amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "up")
      for(let c = 0; c < 3; c++)
        for(let r = 0; r < 3; r++){
          this.backgroundXY[r][c]["y"] -= amt
          if(this.backgroundXY[r][c]["y"] + this.background.height  / 2 <= 0)
              this.backgroundXY[r][c]["y"] = this.backgroundXY[(r+2)%3][c]["y"] + this.background.height - amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "down")
      for(let c = 0; c < 3; c++)
        for(let r = 2; r >= 0; r--){
          this.backgroundXY[r][c]["y"] += amt
          if(this.backgroundXY[r][c]["y"] - this.background.height  / 2 >= this.height)
              this.backgroundXY[r][c]["y"] = this.backgroundXY[(r-2)%3][c]["y"] - this.background.height + amt
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
        }
    else if(direction == "still")
      for(let r = 0; r < 3; r++)
        for(let c = 0; c < 3; c++)   
          this.background.moveTo(this.backgroundXY[r][c]["x"],this.backgroundXY[r][c]["y"])
  }

}
Object.defineProperty(Game.prototype, "time", {
    get: function() {               
      return Math.floor(this.t);
    },
    set: function(t) {
          this.t = t;
    },
        
    configurable: false
});
  


//Image Object
class Sprite{
  constructor(image,game,x,y){
    this.game = game;
    this.image = image;
    this.x = (x == undefined)? this.game.width / 2: x;
    this.y = y || this.game.height / 2;
    this.dx = 0;
    this.dy = 0;
    this.dxsign = 1;
    this.dysign = 1;
    this.left = this.x - this.width / 2;
    this.top = this.y - this.height / 2;
    this.right = this.x + this.width / 2;
    this.bottom = this.y + this.height / 2;
    this.angleVector = 0;
    this.angleRotate = 0;
    this.da = 0;
    this.rotate = "still";
    this.speed = 0;
    this.scale = 1;
    this.visible = true;
    this.health = 100
  }
  draw(x,y){
    var pos = {x:x || this.x,y:y || this.y};
    if(this.visible){
      if(this.rotate == "left" || this.rotate == "right" || this.angleRotate != 0){
        this.angleRotate += this.da;
        this.game.context.save();
        this.game.context.translate(pos.x , pos.y );
        this.game.context.rotate(this.angleRotate);
        this.game.context.drawImage(this.image,0, 0,this.image.width,this.image.height,-(this.width / 2),-(this.height / 2),this.width, this.height);
        this.game.context.restore();
      }else{
        this.game.context.drawImage(this.image,0, 0,this.image.width,this.image.height,pos.x - (this.width / 2),pos.y - (this.height / 2),this.width, this.height);
      }
    }
    this.left = pos.x - (this.width / 2);
    this.top = pos.y - (this.height / 2);
    this.right = pos.x + (this.width / 2);
    this.bottom = pos.y + (this.height / 2);
    if(this.game.showBoundingBoxes) drawBoundingBox(this);
  }
  setVector(speed,angleVector){
        if (angleVector == undefined){
            angleVector = Math.degrees(this.angleVector)
        }
        this.angleVector = Math.radians(angleVector)
        this.speed = speed
        this.calculateSpeedDeltas()
  }
  move(bounce){
    if(bounce){
      if(this.left < 0 || this.right > this.game.width){
        this.changeXSpeed();
      }
      if(this.top < 0 || this.bottom > this.game.height){
        this.changeYSpeed();
      }
    }
    this.calculateSpeedDeltas();
    this.x += this.dx * this.dxsign;
    this.y += this.dy * this.dysign;
    this.draw()
  }
  changeXSpeed(dx){
       if(dx == undefined){
           this.dxsign = -this.dxsign;
       }else{
           this.dx = dx;
       }
  }
  changeYSpeed(dy){
       if(dy == undefined){
           this.dysign = -this.dysign;
       }else{
           this.dy = dy;
       }
  }
  calculateSpeedDeltas(){
        this.dx = this.speed * Math.sin(this.angleVector - this.angleRotate - Math.PI);
        this.dy = this.speed * Math.cos(this.angleVector - this.angleRotate - Math.PI);
  }
  moveTo(x,y){
    this.x = x;
    this.y = y;
    this.draw();
  }
  collidedWith(obj){
    return intersectRect(this,obj) && obj.visible;
  }
}
//https://stackoverflow.com/questions/53832174/javascript-override-from-a-non-es6-class-to-an-es6-class
//https://artandlogic.com/2016/05/es6-subclasses-and-object-defineproperty/
Object.defineProperty(Sprite.prototype, "width", {
    get: function() { 
      return this.image.width * this.scale;
    },
        
    configurable: false
});
Object.defineProperty(Sprite.prototype, "height", {
    get: function() {
      return this.image.height * this.scale;
    },
    configurable: false
});


//Animation Object
class Animation extends Sprite{
  constructor(image,frames,game,w,h,x,y){
    super(image,game,x,y)
    this.frameWidth = w;
    this.frameHeight = h;
    this.frames = frames;
    this.frame = 0;
    this.framerate = 0.25;
    this.angle = 0;
    this.scale = 1;
    this.visible = true;
    this.perRow = Math.floor(image.width / w);
  }
  draw(x,y){
      var pos = {x:x || this.x,y:y || this.y};
      this.frame = this.frame % this.frames;
      var row = Math.floor(Math.floor(this.frame) / this.perRow);
      var col = Math.floor(this.frame) % this.perRow;
      this.frame += this.framerate;
      if(this.visible){
        this.game.context.drawImage(this.image,col * this.frameWidth,row * this.frameHeight, this.frameWidth, this.frameHeight,pos.x - (this.frameWidth * this.scale / 2),pos.y - (this.frameHeight * this.scale / 2),this.frameWidth * this.scale, this.frameHeight * this.scale);
      }
      this.left = pos.x - (this.frameWidth * this.scale / 2);
      this.top = pos.y - (this.frameHeight * this.scale / 2);
      this.right = pos.x + (this.frameWidth * this.scale / 2);
      this.bottom = pos.y + (this.frameHeight * this.scale / 2);
      if(this.game.showBoundingBoxes) drawBoundingBox(this);
  }
}

// Supporting Functions
function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}
function drawBoundingBox(obj){
  obj.game.context.beginPath();
  obj.game.context.rect(obj.left, obj.top, obj.right - obj.left, obj.bottom - obj.top);
  obj.game.context.lineWidth = 7;
  obj.game.context.strokeStyle = 'red';
  obj.game.context.stroke();
}
function randint(sp,range){
  return Math.floor(Math.random()*(range-sp)+sp);
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

let resources = {images:[{id:"forest",src:"images/forest.png"},
                         {id:"creeper",src:"images/creeper.png"},
                         {id:"doge",src:"images/doge.png"},
                         {id:"jakary",src:"images/jakary.png"},
                         {id:"knuck",src:"images/knuck.png"},
                         {id:"nyan",src:"images/nyan.gif"},
                         {id:"crosshair",src:"images/crosshair.png"},
                         {id:"ring",src:"images/ring.png"},
                         {id:"space",src:"images/space.png"},
                         {id:"alien",src:"images/alien.png"},
                         {id:"razor",src:"images/razor.png"},
                         {id:"logo",src:"images/logo.png"}

                  ],
                 audios:[{id:"coin",src:"audios/coin01.ogg"},
                         {id:"theme",src:"audios/themesong.ogg"}

                  ]
                };

function preload(){
  game = new Game ("game")
  game.preload(resources)
  game.state = init
  gameloop();
}
document.onload = preload();

function gameloop(){
game.processInput()
if(game.ready){
  game.state();
}
game.update()
setTimeout( gameloop ,10);
}

function init(){
space = new Sprite(game.images.space , game )
game.setBackground(space)
doge = new Sprite(game.images.doge,game)
doge.scale = 0.40
ring = new Animation (game.images.ring,30,game,512/8,512/8)
ring.framerate = 1 
ring.x = game.width +50
ring.y = randint(175,325)
ring.setVector(2,90)
scorering = new Animation(game.images.ring,30,game,512/8,512/8)
scorering.framerate = 2
scorering .x = 40
scorering.y = game.height - 40
scorefont = new Font("30px","Comic Sans MS","yellow","black")
f = new Font("20pt","Comic Sans MS ","white","black")
alien = new Sprite(game.images.alien,game)
alien.scale = 0.04
alien.setVector(2,90)
razor= new Sprite(game.images.razor,game)
razor.scale = 0.60
logo = new Sprite(game.images.logo,game)
logo.scale = 0.60

coin = new Sound(game.audios.coin)
theme = new Sound(game.audios.theme)
game.state = startscreen;

}
function main(){
  game.scrollBackground("left",1)
  doge.move(100,400)
  ring.move()
  scorering.draw()
  alien.move()
  theme.play()
  game.drawText(` X${game.score}`,scorering.right + 5, scorering.y+7,scorefont)

  if(key.pressed[key.space]){
    doge.y += 3
}else{
  doge.y -=1
}
if(key.pressed[key.right]){
  doge.x +=2 
}
if(key.pressed[key.left]){
  doge.x-=2
}
if(doge.collidedWith(ring)){
  coin.play()
  game.score += 1
  ring.visible = false
}
if(doge.collidedWith(alien)){
    doge.health -= 5
    alien.visible = false
    game.state = gameoverscreen;
  }
if(ring.x<-20){
  ring.x = game.width + 70
  ring.y = randint(175,325)
  ring.visible = true 
}
if(alien.x<-20){
  alien.x = game.width + 50
  alien.y = randint(470,50)
  alien.visible = true 
}

}
function startscreen(){
  game.scrollBackground("left",1)
  logo.draw()
  razor.draw(470,50)
  if(key.pressed[key.space]){
    game.state = main
  }
  game.drawText(`Press [SPACE] to begin `,game.width/2-170,game.height-40,scorefont)
}
function gameoverscreen(){
  if(key.pressed[key.Y]){
    game.state = main
    game.score = 0
    doge.x = game.width / 2
    doge .y = game.height / 2
    ring.x = game.width +50
    ring .y = randint(175,325)
    ring.speed = 2
    ring.visible = true
    game.space = main
  }
  game.drawText(`PLAY AGIAN? CLICK [Y/N] `,game.width/2-170,game.height-40,scorefont)
}



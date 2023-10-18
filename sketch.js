var { limite_esq, limite_dir, limite_cima, limite_baixo, cometas, score, explosao, gameover, naveviva, tempojogo, x_nav, y_nav, x_laser, y_laser, disparo, colisao_verificada, laser_verificado, imgs_cometas, recorde, cometas_visiveis, taxa_aumento_cometas, scoreAnimations, reproduz_som } = var_global()

function var_global() {
  let cometas = []
  let imgs_cometas = []
  let scoreAnimations = []
  var score = 0
  var recorde = 0
  var explosao = false
  var gameover = false
  var naveviva = true
  var tempojogo = 0
  var taxa_aumento_cometas = 0.1
  var cometas_visiveis = 2
  var x_nav = 50
  var y_nav = 50
  var x_laser = 0
  var y_laser = 0
  var limite_esq = 0
  var limite_dir = 0
  var limite_cima = 0
  var limite_baixo = 0
  var disparo = false
  var reproduz_som = false
  var colisao_verificada = false
  var laser_verificado = false
  return { limite_esq, limite_dir, limite_cima, limite_baixo, cometas, score, explosao, gameover, naveviva, tempojogo, x_nav, y_nav, x_laser, y_laser, disparo, colisao_verificada, laser_verificado, imgs_cometas, recorde, cometas_visiveis, taxa_aumento_cometas, scoreAnimations, reproduz_som }
}

function preload(){
  soundFormats('mp3')
  fonte = loadFont('pixelart.ttf')
  fundo = loadImage('fundo.jpg')
  nave = loadImage('nave.png')
  spacebar = loadImage('spacebar.png')
  laser = loadImage('laser.png')
  setas = loadImage('setas.png')
  explosaodoscometas = loadImage('explosaometeoro.png')
  imgs_cometas[0] = loadImage('cometa.png')
  imgs_cometas[1] = loadImage('cometa_2.png')
  imgs_cometas[2] = loadImage('cometa_3.png')
  somlaser = loadSound('laser.mp3')
  somexplosao = loadSound('explosao.mp3')
  somgameover = loadSound('gameover.mp3')
  trilha = loadSound('trilha.mp3', trilhaLoaded)
}
function trilhaLoaded(){
  trilha.setVolume(0.1)
  trilha.loop()
}

function setup() {
  createCanvas(400, 400);
  limite_esq = 0
  limite_dir = width/4
  limite_cima = 0
  limite_baixo = height/1.2
  novo_jogo()
}

function novo_jogo(){
 cometas = []
 score = 0
 explosao = false
 gameover = false
 naveviva = true
 tempojogo = 0
 x_nav = 50
 y_nav = 50
 x_laser = 0
 y_laser = 0
 disparo = false
 colisao_verificada = false
 laser_verificado = false
}

let menuState = "main";

function draw() {
  background(fundo, 70)
  if (menuState === "main") {
    displayMainMenu();
  } else if (menuState === "creditos") {
    displayInstructions();
  } else if (menuState === "game"){
    jogo()
  }
}

function mouseClicked() {
  if (menuState === "main") {
    if (mouseX > 150 && mouseX < 250 && mouseY > 150 && mouseY < 200) {
      // Clicou no botão "Novo Jogo"
      menuState = "game"; // Iniciar o jogo
    } else if (mouseX > 150 && mouseX < 250 && mouseY > 250 && mouseY < 300) {
      // Clicou no botão "Instruções"
      menuState = "creditos"; // Mostrar instruções
    }
  } else if (menuState === "creditos") {
    if (mouseX > 150 && mouseX < 250 && mouseY > 300 && mouseY < 350) {
      // Clicou no botão "Voltar"
      menuState = "main"; // Voltar ao menu principal
    }
  } else if (menuState === "game"){
    if(mouseX > 150 && mouseX < 250 && mouseY > 250 && mouseY < 300){
      menuState = "main";
      novo_jogo()
    }
  }
}

function displayMainMenu() {
  textSize(24);
  fill("#c94c4c");
  strokeWeight(1.5)
  rect(95, 70, 200, 50);
  rect(150, 150, 100, 50);
  rect(150, 250, 100, 50);
  textSize(16);
  fill(255);
  text("Menu Principal", 146, 100);
  text("Novo Jogo", 162, 180);
  text("Créditos", 170, 280);
  noFill()
  stroke(0,0,0)
  strokeWeight(4)
  rect(50,40,300,300)
}

function displayInstructions() {
  textSize(24);
  strokeWeight(1)
  text("Créditos e Instruções", 92, 60);
  textSize(16);
  text("Mover a Nave", 30, 120);
  image(setas, 40, 130)
  text("Atirar", 30, 210);
  image(spacebar, 30, 220)
  strokeWeight(1)
  fill("#c94c4c");
  rect(150, 300, 100, 50);
  textSize(16);
  fill(255);
  text("Voltar", 180, 330);
  textSize(10);
  text("Créditos: Anderson Lemos, UFRN, Escola de Ciências e Tecnologia", width/8, 390);
}

function jogo() {
  textSize(10);
  fill(255);
  text("Pontuação: " + score + " \nRecorde: " + recorde, 10, 30);
  image(nave, x_nav, y_nav)

  //aumenta dificuldade com o tempo
  tempojogo += 1/frameRate()
  cometas_visiveis = Math.floor(tempojogo * taxa_aumento_cometas) + 2

  for (let i = scoreAnimations.length - 1; i >= 0; i--) {
    const animation = scoreAnimations[i];
    animation.update();
    animation.display();
    if (animation.opacity <= 0) {
      scoreAnimations.splice(i, 1); // Remove a animação quando a opacidade chegar a 0
    }
  }
  
 if(!gameover){
     //gera meteoros em movimento
    for(let i = 0; i < cometas_visiveis; i++){
      if( i>= cometas.length){
      gera_cometa()
    }
    const cometa = cometas[i]
    image(imgs_cometas[cometa.gerador], cometa.x, cometa.y)
    cometa.x -= cometa.velocidade
    
    if(cometa.x + imgs_cometas[cometa.gerador].width < 0){
      cometas.splice(i, 1) //remove cometas que sairam do range da tela
      i--
    }
  }
  
  
  //verificar colisao com o laser
  for(let i = cometas.length - 1;i >= 0; i--){
    const margemsegura = 5
    const cometa = cometas[i]
    const cometaX = cometa.x
    const cometaY = cometa.y
    const cometaWidth = imgs_cometas[cometa.gerador].width
    const cometaHeight = imgs_cometas[cometa.gerador].height
    if(x_laser + margemsegura < cometaX + cometaWidth &&
       x_laser + laser.width - margemsegura > cometaX &&
       y_laser + margemsegura < cometaY + cometaHeight &&
       y_laser + laser.height - margemsegura > cometaY){
        
        reproduz_som_explosao = true
        explosao = true
        cometas.splice(i,1)
        image(explosaodoscometas, cometaX, cometaY)
        disparo = false
        score = score + 10
        
        //animação na tela
        const novaPontuacao = 10;
        const x = cometaX; // Define a posição X da animação
        const y = cometaY; // Define a posição Y da animação
        criarAnimacaoPontuacao(x, y, novaPontuacao);
      
        }
      }
    }
    else{ //se não, paralisa os meteoros
      for(let i = 0; i < cometas_visiveis; i++){
        if( i>= cometas.length){
          gera_cometa()
        }
        const cometa = cometas[i]
        image(imgs_cometas[cometa.gerador], cometa.x, cometa.y)
        if(cometa.x + imgs_cometas[cometa.gerador].width < 0){
          cometas.splice(i, 1) //remove os cometas que sairam do range da tela
          i--
        }
      }
    }
  
  //verificar colisao com a nave e meteoro
  for(let i = 0; i < cometas.length; i++){
    const cometa = cometas[i]
    const cometaX = cometa.x
    const cometaY = cometa.y
    const cometalargura = imgs_cometas[cometa.gerador].width
    const cometaaltura = imgs_cometas[cometa.gerador].height
    
    if(verificaColisaoNave(x_nav, y_nav, nave.width, nave.height, cometaX, cometaY, cometalargura, cometaaltura)){
      if(!colisao_verificada){
        colisao_verificada = true
        naveviva = false
        explosao = true
        image(explosaodoscometas, x_nav, y_nav)
        gameover = true
        reproduz_som = true
        disparo = false
        reiniciarjogo()
      }
    }
  }
  
  if(naveviva){
    mover_nave()
    dispararLaser()
  }

  if(reproduz_som ){
    somgameover.play()
    reproduz_som = false 
  }

  if (gameover) {
    textFont(fonte)
    strokeWeight(3)
    fill("#c94c4c");
    textSize(45);
    text("Game Over", width / 2 - 140, height / 2);
    strokeWeight(1)
    rect(150, 250, 100, 50);
    textFont("Helvetica")
    textSize(16)
    fill(255)
    text("Menu", 178, 280);
  }
}

function gera_cometa(){
  //função que gera cometas aleatórios
    const gerador = Math.floor(random(imgs_cometas.length))
    const x = width
    let y 
    let espaço = false
    // cria um espaço para gerar cometas, para que evite nascerem vários cometas na mesma posição
    do{
      y = random(0, height - imgs_cometas[gerador].height)
      espaço = false
      for(let i = 0; i < cometas.length; i++){
        const cometaExist = cometas[i]
        if(y < cometaExist.y + imgs_cometas[cometaExist.gerador].height &&
          y + imgs_cometas[gerador].height > cometaExist){
          espaço = true
          break;
        }
      }
    } while(espaço)

    const velocidade = random(1,3)
    
    cometas.push({gerador, x, y, velocidade})
  
}

function dispararLaser() {
  //função para disparo da nave
  if (keyIsDown(32) && !disparo) {
    x_laser = x_nav + 70;
    y_laser = y_nav + 30;
    disparo = true;
    somlaser.play()
  }
  if (disparo) {
    image(laser, x_laser, y_laser);
    x_laser = x_laser + 10;
    if (x_laser > 400) {
      disparo = false;
    }
  }
}

function mover_nave(){
  // movimentos da nave
  if(keyIsDown(LEFT_ARROW) && x_nav > limite_esq){
    x_nav = x_nav - 4
  }
  if(keyIsDown(RIGHT_ARROW) && x_nav < limite_dir){
    x_nav = x_nav + 4
  }
  if(keyIsDown(UP_ARROW) && y_nav > limite_cima){
    y_nav = y_nav - 4
  }
  if(keyIsDown(DOWN_ARROW) && y_nav < limite_baixo){
    y_nav = y_nav + 4
  }
}

function verificaColisaoNave(xNave, yNave, larguraNave, alturaNave, xCometa, yCometa, larguraCometa, alturaCometa, margemsegura = 30) {
  //função para verificar colisoes da nave
  const colisao = (
    xNave + larguraNave - margemsegura > xCometa &&
    xNave + margemsegura < xCometa + larguraCometa &&
    yNave + alturaNave - margemsegura*1.2 > yCometa &&
    yNave + margemsegura*1.2 < yCometa + alturaCometa
  );
  return colisao;
}

function reiniciarjogo(){
  if(score > recorde){
    recorde = score
  }
  score = 0
}

function criarAnimacaoPontuacao(x, y, score) {
  const animation = {
    x,
    y,
    score,
    opacity: 255,
    update: function () {
      this.y -= 1; // subtrai 1 em y para a animação subir na tela
      this.opacity -= 2; //diminui a opacidade
    },
    display: function () {
      fill(255, 255, 0, this.opacity);
      textSize(24);
      text(`+${this.score}`, this.x, this.y);
    },
  };
  scoreAnimations.push(animation);
}

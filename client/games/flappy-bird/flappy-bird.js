document.addEventListener("contextmenu", e => e.preventDefault());

let board;
let boardWidth = 384;
let boardHeight = 768;
let context;



let birdWidth = 42;
let birdHeight = 42.95;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height: birdHeight
}

let pipeArray = [];
let pipeWidth = 69;
let pipeHeight = 500;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -7;
let velocityY = 0;
let gravity = 0.6;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./Images/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./Images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./Images/bottompipe.png";


    requestAnimationFrame(update);
    setInterval(placePipes, 1500);

    document.addEventListener('pointerdown',moveBird);
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
            moveBird()
        }
    });
}

function update() {
    if (gameOver) {
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;

    bird.y += velocityY
        
    if (bird.y <= 143) {
        bird.y = 143
        velocityY = 0
    } else if (bird.y > board.height) {
        gameOver = true; 
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }



    context.save();

    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(velocityY * 0.05);

    context.drawImage(
        birdImg,
        -bird.width / 2,
        -bird.height / 2,
        bird.width,
        bird.height
    );

    context.restore();

    
    for (let i=0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true; 
        }

        if (detectCollision(bird,pipe)) {
            gameOver = true;
        }
    }

    context.fillStyle = "white";
    context.font = "35px 'Press Start 2P'";
    context.fillText(score, 5, 190)

    if (gameOver) {
        context.fillText("Game Over", 2, 230)
    }
}

function placePipes() {

    let randomPipeY = pipeY - Math.random()*(pipeHeight/1.5);
    let openingSpace = board.height / 4.5


    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe)
}

function moveBird() {
    if (velocityY <= 0) {
        velocityY = min(velocityY-6,-8)
    } else {
    velocityY = -6
    }
    
    if (gameOver) {
        console.log('restart')
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;

        requestAnimationFrame(update);
        return;
    }
    
}

function detectCollision(a,b) {
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
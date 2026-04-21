let board;
let boardWidth = 384;
let boardHeight = 768;
let context;

let chWidth = 100;
let chHeight = 100;
let chImg
let ch = {
    x : 0,
    y : 0,
    width : chWidth,
    height: chHeight
}



window.onload = function() {
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    chImg = new Image;
    chImg.src = "./Images/chromosome.png"

    chImg.onload = function() {
        context.drawImage(chImg, ch.x, ch.y, ch.width, ch.height);
    }
    requestAnimationFrame(update)
}

function update() {
    context.clearRect(0, 0, board.width, board.height);


    context.drawImage(
        chImg,
        ch.x,
        ch.y,
        ch.width,
        ch.height
    );

    requestAnimationFrame(update);
}

function detectCollision(a,b) {
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//chickens
// kosom elfra5 lkosom elfayoum 
let chickenArray = [];
let chickenWidth = tileSize*2;
let chickenHeight = tileSize;
let chickenX = tileSize;
let chickenY = tileSize;
let chickenImg;

let chickenRows = 2;
let chickenColumns = 3;
let chickenCount = 0; //number of chickens to defeat
let chickenVelocityX = 0.5; //chicken moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -5; //bullet moving speed

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial ship
    // context.fillStyle="green";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //load images
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    chickenImg = new Image();
    chickenImg.src = "./chicken1.png";
    createchickens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //chicken
    for (let i = 0; i < chickenArray.length; i++) {
        let chicken = chickenArray[i];
        if (chicken.alive) {
            chicken.x += chickenVelocityX;

            //if chicken touches the borders
            if (chicken.x + chicken.width >= board.width || chicken.x <= 0) {
                chickenVelocityX *= -1;
                chicken.x += chickenVelocityX*2;

                //move all chickens up by one row
                for (let j = 0; j < chickenArray.length; j++) {
                    chickenArray[j].y += chickenHeight;
                }
            }
            context.drawImage(chickenImg, chicken.x, chicken.y, chicken.width, chicken.height);

            if (chicken.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with chickens
        for (let j = 0; j < chickenArray.length; j++) {
            let chicken = chickenArray[j];
            if (!bullet.used && chicken.alive && detectCollision(bullet, chicken)) {
                bullet.used = true;
                chicken.alive = false;
                chickenCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (chickenCount == 0) {
        //increase the number of chickens in columns and rows by 1
        score += chickenColumns * chickenRows * 100; //bonus points :)
        chickenColumns = Math.min(chickenColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        chickenRows = Math.min(chickenRows + 1, rows-4);  //cap at 16-4 = 12
        if (chickenVelocityX > 0) {
            chickenVelocityX += 0.2; //increase the chicken movement speed towards the right
        }
        else {
            chickenVelocityX -= 0.2; //increase the chicken movement speed towards the left
        }
        chickenArray = [];
        bulletArray = [];
        createchickens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createchickens() {
    for (let c = 0; c < chickenColumns; c++) {
        for (let r = 0; r < chickenRows; r++) {
            let chicken = {
                img : chickenImg,
                x : chickenX + c*chickenWidth,
                y : chickenY + r*chickenHeight,
                width : chickenWidth,
                height : chickenHeight,
                alive : true
            }
            chickenArray.push(chicken);
        }
    }
    chickenCount = chickenArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}



const cvs = document.getElementById('tetris');
const ctx = cvs.getContext("2d");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // Colour of an empty square
const scoreElement = document.getElementById('score');
// Draw a square
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Create the board
let board = [];
for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
};

// Draw the board
function drawBoard() {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
};

drawBoard();

// The pieces and their colors
const PIECES = [
    [Z, "#1d2120"],
    [S, "#5a5c51"],
    [T, "#ba9077"],
    [O, "#bcd5d1"],
    [L, "#6534ff"],
    [I, "#fccdd3"],
    [J, "#bbc4ef"]
];

// generate random piece
function randomPiece() {
    let r = randomN = Math.floor(Math.random() * PIECES.length); // 0 - 6
    return new Piece(PIECES[r][0], PIECES[r][1])
}

let p = randomPiece();

// The Object Piece
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    // Control pieces
    this.x = 0;
    this.y = 0;
};

//Coloriezer
Piece.prototype.fill = function(color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            //Draw only occupied squares
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// Draw a piece
Piece.prototype.draw = function() {
    this.fill(this.color);
}

//undraw a piece
Piece.prototype.unDraw = function() {
    this.fill(VACANT);
}

// move down piece
Piece.prototype.moveDown = function() {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        //lock piece and generate a new one
        this.lock();
        p = randomPiece();
    }

}

// move Right the piece
Piece.prototype.moveRight = function() {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move left the piece
Piece.prototype.moveLeft = function() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Rotate
Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            kick = -1; // If left 
        } else {
            kick = 1; // If right 
        }
    }
    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;
Piece.prototype.lock = function() {
        for (r = 0; r < this.activeTetromino.length; r++) {
            for (c = 0; c < this.activeTetromino.length; c++) {
                //skip the vacant squares
                if (!this.activeTetromino[r][c]) {
                    continue;
                }
                // pieces to lock on top = game over
                if (this.y + r < 1) {
                    alert("Game over");
                    // stop request animation frame
                    gameOver = true;
                    break;
                }
                // we lock the piece
                board[this.y + r][this.x + c] = this.color;
            }
        }
        //remove full rows
        for (r = 0; r < ROW; r++) {
            let isRowFull = true;
            for (c = 0; c < COL; c++) {
                isRowFull = isRowFull && (board[r][c] != VACANT);
            }
            if (isRowFull) {
                //if the row is full
                // we move down all the rows above it 
                for (y = r; y > 1; y--) {
                    for (c = 0; c < COL; c++) {
                        board[y][c] = board[y - 1][c];
                    }
                }
                // the top row boar[0][...]has no row above it
                for (c = 0; c < COL; c++) {
                    board[0][c] = VACANT;
                }
                // increment the score
                score += 10;
            }
        }
        //update the board
        drawBoard();
        // update the score
        scoreElement.innerHTML = score;
    }
    //collision function
Piece.prototype.collision = function(x, y, piece) {
        for (r = 0; r < piece.length; r++) {
            for (c = 0; c < piece.length; c++) {
                //if the quare is empty we skip it
                if (!piece[r][c]) {
                    continue;
                }
                // coordinates of the piece after the movement
                let newX = this.x + c + x;
                let newY = this.y + r + y;
                // conditions
                if (newX < 0 || newX >= COL || newY >= ROW) {
                    return true;
                }
                // skip newY < 0; board[-1] will crush the game
                if (newY < 0) {
                    continue;
                }
                // check if there is a locked piece already in place
                if (board[newY][newX] != VACANT) {
                    return true;
                }
            }
        }
        return false;
    }
    //CONTROL the piece
document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        p.moveLeft();
        let dropStart = Date.now();
    } else if (event.keyCode == 38) {
        p.rotate();
        let dropStart = Date.now();
    } else if (event.keyCode == 39) {
        p.moveRight();
        let dropStart = Date.now();
    } else if (event.keyCode == 40) {
        p.moveDown();
        let dropStart = Date.now();
    }
}

// Drop the piece every 1 sec
let dropStart = Date.now();
let gameOver = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}
drop();
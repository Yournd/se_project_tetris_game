const rows = 20;
const cols = 10;
const cell_size = 30;

let dropInterval = 1000; 
let dropTimer = 0;    
let lastTime = 0; 

let score = 0;
let level = 0;
let linesCleared = 0;

const line_clear_points = [0, 100, 300, 500, 800];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = cols * cell_size;
canvas.height = rows * cell_size;
ctx.scale(cell_size, cell_size);



function createBoard() {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

const board = createBoard();

const tetrominoes = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
    ],
    Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
    ],
};

const colors = {
    I: '#BF00FF',
    O: '#0450dcff',
    T: '#d5f42bff',
    J: '#9A0000',
    L: '#FF8600',
    S: '#01FE01',
    Z: '#FF00FF'
};

function createPiece(type) {
    return {
        matrix: tetrominoes[type],
        x: 3,
        y: 0
    };
}

function randomPiece() {
    const keys = Object.keys(tetrominoes);
    const type = keys[(keys.length * Math.random() | 0)];
    return createPiece(type);
}

let currentPiece = randomPiece();

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function drawBoard() {
    board.forEach((row, y) =>{
        row.forEach((value, x) => {
            if (value !== 0) drawCell(x, y, value);
        });
    });
}

function drawPiece(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawCell(piece.x + x, piece.y + y, value)
        });
    });
}

function collides(piece, board) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] !== 0 && (board[piece.y + y] && board[piece.y + y][piece.x + x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;

    if (collides(currentPiece, board)) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        return false;
    }
    return true;
}

function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function rotatePiece() {
    const oldMatrix = currentPiece.matrix;
    currentPiece.matrix = rotateMatrix(oldMatrix);

    if (collides(currentPiece, board)) {
        currentPiece.matrix = oldMatrix;
    }
}

function mergePiece(piece, board) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[piece.y + y][piece.x + x] = value;
            }
        });
    });
}

function clearLines() {
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) continue outer;
        }
        board.splice(y, 1);
        board.unshift(Array(cols).fill(0));
        y++;
    }
}

function draw() {
    ctx.clearRect(0, 0,canvas.width, canvas.height);
    drawBoard();
    drawPiece(currentPiece);
}

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter =+ delta;

    if (dropCounter > dropInterval) {
        if (!movePiece(0, 1)) {
            mergePiece(currentPiece, board);
            clearLines();
            currentPiece = randomPiece();
            if (collides(currentPiece, board)) {
                alert("Game Over");
                return;
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") movePiece(-1, 0);
    if (e.key === "ArrowRight") movePiece(1, 0);
    if (e.key === "ArrowDown") movePiece(0, 1);
    if (e.key === "ArrowUp") rotatePiece();
});

update();
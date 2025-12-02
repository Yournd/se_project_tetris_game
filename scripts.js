const rows = 20;
const cols = 10;
const cell_size = 30;
const scoreSelector = document.querySelector("#score");
const levelSelector = document.querySelector("#level");
const startScreen = document.querySelector("#start");
const startBtnSelector = startScreen.querySelector(".start-screen__btn");
const endScreen = document.querySelector("#end");
const retryBtnSelector = endScreen.querySelector(".end-screen__btn");
const linesSelector = document.querySelector("#lines");


// ======== GAME STATE ========
let dropInterval = 1000;   
let dropCounter = 0;
let lastTime = 0;

let score = 0;
let level = 0;
let linesCleared = 0;

const line_clear_points = [0, 100, 300, 500, 800];

// ======== CANVAS ========
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = cols * cell_size;
canvas.height = rows * cell_size;
ctx.scale(cell_size, cell_size);

// ======== BOARD ========
function createBoard() {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

let board = createBoard();

// ======== PIECES ========
const tetrominoes = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]]
};

const colors = {
    I: "#BF00FF",
    O: "#0450dcff",
    T: "#d5f42bff",
    J: "#9A0000",
    L: "#FF8600",
    S: "#01FE01",
    Z: "#FF00FF"
};

function createPiece(type) {
    return {
        matrix: tetrominoes[type].map(row => row.slice()),
        color: colors[type],
        x: 3,
        y: 0
    };
}

function randomPiece() {
    const keys = Object.keys(tetrominoes);
    return createPiece(keys[(Math.random() * keys.length) | 0]);
}

let currentPiece = randomPiece();

// ======== DRAWING ========
function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function drawGrid(lineColor = "black", lineWidth = .02) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        for (let x = 0; x <= 11; x += 1) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 20);
            ctx.stroke();
        }
        for (let y = 0; y <= 21; y += 1) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(20, y);
            ctx.stroke();
        }

}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawCell(x, y, value);
        });
    });
}

function drawPiece(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawCell(piece.x + x, piece.y + y, piece.color);
        });
    });
}

// ======== COLLISION ========
function collides(piece, board) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] !== 0) {
                const nx = piece.x + x;
                const ny = piece.y + y;

                if (nx < 0 || nx >= cols || ny >= rows) return true;
                if (ny >= 0 && board[ny][nx] !== 0) return true;
            }
        }
    }
    return false;
}

// ======== MOVEMENT ========
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

// ======== ROTATION ========
function rotateMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function rotatePiece() {
    const prev = currentPiece.matrix;
    currentPiece.matrix = rotateMatrix(prev);

    if (collides(currentPiece, board)) {
        currentPiece.matrix = prev;
    }
}

// ======== MERGE ========
function mergePiece(piece, board) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[piece.y + y][piece.x + x] = piece.color;
            }
        });
    });
}

// ======== SCORING + LINE CLEAR ========
function clearLines() {
    let cleared = 0;

    for (let y = board.length - 1; y >= 0; y--) {
        if (board[y].every(v => v !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            cleared++;
            y++;
        }
    }

    if (cleared > 0) {
        score += line_clear_points[cleared];   // add points
        linesCleared += cleared;
        linesSelector.textContent = linesCleared;
        scoreSelector.textContent = score;

        // update level every 10 lines
        const newLevel = Math.floor(linesCleared / 10);
        if (newLevel !== level) {
            level = newLevel;
            levelSelector.textContent = level + 1;
            dropInterval = Math.max(100, 1000 - level * 80); // gravity speeds up
        }
    }
}

// ======== GAME LOOP ========
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawGrid()
    drawPiece(currentPiece);
}

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    // GRAVITY HERE
    if (dropCounter > dropInterval) {
        if (!movePiece(0, 1)) {
            mergePiece(currentPiece, board);
            clearLines();

            currentPiece = randomPiece();
            if (collides(currentPiece, board)) {
                endScreen.classList.add("end-screen");
                endScreen.classList.remove("end-screen_inactive");
                return;
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

// ======== INPUT ========
window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") movePiece(-1, 0);
    if (e.key === "ArrowRight") movePiece(1, 0);
    if (e.key === "ArrowUp") rotatePiece();

    // Soft drop scoring
    if (e.key === "ArrowDown") {
        if (movePiece(0, 1)) score += 1;
    }
});

// ========== START GAME =========
startBtnSelector.addEventListener("click", e => {
    startScreen.classList.add("start-screen_inactive");
    update();
});

// ============ RESTART GAME =============
retryBtnSelector.addEventListener("click", e => {
    endScreen.classList.add("end-screen_inactive");
    endScreen.classList.remove("end-screen");
    
    dropInterval = 1000;     
    dropCounter = 0;
    lastTime = 0;

    score = 0;
    level = 0;
    linesCleared = 0;
    scoreSelector.textContent = "0";
    levelSelector.textContent = "1";
    linesSelector.textContent = "0";
    board = createBoard();
    update();
});
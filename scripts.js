// ======= INFO PANEL SELECTORS ========
const scoreSelector = document.querySelector("#score");
const finalScoreSelector = document.querySelector("#final-score");
const levelSelector = document.querySelector("#level");
const swapsSelector = document.querySelector("#swaps");
const linesSelector = document.querySelector("#lines");

// ========== START SCREEN SELECTORS ==========
const startScreen = document.querySelector("#start");
const startBtnSelector = startScreen.querySelector(".start-screen__btn");

// ============ END SCREEN SELECTORS =============
const endScreen = document.querySelector("#end");
const retryBtnSelector = endScreen.querySelector(".end-screen__btn");

// ============== MOBILE BUTTON SELECTORS =============
const mobileBtnContainer = document.querySelector("#mobile__btns");
const rotateBtn = mobileBtnContainer.querySelector(".mobile__rotate-btn");
const leftBtn = mobileBtnContainer.querySelector(".mobile__left-btn");
const rightBtn = mobileBtnContainer.querySelector(".mobile__right-btn");
const dropBtn = mobileBtnContainer.querySelector(".mobile__drop-btn");
const holdBtn = mobileBtnContainer.querySelector(".mobile__hold-btn");
 
// ============== PAGE TITLE SELECTOR ==============
const pageTitle = document.querySelector("#page__title");

// ============ SCREEN SIZE ============
const screen_size = window.innerWidth;

// ======== GAME STATE ========
const rows = 20;
const cols = 10;
let cell_size = 0;
const heldRows = 5;
const heldCols = 6;
const heldCellSize = 20;
const nextRows = 5;
const nextCols = 6;
const nextCellSize = 20;

let dropInterval = 1000;   
let dropCounter = 0;
let lastTime = 0;
let score = 0;
let level = 1;
let linesCleared = 0;
let swaps = 1;

screen_size <= 755 ? cell_size = 20 :  cell_size = 30;

const line_clear_points = [0, 100, 300, 500, 800];

// ======== CANVAS ========
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
canvas.width = cols * cell_size;
canvas.height = rows * cell_size;
ctx.scale(cell_size, cell_size);

const heldCanvas = document.querySelector("#game__held-piece");
const ctx2 = heldCanvas.getContext("2d");
heldCanvas.width = heldCols * heldCellSize;
heldCanvas.height = heldRows * heldCellSize;
ctx2.scale(heldCellSize, heldCellSize);

const nextCanvas = document.querySelector("#game__next-piece");
const ctx3 = nextCanvas.getContext("2d");
nextCanvas.width = nextCols * nextCellSize;
nextCanvas.height = nextRows * nextCellSize;
ctx3.scale(nextCellSize, nextCellSize);

// ======== BOARD ========
function createBoard() {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function createHeldBoard() {
    return Array.from({ length: heldRows }, () => Array(heldCols).fill(0));
}

function createNextBoard() {
    return Array.from({ length: nextRows }, () => Array(nextCols).fill(0));
}

let board = createBoard();
let heldBoard = createHeldBoard();
let nextBoard = createNextBoard();

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

const ghostColors = {
    I: "rgba(191, 0, 255, .3)",
    O: "rgba(4, 80, 220, .3)",
    T: "rgba(213, 244, 43, .3)",
    J: "rgba(154, 0, 0, .3)",
    L: "rgba(255, 134, 0, .3)",
    S: "rgba(1, 254, 1, .3)",
    Z: "rgba(255, 0, 255, .3)"
};

function createPiece(type) {
    return {
        matrix: tetrominoes[type].map(row => row.slice()),
        color: colors[type],
        x: 3,
        y: 0,
        type: type
    };
}

function randomPiece() {
    const keys = Object.keys(tetrominoes);
    return createPiece(keys[(Math.random() * keys.length) | 0]);
}

let currentPiece = randomPiece();
let heldPiece; 
heldPiece = generateSidePiece(heldPiece);
let nextPiece;
nextPiece = generateSidePiece(nextPiece);

function generateSidePiece(piece) {
    piece = randomPiece();
    piece.x = 1;
    piece.y = 1;
    return piece;
}

// ======== DRAWING ========
function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function drawHeldCell(x, y, color) {
    ctx2.fillStyle = color;
    ctx2.fillRect(x, y, 1, 1);
}

function drawNextCell(x, y, color) {
    ctx3.fillStyle = color;
    ctx3.fillRect(x, y, 1, 1);
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

function drawHeldBoard() {
    heldBoard.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawHeldCell(x, y, value);
        });
    });
}

function drawNextBoard() {
    nextBoard.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawNextCell(x, y, value);
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

function drawHeldPiece(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawHeldCell(piece.x + x, piece.y + y, piece.color);
        });
    });
}

function drawNextPiece(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) drawNextCell(piece.x + x, piece.y + y, piece.color);
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
            swaps += 1;
            swapsSelector.textContent = swaps;
            dropInterval = Math.max(100, 1000 - level * 80); // gravity speeds up
        }
    }
}

// ======= GHOST PIECE =========

function calculateGhostPosition(currentPiece, board) {
    const ghost = structuredClone(currentPiece);
    ghost.y = currentPiece.y + 1;
    ghost.color = ghostColors[currentPiece.type]
    while (!collides(ghost, board)) {
        ghost.y++;
    }
    ghost.y -= 1;
    return ghost;
}

// ======== GAME LOOP ========
function drawGame() {
    const ghostPiece = calculateGhostPosition(currentPiece, board);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawGrid();
    drawPiece(ghostPiece);
    drawPiece(currentPiece);
    setNextBoard();
    if (swaps >= 1) {
        setHeldBoard();
    }
}

function setHeldBoard() {
    ctx2.clearRect(0, 0, heldCanvas.width, heldCanvas.height);
    drawHeldBoard();
    drawHeldPiece(heldPiece);
}

function setNextBoard() {
    ctx3.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawNextBoard();
    drawNextPiece(nextPiece);
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

            currentPiece = nextPiece;
            nextPiece = generateSidePiece(nextPiece);
            if (collides(currentPiece, board)) {
                finalScoreSelector.textContent = score;
                endScreen.classList.add("end-screen");
                endScreen.classList.remove("end-screen_inactive");
                return;
            }
        }
        dropCounter = 0;
    }

    drawGame();
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

    if ((e.code === "Space") && (swaps >= 1)) {
        heldPieceSwap();
    }
});

rotateBtn.addEventListener("click", rotatePiece);
leftBtn.addEventListener("click", () => {movePiece(-1, 0)});
holdBtn.addEventListener("click", () => {
    if (swaps >= 1) {
        heldPieceSwap();
    }
});
rightBtn.addEventListener("click",() => {movePiece(1, 0)});
dropBtn.addEventListener("click", () => {
    if (movePiece(0, 1)) score += 1;
});

// ======== HELD PIECE =========
function heldPieceSwap() {
    currentPiece.matrix = heldPiece.matrix;
    currentPiece.color = heldPiece.color;
    currentPiece.type = heldPiece.type;
    swaps -= 1;
    swapsSelector.textContent = swaps;
    const newHeldPiece = randomPiece();
    newHeldPiece.x = 1;
    newHeldPiece.y = 1;
    heldPiece = newHeldPiece;
    setHeldBoard();
}


// ========== START GAME =========
startBtnSelector.addEventListener("click", e => {
    finalScoreSelector.textContent = 0;
    startScreen.classList.add("start-screen_inactive");
    if (screen_size <= 768) {
        pageTitle.classList.add("page__title_mobile");
        pageTitle.classList.remove("page__title_active");
        mobileBtnContainer.classList.add("mobile__btns");
        mobileBtnContainer.classList.remove("mobile__btns_inactive");
    }
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
    level = 1;
    linesCleared = 0;
    swaps = 1;
    scoreSelector.textContent = "0";
    levelSelector.textContent = "1";
    linesSelector.textContent = "0";
    board = createBoard();
    update();
});
const boards = [
    {
        cells: [
            ["E", "L", "W", "Y", "C"],
            ["Y", "L", "O", "A", "N"],
            ["U", "B", "L", "E", "E"],
            ["E", "L", "P", "M", "V"],
            ["P", "U", "R", "A", "U"]],
        words: ["CYAN", "YELLOW", "PURPLE", "MAUVE", "BLUE"]
    },
    {
        cells: [
            ["W", "A", "G", "L", "E"],
            ["O", "J", "A", "G", "U"],
            ["L", "A", "R", "S", "N"],
            ["F", "T", "A", "P", "I"],
            ["K", "E", "R", "A", "E"]],
        words: ["TAPIR", "EAGLE", "JAGUAR", "SNAKE", "WOLF"]
    },
    {
        cells: [
            ["C", "H", "E", "R", "Y"],
            ["P", "A", "P", "A", "Y"],
            ["B", "A", "N", "A", "N"],
            ["A", "P", "E", "A", "R"],
            ["F", "I", "G", "R", "R"]],
        words: ["CHERRY", "PAPAYA", "BANANA", "PEAR", "FIG"]
    },
]

// Aesthetically pleasing color palette for the cells
const cellColors = [
    '#a8e6cf', // Light Mint
    '#dcedc1', // Light Green
    '#ffd3b6', // Light Peach
    '#ffaaa5', // Light Salmon
    '#ff8b94'  // Light Coral
];

// Global variables for game state
let currentBoardIndex = -1; // To track the current board
let CELLS = []; // Will store the 2D array of cell DOM elements
let selected_x = -1;
let selected_y = -1;

// DOM elements (will be initialized when the page loads)
let gameBoardElement;
let boardTitleElement;
let wordsToFindListElement;

// Function to initialize DOM elements
function initializeDOMElements() {
    gameBoardElement = document.getElementById('game-board');
    boardTitleElement = document.getElementById('board-title');
    wordsToFindListElement = document.getElementById('words-to-find-list');
}

// Function to render a specific board
function renderBoard(boardIndex) {
    if (boardIndex < 0 || boardIndex >= boards.length) {
        console.error(`Board index ${boardIndex} out of bounds.`);
        return;
    }

    currentBoardIndex = boardIndex;
    const boardData = boards[boardIndex];

    // Clear previous board
    gameBoardElement.innerHTML = ''; // Clear existing cells
    CELLS = []; // Reset CELLS array

    // Set board title
    boardTitleElement.textContent = boardData.title || `Board ${boardIndex + 1}`; // Use title from data or default

    // Populate game board cells
    for (let y = 0; y < 5; y++) {
        const row = [];
        for (let x = 0; x < 5; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = boardData.cells[y][x];
            // Assign a unique, aesthetic color from the palette
            cell.style.backgroundColor = cellColors[(y * 5 + x) % cellColors.length];
            // Add a staggered animation delay for a cascading effect
            cell.style.animationDelay = `${(y * 5 + x) * 100}ms`;
            cell.onclick = () => on_cell_click(x, y); // Attach click handler
            gameBoardElement.appendChild(cell);
            row.push(cell);
        }
        CELLS.push(row);
    }

    // Populate words to find
    wordsToFindListElement.innerHTML = ''; // Clear previous words
    if (boardData.words && boardData.words.length > 0) {
        boardData.words.forEach(word => {
            const listItem = document.createElement('li');
            listItem.id = `word-${word}`; // Add ID for easy access
            listItem.textContent = word;
            wordsToFindListElement.appendChild(listItem);
        });
    }

    // Reset selection when a new board is loaded
    unselect();
}

// Game logic functions (using global CELLS array)
function move(x, y) {
    const selectedContent = CELLS[selected_y][selected_x].innerHTML;
    const targetContent = CELLS[y][x].innerHTML;

    // Check both concatenation orders
    const word1 = selectedContent + targetContent;
    const word2 = targetContent + selectedContent;

    CELLS[y][x].innerHTML = word1; // Default to one order
    CELLS[selected_y][selected_x].innerHTML = "";

    const was_won = checkWord(word1) || checkWord(word2);

    select(x, y); // Reselect the new cell

    if (!was_won) {
        checkForLoss();
    }
}

function unselect() {
    if (selected_x !== -1 && selected_y !== -1) {
        CELLS[selected_y][selected_x].classList.remove("selected");
    }
    selected_x = -1;
    selected_y = -1;
}

function select(x, y) {
    if (CELLS[y][x].innerHTML.length > 0) {
        unselect(); // Unselect previous cell first
        CELLS[y][x].classList.add("selected");
        selected_y = y;
        selected_x = x;
    }
}

function is_close(a, b) {
    return Math.abs(a - b) <= 1;
}

function can_move(x, y) {
    // Check if a cell is currently selected
    if (selected_x === -1 || selected_y === -1) {
        return false;
    }

    // Check if the target cell is adjacent (horizontally or vertically, not diagonally)
    const isAdjacentX = is_close(selected_x, x) && selected_y === y;
    const isAdjacentY = is_close(selected_y, y) && selected_x === x;

    // Ensure it's not the same cell
    const isSameCell = selected_x === x && selected_y === y;

    // Can move if adjacent and target cell has content
    return (isAdjacentX || isAdjacentY) && !isSameCell && CELLS[y][x].innerHTML.length > 0;
}

function on_cell_click(x, y) {
    if (selected_x === x && selected_y === y) {
        unselect();
    } else if (can_move(x, y)) {
        const selectedContent = CELLS[selected_y][selected_x].innerHTML;
        const targetContent = CELLS[y][x].innerHTML;
        if (selectedContent.length + targetContent.length > 7) {
            alert("Word length cannot exceed 7 letters!");
            return;
        }
        move(x, y);
    } else {
        select(x, y); // This will handle unselecting the old one
    }
}

function checkWord(word) {
    if (currentBoardIndex === -1) return false;

    const wordsToFind = boards[currentBoardIndex].words;
    const wordListItem = document.getElementById(`word-${word}`);

    if (wordsToFind.includes(word) && wordListItem && !wordListItem.classList.contains('found')) {
        wordListItem.classList.add('found');

        const foundCount = wordsToFindListElement.querySelectorAll('.found').length;
        if (foundCount === wordsToFind.length) {
            setTimeout(() => alert("Congratulations! You found all the words! You win!"), 100);
            return true; // Game is won
        }
    }
    return false;
}

function checkForLoss() {
    if (currentBoardIndex === -1) return;

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (CELLS[y][x].innerHTML !== "") {
                // Check right neighbor
                if (x < 4 && CELLS[y][x + 1].innerHTML !== "") return;
                // Check bottom neighbor
                if (y < 4 && CELLS[y + 1][x].innerHTML !== "") return;
            }
        }
    }

    const wordsToFind = boards[currentBoardIndex].words;
    const foundCount = wordsToFindListElement.querySelectorAll('.found').length;
    if (foundCount < wordsToFind.length) {
        setTimeout(() => alert("No more moves possible. You lose!"), 100);
    }
}
// Initial setup when the script loads (after DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    // No initial board render here, as game.html's window.onload will handle it.
});
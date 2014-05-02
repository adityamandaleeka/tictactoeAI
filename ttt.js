// Aditya Mandaleeka
// 2/2012
// Tic-Tac-Toe game against AI opponent using minimax and AB pruning

"use strict";

/*
  Board State
  First three elements of the array represent top row, next three
  are middle row, and last three are bottom row. +1 represents the
  player (X), and -1 represents the AI (O).
*/
var boardState;

// Colors
var AI_COLOR    = '#267979';
var HUMAN_COLOR = '#CA7E3F';
var GRID_COLOR  = '#003366';

// Mark types
var AI_SYMBOL = 'O';
var HUMAN_SYMBOL = 'X';

// Some constant to use for evaluated board value when game is not over
var GAME_NOT_OVER = -100;


/**
 * Draw the initial grid for the game
 */
function drawGrid() {
    var grid = document.getElementById("grid");
    var context = grid.getContext("2d");

    grid.width = grid.width; // clears the grid
    context.beginPath();
    boardState = [0,0,0,0,0,0,0,0,0];

    // Draw the lines
    context.moveTo(grid.width/3, 0);
    context.lineTo(grid.width/3, grid.height);
    context.moveTo(2 * grid.width/3, 0);
    context.lineTo(2 * grid.width/3, grid.height);
    context.moveTo(0, grid.height/3);
    context.lineTo(grid.width, grid.height/3);
    context.moveTo(0, 2 * grid.height/3);
    context.lineTo(grid.width, 2 * grid.height/3);

    context.lineWidth = 0.25;
    context.strokeStyle = GRID_COLOR;
    context.stroke();
    context.closePath();
}

/**
 * Handle clicks
 * @param e - The click event
 */
function clickHandler(e) {
    var grid = document.getElementById("grid");
    var yPos = e.clientY - grid.offsetTop;
    var xPos = e.clientX - grid.offsetLeft;

    // Find the row and the column that the click was in
    var row = Math.floor(yPos/(grid.height/3));
    var col = Math.floor(xPos/(grid.width/3));

    // Position of this square in the boardState array
    var arrayPosOfSquare = 3 * row + col; 

    // Clicking in a populated square does nothing
    if(boardState[arrayPosOfSquare] !== 0)
        return;

    mark(HUMAN_SYMBOL, arrayPosOfSquare);
    boardState[arrayPosOfSquare] = 1;

    var evaluatedValue = evaluateGameBoard(boardState);
    if(evaluatedValue !== GAME_NOT_OVER) {
        createAlertMessage(evaluatedValue);
    }
    else {
        makeAImove();
    }
}

/**
 * Evaluate the board
 * @param board - The current state of the board
 * @returns {Number} The value of the board
 */
function evaluateGameBoard(board) {
    var sums = getRowColDiagonalTotals(board);

    // If any of the rows/columns/diagonals add up to 3, the human has won
    if(sums.indexOf(3) !== -1)
        return 1;

    // If any of the rows/columns/diagonals add up to -3, the AI has won
    if(sums.indexOf(-3) !== -1)
        return -1;

    // Game is not over if there are empty squares
    if(board.indexOf(0) !== -1)
        return GAME_NOT_OVER;

    return 0; // Draw
}

/**
 * Returns the totals of the rows, columns, and diagonals of the board
 * @param board - The current state of the board
 * @returns Totals of the rows, columns, and diagonals
 */
function getRowColDiagonalTotals(board) {
    return [
        board[0] + board[1] + board[2],
        board[3] + board[4] + board[5],
        board[6] + board[7] + board[8],
        board[0] + board[3] + board[6],
        board[1] + board[4] + board[7],
        board[2] + board[5] + board[8],
        board[0] + board[4] + board[8],
        board[2] + board[4] + board[6]
        ];
}

/**
 * Perform alpha-beta pruning search to find the best AI move to make.
 * @param board - The current state of the board
 * @returns {Number} The square to play in order to minimize the score
 */
function alphaBetaPruningSearch(board) {
    var evaluatedValue = evaluateGameBoard(board);
    if(evaluatedValue !== GAME_NOT_OVER)
        return evaluatedValue;

    var score = Number.MAX_VALUE;
    var desiredIndex;
    var alpha = -99999;
    var beta = 99999;
    var currMin;
    for(var i = 0; i < 9; i++) {
        var nextBoardState = board.slice(0);
        if(nextBoardState[i] === 0) {
            nextBoardState[i] = -1;
            currMin = getValue(true, nextBoardState, alpha, beta);
            if(currMin < score) {
                score = currMin;
                desiredIndex = i;
            }
            
            if(score <= alpha)
                return score;
            
            beta = Math.min(beta, score);
        }
    }

    return desiredIndex;
}

/**
 * Gets the value of the game tree in the given state.
 * @param maxOrMin - A boolean value representing whom the next turn belongs to (max if true and min if false)
 * @param board - The current state of the board
 * @param alpha - The current value of alpha in the AB-pruning algorithm
 * @param beta - The current value of beta in the AB-pruning algorithm
 * @returns {Number} The value of this game subtree
 */
function getValue(maxOrMin, board, alpha, beta) {
    var evaluatedValue = evaluateGameBoard(board);
    if(evaluatedValue !== GAME_NOT_OVER)
        return evaluatedValue;
    
    // If maximizing, start with value set to MIN_VALUE and vice versa
    var val = maxOrMin ?  Number.MIN_VALUE : Number.MAX_VALUE;

    for(var i = 0; i < 9; i++) {
        var nextBoardState = board.slice(0);

        if(nextBoardState[i] === 0) {
            nextBoardState[i] = maxOrMin ? 1 : -1; // human is max

            if(maxOrMin) {
                // get max value
                val = Math.max(val, getValue(false, nextBoardState, alpha, beta));
                if(val >= beta)
                    return val;

                alpha = Math.max(alpha, val);
            }
            else {
                // get min value
                val = Math.min(val, getValue(true, nextBoardState, alpha, beta));
                if(val <= alpha)
                    return val;

                beta = Math.min(beta, val);
            }
        }
    }
  
    return val;
}

/**
 * Finds the best move for the AI to make and makes it.
 */
function makeAImove() {
    var bestMove = alphaBetaPruningSearch(boardState);
    boardState[bestMove] = -1;
    mark(AI_SYMBOL, bestMove);

    var evaluatedValue = evaluateGameBoard(boardState);
    if(evaluatedValue !== GAME_NOT_OVER)
       createAlertMessage(evaluatedValue);
}

/**
 * Draws a mark of the given type in the specified square
 * @param type - The type of mark to draw (X or O)
 * @param squareNum - The index of the square in which to draw
 * @throws Will throw if the mark type is not recognized.
 */
function mark(type, squareNum) {
    var grid = document.getElementById("grid");

    var context = grid.getContext("2d");
    context.beginPath();
    context.lineWidth = 7;

    if(type === AI_SYMBOL) {
        // draw circle
        var centerX = (squareNum % 3) * (grid.width / 3) + (grid.width / 6);
        var centerY = Math.floor(squareNum / 3) * (grid.height / 3) + (grid.width / 6);
        var radius = (grid.width / 6) - 5;

        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.strokeStyle = AI_COLOR; 
    }
    else if(type === HUMAN_SYMBOL) {
        // draw X
        var leftX = (squareNum % 3) * (grid.width / 3) + 5;
        var topY = Math.floor((squareNum / 3)) * (grid.height / 3) + 5;
        var rightX = leftX + (grid.width / 3) - 10;
        var bottomY = topY + (grid.height / 3) - 10;

        context.moveTo(leftX, topY);
        context.lineTo(rightX, bottomY); 
        context.moveTo(leftX, bottomY);
        context.lineTo(rightX, topY);   

        context.lineCap = "round";
        context.strokeStyle = HUMAN_COLOR; 
    }
    else {
        throw "Invalid mark type";
    }

    context.stroke();
    context.closePath(); 
}

/**
 * Shows an alert indicating the game's outcome and restarts the game
 * @param boardValue - The value of the board
 */
function createAlertMessage(boardValue) {
    if(boardValue === 1)
        alert('You Win!');
    else if(boardValue === -1)
        alert('You Lose!');
    else
        alert('Draw');

    drawGrid();
}

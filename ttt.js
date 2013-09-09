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

function drawGrid()
{
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

function clickHandler(e)
{
    var grid = document.getElementById("grid");
    var yPos = e.clientY - grid.offsetTop;
    var xPos = e.clientX - grid.offsetLeft;

    // Find the row and the column that the click was in
    var row = Math.floor(yPos/(grid.height/3));
    var col = Math.floor(xPos/(grid.width/3));

    // position of this square in the boardState array
    var arrayPosOfSquare = 3 * row + col; 
    if(boardState[arrayPosOfSquare] == 0)
    {
        mark(1, arrayPosOfSquare);
        boardState[arrayPosOfSquare] = 1;
        if(checkGameOver(boardState))
        {
            createAlertMessage(boardState);
        }
        else
        {
            makeAImove();
        }
    }
}

// Check if the game is over
function checkGameOver(board)
{
    return (evaluateGameBoard(board) != -100);
}

function evaluateGameBoard(board)
{
    // Sum the rows/columns/diagonals and check if there is a +3,
    // indicating the human has won.
    if (board[0] + board[1] + board[2] == 3 ||
        board[3] + board[4] + board[5] == 3 ||
        board[6] + board[7] + board[8] == 3 ||
        board[0] + board[3] + board[6] == 3 ||
        board[1] + board[4] + board[7] == 3 ||
        board[2] + board[5] + board[8] == 3 ||
        board[0] + board[4] + board[8] == 3 ||
        board[2] + board[4] + board[6] == 3)
       return 1;

    // Sum the rows/columns/diagonals and check if there is a -3,
    // indicating the AI has won.
    if (board[0] + board[1] + board[2] == -3 ||
        board[3] + board[4] + board[5] == -3 ||
        board[6] + board[7] + board[8] == -3 ||
        board[0] + board[3] + board[6] == -3 ||
        board[1] + board[4] + board[7] == -3 ||
        board[2] + board[5] + board[8] == -3 ||
        board[0] + board[4] + board[8] == -3 ||
        board[2] + board[4] + board[6] == -3)
       return -1;

    for(var i = 0; i<9; i++)
    {
        if(board[i] == 0)
        {
            return -100; // Game isn't over yet
        }
    }

    return 0; // Draw
}

function alphaBetaPruningSearch(board)
{
    if(checkGameOver(board))
       return evaluateGameBoard(board);

    var score = 9999;
    var desiredIndex;
    var alpha = -99999;
    var beta = 99999;
    var currMax;
    for(var i = 0; i < 9; i++)
    {
        var nextBoardState = board.slice(0);
        if(nextBoardState[i] == 0)
        {
            nextBoardState[i] = -1;
            currMax = getValue(true, nextBoardState, alpha, beta);
            if(currMax < score)
            {
                score = currMax;
                desiredIndex = i;
            }
            
            if(score <= alpha)
                return score;
            
            beta = Math.min(beta, score);
        }
    }

    return desiredIndex;
}

// maxOrMin is a boolean - true for max, false for min
function getValue(maxOrMin, board, alpha, beta)
{
    if(checkGameOver(board))
        return evaluateGameBoard(board);
    
    var val = maxOrMin ? -9999 : 9999;
    var myAlpha = alpha;
    var myBeta = beta;

    for(var i = 0; i < 9; i++)
    {
        var nextBoardState = board.slice(0);
        if(nextBoardState[i] == 0)
        {
            nextBoardState[i] = maxOrMin ? 1 : -1; //human is max

            if(maxOrMin) // get max value
            {
                val = Math.max(val, getValue(false, nextBoardState, myAlpha, myBeta));
                if(val >= myBeta)
                    return val;

                myAlpha = Math.max(myAlpha, val);
            }
            else // get min value
            {
                val = Math.min(val, getValue(true, nextBoardState, myAlpha, myBeta));
                if(val <= myAlpha)
                    return val;

                myBeta = Math.min(myBeta, val);
            }
        }
    }
  
    return val;
}

function makeAImove()
{
    var bestMove = alphaBetaPruningSearch(boardState);
    boardState[bestMove] = -1;
    mark(0, bestMove);

    if(checkGameOver(boardState))
       createAlertMessage(boardState);
}

function mark(type, squareNum)
{
    var grid = document.getElementById("grid");

    var context = grid.getContext("2d");
    context.beginPath();
    context.lineWidth = 7;

    if(type == 0) // draw circle
    {
        var centerX = (squareNum % 3) * (grid.width / 3) + (grid.width / 6);
        var centerY = Math.floor(squareNum / 3) * (grid.height / 3) + (grid.width / 6);
        var radius = (grid.width / 6) - 5;

        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.strokeStyle = AI_COLOR; 
    }
    else // draw X
    {
        var grid = document.getElementById("grid");
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

    context.stroke();
    context.closePath(); 
}

function createAlertMessage(board)
{
    if(checkGameOver(boardState))
    {
        var val = evaluateGameBoard(board);
        if(val == 1)
            alert('You Win!');
        else if(val == -1)
            alert('You Lose!');
        else
            alert('Draw');

        drawGrid();
    }
}

'use strict';

var MINE = `💣`;
var smiely = `😃`;
var FLAG = `🏴󠁫󠁭󠁧󠁿`;

var timerInterval;

var colors = {
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'purple',
  5: 'maroon',
  6: 'turquoise',
  7: 'black',
  8: 'grey',
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
};

var gSecUnits, gSecTens, gSecHundreds;
// resetTimer();
var gBoard;
var gCell;
var gLevel = {
  SIZE: 4,
  MINES: 2,
};

function init() {
  smiely = `😃`;
  clearInterval(timerInterval);
  timerInterval = null;
  resetGGame();
  preventRightClickDefault();
  resetTimer();
  clearInterval();
  gBoard = buildBoard(gLevel.SIZE);
  setMines();
}

function setSize(size) {
  gLevel.SIZE = size;
  switch (size) {
    case 4:
      gLevel.MINES = 2;
      break;
    case 8:
      gLevel.MINES = 12;
      break;
    case 12:
      gLevel.MINES = 30;
      break;
  }
  init();
}

function createCell(i, j) {
  gCell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: false,
    location: { i: i, j: j },
  };
  return gCell;
}

function setMines() {
  var mines = [];
  while (mines.length < gLevel.MINES) {
    var newMine = createMine();
    if (mines.length === 0) mines.push(newMine);
    if (!isLocationEmpty(mines, newMine)) mines.push(newMine);
  }
  for (var i = 0; i < mines.length; i++) {
    var rowIdx = mines[i].rowIdx;
    var colIdx = mines[i].colIdx;
    gBoard[rowIdx][colIdx].isMine = true;
  }
  setMinesNegsToAll();
  renderBoard(gBoard, `tbody`);
  addRightClickListener();
}

function createMine() {
  var mine;
  var rowIdx = getRandomInt(0, gLevel.SIZE - 1);
  var colIdx = getRandomInt(0, gLevel.SIZE - 1);
  mine = { rowIdx: rowIdx, colIdx: colIdx };
  return mine;
}

function setMinesNegsToAll() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      setMinesNegsCount(gBoard[i][j]);
    }
  }
}

function setMinesNegsCount(cell) {
  var rowIdx = cell.location.i;
  var colIdx = cell.location.j;
  var negs = countNegs(gBoard, rowIdx, colIdx);
  cell.minesAroundCount = negs;
}

function cellClicked(elCell) {
  gGame.isOn = true;
  if (!timerInterval) timerInterval = setInterval(incrementSeconds, 1000);
  var location = getCellCoord(elCell.id);
  var rowIdx = location.i;
  var colIdx = location.j;
  var currCell = gBoard[rowIdx][colIdx];
  gGame.shownCount++;
  currCell.isShown = true;
  checkWin();
  if (currCell.isMine) {
    reset();
    smiely = `🤕`;
    return;
  }
  renderBoard(gBoard, `tbody`);
  addRightClickListener();
}

function incrementSeconds() {
  var el = document.querySelector('.timer');
  gSecUnits += 1;
  if (gSecUnits === 10) {
    gSecUnits = 0;
    gSecTens += 1;
  }
  if (gSecTens === 10) {
    gSecTens = 0;
    gSecHundreds += 1;
  }
  if (gSecHundreds == 10) reset();
  el.innerText = `${gSecHundreds}${gSecTens}${gSecUnits}`;
}

function reset() {
  clearInterval(timerInterval);
  timerInterval = null;
  revealBoard();
  setTimeout(init, 1000);
}

function addRightClickListener() {
  var elCells = document.querySelectorAll(`.noContextMenu`);
  for (var i = 0; i < elCells.length; i++) {
    elCells[i].addEventListener('contextmenu', (e) => {
      putFlag(e);
    });
  }
}

function putFlag(elCell) {
  var strCellId = elCell.srcElement.id;
  var location = getCellCoord(strCellId);
  var currCell = gBoard[location.i][location.j];
  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--;
  } else {
    currCell.isMarked = true;
    gGame.markedCount++;
  }
  checkWin();
  renderBoard(gBoard, `tbody`);
  addRightClickListener();
}

function revealBoard() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      gBoard[i][j].isMarked = false;
      gBoard[i][j].isShown = true;
      smiely = `💀`;
      renderBoard(gBoard, `tbody`);
    }
  }
}

function checkWin() {
  var safeCellsNum = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
  if (gGame.shownCount === safeCellsNum && gGame.markedCount === gLevel.MINES)
    win();
  return;
}

function win() {
  // to do win
  console.log(`win`);
}

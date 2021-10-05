'use strict';

var MINE = `💣`;
var gSmiely = `😃`;
var FLAG = `🏴󠁫󠁭󠁧󠁿`;
var HEART = `❤️`;
var gLifes = 2;
var HINT = `💡`;
var gHints = 3;

var gTimerInterval;

preventRightClickDefault();

var gEasyRecord;
isNewRecord(`easy`, gEasyRecord);
var gMediumRecord;
isNewRecord(`medium`, gMediumRecord);
var gHardRecord;
isNewRecord(`hard`, gHardRecord);

var gColors = {
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

var gLevel = {
  SIZE: 4,
  MINES: 2,
};

var gSecUnits, gSecTens, gSecHundreds;
var gEmptyNegs = [];
var gIsHintActive;
var gSafeRemain;
var gBoard;
var gCell;

var gDifficulty = `easy`;
var gTime;

function init() {
  gTime = 0;
  gEmptyNegs = [];
  gSmiely = `😃`;
  clearInterval(gTimerInterval);
  gTimerInterval = null;
  resetGGame();
  resetTimer();
  gBoard = buildBoard(gLevel.SIZE);
  setMines();
  gLifes = gLevel.SIZE === 4 ? 2 : 3;
  updateLifesEl();
  gIsHintActive = false;
  gHints = 3;
  updateHintsEl();
  gSafeRemain = 3;
  updateSafeClick();
}

function setSize(size) {
  gLevel.SIZE = size;
  switch (size) {
    case 4:
      gLevel.MINES = 2;
      gDifficulty = `easy`;
      break;
    case 8:
      gLevel.MINES = 12;
      gDifficulty = `medium`;
      break;
    case 12:
      gLevel.MINES = 30;
      gDifficulty = `hard`;
      break;
  }
  init();
}

function updateLifesEl() {
  var lifesEl = document.querySelector(`.lifes-el`);
  var str = '';
  for (var i = 0; i < gLifes; i++) {
    str += HEART;
  }
  lifesEl.innerText = str;
}

function updateHintsEl() {
  var hintEl = document.querySelector(`.hints-el`);
  var str = '';
  for (var i = 0; i < gHints; i++) {
    str += `<span class="hint"> ${HINT} </span>`;
  }
  hintEl.innerHTML = str;
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
  console.log(gBoard);
  renderBoard(gBoard, `tbody`);
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
  var location = getCellCoord(elCell.id); //find curr cell
  var rowIdx = location.i;
  var colIdx = location.j;
  var currCell = gBoard[rowIdx][colIdx];
  if (gIsHintActive) {
    // hints
    useHint(currCell);
    return;
  }
  if (!gGame.isOn && currCell.isMine) {
    //first cell no mine
    init();
    cellClicked(elCell);
    return;
  }
  if (!gGame.isOn) gGame.isOn = true;
  if (!gTimerInterval) gTimerInterval = setInterval(incrementSeconds, 1000);
  if (currCell.isShown) return; // what to do to the cell
  if (currCell.isMarked) return;
  gGame.shownCount++;
  currCell.isShown = true;
  if (currCell.isMine) {
    gGame.shownCount--; //  for the win function to work properly
    gGame.markedCount++;
    gSmiely = `🤕`; // adjusting game elements
    gLifes--;
    updateLifesEl();
    if (gLifes === 0) reset();
    renderBoard(gBoard, `tbody`);
    blowUp(currCell);
    return;
  }
  if (currCell.minesAroundCount === 0) checkNegs(elCell.id);
  checkWin();
  renderBoard(gBoard, `tbody`);
}

function incrementSeconds() {
  if (!gGame.isOn) return;
  var el = document.querySelector('.timer');
  gSecUnits += 1;
  gTime += 1;
  if (gSecUnits === 10) {
    gSecUnits = 0;
    gSecTens += 1;
  }
  if (gSecTens === 10) {
    gSecTens = 0;
    gSecHundreds += 1;
  }
  if (gSecHundreds === 10) reset();
  el.innerText = `${gSecHundreds}${gSecTens}${gSecUnits}`;
}

function putFlag(elCell) {
  var strCellId = elCell.srcElement.id; //getting the location from the element
  var location = getCellCoord(strCellId);
  var currCell = gBoard[location.i][location.j];
  if (currCell.isShown) return;
  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--;
  } else {
    currCell.isMarked = true;
    gGame.markedCount++;
  }
  checkWin();
  renderBoard(gBoard, `tbody`);
}

function revealBoard() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      gBoard[i][j].isMarked = false;
      gBoard[i][j].isShown = true;
      gSmiely = `💀`;
      renderBoard(gBoard, `tbody`);
    }
  }
}

function checkNegs(currId) {
  var location = getCellCoord(currId);
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) {
      continue;
    }
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) {
        continue;
      }
      if (i === location.i && j === location.j) continue;
      var newCell = gBoard[i][j];
      if (newCell.isMarked) continue;
      if (newCell.isShown) continue;
      if (!newCell.isMine) {
        newCell.isShown = true;
        gGame.shownCount++;
        if (newCell.minesAroundCount === 0) gEmptyNegs.push(newCell);
        renderBoard(gBoard, `tbody`);
      }
    }
  }
  for (var i = 0; i < gEmptyNegs.length; i++) {
    var currCell = gEmptyNegs.pop();
    var newCellId = getCellId(currCell.location);
    checkNegs(newCellId);
  }
}

function blowUp(cell) {
  var CellId = getCellId(cell.location);
  var elCell = document.querySelector(`#${CellId}`);
  elCell.style.backgroundColor = 'red';
  setTimeout(() => {
    renderBoard(gBoard, `tbody`);
  }, 1000);
}

function activeHint() {
  if (gIsHintActive) {
    gIsHintActive = false;
    var elHint = document.querySelector(`.hint`);
    elHint.style.opacity = '1';
  } else {
    gIsHintActive = true;
    var elHint = document.querySelector(`.hint`);
    elHint.style.opacity = '0.5';
  }
}

function useHint(currCell) {
  toogleNegsDisplay(currCell);
  renderBoard(gBoard, `tbody`);
  gHints--;
  updateHintsEl();
  setTimeout(() => {
    gIsHintActive = false;
    toogleNegsDisplay(currCell);
    renderBoard(gBoard, `tbody`);
  }, 1000);
}

function updateSafeClick() {
  var elsSafeRemain = document.querySelector(`.safe-available`);
  elsSafeRemain.innerText = `${gSafeRemain} pressed left`;
}

function activeSafeClick() {
  gSafeRemain--;
  if (gSafeRemain < 0) return;
  var emptyLoc = getEmptyCells(gBoard);
  for (var i = 0; i < emptyLoc.length; i++) {
    var rowIdx = emptyLoc[i].i;
    var colIdx = emptyLoc[i].j;
    if (gBoard[rowIdx][colIdx].isShown) {
      emptyLoc.splice(i, 1);
      i--;
    }
  }
  var ranIdx = getRandomInt(0, emptyLoc.length - 1);
  var safeCell = emptyLoc.splice(ranIdx, 1);
  var safeCellId = getCellId(safeCell[0]);
  var elSafeCell = document.querySelector(`#${safeCellId}`);
  elSafeCell.style.backgroundColor = 'lightblue';
  updateSafeClick();
}

function checkWin() {
  var safeCellsNum = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
  if (gGame.shownCount === safeCellsNum && gGame.markedCount === gLevel.MINES) {
    gSmiely = `😎`;
    clearInterval(gTimerInterval);
    renderBoard(gBoard, `tbody`);
    gGame.isOn = false;
    isNewRecord(gDifficulty, gTime);
    win();
  }
  return;
}

function win() {
  setTimeout(() => {
    //the timeout is here to allow the user to see the winnig situation until pressing on the alert
    init();
    alert('Win!!!..  Finally');
  }, 30);
}

function reset() {
  clearInterval(gTimerInterval);
  gTimerInterval = null;
  gGame.isOn = false;
  revealBoard();
  setTimeout(init, 1500); // see the result before starting a new game
}

function addRightClickListener() {
  var elCells = document.querySelectorAll(`.noContextMenu`);
  for (var i = 0; i < elCells.length; i++) {
    elCells[i].addEventListener('contextmenu', (e) => {
      putFlag(e);
    });
  }
}

function toogleNegsDisplay(currCell) {
  var location = currCell.location;
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) {
      continue;
    }
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) {
        continue;
      }
      var newCell = gBoard[i][j];

      newCell.isShown = gIsHintActive ? true : false;
    }
  }
  renderBoard(gBoard, `tbody`);
}

function isNewRecord(difficulty, time) {
  if (typeof Storage !== 'undefined') {
    switch (difficulty) {
      case `easy`:
        if (gEasyRecord !== null) {
          if (time < gEasyRecord) {
            localStorage.setItem('easyHighscore', time);
            gEasyRecord = time;
          }
        } else {
          localStorage.setItem('easyHighscore', time);
          gEasyRecord = time;
        }
        var elEasyRecord = document.querySelector(`.easy-record`);
        elEasyRecord.innerText = localStorage.getItem('easyHighscore');
        break;
      case `medium`:
        if (gMediumRecord !== null) {
          if (time < gMediumRecord) {
            localStorage.setItem('mediumHighscore', time);
            gMediumRecord = time;
          }
        } else {
          localStorage.setItem('mediumHighscore', time);
          gMediumRecord = time;
        }
        var elMediumRecord = document.querySelector(`.medium-record`);
        elMediumRecord.innerText = localStorage.getItem('mediumHighscore');
        break;
      case `hard`:
        if (gHardRecord !== null) {
          if (time < gHardRecord) {
            localStorage.setItem('hardHighscore', time);
          }
        } else {
          localStorage.setItem('hardHighscore', time);
        }
        var elHardRecord = document.querySelector(`.hard-record`);
        elHardRecord.innerText = localStorage.getItem('hardHighscore');
        break;
    }
  } else {
    var elStorage = document.querySelector(`.storage`);
    elStorage.innerText = `Sorry! No Web Storage support..`;
  }
}

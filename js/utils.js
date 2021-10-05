function renderBoard(borad, selector) {
  var strHTML = `<td class="table-header" colspan="${borad.length}">`; //table-header
  var minesLeft = gLevel.MINES - gGame.markedCount;
  strHTML += `<div class="mines-marked">${minesLeft}</div>`;
  strHTML += `<div class="smiley"><button onclick="init()" >${gSmiely}</button></div>`;
  strHTML += `<div class="timer">${gSecHundreds}${gSecTens}${gSecUnits}</div></td>`;
  //table-body
  for (var i = 0; i < borad.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < borad[0].length; j++) {
      var styleStr = '';
      var cell;
      var className = '';
      if (borad[i][j].isMarked) {
        className += 'flaged '; // put flags
        cell = FLAG;
      } else if (borad[i][j].isShown) {
        className += 'clicked ';
        if (borad[i][j].isMine) {
          cell = MINE;
        } else if (borad[i][j].minesAroundCount === 0) {
          cell = ''; // no neighbors
        } else cell = borad[i][j].minesAroundCount;
      } else cell = ''; //unShown
      if (borad[i][j].isShown) {
        var currColor = gColors[borad[i][j].minesAroundCount]; // colors for numbers
        var styleStr = `style="color:${currColor}"`;
      }
      className += `cell noContextMenu`;
      var tdId = `cell-${i}-${j}`;
      strHTML += `<td id="${tdId}" ${styleStr} class="${className}" onclick ="cellClicked(this)" >${cell}</td>`;
    }
    strHTML += '</tr>';
  }
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
  addRightClickListener();
}

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    var row = [];
    for (var j = 0; j < size; j++) {
      row.push(createCell(i, j));
    }
    board.push(row);
  }
  return board;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (!board[i][j].isMine) {
        emptyCells.push({ i: i, j: j });
      }
    }
  }
  return emptyCells;
}

function countNegs(board, rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) {
      continue;
    }
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > board[0].length - 1) {
        continue;
      }
      if (i === rowIdx && j === colIdx) continue;
      if (board[i][j].isMine) count++;
    }
  }
  return count;
}

function getCellId(location) {
  var str = `cell-${location.i}-${location.j}`;
  return str;
}

function getCellCoord(strCellId) {
  var parts = strCellId.split('-');
  var coord = { i: +parts[1], j: +parts[2] };
  return coord;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function isLocationEmpty(mines, newMine) {
  for (var i = 0; i < mines.length; i++) {
    if (
      mines[i].rowIdx === newMine.rowIdx &&
      mines[i].colIdx === newMine.colIdx
    ) {
      return true;
    }
  }
  return false;
}

function preventRightClickDefault() {
  var elApp = document.querySelector(`.app`);
  elApp.oncontextmenu = (e) => {
    e.preventDefault();
  };
}

function resetTimer() {
  gSecUnits = 0;
  gSecTens = 0;
  gSecHundreds = 0;
}

function resetGGame() {
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
  };
}

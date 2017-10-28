var distance = function(playerA, playerB){
  return Math.abs(playerA.x - playerB.x) + Math.abs(playerA.y - playerB.y);
}

// ---------- Display -------------------------------------------
var Display = function () {

  this.init = function(gameObject){
    this.destination = new Player();
    this.destination.init([gameObject.playerOne.x, gameObject.playerOne.y], 1, 0, 0, 'destination');
    this.destination.range = this.destination.calculateRange(gameObject.board);

    this.board = this.generateBoard(gameObject.board.fields, gameObject.board.fieldClasses);
  }

  this.optionalStep = function (boardObject, player, direction) {
    switch (direction) {
      case 'top':
        var newY = this.destination.y - 1;
        // If destination has no obstacles above
        if (this.destination.range.top > 0){
          // If destination is at the same row or above player and moving upwards will increase distance to player
          if (player.y >= this.destination.y) {
            // So if player.rangeLimit hasn't been reached
            if (player.rangeLimit > distance(player, this.destination)){
              // Move destination upwards
              this.destination.changePosition(boardObject, [this.destination.x, newY]);
            }
          // If destination is beneath player moving upwards will decrease distance to player, so no need to check distance
          } else {
            // Move destination upwards
            this.destination.changePosition(boardObject, [this.destination.x, this.destination.y--]);
          }
        }
        break;
      case 'right':
        var newX = this.destination.x + 1;
        // If destination has no obstacles on right
        if (this.destination.range.right > 0){
          // If destination is in the same or in the right side column from  player then moving right will increase distance to player
          if (player.x <= this.destination.x) {
            // So if player.rangeLimit hasn't been reached
            if (player.rangeLimit > distance(player, this.destination)){
              // Move destination to right
              this.destination.changePosition(boardObject, [newX, this.destination.y]);
            }
          // If destination is in left side column from` player moving right will decrease distance, so no need to check distance
          } else {
            // Move destination upwards
            this.destination.changePosition(boardObject, [newX, this.destination.y]);
          }
        }
        break;
      case 'bottom':
        var newY = this.destination.y + 1;
        // If destination has no obstacles beneath
        if (this.destination.range.bottom > 0){
          // If destination is at the same row or beneath player and moving downwards will increase distance to player
          if (player.y <= this.destination.y) {
            // So if player.rangeLimit hasn't been reached
            if (player.rangeLimit > distance(player, this.destination)){
              // Move destination downwards
              this.destination.changePosition(boardObject, [this.destination.x, newY]);
            }
          // If destination is above player moving downwards will decrease distance to player, so no need to check distance
          } else {
            // Move destination downwards
            this.destination.changePosition(boardObject, [this.destination.x, newY]);
          }
        }
        break;
      case 'left':
        var newX = this.destination.x - 1;
        // If destination has no obstacles on left
        if (this.destination.range.left > 0){
          // If destination is in the same or in the left side column from  player then moving right will increase distance to player
          if (player.x >= this.destination.x) {
            // So if player.rangeLimit hasn't been reached
            if (player.rangeLimit > distance(player, this.destination)){
              // Move destination to left
              this.destination.changePosition(boardObject, [newX, this.destination.y]);
            }
          // If destination is in right side column from` player moving left will decrease distance, so no need to check distance
          } else {
            // Move destination upwards
            this.destination.changePosition(boardObject, [newX, this.destination.y]);
          }
        }
        break;
      default:
    }
    if (this.destination.x 1== ) {

    }
  }

  this.generateBoard = function (fieldsArr, classArr){

    // Find #board element
    var boardHTML = $('#board');

    // For every board row
    for (var y = 0; y < fieldsArr.length; y++) {
      // Create div with class row
      var row = $('<div>').addClass('row');
      // For every field in a row
      for (var x = 0; x < fieldsArr.length; x++) {
        // Create dive with class, id with field index number in name and sample content
        var field = $('<div>').addClass('field ' + fieldsArr[x][y]);
        field.attr('id', "field-" +  x + y);
        field.text(x + ', ' + y);
        // Add it to the row
        row.append(field);
      }
      // Add row to the board
      boardHTML.append(row);
    }
    return boardHTML;
  }
}

// Find div with id with player coordinates and add player class
var addClassName = function ([x, y], customClass) {
  $('#field-'.concat(x, y)).addClass(customClass);
}

// Find div with id with player coordinates and remove player class
var removeClassName = function ([x, y], customClass) {
  $('#field-'.concat(x, y)).removeClass(customClass);
}

// Find div with id with player coordinates and add 'range' class for available fields in range
var showPlayerRange = function (player, boardObject) {
  for (var x = player.x - player.range.left; x <= player.x + player.range.right; x++) {
    for (var y = player.y - player.range.top; y <= player.y + player.range.bottom; y++) {
      var field = $('#field-'.concat(player.x, player.y));
      if (!((x === player.x && y === player.y) || field.hasClass(boardObject.fieldClasses.obstacle) || field.hasClass(boardObject.fieldClasses.player))) {
        field.addClass('range');
      }
    }
  }
}

var hidePlayerRange = function (player, boardObject) {
  for (var x = player.x - player.range.left; x <= player.x + player.range.right; x++) {
    for (var y = player.y - player.range.top; y <= player.y + player.range.bottom; y++) {
      if (!((x === player.x && y === player.y) || field.hasClass(boardObject.fieldClasses.obstacle) || field.hasClass(boardObject.fieldClasses.player))) {
        field.removeClass('range');
      }
    }
  }
}

// Update player position
var updatePlayer = function (gameObject, player, newCoordinates) {
  // Make player dispaear from board
  removeClassName([player.x, player.y], player.customClass);
  // Update position and movement range
  gameObject.movePlayer(player, newCoordinates);
  // Make player appear on board
  addClassName([player.x, player.y], player.customClass);
}

// ---------- Game cycle -------------------------------------------

function playerOneTurn (event, gameObject, displayObject) {
  switch (event.key) {
    case 'w':
      displayObject.optionalStep(gameObject.board, gameObject.playerOne, 'top');
      break;
    case 'd':
      displayObject.optionalStep(gameObject.board, gameObject.playerOne, 'right');
      break;
    case 's':
      displayObject.optionalStep(gameObject.board, gameObject.playerOne, 'bottom');
      break;
    case 'a':
      displayObject.optionalStep(gameObject.board, gameObject.playerOne, 'left');
      break;
    case 'Enter':
      updatePlayer(gameObject, gameObject.playerOne, [displayObject.destination.x, displayObject.destination.y]);
      displayObject.destination.changePosition(gameObject.board,  [gameObject.playerTwo.x, gameObject.playerTwo.y]);
      return 2;
    case 'q':
      return 3;
    default:
  }
  return 1;
}

function playerTwoTurn (event, gameObject, displayObject) {
  switch (event.key) {
    case 'ArrowUp':
      displayObject.optionalStep(gameObject.board, gameObject.playerTwo, 'top');
      break;
    case 'ArrowRight':
      displayObject.optionalStep(gameObject.board, gameObject.playerTwo, 'right');
      break;
    case 'ArrowDown':
      displayObject.optionalStep(gameObject.board, gameObject.playerTwo, 'bottom');
      break;
    case 'ArrowLeft':
      displayObject.optionalStep(gameObject.board, gameObject.playerTwo, 'left');
      break;
    case 'Enter':
      updatePlayer(gameObject, gameObject.playerTwo, [displayObject.destination.x, displayObject.destination.y]);
      displayObject.destination.changePosition(gameObject.board,  [gameObject.playerOne.x, gameObject.playerOne.y]);
      return 1;
    case 'q':
      return 3;
    default:
  }
  return 2
}

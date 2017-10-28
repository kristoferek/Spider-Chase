// ---------- Display -------------------------------------------
var Display = function () {

  this.init = function(gameObject){
    this.destination = new Player();

    // Sets the origin player for destination object
    this.destination.originPlayer = gameObject.playerOne;
    this.destination.obstaclePlayer = gameObject.playerTwo;

    // Initialize destinantion Player object
    this.destination.init([this.destination.originPlayer.x, this.destination.originPlayer.y], 1, 0, 0, 'destination');

    // Calculate destinantion range from board, edges, obstacles and oposite player
    this.destination.range = this.destination.calculateRange(gameObject.board, [gameObject.board.fieldClasses.obstacle, this.destination.obstaclePlayer.customClass]);

    // Create HTML board and display in html
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
            if (player.rangeLimit > distance(player.x, player.y, this.destination.x, this.destination.y)){
              // Move destination upwards
              updateDestination(boardObject, this.destination, [this.destination.x, newY]);
            }
          // If destination is beneath player moving upwards will decrease distance to player, so no need to check distance
          } else {
            // Move destination upwards
            updateDestination(boardObject, this.destination, [this.destination.x, newY]);
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
            if (player.rangeLimit > distance(player.x, player.y, this.destination.x, this.destination.y)){
              // Move destination to right
              updateDestination(boardObject, this.destination, [newX, this.destination.y]);
            }
          // If destination is in left side column from` player moving right will decrease distance, so no need to check distance
          } else {
            // Move destination upwards
            updateDestination(boardObject, this.destination, [newX, this.destination.y]);
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
            if (player.rangeLimit > distance(player.x, player.y, this.destination.x, this.destination.y)){
              // Move destination downwards
              updateDestination(boardObject, this.destination, [this.destination.x, newY]);
            }
          // If destination is above player moving downwards will decrease distance to player, so no need to check distance
          } else {
            // Move destination downwards
            updateDestination(boardObject, this.destination, [this.destination.x, newY]);
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
            if (player.rangeLimit > distance(player.x, player.y, this.destination.x, this.destination.y)){
              // Move destination to left
            updateDestination(boardObject, this.destination, [newX, this.destination.y]);
            }
          // If destination is in right side column from` player moving left will decrease distance, so no need to check distance
          } else {
            // Move destination upwards
            updateDestination(boardObject, this.destination, [newX, this.destination.y]);
          }
        }
        break;
      default:
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
        field.append($('<div>').addClass('background').append($('<div>').addClass('object')));
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
var showPlayerRange = function (player, gameObject) {
  for (var x = player.x - player.rangeLimit; x <= player.x + player.rangeLimit; x++) {
    for (var y = player.y - player.rangeLimit; y <= player.y + player.rangeLimit; y++) {
      if ((x => 0) && (y => 0)){
        var field = $('#field-'.concat(x, y));
        if (distance(player.x, player.y, x, y) <= player.rangeLimit) {
          if (!(field.hasClass(gameObject.board.fieldClasses.obstacle) || field.hasClass(gameObject.playerOne.customClass) || field.hasClass(gameObject.playerTwo.customClass))) {
            field.addClass('range');
          }
        }
      }
    }
  }
}

var hidePlayerRange = function (player, boardObject) {
  for (var x = player.x - player.rangeLimit; x <= player.x + player.rangeLimit; x++) {
    for (var y = player.y - player.rangeLimit; y <= player.y + player.rangeLimit; y++) {
      if ((x => 0) && (y => 0)){
        var field = $('#field-'.concat(x, y));
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
  gameObject.movePlayer(player, newCoordinates, [gameObject.board.fieldClasses.obstacle, gameObject.board.fieldClasses.player]);
  // Make player appear on board
  addClassName([player.x, player.y], player.customClass);
}

// Update destination position
var updateDestination = function (boardObject, destination, [x, y], playerOne, playerTwo) {
  // If player defined change destination originPlayer
  if (playerOne && playerTwo) {
    destination.originPlayer = playerOne;
    destination.obstaclePlayer = playerTwo;
  }
  // Make destination dispaear from board
  removeClassName([destination.x, destination.y], destination.customClass);
  // Update destination position and movement range to obstacles including opposite player
  destination.changePosition(boardObject, [x, y], [boardObject.fieldClasses.obstacle, destination.obstaclePlayer.customClass]);
  // If there is no player on field
  if (boardObject.fields[x][y].includes(boardObject.fieldClasses.player) === false){
    // Make destination appear on board
    addClassName([destination.x, destination.y], destination.customClass);
  }
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
      hidePlayerRange(gameObject.playerOne, gameObject)
      updatePlayer(gameObject, gameObject.playerOne, [displayObject.destination.x, displayObject.destination.y]);
      updateDestination(gameObject.board, displayObject.destination, [gameObject.playerTwo.x, gameObject.playerTwo.y], gameObject.playerTwo, gameObject.playerOne);
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
      hidePlayerRange(gameObject.playerTwo, gameObject)
      updatePlayer(gameObject, gameObject.playerTwo, [displayObject.destination.x, displayObject.destination.y]);
      updateDestination(gameObject.board, displayObject.destination, [gameObject.playerOne.x, gameObject.playerOne.y], gameObject.playerOne, gameObject.playerTwo);
      return 1;
    case 'q':
      return 3;
    default:
  }
  return 2
}

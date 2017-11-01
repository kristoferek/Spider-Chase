// ---------- Display -------------------------------------------
var Display = function () {

  this.init = function(gameObject){
    this.classNames = {
      playerOne: gameObject.playerOne.customClass,
      playerTwo: gameObject.playerTwo.customClass,
      nextStep: 'step',
      obstacle: 'obstacle',
      wepon: 'weapon',
      range: 'range',
      path: 'path'
    }
    this.destination = new Player();

    // Sets the origin player for destination object
    this.destination.originPlayer = gameObject.playerOne;
    this.destination.obstaclePlayer = gameObject.playerTwo;

    // Initialize destinantion Player object
    this.destination.init([this.destination.originPlayer.x, this.destination.originPlayer.y], 1, 0, 0, 'destination');

    // Calculate destinantion range from board, edges, obstacles and oposite player
    this.destination.range = this.destination.calculateRange(gameObject.board, [gameObject.board.fieldClasses.obstacle, this.destination.obstaclePlayer.customClass]);

    // Create next step object for player One
    this.nextStep = new NextStep();
    this.nextStep.init(gameObject.playerOne);

    // Create HTML board and display on page
    this.board = this.generateBoard(gameObject.board.fields, gameObject.obstacles);
    // Display board
    this.showBoard(this.board);
    // Display players
    this.showPlayer(gameObject.playerOne);
    this.showPlayerRange(gameObject.playerOne);
    this.showPlayer(gameObject.playerTwo);
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

  // Generate game board
  this.generateBoard = function (fieldsArr, obstacles){

    var boardHTML = $('<div>');

    // For every board row
    for (var y = 0; y < fieldsArr.length; y++) {
      // Create div with class row
      var row = $('<div>').addClass('row');
      // For every field in a row
      for (var x = 0; x < fieldsArr.length; x++) {

        // Create dive with class, id with field index number in name and sample content
        var field = $('<div>').addClass((isInArray([x, y], obstacles) ? 'field ' + this.classNames.obstacle : 'field'));
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

  // Display board
  this.showBoard = function(elementHTML){
    // Find #board element
    var boardHTML = $('#board');
    boardHTML.html('');
    boardHTML.append(elementHTML);
  }

  // Get player class
  this.getPlayerClass = function (player){

  }
  // Display player
  this.showPlayer = function(player) {
    addClassName([player.x, player.y], player.customClass);
  }

  // Hide player
  this.hidePlayer = function(player) {
    removeClassName([player.x, player.y], player.customClass);
  }

  // Display player possible move range
  this.showPlayerRange = function (player) {
    // For all coordinates in player plossibleMoves array
    for (var i = 0; i < player.possibleMoves.length; i++) {
      // Find element with id #field-xy
      var field = $('#field-'.concat(player.possibleMoves[i][0], player.possibleMoves[i][1]));
      // Add 'range' class except player one or two field
      if (!(field.hasClass(this.classNames.playerOne) || field.hasClass(this.classNames.playerTwo))) {
        field.hasClass(this.classNames.range) ? null : field.addClass(this.classNames.range);
      }
    }
  }

  // Hide player possible move range
  this.hidePlayerRange = function (player) {
    // For all coordinates in player plossibleMoves array
    for (var i = 0; i < player.possibleMoves.length; i++) {
      // Find element with id #field-xy
      var field = $('#field-'.concat(player.possibleMoves[i][0], player.possibleMoves[i][1]));
      // Remove 'range' class except player one or two field
      field.hasClass(this.classNames.range) ?  field.removeClass(this.classNames.range) : null;
    }
  }

  // Display next possible step
  this.showNextPossibleStep = function (coordinates) {
    // If new ccordinates are possible to move to
    if (this.nextStep.isPossible(coordinates)) {
      // hide actual possible step
      removeClassName([this.nextStep.x, this.nextStep.y], this.classNames.nextStep);

      // hide path
      var pathClass = this.classNames.path;
      console.log(pathClass);
      this.nextStep.path.forEach(function(pathElement){
        removeClassName([pathElement[0], pathElement[1]], pathClass);
      });

      // update possible step position
      this.nextStep.updatePosition(coordinates);

      // show path
      this.nextStep.path.forEach(function(pathElement){
        addClassName([pathElement[0], pathElement[1]], pathClass);
      });
      // show updated possible step
      addClassName([this.nextStep.x, this.nextStep.y], this.classNames.nextStep);
    }
  }
}

// Find div with id and coordinates and add custom class
var addClassName = function ([x, y], customClass) {
  var element = $('#field-'.concat(x, y));
  element.hasClass(customClass) ? null : element.addClass(customClass);
}

// Find div with id and coordinates and remove custom class
var removeClassName = function ([x, y], customClass) {
  var element = $('#field-'.concat(x, y));
  element.hasClass(customClass) ? element.removeClass(customClass) : null;
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
      hidePlayerRange(gameObject.playerTwo, gameObject);
      updatePlayer(gameObject, gameObject.playerTwo, [displayObject.destination.x, displayObject.destination.y]);
      updateDestination(gameObject.board, displayObject.destination, [gameObject.playerOne.x, gameObject.playerOne.y], gameObject.playerOne, gameObject.playerTwo);
      return 1;
    case 'q':
      return 3;
    default:
  }
  return 2
}

function playerTurn (event, gameObject, player, displayObject) {
  // console.log('actual nextStep', displayObject.nextStep);
  switch (event.key) {
    case 'ArrowUp':
      displayObject.showNextPossibleStep([displayObject.nextStep.x, displayObject.nextStep.y - 1]);
      break;
    case 'ArrowRight':
      displayObject.showNextPossibleStep([displayObject.nextStep.x + 1, displayObject.nextStep.y]);
      break;
    case 'ArrowDown':
      displayObject.showNextPossibleStep([displayObject.nextStep.x, displayObject.nextStep.y + 1]);
      break;
    case 'ArrowLeft':
      displayObject.showNextPossibleStep([displayObject.nextStep.x - 1, displayObject.nextStep.y]);
      break;
    case 'Enter':
      // hide actual player range and position
      displayObject.hidePlayerRange(player);
      displayObject.hidePlayer(player)

      // set obstacles including opponent class
      var obstacles = [
        gameObject.obstacles.concat([[gameObject.getOpponent(player.x, gameObject.getOpponent(player).y)]]),
      ];

      // Update player position and possibleMoves array
      gameObject.actionMove(player, [displayObject.nextStep.x, displayObject.nextStep.y], obstacles);

      // Reset nextStep and change its origin to opponent player
      displayObject.nextStep.updateOrigin(gameObject.getOpponent(player));

      // Show updated player in new position
      displayObject.showPlayer(player);

      // Display opponent player range
      displayObject.showPlayerRange(gameObject.getOpponent(player));
      return (gameObject.state === 1) ? 2 : 1;
    case 'q':
      return 3;
    default:
  }
  return gameObject.state;
}

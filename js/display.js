// ---------- Display -------------------------------------------
var Display = function{
  this.destination = {};

  this.init = function(gameObject){
    this.destination.x = gameObject.playerOne.x;
    this.destination.y = gameObject.playerOne.y;
    this.destination.customClass: 'destination';
    this.board = this.generateBoard(gameObject.board.fields, gameObject.board.fieldClasses);
  }

  this.optionalStep = function (player, direction) {
    var destination = this.destination;
    switch (direction) {
      case 'top':
        if (player.range.top > player.y - destination.y) {
          this.destination.y =- 1;
        }
        break;
      case 'right':
        if (player.range.right > this.destination.x - player.x) {
          this.destination.x =+ 1;
        }
        break;
      case 'bottom':
        if (player.range.bottom > this.destination.y - player.y) {
          this.destination.y =+ 1;
        }
        break;
      case 'left':
        if (player.range.left > player.x - this.destination.x) {
          this.destination.x =- 1;
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
        field.text(x + ', ' + y);
        // Add it to the row
        row.append(field);
      }
      // Add row to the board
      boardHTML.append(row);
    }
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
      if !((x === player.x && y === player.y) || field.hasClass(boardObject.fieldClasses.obstacle) || field.hasClass(boardObject.fieldClasses.player)) {
        field.addClass('range');
      }
    }
  }
}

var hidePlayerRange = function (player, boardObject) {
  for (var x = player.x - player.range.left; x <= player.x + player.range.right; x++) {
    for (var y = player.y - player.range.top; y <= player.y + player.range.bottom; y++) {
      if !((x === player.x && y === player.y) || field.hasClass(boardObject.fieldClasses.obstacle) || field.hasClass(boardObject.fieldClasses.player)) {
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

showDestination(gameObject.destination);
removeClassName([gameObject.destination.x, gameObject.destination.x], gameObject.destination.customClass);


// ---------- Game cycle -------------------------------------------

function playerOneTurn (event, gameObject) {
  switch (event.key) {
    case 'w':
      optionalMove(gameObject, gameObject.playerOne, 'top');
      break;
    case 'd':
      optionalMove(gameObject, gameObject.playerOne, 'right');
      break;
    case 's':
      optionalMove(gameObject, gameObject.playerOne, 'bottom');
      break;
    case 'a':
      optionalMove(gameObject, gameObject.playerOne, 'left');
      break;
    case 'Enter':
      updatePlayer(gameObject, gameObject.playerOne, gameObject.newCoordinates)
      return 2;
    case 'q':
      return 3;
    default:
  }
  return 1;
}

function playerTwoTurn (event, gameObject) {
  switch (event.key) {
    case 'ArrowUp':
      move(gameObject, gameObject.playerTwo, 'top');
      break;
    case 'ArrowRight':
      move(gameObject, gameObject.playerTwo, 'right');
      break;
    case 'ArrowDown':
      move(gameObject, gameObject.playerTwo, 'bottom');
      break;
    case 'ArrowLeft':
      move(gameObject, gameObject.playerTwo, 'left');
      break;
    case 'Enter':
      return 1;
    case 'q':
      return 3;
    default:
  }
  return 2
}

// ---------- Display -------------------------------------------
var Display = function () {

  this.init = function(gameObject){
    // Display classes
    this.classNames = {
      playerOne: gameObject.playerOne.customClass,
      playerTwo: gameObject.playerTwo.customClass,
      nextStep: 'step',
      obstacle: 'obstacle',
      wepon: 'weapon',
      range: 'range',
      path: 'path'
    }

    // Create next step object for player One
    this.nextStep = new NextStep();
    this.nextStep.init(gameObject.playerOne);

    // Create HTML board and display on page
    this.board = this.generateBoard(gameObject.board.fields, gameObject.obstacles);


    // Display board
    this.showBoard(this.board);

    // Display players
    this.showPlayer(gameObject.playerOne);
    this.showPlayer(gameObject.playerTwo);
    this.showPlayerRange(gameObject.playerOne);

    // Mount and hide decision modal window
    this.modal = new Modal();
    this.board.append(this.modal.window.hide());
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

  // Display player
  this.showPlayer = function(player) {
    addClassName([player.x, player.y], player.customClass);
  }

  // Hide player
  this.hidePlayer = function(player) {
    this.nextStep.path.forEach(function(pathElement){
      removeClassName([pathElement[0], pathElement[1]], this.classNames.path);
    }, this);
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

  this.toggleActive = function(elOne, elTwo, gameObject){
    if (gameObject.state > 0) {
      if ((gameObject.state % 2) === 1){
        elOne.addClass('active');
        elTwo.removeClass('active');
      } else {
        elTwo.addClass('active');
        elOne.removeClass('active');
      }
    }
  }


  this.updateGameInformation = function(playerOne, playerTwo, gameObject){
    var information = $('#informations').html('');
    var plOne = $('<div>').addClass('player');
    var playerOneName = $('<div>').addClass('playerName').text('Player One');
    var playerOnePowerLabel = $('<div>').addClass('power').text("Power: ");
    var playerOnePower = $('<div>').addClass('power').text(playerOne.power);
    var playerOneWeaponLabel = $('<div>').addClass('weapon').text("Weapon:");
    var playerOneWeapon = $('<div>').addClass('weapon').text(- playerOne.weapon * 100 + "%");

    var turn = $('<div>').addClass('turn').text(gameObject.urnCounter);

    var plTwo = $('<div>').addClass('player');
    var playerTwoName = $('<div>').addClass('playerName').text('Player Two');
    var playerTwoPowerLabel = $('<div>').addClass('power').text("Power: ");
    var playerTwoPower = $('<div>').addClass('power').text(playerTwo.power);
    var playerTwoWeaponLabel = $('<div>').addClass('weapon').text("Weapon:");
    var playerTwoWeapon= $('<div>').addClass('weapon').text(- playerTwo.weapon * 100 + "%");

    this.toggleActive(plOne, plTwo, gameObject);

    information
      .append(plOne.append(playerOneName).append(playerOnePowerLabel).append(playerOnePower).append(playerOneWeaponLabel).append(playerOneWeapon))
      .append(turn)
      .append(plTwo.append(playerTwoName).append(playerTwoPowerLabel).append(playerTwoPower).append(playerTwoWeaponLabel).append(playerTwoWeapon));
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


// ---------- Game cycle -------------------------------------------

function handlePlayerTurn (event, gameObject, player, displayObject) {
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
      // hide actual player path, range and position
      displayObject.hidePlayerRange(player);
      displayObject.hidePlayer(player);

      // Update player position and both player possible moves arrays
      gameObject.actionMove(player, [displayObject.nextStep.x, displayObject.nextStep.y]);

      // Reset nextStep and change its origin to opponent player
      displayObject.nextStep.updateOrigin(gameObject.getOpponnent(player));

      // Show updated player and range in new position
      displayObject.showPlayer(player);

      // Display opponent player range
      displayObject.showPlayerRange(gameObject.getOpponnent(player));

      // Check the distance between players
      var adjacent = (distance(player.x, player.y, gameObject.getOpponnent(player).x, gameObject.getOpponnent(player).y) < 2);

      // If players after move are at adjacent positions - handle battle
      if (adjacent && (gameObject.battleState === 0)){
        if (gameObject.state === 1){
          return 4;
        } else {
          return 3;
        }
      }
      // Otherwise - handle battle
      if (gameObject.state === 1) {
        return 2;
      } else {
        return 1;
      }
      break;
    case 'q':
      return 5;
    default:
  }
  return gameObject.state;
}

var Modal = function(){
  this.buttonAttack = $('<button>').addClass('button attack').text('Attack'.toUpperCase());
  this.buttonDefend = $('<button>').addClass('button defend').text('Defend'.toUpperCase());
  this.titleText = $('<h1>').addClass('title');
  var desicionPrompt = $('<div>').addClass('prompt').text('Select battle mode');
  this.window = $('<div id="decision">').addClass('modal').append(this.titleText).append(desicionPrompt).append(this.buttonAttack).append(this.buttonDefend);
  this.setTitle = function(text){
    this.titleText.text(text);
  }
}

// Return game state depending on battle stage
handleDecision = function(gameObject, player, decision){

  // If no player made a battle mode decision
  if (gameObject.battleState === 0){
    // Set first player decision
    player.updateBattleMode(decision);
    // Update battle state
    gameObject.updateBattleState(gameObject.battleState + 1);
    // Go to second player decision setting
    return (gameObject.state === 3) ? 4 : 3;
    // If first player has made decision
  } else if (gameObject.battleState === 1){
    // Set second player decision
    player.updateBattleMode(decision);
    // Update battle state
    gameObject.updateBattleState(gameObject.battleState + 1);
    // Handle battle
    gameObject.actionBattle(gameObject.playerOne.defend, gameObject.playerTwo.defend);
    // reset battle state
    gameObject.updateBattleState(0);
    // Go to first player turn
    return (gameObject.state === 3) ? 2 : 1;
  }
}

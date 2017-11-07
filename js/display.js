/* eslint semi: ["error", "always"] */
// ---------- Display -------------------------------------------
var Display = function () {
  this.init = function (gameObject) {
    // Display classes
    this.classNames = {
      playerOne: gameObject.playerOne.customClass,
      playerTwo: gameObject.playerTwo.customClass,
      nextStep: 'step',
      obstacle: 'obstacle',
      weapon: 'weapon',
      range: 'range',
      path: 'path'
    };

    // Create next step object for player One
    this.nextStep = new NextStep ();
    this.nextStep.init(gameObject.playerOne);

    // Create HTML board and display on page
    this.board = this.generateBoard(gameObject.board.fields, gameObject.obstacles);

    // Display board
    this.showBoard(this.board);

    // Display players
    this.showPlayer(gameObject.playerOne);
    this.showPlayer(gameObject.playerTwo);
    this.showPlayerRange(gameObject.playerOne);

    // Display weapons
    this.showWeapons(gameObject.weapons);

    // Mount and hide decision modal window
    this.modal = new Modal();
    this.board.append(this.modal.window.hide());
  };

  // Generate game board
  this.generateBoard = function (fieldsArr, obstacles) {
    var boardHTML = $('<div>');

    // For every board row
    for (var y = 0; y < fieldsArr.length; y++) {
      // Create div with class row
      var row = $('<div>').addClass('row');
      // For every field in a row
      for (var x = 0; x < fieldsArr.length; x++) {
        // Create div with class, id with field index number in name and sample content
        var field = $('<div>').addClass((isInArray([x, y], obstacles) ? 'field ' + this.classNames.obstacle : 'field'));
        field.attr('id', 'field-' + x + y);
        field.append($('<div>').addClass('background').append($('<div>').addClass('object')));
        // Add it to the row
        row.append(field);
      }
      // Add row to the board
      boardHTML.append(row);
    }
    return boardHTML;
  };

  // Display board
  this.showBoard = function (elementHTML) {
    // Find #board element
    var boardHTML = $('#board');
    boardHTML.html('');
    boardHTML.append(elementHTML);
  };

  // Display player
  this.showPlayer = function (player) {
    addClassName([player.x, player.y], player.customClass);
  };

  // Hide player
  this.hidePlayer = function (player) {
    // hide path of possible moves
    this.nextStep.path.forEach(function (pathElement) {
      removeClassName([pathElement[0], pathElement[1]], this.classNames.path);
    }, this);
    // hide nextStep
    removeClassName([this.nextStep.x, this.nextStep.y], this.classNames.nextStep);
    // hide player
    removeClassName([player.x, player.y], player.customClass);
  };

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
  };

  // Hide player possible move range
  this.hidePlayerRange = function (player) {
    // For all coordinates in player plossibleMoves array
    for (var i = 0; i < player.possibleMoves.length; i++) {
      // Find element with id #field-xy
      var field = $('#field-'.concat(player.possibleMoves[i][0], player.possibleMoves[i][1]));
      // Remove 'range' class except player one or two field
      field.hasClass(this.classNames.range) ?  field.removeClass(this.classNames.range) : null;
    }
  };

  // Display next possible step
  this.showNextPossibleStep = function (coordinates) {
    // If new ccordinates are possible to move to
    if (this.nextStep.isPossible(coordinates)) {
      // hide actual possible step
      removeClassName([this.nextStep.x, this.nextStep.y], this.classNames.nextStep);

      // hide path
      var pathClass = this.classNames.path;
      this.nextStep.path.forEach(function (pathElement) {
        removeClassName([pathElement[0], pathElement[1]], pathClass);
      });

      // update possible step position
      this.nextStep.updatePosition(coordinates);

      // show path
      this.nextStep.path.forEach(function (pathElement) {
        addClassName([pathElement[0], pathElement[1]], pathClass);
      });
      // show updated possible step
      addClassName([this.nextStep.x, this.nextStep.y], this.classNames.nextStep);
    }
  };

  // Show weapons
  this.showWeapons = function (weapons) {
    for (var i = 0; i < weapons.length; i++) {
      addClassName([weapons[i].x, weapons[i].y], this.classNames.weapon);
    }
  };

  this.hideWeapons = function (weapons) {
    for (var i = 0; i < weapons.length; i++) {
      removeClassName([weapons[i].x, weapons[i].y], this.classNames.weapon);
    }
  };

  // Set active class for player information block
  this.toggleActive = function (elOne, elTwo, gameObject) {
    if (gameObject.state > 0) {
      if ((gameObject.state % 2) === 1) {
        elOne.addClass('active');
        elTwo.removeClass('active');
      } else {
        elTwo.addClass('active');
        elOne.removeClass('active');
      }
    }
  };

  // Display updated players and game info
  this.updateGameInformation = function (playerOne, playerTwo, gameObject) {
    var information = $('#informations').html('');
    var plOne = $('<div>').addClass('player');
    var playerOneName = $('<div>').addClass('playerName').text('Player One');
    var playerOnePowerLabel = $('<div>').addClass('power').text('Power: ');
    var playerOnePower = $('<div>').addClass('power').text(playerOne.power);
    var playerOneWeaponLabel = $('<div>').addClass('weapon').text('Weapon:');
    var playerOneWeapon = $('<div>').addClass('weapon').text(-playerOne.weapon.damage * 100 + '%');

    var turn = $('<div>').addClass('turn').text(gameObject.urnCounter);

    var plTwo = $('<div>').addClass('player');
    var playerTwoName = $('<div>').addClass('playerName').text('Player Two');
    var playerTwoPowerLabel = $('<div>').addClass('power').text('Power:');
    var playerTwoPower = $('<div>').addClass('power').text(playerTwo.power);
    var playerTwoWeaponLabel = $('<div>').addClass('weapon').text('Weapon:');
    var playerTwoWeapon= $('<div>').addClass('weapon').text(-playerTwo.weapon.damage * 100 + '%');

    this.toggleActive(plOne, plTwo, gameObject);

    information
      .append(plOne.append(playerOneName).append(playerOnePowerLabel).append(playerOnePower).append(playerOneWeaponLabel).append(playerOneWeapon))
      .append(turn)
      .append(plTwo.append(playerTwoName).append(playerTwoPowerLabel).append(playerTwoPower).append(playerTwoWeaponLabel).append(playerTwoWeapon));
  };
};

// Find div with id and coordinates and add custom class
var addClassName = function (coordinates, customClass) {
  if (coordinates[0] >= 0 && coordinates[1] >= 0){
    var element = $('#field-'.concat(coordinates[0], coordinates[1]));
    if (!element.hasClass(customClass)) {
      element.addClass(customClass);
    }
  }
};

// Find div with id and coordinates and remove custom class
var removeClassName = function (coordinates, customClass) {
  var element = $('#field-'.concat(coordinates[0], coordinates[1]));
  element.hasClass(customClass) ? element.removeClass(customClass) : null;
};

// Modal window for battle mode desicion
var Modal = function () {
  // Define buttons attack and defend
  this.buttonAttack = $('<button>').addClass('button attack').text('Attack'.toUpperCase());
  this.buttonDefend = $('<button>').addClass('button defend').text('Defend'.toUpperCase());
  // Define title
  this.titleText = $('<h1>').addClass('title');
  // Define modal prompt
  this.desicionPrompt = $('<div>').addClass('prompt').text('Select battle mode');
  // Define modal window
  this.window = $('<div id="decision">');
  // Fill modal window with content
  this.window.addClass('modal').append(this.titleText).append(this.desicionPrompt).append(this.buttonAttack).append(this.buttonDefend);

  // Function for setting title text content
  this.setTitle = function (text) {
    this.titleText.text(text);
  };
};

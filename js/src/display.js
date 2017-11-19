/* eslint semi: ["error", "always"] */
// ---------- Display -------------------------------------------
var Display = function () {
  var displayContext = this;
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
    // Activate player information
    this.generateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

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
    // Empty Board
    boardHTML.html('');
    // Append elementHTML
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
      // if (!(field.hasClass(this.classNames.playerOne) || field.hasClass(this.classNames.playerTwo))) {
        if (!field.hasClass(this.classNames.range)) {
          field.addClass(this.classNames.range);
        }
      // }
    }
  };

  // Hide player possible move range
  this.hidePlayerRange = function (player) {
    // For all coordinates in player plossibleMoves array
    for (var i = 0; i < player.possibleMoves.length; i++) {
      // Find element with id #field-xy
      var field = $('#field-'.concat(player.possibleMoves[i][0], player.possibleMoves[i][1]));
      // Remove 'range' class except player one or two field
      if (field.hasClass(this.classNames.range)) {
        field.removeClass(this.classNames.range);
      }
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

  // Show weapons - weapon.model becomes class
  this.showWeapons = function (weapons) {
    for (var i = 0; i < weapons.length; i++) {
      addClassName([weapons[i].x, weapons[i].y], weapons[i].weapon.model);
    }
  };

  // Hide weapons - weapon.model becomes class
  this.hideWeapons = function (weapons) {
    for (var i = 0; i < weapons.length; i++) {
      removeClassName([weapons[i].x, weapons[i].y], weapons[i].weapon.model);
    }
  };

// ------------------- Movement animation ----------------

  // Generate array of step directions and lengths
  this.getPathAnimationStyles = function (path, elWidth, elHeight) {
    // Initialize array
    var animationStyles = [];

    // Go through path
    for (var i = 1; i < path.length; i++) {
      // for vertical move
      if (path[i - 1][1] !== path[i][1]) {
        // set valueus for moving TOP
        if (path[i - 1][1] > path[i][1]) {
          animationStyles.push(['top', -elHeight]);
        // set valueus for moving BOTTOM
        } else {
          animationStyles.push(['bottom', -elHeight]);
        }
      // for vertical move
      } else if (path[i - 1][0] !== path[i][0]) {
        // set valueus for moving LEFT
        if (path[i - 1][0] > path[i][0]) {
          animationStyles.push(['left', -elWidth]);
        // set valueus for moving RIGHT
        } else {
          animationStyles.push(['right', -elWidth]);
        }
      }
    }
    // Return array
    return animationStyles;
  };

  // Animate every step using array of step directions and lenghts
  this.animateSteps = function (gameObject, player, animatedElement, animationStyles, index) {
    // If animation finished - index reached path length
    if (index >= animationStyles.length) {
      // Remove animation element from DOM
      animatedElement.remove();
      // Show updated player in new position
      displayContext.showPlayer(player);
      // Display actual player range
      if (gameObject.state === gameObject.states.PLAYERONE_TURN) {
        displayContext.showPlayerRange(gameObject.playerOne);
      } else if (gameObject.state === gameObject.states.PLAYERTWO_TURN) {
        displayContext.showPlayerRange(gameObject.playerTwo);
      }
    // If index in setps styles array
    } else if ((index >= 0) && (index < animationStyles.length)) {
      // Set empty object for step style
      var animationStyle = {};
      // Set step style object property name - step direction
      var propertyName = animationStyles[index][0];
      // compute step style object property value - step length
      var currentDistance = (parseInt(animatedElement.css(propertyName)) + animationStyles[index][1]) + 'px';
      // Set style object properities for step
      animationStyle[propertyName] = currentDistance;
      // animationStyle['z-index'] = 1000;

      // Set background styling class (sprite animation) for child of animated element
      animatedElement.children().eq(0).addClass('move-' + propertyName);
      // Apply animation for main element using step style object
      animatedElement.animate(animationStyle, 500, 'linear',
        // After animation completed
        function () {
          // Remove background styling class (sprite animation) for child of animated element
          animatedElement.css(propertyName, currentDistance).children().eq(0).removeClass('move-' + propertyName);
          // Animate next step movemnt
          displayContext.animateSteps(gameObject, player, animatedElement, animationStyles, index + 1);
          // increase index
          index++;
        }
      );
    }
  };

  // Show moving player animation
  this.showPlayerMoving = function (gameObject, player, path) {
    // If path is longer then one step (player changes position)
    if (path.length > 1) {
      // Set starting point of animation
      var startElement = $('#field-'.concat(path[0][0], path[0][1]));
      // Get dimensions of starting field to set step length
      var elHeight = startElement.outerHeight();
      var elWidth = startElement.outerWidth();

      // Create element to animate
      var animatedElement = $('<div>').addClass(player.customClass).addClass('background').append($('<div>').addClass('moving'));
      // Insert element to animate into starting point
      startElement.append(animatedElement);

      // Set array of step directions and lenghts
      var animationStyles = this.getPathAnimationStyles(path, elWidth, elHeight);
      // Set starting index
      var animationIndex = 0;

      // Animate steps
      this.animateSteps(gameObject, player, animatedElement, animationStyles, animationIndex);
    // If path is equal to one step (player is not moving in any direction)
    } else {
      this.showPlayer(player);
      this.showPlayerRange(gameObject.getOpponnent(player));
    }
  };

// --------------------- Movement handling ----------------------

  // Handle player move display and animation
  this.playerMoves = function (gameObject, player) {
    // hide actual player path, range and position
    this.hidePlayerRange(player);
    this.hidePlayer(player);

    // hide weapons
    this.hideWeapons(gameObject.weapons);

    // Update player position, weapon and both player possible moves arrays
    gameObject.actionMove(player, [this.nextStep.x, this.nextStep.y], this.nextStep.path);

    // Show moving animation
    this.showPlayerMoving(gameObject, player, this.nextStep.path);

    // Reset nextStep and change its origin to opponent player
    this.nextStep.updateOrigin(gameObject.getOpponnent(player));

    // Display weapons
    this.showWeapons(gameObject.weapons);
  };

// ----------------------------- information block ------------------

  // Set active class for player information block
  this.toggleActive = function (elOne, elTwo, gameObject) {
    if (gameObject.state > gameObject.states.START) {
      if (gameObject.state === gameObject.states.PLAYERONE_TURN || gameObject.state === gameObject.states.PLAYERONE_BATTLEMODE) {
        elOne.addClass('active');
        elTwo.removeClass('active');
      } else if (gameObject.state === gameObject.states.PLAYERTWO_TURN || gameObject.state === gameObject.states.PLAYERTWO_BATTLEMODE) {
        elTwo.addClass('active');
        elOne.removeClass('active');
      }
    }
  };

  // Display updated players and game info
  this.generateGameInformation = function (playerOne, playerTwo, gameObject) {
    // Find and empty #information element
    var information = $('#informations').html('');

    this.playerOneSection = $('<div>').addClass('player');
    var playerOneName = $('<div>').addClass('title').text('P1');
    var playerOnePowerLabel = $('<div>').addClass('power').text('Power: ');
    this.playerOnePower = $('<div>').addClass('power').text(playerOne.power);
    var playerOneWeaponLabel = $('<div>').addClass('weapon').text('Weapon:');
    this.playerOneWeapon = $('<div>').addClass('weapon').text(-playerOne.weapon.damage * 100 + '%');

    this.playerTwoSection = $('<div>').addClass('player');
    var playerTwoName = $('<div>').addClass('title').text('P2');
    var playerTwoPowerLabel = $('<div>').addClass('power label').text('Power:');
    this.playerTwoPower = $('<div>').addClass('power').text(playerTwo.power);
    var playerTwoWeaponLabel = $('<div>').addClass('weapon label').text('Weapon:');
    this.playerTwoWeapon = $('<div>').addClass('weapon').text(-playerTwo.weapon.damage * 100 + '%');

    this.turn = $('<div>').addClass('turn').text('Turn: ' + gameObject.turnCounter);

    this.buttonRestart = $('<div>').addClass('button restart').text('Restart');
    this.buttonQuit = $('<div>').addClass('button quit').text('Quit');
    var buttons = $('<div>').addClass('buttons');

    var instruction = $('<div>').addClass('instruction').html('<p>Press (<kbd>Arrows</kbd>) </br>to move spider.</p><p>Press (<kbd>Enter</kbd>)</br>to end player turn.</p>');

    information
      .append(this.playerOneSection.append(playerOneName).append(playerOnePowerLabel).append(this.playerOnePower).append(playerOneWeaponLabel).append(this.playerOneWeapon))
      .append(this.playerTwoSection.append(playerTwoName).append(playerTwoPowerLabel).append(this.playerTwoPower).append(playerTwoWeaponLabel).append(this.playerTwoWeapon))
      .append(this.turn)
      .append(buttons.append(this.buttonRestart).append(this.buttonQuit))
      .append(instruction);
  };

  this.updateGameInformation = function (playerOne, playerTwo, gameObject) {
    this.playerOnePower.text(playerOne.power);
    this.playerOneWeapon.text(-playerOne.weapon.damage * 100 + '%');

    this.playerTwoPower.text(playerTwo.power);
    this.playerTwoWeapon.text(-playerTwo.weapon.damage * 100 + '%');

    this.turn.text('Turn: ' + gameObject.turnCounter);

    this.toggleActive(this.playerOneSection, this.playerTwoSection, gameObject);
  };
};

// ----------------------- Helper functions --------------------

// Find div with id and coordinates and add custom class
var addClassName = function (coordinates, customClass) {
  if (coordinates[0] >= 0 && coordinates[1] >= 0) {
    var element = $('#field-'.concat(coordinates[0], coordinates[1]));
    if (!element.hasClass(customClass)) {
      element.addClass(customClass);
    }
  }
};

// Find div with id and coordinates and remove custom class
var removeClassName = function (coordinates, customClass) {
  var element = $('#field-'.concat(coordinates[0], coordinates[1]));
  if (element.hasClass(customClass)) {
    element.removeClass(customClass);
  }
};

// Modal window for game states and battle mode desicions
var Modal = function () {
  // Define modal main element
  this.window = $('<div id="decision">').addClass('modal');
  // Define title
  this.titleText = $('<h1>').addClass('title');
  // Define modal prompt
  this.modalPrompt = $('<div>').addClass('prompt')
  // Define attack and defend buttons
  this.buttonAttack = $('<div>').addClass('button attack').html('Attack (<kbd>Enter</kbd>)');
  this.buttonDefend = $('<div>').addClass('button defend').html('Defend (<kbd>Esc</kbd>)');

  // Show modal for player battle mode decision
  this.decisionShow = function (playerClass) {
    // Update title
    this.titleText.text(this.getPlayerTitle(playerClass));
    // Define modal prompt
    this.modalPrompt.text('Select battle mode');
    // Fill modal window with content
    this.window.append(this.titleText).append(this.modalPrompt).append(this.buttonAttack).append(this.buttonDefend);
    // Show modal window
    this.window.fadeIn(200);
  };

  // Show modal for start game
  this.welcomeShow = function () {
    // Update title
    this.titleText.text('Welcome');
    // Define modal prompt
    this.modalPrompt.append('<p>To move spider use (<kbd>Arrows</kbd>).</br>To end player turn press (<kbd>Enter</kbd>).</p><p><strong>To begin press (<kbd>Enter</kbd>)</strong></p>');
    // Fill modal window with content
    this.window.append(this.titleText).append(this.modalPrompt);
    // Show modal window
    this.window.fadeIn(200);
  };

  // Show modal for game over
  this.gameOverShow = function (param) {
    switch (param) {
      case 'playerOne':
        this.modalPrompt.append($('<p>').text('Player ' + this.getPlayerTitle(param) + ' won!'));
        break;
      case 'playerTwo':
        this.modalPrompt.append($('<p>').text('Player ' + this.getPlayerTitle(param) + ' won!'));
        break;
      case 'draw':
        this.modalPrompt.append($('<p>').text('We have DRAW'));
        break;
      case '':
        this.modalPrompt.append($('<p>').text('Game interrupted by user'));
        break;
      default:
    }
    // Update title
    this.titleText.text('Game Over');
    // Default modal prompt
    this.modalPrompt.append($('<p>Press (<kbd>Enter</kbd>) to restart game</p>'));
    // Fill modal window with content
    this.window.append(this.titleText).append(this.modalPrompt);
    // Show modal window
    this.window.fadeIn(200);
  };

  // Empty and hide modal window
  this.emptyAndHide = function () {
    // Empty modal window
    this.window.html('');
    this.titleText.html('');
    this.modalPrompt.html('');
    // Hide modal window
    this.window.fadeOut(100);
  };

  // Function for setting title text content
  this.getPlayerTitle = function (playerClass) {
    if (playerClass === 'playerOne') {
      return 'P1';
    } else if (playerClass === 'playerTwo') {
      return 'P2';
    }
  };
};

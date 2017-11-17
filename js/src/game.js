/* eslint semi: ["error", "always"] */
// ---------- Board object -------------------------------------------

// Board is a square of defined size
// consistsing of fields arranged in array of arrays
// Each alement of board consists of:
// - x coordinate,
// - y coordinate,
// - content
// They are stored in fields of array
// fields[x][y][fieldClasses index]
// sample fields = [[fi, fi, fi], [fi, fi, fi], [fi, fi, fi]]]

  var Board = function () {
    // Board filed content types
    this.fieldClasses = {
      empty: 'available',
      obstacle: 'unavailable',
      player: 'player',
      weapon: 'weapon'
    };
    // Constructor
    this.init = function (size) {
      this.size = size || 10;
      this.fields = [];
      for (var x = 0; x < this.size; x++) {
        var column = [];
        for (var y = 0; y < this.size; y++) {
          column.push(this.fieldClasses.empty);
        }
        this.fields.push(column);
      }
    };

    // Generates list of random field indexes [[x, y],[x, y],[x, y]]
    this.randomFieldList = function (quantity) {
      var maxQuantity = this.size * this.size / 4;

      // Proceed if quantity is lower then allowed max (density)
      if (quantity < maxQuantity && quantity >= 1) {
        var randomXYArr = [[getRandomNumber(this.size), getRandomNumber(this.size)]];

        // If requested quantity is more then one generate unique indexes
        if (quantity > 1) {
          var i = 1;
          while (i < quantity) {
            var newRandomIndex = [getRandomNumber(this.size), getRandomNumber(this.size)];
            // if new coordinates are unique add them to randomXYArr
            if (!isInArray(newRandomIndex, randomXYArr)) {
              randomXYArr.push(newRandomIndex);
              i++;
            }
          }
        }
        return randomXYArr;

      // if requested quantity is to large
      } else {
        console.log(Error('Quantity of random indexes: " + quantity + " is greater then max: ' + maxQuantity));
        return [];
      }
    };
  };

// ---------- Player object -------------------------------------------
  // coordinates:
  // x, y
  // range limit - integer;
  // possibleMoves - array of coordinates;
  // range - object,
  // power - integer;
  // weapon - object;

  var Player = function () {
    // Constructor
    this.init = function (coordinates, rangeLimit, power, weapon, customClass) {
      this.x = coordinates[0];
      this.y = coordinates[1];
      this.rangeLimit = rangeLimit || 3;
      this.possibleMoves = [];
      this.power = power || 100;
      this.weapon = weapon;
      this.customClass = customClass;
      this.defend = false;
    };

    // Update player range and stores it in array of possible moves
    this.updatePossibleMoves = function (fieldsArr, obstacles) {
      // Set max player range coordinates for given board (fieldArr)
      var topLeft = {
        x: Math.min(Math.abs(this.x - this.rangeLimit), 0),
        y: Math.min(Math.abs(this.y - this.rangeLimit), 0)
      };
      var bottomRight = {
        x: Math.min(this.x + this.rangeLimit, fieldsArr.length - 1),
        y: Math.min(this.y + this.rangeLimit, fieldsArr[0].length - 1)
      };

      var arr = [];

      // Generate array of coordinates in range on vertical and horizontal axis excluding obstacles
      // Go TOP and add fields in range until first obstacle
      for (var y = this.y; y >= topLeft.y; y--) {
        // if distance is lower than range limit
        if (distance(this.x, this.y, this.x, y) <= this.rangeLimit) {
          // If field contains no obstacles add its coordinates to array
          if (!isInArray([this.x, y], obstacles)) {
            arr.push([this.x, y]);
          } else break;
        }
      }
      // Go RIGHT  and add fields in range until first obstacle
      for (var x = this.x; x <= bottomRight.x; x++) {
        // if distance is lower than range limit
        if (distance(this.x, this.y, x, this.y) <= this.rangeLimit) {
          // If field contains no obstacles add its coordinates to array
          if (!isInArray([x, this.y], obstacles)) {
            arr.push([x, this.y]);
          } else break;
        }
      }
      // Go DOWN and add fields in range until first obstacle
      for (y = this.y; y <= bottomRight.y; y++) {
        // if distance is lower than range limit
        if (distance(this.x, this.y, this.x, y) <= this.rangeLimit) {
          // If field contains no obstacles add its coordinates to array
          if (!isInArray([this.x, y], obstacles)) {
            arr.push([this.x, y]);
          } else break;
        }
      }
      // Go LEFT and add fields in range until first obstacle
      for (x = this.x; x >= topLeft.x; x--) {
        // if distance is lower than range limit
        if (distance(this.x, this.y, x, this.y) <= this.rangeLimit) {
          // If field contains no obstacles add its coordinates to array
          if (!isInArray([x, this.y], obstacles)) {
            arr.push([x, this.y]);
          } else break;
        }
      }

      // // Generate range array of coordinates for all fields in range
      // for (var x = topLeft.x; x <= bottomRight.x; x++) {
      //   for (var y = topLeft.y; y <= bottomRight.y; y++) {
      //     // if distance is lower than range limit
      //     if (distance(this.x, this.y, x, y) <= this.rangeLimit) {
      //       // If field contains no obstacles add its coordinates to array
      //       if (!isInArray([x, y], obstacles)) {
      //         arr.push([x, y]);
      //       }
      //     }
      //   }
      // }

      this.possibleMoves = arr;
    };

    // Update position
    this.updatePosition = function (fieldArr, coordinates) {
      this.x = coordinates[0];
      this.y = coordinates[1];
    };

    // Check if coordinates [x, y] are allowed to move to
    this.positonIsPossible = function (coordinates) {
      return isInArray([coordinates[0], coordinates[1]], this.possibleMoves);
    };

    // Update player power - power is Number
    this.updatePower = function (power) {
      if (power !== undefined) this.power = power;
    };

    // Update player weapon - newWeapon is Weapon object
    this.updateWeapon = function (newWeapon) {
      this.weapon = newWeapon;
    };

    // Update player battle mode
    // - true - defend
    // - false - attack
    this.updateBattleMode = function (isDefend) {
      this.defend = isDefend;
    };
  };

// ----------  Next step -------------------------------------------//
// Object to allow player choose new position on board regarding all limitations
  var NextStep = function () {
    this.init = function (player) {
      // Origin player
      this.origin = player;
      // Max number of steps
      this.stepLimit = player.rangeLimit + 1;
      // Board coordinates
      this.x = this.origin.x;
      this.y = this.origin.y;
      // List of following moves
      this.path = [[this.x, this.y]];
    };

    // Check if next step is possible for origin player
    this.isPossible = function (coordinates) {
      return isInArray(coordinates, this.origin.possibleMoves);
    };

    // Update last position on path
    this.updatePosition = function (coordinates) {
      var inPathIndex = getCoordinatesIndex(coordinates, this.path);
      // if coordinates are not in the path
      if (inPathIndex < 0) {
        // if number of steps is lower than stepLimit
        if (this.path.length < this.stepLimit) {
          // add coordinates it to the path
          this.path.push(coordinates);
          // update nextStep
          this.x = coordinates[0];
          this.y = coordinates[1];
          this.distance = distance(this.x, this.y, this.origin.x, this.origin.y);
        }
      // if coordinates are in path, slice path to new one including  coordinates at the end
      } else {
        this.path = this.path.slice(0, inPathIndex + 1);
        this.x = coordinates[0];
        this.y = coordinates[1];
        this.distance = distance(this.x, this.y, this.origin.x, this.origin.y);
      }
    };

    // Update path origin player
    this.updateOrigin = function (player) {
      this.origin = player;
      this.distance = 0;
      this.x = this.origin.x;
      this.y = this.origin.y;
      this.path = [[this.x, this.y]];
    };
  };

// ---------- Weapon object -------------------------------------------
  // damage - multiplier - 2 x 0.1 = 0.2 ... 5 * 0.1 = 0.5
  // model - string
  var Weapon = function (damageMultiplier, model) {
    this.damage = damageMultiplier || 1;
    this.model = model || 'default';
  };
  // Update weapon
  Weapon.prototype.update = function (weaponObject) {
    this.damage = weaponObject.damage;
    this.model = weaponObject.model;
  };

// ---------- Game object -------------------------------------------

  var Game = function () {
    this.init = function (boardSize, rangeLimit, initialPower, defaultDamage, obstaclesNumber, weaponsNumber) {
      // Initial player power
      this.initialPower = initialPower || 100;

      // Counter of turns
      this.turnCounter = 0;

      // Initialize game board
      this.board = new Board();
      this.board.init(boardSize);

      // Initialize weapons
      this.defaultWeapon = new Weapon(defaultDamage, 'default');

      // Generate random list of coordinates of board fields
      // - randXYList[0][0,1] for playerOne
      // - randXYList[1][0,1] for playerTwo
      // - randXYList[2, ..., randXYList - obstaclesNumber] - for obstacles
      // - randXYList[randXYList - obstaclesNumber, ... ] - for weapons
      var randXYList = this.board.randomFieldList(2 + obstaclesNumber + weaponsNumber);

      // Set array of coordinates for obstacles
      this.obstacles = randXYList.slice(2, randXYList.length - weaponsNumber).sort();

      // For defined numer (weaponNumber) of last indexes od coordinates
      // array generate array of object of weapons with these coordinates
      var arr = [];
      randXYList.slice(randXYList.length - weaponsNumber).sort().forEach(function (itemXY, index) {
        var newWeapon = new Weapon(defaultDamage * (index + 2), 'weapon' + (index + 2));
        arr.push({x: itemXY[0], y: itemXY[1], weapon: newWeapon});
      });
      // Set array of coordinates and weapons
      this.weapons = arr;

      // Initialize player one
      this.playerOne = new Player();
      this.playerOne.init(randXYList[0], rangeLimit, this.initialPower, this.defaultWeapon, 'playerOne');

      // Initialize player two
      this.playerTwo = new Player();
      this.playerTwo.init(randXYList[1], rangeLimit, this.initialPower, this.defaultWeapon, 'playerTwo');

      // Update possible moves array for player One
      this.playerOne.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerTwo.x, this.playerTwo.y]]));

      // Update possible moves array for player Two
      this.playerTwo.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerOne.x, this.playerOne.y]]));

      // Define game states
      this.states = {
        START: 0,
        PLAYERONE_TURN: 1,
        PLAYERTWO_TURN: 2,
        PLAYERONE_BATTLEMODE: 3,
        PLAYERTWO_BATTLEMODE: 4,
        GAMEOVER: 5,
        QUIT: 6
      };
      // Define battle states
      this.battleModeStates = {
        ON: true,
        OFF: false
      };
      // Define battle modes
      this.decisions = {
        ATTACK: false,
        DEFEND: true
      };

      // Initialize game and battle state
      this.state = this.states.START;

      // Initilize battle mode selection state
      this.battleModeState = this.battleModeStates.OFF;
    };

    // Get opponent
    this.getOpponnent = function (player) {
      return (player === this.playerOne) ? this.playerTwo : this.playerOne;
    };

    // Updates weapon on each field containing weapon
    // while player moves along path
    this.updatePlayerWeaponOnPath = function (player, path) {
      // for every succeeding path field
      for (var i = 0; i < path.length; i++) {
        for (var j = 0; j < this.weapons.length; j++) {
          // If in this field there is a weapon available
          if ((path[i][0] === this.weapons[j].x) && (path[i][1] === this.weapons[j].y)) {
            // If player has only default weapon
            if (player.weapon.model === this.defaultWeapon.model) {
              // Update player weapon with this found on field
              player.updateWeapon(this.weapons[j].weapon);
              // Remove weapon from board
              this.weapons[j].x = -1;
              this.weapons[j].y = -1;
            // If player has improved weapon
            } else {
              // exchange weapon for every step on path excluding start position
              if (i > 0) {
                // Remember player weapon
                var tempWeapon = player.weapon;
                // Exchange player weapon to field weapon
                player.updateWeapon(this.weapons[j].weapon);
                // Exchange field weapon to player weapon
                this.weapons[j].weapon = tempWeapon;
              }
            }
          }
        }
      }
    };

    // Update player position as well as previous and actual board fields content and turn counter
    this.actionMove = function (player, newCoordinates, path) {
      // Update player position and range
      player.updatePosition(this.board.fields, newCoordinates);

      this.updatePlayerWeaponOnPath(player, path);

      // Update possible position arrays for actual player excluding obstacles and opponent coordinates
      player.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.getOpponnent(player).x, this.getOpponnent(player).y]]));

      // Update possible position arrays for second player excluding obstacles and opponent coordinates
      this.getOpponnent(player).updatePossibleMoves(this.board.fields, this.obstacles.concat([[player.x, player.y]]));

      // Update turn counter
      this.turnCounter++;
    };

    // Battle - update players power and weapon level depending on battle mode modeeselected
    this.actionBattle = function (playerOne, playerTwo) {
      var damageOne = this.initialPower * this.playerTwo.weapon.damage / 10;
      var damageTwo = this.initialPower * this.playerOne.weapon.damage / 10;

      if (playerOne.defend) {
        if (playerTwo.defend) {
          // Player One defends, Player Two defends - no one attacks
        } else {
          // Player One defends, player Two attacks
          this.playerOne.updatePower(this.playerOne.power - damageOne * 0.5);
          this.playerTwo.updateWeapon(this.defaultWeapon);
        }
      } else {
        if (playerTwo.defend) {
          // Player One attacks, player two defends
          this.playerTwo.updatePower(this.playerTwo.power - damageTwo * 0.5);
          this.playerOne.updateWeapon(this.defaultWeapon);
        } else {
          // Player One attacks, player two attacks
          this.playerOne.updatePower(this.playerOne.power - damageOne);
          this.playerOne.updateWeapon(this.defaultWeapon);
          this.playerTwo.updatePower(this.playerTwo.power - damageTwo);
          this.playerTwo.updateWeapon(this.defaultWeapon);
        }
      }
    };

    // Change game state
    this.updateState = function (newState) {
      this.state = newState;
    };

    // Change battle state
    this.updateBattleModeState = function (boolean) {
      this.battleModeState = boolean;
    };
  }
;
// ---------- Global functions ----------------------------------------

  // Get random number
  function getRandomNumber (number) {
    return (number > 1) ? Math.floor(Math.random() * Number(number)) : 0;
  }

  // Calculate distance
  function distance (x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  // Check if coordinates exists in array
  function isInArray (coordinates, array) {
    if (getCoordinatesIndex(coordinates, array) < 0) {
      return false;
    } else {
      return true;
    }
  }

  // Check if coordinates exists in array
  function getCoordinatesIndex (coordinates, array) {
    var ind = -1;
    array.some(
      function (element, index) {
        if ((element[0] === coordinates[0]) && (element[1] === coordinates[1])) {
          ind = index;
          return true;
        }
        return false;
      });
    return ind;
  }

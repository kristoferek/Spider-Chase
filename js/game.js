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

// Different types of content:
//   [
//      0 - empty
//      1 - unavailable
//      2 - weapon
//   ]
// }
  var Board = function () {
    this.fieldClasses = {
      empty: 'available',
      obstacle: 'unavailable',
      player: 'player',
      weapon: 'weapon'
    };

    this.init = function (size) {
      this.size = size;
      this.fields = [];
      for (var x = 0; x < this.size; x++) {
        var column = [];
        for (var y = 0; y < this.size; y++) {
          column.push(this.fieldClasses.empty);
        }
        this.fields.push(column);
      }
    }

    this.setField = function([x,y], className){
      this.fields[x][y] = className;
    }

    // Generates list of random field indexes [[x, y],[x, y],[x, y]]
    this.randomFieldList = function (quantity) {
      var maxQuantity = this.size * this.size /4;

      // Proceed if quantity is lower then allowed max (density)
      if (quantity < maxQuantity && quantity >= 1) {
        var randomXYArr = [[getRandomNumber(this.size), getRandomNumber(this.size)]];
        // If requested quantity is more then one generate unique indexes
        if (quantity > 1){
          var i = 1;
          while (i < quantity){
            var newRandomIndex = [getRandomNumber(this.size), getRandomNumber(this.size)];
            var isUnique = !randomXYArr.some(function(indexXY){
              return indexXY[0] === newRandomIndex[0] && indexXY[1] === newRandomIndex[1]
            });
            if (isUnique){
              randomXYArr.push(newRandomIndex);
              i++;
            }
          }
        }
        return randomXYArr;

      // if requested quantity is to large
      } else {
        console.log(Error("Quantity of random indexes: " + quantity + " is greater then max: " + maxQuantity));
        return [];
      }
    }
  }

// ---------- Player object -------------------------------------------
  // coordinates:
  // x, y
  // range limit - integer;
  // possibleMoves - array of coordinates;
  // range - object,
  // power - integer;
  // weapon - object;

  var Player = function () {
    this.init = function (coordinates, rangeLimit, power, weapon, customClass) {
      this.x = coordinates[0];
      this.y = coordinates[1];
      this.rangeLimit = rangeLimit;
      this.possibleMoves = [];
      this.range = new Range(rangeLimit, rangeLimit, rangeLimit, rangeLimit);
      this.power = power;
      this.weapon = weapon;
      this.customClass = customClass;
      this.defend = false;
    }

    // Update player range and stores it in array of possible moves
    this.updatePossibleMoves = function(fieldsArr, obstacles) {
      // Set max player range coordinates for given board (fieldArr)
      var topLeft = {
        x: Math.min(Math.abs(this.x - this.rangeLimit), 0),
        y: Math.min(Math.abs(this.y - this.rangeLimit), 0)
      }
      var bottomRight = {
        x: Math.min(this.x + this.rangeLimit, fieldsArr.length - 1),
        y: Math.min(this.y + this.rangeLimit, fieldsArr[0].length - 1)
      }

      var arr = [];

      // Generate range array of coordinates
      for (var x = topLeft.x; x <= bottomRight.x; x++) {
        for (var y = topLeft.y; y <= bottomRight.y; y++) {
          // if distance is lower than range limit
          if (distance(this.x, this.y, x, y) <= this.rangeLimit) {
            // If field contains no obstacles add its coordinates to array
            (isInArray([x, y], obstacles)) ? null :  arr.push([x, y]);
          }
        }
      }
      this.possibleMoves = arr;
    }

    // Update position
    this.updatePosition = function (fieldArr, [x, y]) {
      this.x = x;
      this.y = y;
    }

    this.positonIsPossible = function(coordinates){
      return isInArray([coordinates[0], coordinates[1]], this.possibleMoves);
    }

    this.updateBattleMode = function(isDefend){
      this.defend = isDefend;
    }
  }

// ----------  Next step -------------------------------------------//
  var NextStep = function(){
    this.init = function(player){
      // Origin player
      this.origin = player;
      // Current distance
      this.distance = 0;
      // Max number of steps
      this.stepLimit = player.rangeLimit + 1;
      // Board coordinates
      this.x = this.origin.x;
      this.y = this.origin.y;
      // List of following moves
      this.path = [[this.x, this.y]];
    }

    // Check if next step is possible for origin player
    this.isPossible = function (coordinates) {
      return isInArray(coordinates, this.origin.possibleMoves);
    }

    this.updatePosition = function(coordinates){
      var inPathIndex = getCoordinatesIndex(coordinates, this.path);
      // if coordinates are not in the path
      if (inPathIndex < 0) {
        // if number of steps is lower than stepLimit
        if (this.path.length < this.stepLimit){
          // add coordinates it to the path
          this.path.push(coordinates);
          // update nextStep
          this.x = coordinates[0];
          this.y = coordinates[1];
          this.distance = distance(this.x, this.y, this.origin.x, this.origin.y);
        }
      // if they are in path, slice path to new including this coordinates
      } else if (inPathIndex => 0) {
        this.path = this.path.slice(0, inPathIndex + 1);
        this.x = coordinates[0];
        this.y = coordinates[1];
        this.distance = distance(this.x, this.y, this.origin.x, this.origin.y);
      }
    }

    this.updateOrigin = function(player){
      this.origin = player;
      this.distance = 0;
      this.x = this.origin.x;
      this.y = this.origin.y;
      this.path = [[this.x, this.y]];
    }
  }

// ---------- Game object -------------------------------------------

  var Game = function () {
    this.init = function(boardSize = 10, rangeLimit = 3, initialPower = 100, defaultWeapon = 0){
      this.initialPower = initialPower;
      this.defaultWeapon = defaultWeapon;

      // Counter of turns
      this.turnCounter = 0;

      // Initialize game board
      this.board = new Board();
      this.board.init(boardSize);

      // Generate random list of coordinates of board fields
      // - randXYList[0][0,1] for playerOne
      // - randXYList[1][0,1] for playerTwo
      // - randXYList[...rest] - for obstacles
      var randXYList = this.board.randomFieldList(20);

      // Set array of coordinats for obstacles
      this.obstacles = randXYList.slice(2).sort();

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

      // Initialize game and battle state
      this.state = 0;
      this.battleState = 0;
    }

    // Get opponent
    this.getOpponnent = function (player) {
      return (player === this.playerOne) ? this.playerTwo : this.playerOne;
    }

    // Update player position as well as previous and actual board fields content and turn counter
    this.actionMove = function (player, newCoordinates) {

      // Update player position and range
      player.updatePosition(this.board.fields, newCoordinates);

      // Update possible position arrays for actual player excluding obstacles and opponent coordinates
      player.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.getOpponnent(player).x, this.getOpponnent(player).y]]));

      // Update possible position arrays for second player excluding obstacles and opponent coordinates
      this.getOpponnent(player).updatePossibleMoves(this.board.fields, this.obstacles.concat([[player.x, player.y]]));

      // Update turn counter
      this.turnCounter++;
    }

    // Battle - update players power and weapon level depending on battle mode modeeselected
    this.actionBattle = function (playerOneDefend, playerTwoDefend){
      var damageOne = this.initialPower * this.playerTwo.weapon;
      var damageTwo = this.initialPower * this.playerOne.weapon;

      if (playerOneDefend){
        if (playerTwoDefend){
          // Player One defends, Player Two defends - no one attacks
        } else {
          // Player One defends, player Two attacks
          this.playerOne.power -= damageOne * 0.5;
          this.playerTwo.weapon = this.defaultWeapon;
        }
      } else {
        if (playerTwoDefend){
          // Player One attacks, player two defends
          this.playerTwo.power -= damageTwo * 0.5;
          this.playerOne.weapon = this.defaultWeapon;
        } else {
          // Player One attacks, player two attacks
          this.playerOne.power -= damageOne;
          this.playerTwo.power -= damageTwo;
          this.playerOne.weapon = this.defaultWeapon;
          this.playerTwo.weapon = this.defaultWeapon;
        }
      }
      console.log('One', this.playerOne.power, 'Two', this.playerTwo.power);
    }

    // Game states
    // 0 - 'welcome',
    // 1 - 'playerOne turn',
    // 2 - 'playerTwo turn',
    // 3 - 'playerOne decision'
    // 4 - 'playerTwo decision'
    // 5 - 'finished',
    // 6 - 'quit'
    this.states = [0, 1, 2, 3, 4, 5, 6];

    // Change game state
    this.updateState = function (newState) {
      this.state = newState;
    }
    this.updateBattleState = function (newState) {
      this.battleState =  newState;
    }
  }

// ---------- Global functions ----------------------------------------

  // Get random number
  function getRandomNumber(number){
    return (number > 1)
      ? Math.floor(Math.random() * Number(number))
      : 0;
  }

  // Calculate distance
  function distance(x1, y1, x2, y2){
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  // Check if coordinates exists in array
  function isInArray([x, y], array){
    var existsInArr = array.some(
      function(element){
        if ((element[0] === x) && (element[1] === y)){
          return true;
        }
        return false;
      }
    );
    return existsInArr;
  }

  // Check if coordinates exists in array
  function getCoordinatesIndex([x, y], array){
    var ind = -1;
    array.some(
      function(element, index){
        if ((element[0] === x) && (element[1] === y)){
          ind = index;
          return true;
        }
        return false;
      }
    );
    return ind;
  }

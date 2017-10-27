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

  // ---------- Range object -------------------------------------------
    //  top;
    //  right;
    //  bottom;
    //  left;

  var Range = function(top = 0, right = 0, bottom = 0, left = 0){
    this.top = top;
    this.right= right;
    this.bottom= bottom;
    this.left= left;
  }

// ---------- Player object -------------------------------------------
  // fieldIndex [x, y];
  // range limit;
  // range,
  // power;
  // weapon;

  var Player = function () {
    this.init = function (coordinates, rangeLimit, power, weapon, customClass) {
      this.x = coordinates[0];
      this.y = coordinates[1];
      this.rangeLimit = rangeLimit;
      this.range = new Range(rangeLimit, rangeLimit, rangeLimit, rangeLimit);
      this.power = power;
      this.weapon = weapon;
      this.customClass = customClass;
    }

    // Update movement range for given field index depending on board size and range limit
    this.edgeDistance = function (size) {
      var playerRange = this.range;
      var x = this.x;
      var y = this.y;
      var rangeLimit = this.rangeLimit

      // Choose lower value among distance among board edge and range limit
      playerRange.top = Math.min(y, rangeLimit);
      playerRange.right = Math.min((size - (x + 1)), rangeLimit);
      playerRange.bottom = Math.min((size - (y + 1)), rangeLimit);
      playerRange.left = Math.min(x, rangeLimit);

      return playerRange;
    }

    // Looks for obstacles and modifies previousy set range
    this.obstaclesDistance = function (board) {

      var playerRange = this.range;
      var obstacles = [board.fieldClasses.obstacle, board.fieldClasses.player];

      // Beginning from closest neighbour check field class, if it is 'unavailable' modify actual range, otherwise go to the next field in the same direction
      // Top closest obstacle in field range
      if (playerRange.top > 0){
        for (var range = 1; range <= playerRange.top; range++) {
          if (obstacles.indexOf(board.fields[this.x][this.y - range]) >= 0){
            playerRange.top = range - 1;
            break;
          }
        }
      }
      // Right closest obstacle in field range
      if (playerRange.right > 0){
        for (var range = 1; range <= playerRange.right; range++) {
          if (obstacles.indexOf(board.fields[this.x + range][this.y]) >= 0){
            playerRange.right = range - 1;
            break;
          }
        }
      }
      // Bottom closest obstacle in field range
      if (playerRange.bottom > 0){
        for (var range = 1; range <= playerRange.bottom; range++) {
          if (obstacles.indexOf(board.fields[this.x][this.y + range]) >= 0){
            playerRange.bottom = range - 1;
            break;
          }
        }
      }
      // Left closest obstacle in field range
      if (playerRange.left > 0){
        for (var range = 1; range <= playerRange.left; range++) {
          if (obstacles.indexOf(board.fields[this.x - range ][this.y]) >= 0){
            playerRange.left = range - 1;
            break;
          }
        }
      }

      return playerRange;
    }

    // Calculate range for player regarding board edges and obstacles
    this.calculateRange = function(boardObject){

      var newRange = this.range;
      // Update range regarding board edges and given limit
      newRange = this.edgeDistance(boardObject.size);
      // Update range regarding obstacles in distance
      newRange = this.obstaclesDistance(boardObject);
      // Update range regarding other player position

      return newRange;
    }

    // Move player to new field
    this.changePosition = function (boardObject, [x, y]) {
      // Assign new coordinates
      this.x = x;
      this.y = y;
      // Update available movement range
      this.range = this.calculateRange(boardObject);
    }

    // // Update weapon
    // this.updateWeapon = function (weapon) {
    //   return (weapon > this.weapon) ? weapon : this.weapon;
    // }
    //
    // // Decrease power
    // this.decreasePower = function (power) {
    //   return (power > this.power) ? 0 : this.power - power;
    // }
  }

// ---------- Game object -------------------------------------------

  var Game = function () {
    this.init = function(boardSize = 10, rangeLimit = 3, initialPower = 100, defaultWeapon = 0){

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

      // Set content type for every field with obstacles
      for (var i = 2; i < randXYList.length; i++) {
        this.board.fields[randXYList[i][0]][randXYList[i][1]] = this.board.fieldClasses.obstacle;
      }

      // Set class value for player fields
      this.board.fields[randXYList[0][0]][randXYList[0][1]] = this.board.fieldClasses.player;
      this.board.fields[randXYList[1][0]][randXYList[1][1]] = this.board.fieldClasses.player;
      // Initialize player one
      this.playerOne = new Player();
      this.playerOne.init(randXYList[0], rangeLimit, initialPower, defaultWeapon, 'playerOne');
      this.playerOne.range = this.playerOne.calculateRange(this.board);

      // Initialize player two
      this.playerTwo = new Player();
      this.playerTwo.init(randXYList[1], rangeLimit, initialPower, defaultWeapon, 'playerTwo');
      this.playerTwo.range = this.playerTwo.calculateRange(this.board);

      // Initialize game state
      this.state = 0;
    }

    // Update board fields with player class on position change
    this.movePlayer = function (player, newCoordinates) {
      this.board.fields[player.x][player.y] = this.board.fieldClasses.empty;
      player.changePosition(this.board, newCoordinates);
      this.board.fields[player.x][player.y] = this.board.fieldClasses.player;
      this.turnCounter++;
    }

    // Game states
    // 0 - 'welcome',
    // 1 - 'playerOne turn',
    // 2 - 'playerTwo turn',
    // 3 - 'finished',
    // 4 - 'quit'
    this.states = [0, 1, 2, 3, 4];

    // Change game state
    this.changeState = function (newState) {
      (this.states.indexOf(newState) >= 0) ? this.state = newState : 0;
    }
  }

// ---------- Global functions ----------------------------------------

// Get random number
  function getRandomNumber(number){
    return (number > 1)
      ? Math.floor(Math.random() * Number(number))
      : 0;
  }

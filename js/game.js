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

    // Looks for obstacles from array [obstacle, obstacle ...] and modifies previousy set range
    this.obstaclesDistance = function (board, obstacleArr) {

      var playerRange = this.range;
      var obstacles = obstacleArr;

      // Beginning from closest neighbour check field class, if it is 'unavailable' modify actual range, otherwise go to the next field in the same direction
      // Top closest obstacle in field range
      if (playerRange.top > 0){
        for (var range = 1; range <= playerRange.top; range++) {
          // Check if string in field contains any of obstacles
          var obstacleTop = obstacles.some(function (currentObstacle) {
            return board.fields[this.x][this.y - range].includes(currentObstacle);
          }, this);
          // If there is obstacle
          if (obstacleTop) {
            // Set new range and stop
            playerRange.top = range - 1;
            break;
          }
        }
      }
      // Right closest obstacle in field range
      if (playerRange.right > 0){
        for (var range = 1; range <= playerRange.right; range++) {
          // Check if string in field contains any of obstacles
          var obstacleRight = obstacles.some(function (currentObstacle) {
            return board.fields[this.x + range][this.y].includes(currentObstacle);
          }, this);
          // If there is obstacle
          if (obstacleRight) {
            // Set new range and stop
            playerRange.right = range - 1;
            break;
          }
        }
      }
      // Bottom closest obstacle in field range
      if (playerRange.bottom > 0){
        for (var range = 1; range <= playerRange.bottom; range++) {
          // Check if string in field contains any of obstacles
          var obstacleBottom = obstacles.some(function (currentObstacle) {
            return board.fields[this.x][this.y  + range].includes(currentObstacle);
          }, this);
          // If there is obstacle
          if (obstacleBottom) {
            // Set new range and stop
            playerRange.bottom = range - 1;
            break;
          }
        }
      }
      // Left closest obstacle in field range
      if (playerRange.left > 0){
        for (var range = 1; range <= playerRange.left; range++) {
          // Check if string in field contains any of obstacles
          var obstacleLeft = obstacles.some(function (currentObstacle) {
            return board.fields[this.x - range][this.y].includes(currentObstacle);
          }, this);
          // If there is obstacle
          if (obstacleLeft) {
            // Set new range and stop
            playerRange.left = range - 1;
            break;
          }
        }
      }

      return playerRange;
    }

    // Calculate range for player regarding board edges and obstacles
    this.calculateRange = function(boardObject, obstacles){

      var newRange = this.range;
      // Update range regarding board edges and given limit
      newRange = this.edgeDistance(boardObject.size);
      // Update range regarding obstacles in distance
      newRange = this.obstaclesDistance(boardObject, obstacles);
      // Update range regarding other player position

      return newRange;
    }

    // Move player to new field
    this.changePosition = function (boardObject, [x, y], obstacles) {
      // Assign new coordinates
      this.x = x;
      this.y = y;
      // Update available movement range
      this.range = this.calculateRange(boardObject, obstacles);
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
  }

// ----------  Next step -------------------------------------------//
  var NextStep = function(){
    this.init = function(player){
      // Origin player
      this.origin = player;
      // Current step
      this.distance = 0;
      // Max number of steps
      this.stepLimit = player.rangeLimit;
      // Board coordinates
      this.x = player.x;
      this.y = player.y;
    }

    // Check if next step is possible for origin player
    this.isPossible = function (coordinates) {
      return isInArray(coordinates, this.origin.possibleMoves);
    }

    this.updatePosition = function(coordinates){
      this.x = coordinates[0];
      this.y = coordinates[1];
      var newDistance = distance(this.origin.x, this.origin.y, this.x, this.y);
      if (newDistance < this.distance) {
        this.distance--;
      } else if (newDistance > this.distance) {
        this.distance++;
      }
    }

    this.updateOrigin = function(player){
      this.origin = player;
      this.distance = 0;
      this.x = this.origin.x;
      this.y = this.origin.y;
    }
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

      this.obstacles = randXYList.slice(2).sort();

      // Set content type for every field with obstacles
      // for (var i = 2; i < randXYList.length; i++) {
      //   this.board.fields[randXYList[i][0]][randXYList[i][1]] = this.board.fieldClasses.obstacle;
      // }

      // Initialize player one
      this.playerOne = new Player();
      this.playerOne.init(randXYList[0], rangeLimit, initialPower, defaultWeapon, 'playerOne');
      // this.playerOne.range = this.playerOne.calculateRange(this.board, [this.board.fieldClasses.obstacle, this.board.fieldClasses.player]);
      // Set class value for player fields as content
      // this.board.fields[randXYList[0][0]][randXYList[0][1]] = this.playerOne.customClass;

      // Initialize player two
      this.playerTwo = new Player();
      this.playerTwo.init(randXYList[1], rangeLimit, initialPower, defaultWeapon, 'playerTwo');
      // this.playerTwo.range = this.playerTwo.calculateRange(this.board, [this.board.fieldClasses.obstacle, this.board.fieldClasses.player]);
      // Set class value for player fields as content
      // this.board.fields[randXYList[1][0]][randXYList[1][1]] = this.playerTwo.customClass;

      // Update possible moves array for player One
      this.playerOne.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerTwo.x, this.playerTwo.y]]));

      // Update possible moves array for player Two
      this.playerTwo.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerOne.x, this.playerOne.y]]));

      // Set current player
      this.currentPlayer = this.playerOne;

      // Initialize game state
      this.state = 0;
    }

    // Get opponent
    this.getOpponent = function (player) {
      return (player === this.playerOne) ? this.playerTwo : this.playerOne;
    }

    // Update board fields with player class on position change
    this.movePlayer = function (player, newCoordinates, obstacles) {
      // Empty actual player field on board
      this.board.fields[player.x][player.y] = this.board.fieldClasses.empty;
      // Update player position and range
      player.changePosition(this.board, newCoordinates, obstacles);
      // Mark new player field on board
      this.board.fields[player.x][player.y] = player.customClass;
      // Update turn counter
      this.turnCounter++;
    }

    // Update player position as well as previous and actual board fields content and turn counter
    this.actionMove = function (player, newCoordinates) {
      // Empty previous player board field
      // this.board.setField([player.x, player.y], this.board.fieldClasses.empty);
      // Update player position and range
      player.updatePosition(this.board.fields, newCoordinates);
      this.playerOne.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerTwo.x, this.playerTwo.y]]));

      this.playerTwo.updatePossibleMoves(this.board.fields, this.obstacles.concat([[this.playerOne.x, this.playerOne.y]]));
      // Fill actual player field with player class
      // this.board.setField([player.x, player.y], player.customClass);
      // Update turn counter
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

  function distance(x1, y1, x2, y2){
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  // Check if coordinates exists in array
  function isInArray([x, y], array){
    var existsInArr = array.some(
      function(element){
        if (element[0] === x){
          if (element[1] === y){
            return true;
          }
        }
        return false;
      }
    );
    return existsInArr;
  }

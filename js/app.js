
document.addEventListener("DOMContentLoaded", function(){

// ---------- Board object -------------------------------------------

  var Board = function () {
    // Board is a square of defined size
    // consistsing of fields arranged in array of arrays
    // Each alement of board consists of:
    // - x coordinate,
    // - y coordinate,
    // - content
    // They are stored in fields array
    // fields[x][y][fieldContent index]
    // sample fields = [[fi, fi, fi], [fi, fi, fi], [fi, fi, fi]]]

    // Different types of content:
    //   [
    //      0 - empty
    //      1 - unavailable
    //      2 - weapon
    //   ]
    // }
    this.fieldContent = ['available', 'unavailable', 'weapon'];

    this.init = function (size) {
      this.size = size;
      this.fields = [];
      for (var x = 0; x < this.size; x++) {
        var column = [];
        for (var y = 0; y < this.size; y++) {
          column.push(0);
        }
        this.fields.push(column);
      }
    }

    // Generates list of random field indexes [x, y]
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
      // this.states = [0, 1, 2, 3];

      // Initialize game board
      this.board = new Board();
      this.board.init(boardSize);

      // Generate random list of indexes of board fields
      // - randXYList[0] for playerOne
      // - randXYList[1] for playerTwo
      // - randXYList[...rest] - for obstacles
      var randXYList = this.board.randomFieldList(20);

      // Set content type for every field with obstacles
      for (var i = 2; i < randXYList.length; i++) {
        this.board.fields[randXYList[i][0]][randXYList[i][1]] = 1;
      }

      // Initialize player one
      this.playerOne = new Player();
      this.playerOne.init(randXYList[0], rangeLimit, initialPower, defaultWeapon, 'playerOne');
      this.playerOne.range = this.calculateRange(this.playerOne);

      // Initialize player two
      this.playerTwo = new Player();
      this.playerTwo.init(randXYList[1], rangeLimit, initialPower, defaultWeapon, 'playerTwo');
      this.playerTwo.range = this.calculateRange(this.playerTwo);

      // Initialize game state
      this.state = 0;
    }


    // Update movement range for given field index depending on board size and range limit
    this.edgeDistance = function (player) {
      var playerRange = player.range;
      var x = player.x;
      var y = player.y;
      var rangeLimit = player.rangeLimit

      // Choose lower value among distance from board edge and range limit
      playerRange.top = Math.min(y, rangeLimit);
      playerRange.right = Math.min((this.board.size - (x + 1)), rangeLimit);
      playerRange.bottom = Math.min((this.board.size - (y + 1)), rangeLimit);
      playerRange.left = Math.min(x, rangeLimit);

      return playerRange;
    }

    // Looks for obstacles and modifies previousy set range
    this.obstaclesDistance = function (player) {

      var playerRange = player.range;
      // indexes of board.fields array
      var inX = player.x;
      var inY = player.y;

      // Beginning from closest neighbour check if field is 'unavailable' and modify actual range if neccessary
      // Top closest obstacle in field range
      if (playerRange.top > 0){
        for (var range = 1; range <= playerRange.top; range++) {
          if (this.board.fields[inX][inY - range] === 1){
            playerRange.top = range - 1;
            break;
          }
        }
      }
      // Right closest obstacle in field range
      if (playerRange.right > 0){
        for (var range = 1; range <= playerRange.right; range++) {
          if (this.board.fields[inX + range][inY] === 1){
            playerRange.right = range - 1;
            break;
          }
        }
      }
      // Bottom closest obstacle in field range
      if (playerRange.bottom > 0){
        for (var range = 1; range <= playerRange.bottom; range++) {
          if (this.board.fields[inX][inY + range] === 1){
            playerRange.bottom = range - 1;
            break;
          }
        }
      }
      // Left closest obstacle in field range
      if (playerRange.left > 0){
        for (var range = 1; range <= playerRange.left; range++) {
          if (this.board.fields[inX - range ][inY] === 1){
            playerRange.left = range - 1;
            break;
          }
        }
      }

      return playerRange;
    }

    // Calculate range for player regarding board edges and obstacles
    this.calculateRange = function(player){

      // Update range regarding board edges and given limit
      var newRange = this.edgeDistance(player);
      // Update range regarding obstacles in distan = ce
      newRange = this.obstaclesDistance(player);

      return newRange;
    }

    // Move player to new field
    this.changePosition = function (player, newCoordinates) {
      // Assign new coordinates
      player.x = newCoordinates[0];
      player.y = newCoordinates[1];
      // Update available movement range
      player.range = this.calculateRange(player);
    }

    // ---------- Display -------------------------------------------

    this.displayBoard = function (){

      // Find #board element
      var boardElement = $('#board')
      // .width((boardObject.size * 60) + 'px');

      // For every board row
      for (var y = 0; y < this.board.size; y++) {
        // Create div with class row
        var row = $('<div>').addClass('row');
        // For every field in a row
        for (var x = 0; x < this.board.size; x++) {
          // Create dive with class, id with field index umber in name and sample content
          var field = $('<div>').addClass('field ' + this.board.fieldContent[this.board.fields[x][y]]);
          field.attr('id', "field-" +  x + y);
          field.text(x + ', ' + y);
          // Add it to the row
          row.append(field);
        }
        // Add row to the board
        boardElement.append(row);
      }
    }

    // Find div with id with player coordinates and add player class
    this.showPlayer = function (player) {
      $('#field-'.concat(player.x, player.y)).addClass(player.customClass);
    }

    // Find div with id with player coordinates and remove player class
    this.hidePlayer = function (player) {
      $('#field-'.concat(player.x, player.y)).removeClass(player.customClass);
    }

    // Update player position
    this.updatePlayer = function (player, newCoordinates) {
      // Make player dispaear from board
      this.hidePlayer(player);
      // Update position and movement range
      this.changePosition(player, newCoordinates);
      // Make player appear on board
      this.showPlayer(player);
    }

    this.move = function (player, direction) {
      switch (direction) {
        case 'top':
          this.updatePlayer(player, [player.x, player.range.top > 0 ? player.y - 1 : player.y]);
          break;
        case 'right':
          this.updatePlayer(player, [player.range.right > 0 ? player.x + 1 : player.x, player.y]);
            break;
        case 'bottom':
          this.updatePlayer(player, [player.x, player.range.bottom > 0 ? player.y + 1 : player.y]);
          break;
        case 'left':
          this.updatePlayer(player, [player.range.left > 0 ? player.x - 1 : player.x, player.y]);
          break;
        default:
      }
    }

    // Game states
    // 0 - 'welcome',
    // 1 - 'playing',
    // 2 - 'finished',
    // 3 - 'quit'
    this.states = [0, 1, 2, 3];


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

  function handleMove(event, gameObject){
    switch (event.key) {
      case 'w':
        gameObject.move(gameObject.playerOne, 'top');
        break;
      case 'd':
        gameObject.move(gameObject.playerOne, 'right');
        break;
      case 's':
        gameObject.move(gameObject.playerOne, 'bottom');
        break;
      case 'a':
        gameObject.move(gameObject.playerOne, 'left');
        break;
      case 'o':
        gameObject.move(gameObject.playerTwo, 'top');
        break;
      case ';':
        gameObject.move(gameObject.playerTwo, 'right');
        break;
      case 'l':
        gameObject.move(gameObject.playerTwo, 'bottom');
        break;
      case 'k':
        gameObject.move(gameObject.playerTwo, 'left');
        break;
      default:
    }
    event.preventDefault();

  }

// ---------- Game cycle -------------------------------------------

  // Initialize game
  $(document).ready(function() {

    var myGame = new Game();
    myGame.init(10, 3, 100, 0);

    console.log(myGame);
    console.log("My game state is: ", myGame.state);

    myGame.displayBoard();
    myGame.showPlayer(myGame.playerOne);
    myGame.showPlayer(myGame.playerTwo);

    $(window).keypress(function (event) {
      handleMove(event, myGame);
    });
    //
    // while (myGame.state !== 3) {
    //   switch (myGame.state) {
    //     case 3:
    //     console.log("Quit");
    //     console.log("My game state is: ", myGame.state);
    //     break;
    //     case 2:
    //     console.log(myGame.playerOne);
    //     break;
    //     case 1:
    //     console.log(myGame.playerOne);
    //     break;
    //     default:
    //     console.log(myGame.board);
    //   }
    // }

    // var interval = setInterval(function(){
    //   if (myGame.state != 3) {
    //     console.log('czekam... Game state: ', myGame.state );
    //   } else {
    //     clearInterval(interval);
    //   }
    // }, 2000);
    //
    // while (myGame.state !== myGame.states[4]) {
    //   myGame.state = Number(prompt('State: '));
    //   console.log(myGame.state);
    // }
  });
});

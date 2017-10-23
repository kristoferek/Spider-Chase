
document.addEventListener("DOMContentLoaded", function(){


// ---------- Board object -------------------------------------------

  var Board = function () {
    // Board is a square of defined size
    // consistsing of fields arranged in array of arrays
    // Each fields consists of
    // {
    //   x coordinate,
    //   y coordinate,
    //   content:[
    //      0 - empty
    //      1 - unavailable
    //      2 - weapon
    //   ]
    // }

    this.init = function (size) {
      this.fields = [];
      this.size = size;
      for (var y = 1; y <= size; y++) {
        for (var x = 1; x <= size; x++) {
          this.fields.push({
            x: x,
            y: y,
            content: this.fieldContent[0]
          });
        }
      }
    }
    this.fieldContent = ['', 'unavailable', 'weapon'];

    // Generates list of random field indexes
    this.randomFieldList = function (quantity) {
      if (quantity < this.size || quantity >= 1) {
        var arr = [getRandomNumber(this.fields.length)];

        if (quantity > 1){
          var i = 0;
          while (i < quantity){
            var randomIndex = getRandomNumber(this.fields.length);
            if (arr.indexOf(randomIndex) < 0) {
              arr.push(randomIndex);
              i++;
            }
          }
        }
        return arr;
      } else {
        return undefined;
      }
    }
  }

// ---------- Player object -------------------------------------------
  // coordinate x;
  // coordinate y;
  // range limit;
  // range = {
  //  top;
  //  right;
  //  bottom;
  //  left;
  // }
  // power;
  // weapon;

  var Range = function(top = 0, right = 0, bottom = 0, left = 0){
    this.top = top;
    this.right= right;
    this.bottom= bottom;
    this.left= left;
  }

  var Player = function () {
    this.init = function (fieldIndex, rangeLimit, power, weapon) {
      this.fieldIndex = fieldIndex;
      this.rangeLimit = rangeLimit;
      this.range = new Range(rangeLimit, rangeLimit, rangeLimit, rangeLimit);
      this.power = power;
      this.weapon = weapon;
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
      // - First and second index - for players
      // - Rest - for obstacles
      var randIndexList = this.board.randomFieldList(12);

      // initialize obstacles
      this.obstacleIndexList = randIndexList.slice(2);
      // Set content type for every field with obstacles
      for (var i = 0; i < this.obstacleIndexList.length; i++) {
        this.board.fields[this.obstacleIndexList[i]].content = this.board.fieldContent[1];
      }

      // Initialize player one
      this.playerOne = new Player();
      this.playerOne.init(randIndexList[0], rangeLimit, initialPower, defaultWeapon);
      this.playerOne.range = this.calculateRange(this.playerOne.fieldIndex, this.playerOne.rangeLimit);

      // Initialize player two
      this.playerTwo = new Player();
      this.playerTwo.init(randIndexList[1], rangeLimit, initialPower, defaultWeapon);
      this.playerTwo.range = this.calculateRange(this.playerTwo.fieldIndex, this.playerTwo.rangeLimit);

      // Initialize game state
      this.state = 0;
    }

    // Looks for obstacles and modifies previousy set range
    this.obstaclesDistance = function (fieldIndex, fieldRange) {
      var obstacleRange = fieldRange;

      // Beginning from closest neighbour check if field is 'unavailable' and modify actual range if neccessary
      // Top closest obstacle in field range
      if (fieldRange.top > 0){
        for (var range = 1; range <= fieldRange.top; range++) {
          var minVerticalIndex = fieldIndex - (range * this.board.size);
          if (this.board.fields[minVerticalIndex].content === 'unavailable'){
            obstacleRange.top = range - 1;
            break;
          }
        }
      }
      // Right closest obstacle in field range
      if (fieldRange.right > 0){
        for (var range = 1; range <= fieldRange.right; range++) {
          var minHorizontalIndex = fieldIndex + range;
          if (this.board.fields[minHorizontalIndex].content === 'unavailable'){
            obstacleRange.right = range - 1;
            break;
          }
        }
      }
      // Bottom closest obstacle in field range
      if (fieldRange.bottom > 0){
        for (var range = 1; range <= fieldRange.bottom; range++) {
          var minVerticalIndex = fieldIndex + (range * this.board.size);
          if (this.board.fields[minVerticalIndex].content === 'unavailable'){
            obstacleRange.bottom = range - 1;
            break;
          }
        }
      }
      // Left closest obstacle in field range
      if (fieldRange.left > 0){
        for (var range = 1; range <= fieldRange.left; range++) {
          var minHorizontalIndex = fieldIndex - range;
          if (this.board.fields[minHorizontalIndex].content === 'unavailable'){
            obstacleRange.left = range - 1;
            break;
          }
        }
      }

      return obstacleRange;
    }

    // Update movement range for given coordinates depending on board size and range limit
    this.calculateRange = function(fieldIndex, rangeLimit){

      var newRange = new Range();

      // Choose lower value among distance from board edge and range limit
      newRange.top = Math.min(this.board.fields[fieldIndex].y - 1, rangeLimit);
      newRange.right = Math.min((this.board.size - this.board.fields[fieldIndex].x), rangeLimit);
      newRange.bottom = Math.min((this.board.size - this.board.fields[fieldIndex].y), rangeLimit);
      newRange.left = Math.min((this.board.fields[fieldIndex].x - 1), rangeLimit);

      // Update range regarding obstacles in distance
      newRange = this.obstaclesDistance(fieldIndex, newRange);
      return newRange;
    }

    // Move player to new field
    this.changePosition = function (player, newFieldIndex) {
      player.field = this.board.fields[newFieldIndex];
      player.range = this.calculateRange(newFieldIndex, player.rangeLimit);
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

// ---------- Display -------------------------------------------

  function displayBoard(boardObject){

    // Find #board element
    var board = $('#board').width((boardObject.size * 60) + 'px'); 

    // For every board row
    for (var i = 0; i < boardObject.size; i++) {
      // Create divwith class row
      var row = $('<div>').addClass('row');
      // For every field in a row
      for (var j = 0; j < boardObject.size; j++) {
        // Create dive with class, id and sample content
        var field = $('<div>')
          .addClass('field ' + boardObject.fields[i * boardObject.size + j].content);
        field.attr('id', "field-" +  boardObject.fields[i * boardObject.size].y + boardObject.fields[j].x);
        field.text(boardObject.fields[i * boardObject.size].y + ', ' + boardObject.fields[j].x);
        // Add it to the row
        row.append(field);
      }
      // Add row to the board
      board.append(row);
    }
  }

  function displayPlayer(field, playerClassName){
    $('#field-'.concat(field.y, field.x)).addClass(playerClassName);
  }

  function handleWelcome(event, gameObject){
    if (event.key !== 'q') {
    } else {
      gameObject.state = 3;
    }
  }



// ---------- Game cycle -------------------------------------------

  // Initialize game
  $(document).ready(function() {

    var myGame = new Game();
    myGame.init(7, 3, 100, 0);


    console.log(myGame);
    console.log("My game state is: ", myGame.state);

    displayBoard(myGame.board);
    displayPlayer(myGame.board.fields[myGame.playerOne.fieldIndex], 'playerOne');
    displayPlayer(myGame.board.fields[myGame.playerTwo.fieldIndex], 'playerTwo');

    $(window).keypress(function (event) {
      handleWelcome(event, myGame);
    });

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

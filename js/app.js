function handleGameState (gameObject, displayObject) {
  $(window).off();
  switch (gameObject.state) {
    case 0:
      // console.log('Welcome - game state:', gameObject.state);
      console.log('Press Enter to begin ');
      $(window).keydown(function (event) {
        (event.key === 'Enter') ? gameObject.state = 1 : null;
        handleGameState(gameObject, displayObject);
      });
      break;
    case  1:
      // console.log('Game Started - playerOne\'s move - game state:', gameObject.state);
      showPlayerRange(gameObject.playerOne, gameObject);
      $(window).keydown(function (event) {
        gameObject.state = playerOneTurn(event, gameObject, displayObject);
        handleGameState(gameObject, displayObject);
      });
      break;
    case  2:
      // console.log('Game Started - playerOne\'s move - game state:', gameObject.state);
      showPlayerRange(gameObject.playerTwo, gameObject);
      $(window).keydown(function (event) {
        gameObject.state = playerTwoTurn(event, gameObject, displayObject);
        handleGameState(gameObject, displayObject);
      });
      break;
    case  3:
      // console.log('Game Over - game state:', gameObject.state);
      console.log('Press Q to exit program');
      $(window).keydown(function (event) {
        gameObject.state = (event.key === 'q') ? 4 : gameObject.state;
        handleGameState(gameObject, displayObject);
      });
      break;
    case  4:
      // console.log('Game Exit - game state:', gameObject.state);
      break;
    default:

  }
}

$(document).ready(function() {

  var myGame = new Game();
  myGame.init(10, 3, 100, 0);
  console.log(myGame);

  var display = new Display()
  display.init(myGame);
  console.log(display);

  addClassName([myGame.playerOne.x, myGame.playerOne.y], myGame.playerOne.customClass);
  addClassName([myGame.playerTwo.x, myGame.playerTwo.y], myGame.playerTwo.customClass);

  handleGameState(myGame, display);

});

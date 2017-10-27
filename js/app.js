function handleGameState (gameObject) {
  $(window).off();
  switch (gameObject.state) {
    case 0:
      console.log('Welcome - game state:', gameObject.state);
      console.log('Press Enter to begin ');
      $(window).keydown(function (event) {
        (event.key = 'Enter') ? gameObject.state = 1 : null;
      });
      break;
    case  1:
      console.log('Game Started - playerOne\'s move - game state:', gameObject.state);
      $(window).keydown(function (event) {
        gameObject.state = playerOneTurn(event, gameObject);
        handleGameState(gameObject);
      });
      break;
    case  2:
      console.log('Game Started - playerOne\'s move - game state:', gameObject.state);
      $(window).keydown(function (event) {
        gameObject.state = playerTwoTurn(event, gameObject);
        handleGameState(gameObject);
      });
      break;
    case  3:
      console.log('Game Over - game state:', gameObject.state);
      console.log('Press Q to exit program');
      $(window).keydown(function (event) {
        gameObject.state = (event.key === 'q') ? 4 : gameObject.state;
        handleGameState(gameObject);
      });
      break;
    case  4:
      console.log('Game Exit - game state:', gameObject.state);
      break;
    default:

  }
}

$(document).ready(function() {

  var myGame = new Game();
  myGame.init(10, 3, 100, 0);

  console.log(myGame);
  var display = new Display()

  display.init(myGame.board.fields, myGame.board.fieldClasses);
  showPlayer(myGame.playerOne);
  showPlayer(myGame.playerTwo);

  handleGameState(myGame);

});

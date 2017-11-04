function handleGameState (gameObject, displayObject) {
  displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);
  $(window).off();
  displayObject.modal.buttonAttack.off('click');
  displayObject.modal.buttonDefend.off('click');

  switch (gameObject.state) {
    case 0:
      // console.log('Welcome - game state:', gameObject.state);
      console.log('Press Enter to begin ');
      $(window).keydown(function (event) {
        (event.key === 'Enter') ? gameObject.updateState(1) : null;
        handleGameState(gameObject, displayObject);
      });
      break;

    case  1:
      $(window).keydown(function (event) {
        gameObject.updateState(handlePlayerTurn(event, gameObject, gameObject.playerOne, displayObject));
        handleGameState(gameObject, displayObject);
      });
      break;

    case  2:
      $(window).keydown(function (event) {
        gameObject.updateState(handlePlayerTurn(event, gameObject, gameObject.playerTwo, displayObject));
        handleGameState(gameObject, displayObject);
      });
      break;

    case 3:
      displayObject.modal.setTitle(gameObject.playerOne.customClass);
      displayObject.modal.window.fadeIn();
      displayObject.modal.buttonAttack.on('click', function(event){
        gameObject.updateState(handleDecision(gameObject, gameObject.playerOne, false));
        displayObject.modal.window.fadeOut();
        handleGameState(gameObject, displayObject);
      });

      displayObject.modal.buttonDefend.on('click', function(event){
        gameObject.updateState(handleDecision(gameObject, gameObject.playerOne, true));
        displayObject.modal.window.fadeOut();
        handleGameState(gameObject, displayObject);
      });
      break;

    case 4:
      displayObject.modal.setTitle(gameObject.playerTwo.customClass);
      displayObject.modal.window.fadeIn();
      displayObject.modal.buttonAttack.on('click', function(event){
        gameObject.updateState(handleDecision(gameObject, gameObject.playerTwo, false));
        displayObject.modal.window.fadeOut();
        handleGameState(gameObject, displayObject);
      });

      displayObject.modal.buttonDefend.on('click', function(event){
        gameObject.updateState(handleDecision(gameObject, gameObject.playerTwo, true));
        displayObject.modal.window.fadeOut();
        handleGameState(gameObject, displayObject);
      });
      break;

    case  5:
      console.log('Press Q to exit program');
      $(window).keydown(function (event) {
        gameObject.updateState((event.key === 'q') ? 6 : gameObject.state);
        handleGameState(gameObject, displayObject);
      });
      break;

    case  6:
      // console.log('Game Exit - game state:', gameObject.state);
      break;
    default:
  }
}

$(document).ready(function() {

  // initialize game object
  var myGame = new Game();
  myGame.init(10, 3, 100, 0.1);

  // initialize display object
  var display = new Display()
  display.init(myGame);

  // console.log(myGame);
  // console.log(display);

  handleGameState(myGame, display);


});

/* eslint semi: ["error", "always"] */
$(document).ready(function () {
  // initialize game object
  var myGame = new Game();
  myGame.init(10, 3, 100, 1, 15, 4);

  // initialize display object
  var display = new Display();
  display.init(myGame);

  // initialize game handlers
  var handle = new Handle();

  // run game, display and handlers
  handle.gameState(myGame, display);
});

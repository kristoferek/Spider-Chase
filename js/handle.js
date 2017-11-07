/* eslint semi: ["error", "always"] */
// ---------- Game cycle -------------------------------------------

var Handle = function (gameObject, displayObject) {
  this.playerTurn = function (event, gameObject, player, displayObject) {
    switch (event.key) {
      case 'ArrowUp':
        displayObject.showNextPossibleStep([displayObject.nextStep.x, displayObject.nextStep.y - 1]);
        break;
      case 'ArrowRight':
        displayObject.showNextPossibleStep([displayObject.nextStep.x + 1, displayObject.nextStep.y]);
        break;
      case 'ArrowDown':
        displayObject.showNextPossibleStep([displayObject.nextStep.x, displayObject.nextStep.y + 1]);
        break;
      case 'ArrowLeft':
        displayObject.showNextPossibleStep([displayObject.nextStep.x - 1, displayObject.nextStep.y]);
        break;
      case 'Enter':
        // hide actual player path, range and position
        displayObject.hidePlayerRange(player);
        displayObject.hidePlayer(player);

        // hide weapons
        displayObject.hideWeapons(gameObject.weapons);

        // Update player position, weapon and both player possible moves arrays
        gameObject.actionMove(player, [displayObject.nextStep.x, displayObject.nextStep.y], displayObject.nextStep.path);

        // Reset nextStep and change its origin to opponent player
        displayObject.nextStep.updateOrigin(gameObject.getOpponnent(player));

        // Show updated player and range in new position
        displayObject.showPlayer(player);

        // Display opponent player range
        displayObject.showPlayerRange(gameObject.getOpponnent(player));

        // Dosplay weapons
        displayObject.showWeapons(gameObject.weapons);

        // Check the distance between players
        var adjacent = (distance(player.x, player.y, gameObject.getOpponnent(player).x, gameObject.getOpponnent(player).y) < 2);

        // If players after move are at adjacent positions - handle battle
        if (adjacent && (gameObject.battleState === 0)) {
          if (gameObject.state === 1) {
            return 4;
          } else {
            return 3;
          }
        }
        // Otherwise - handle battle
        if (gameObject.state === 1) {
          return 2;
        } else {
          return 1;
        }
        break;
      case 'q':
        return 5;
      default:
    }
    return gameObject.state;
  };

  // Return game state depending on battle stage
  this.decision = function (gameObject, player, decision) {
    // If no player made a battle mode decision
    if (gameObject.battleState === 0) {
      // Set first player decision
      player.updateBattleMode(decision);
      // Update battle state
      gameObject.updateBattleState(gameObject.battleState + 1);
      // Go to second player decision setting
      return (gameObject.state === 3) ? 4 : 3;
    // If first player has made decision
    } else if (gameObject.battleState === 1) {
      // Set second player decision
      player.updateBattleMode(decision);
      // Update battle state
      gameObject.updateBattleState(gameObject.battleState + 1);
      // Handle battle
      gameObject.actionBattle(gameObject.playerOne, gameObject.playerTwo);
      // reset battle state
      gameObject.updateBattleState(0);
      // Go to first player turn
      return (gameObject.state === 3) ? 2 : 1;
    }
  };

  this.gameState = function (gameObject, displayObject) {
    displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);
    $(window).off();
    displayObject.modal.buttonAttack.off('click');
    displayObject.modal.buttonDefend.off('click');

    var handle = this;

    // var state = {
    //   START: 0,
    //   ...
    // }
    // var START = 0;
    // var PLAYERONETURN = 1;
    // var PLAYERTWOTURN = 2;

    switch (gameObject.state) {
      // case state.START:
      case 0:
        // console.log('Welcome - game state:', gameObject.state);
        console.log('Press Enter to begin ');
        $(window).keydown(function (event) {
          (event.key === 'Enter') ? gameObject.updateState(1) : null;
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 1:
        $(window).keydown(function (event) {
          gameObject.updateState(handle.playerTurn(event, gameObject, gameObject.playerOne, displayObject));
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 2:
        $(window).keydown(function (event) {
          gameObject.updateState(handle.playerTurn(event, gameObject, gameObject.playerTwo, displayObject));
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 3:
        displayObject.modal.setTitle(gameObject.playerOne.customClass);
        displayObject.modal.window.fadeIn();
        displayObject.modal.buttonAttack.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, false));
          displayObject.modal.window.fadeOut();
          handle.gameState(gameObject, displayObject);
        });

        displayObject.modal.buttonDefend.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, true));
          displayObject.modal.window.fadeOut();
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 4:
        displayObject.modal.setTitle(gameObject.playerTwo.customClass);
        displayObject.modal.window.fadeIn();
        displayObject.modal.buttonAttack.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, false));
          displayObject.modal.window.fadeOut();
          handle.gameState(gameObject, displayObject);
        });

        displayObject.modal.buttonDefend.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, true));
          displayObject.modal.window.fadeOut();
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 5:
        console.log('Press Q to exit program');
        $(window).keydown(function (event) {
          gameObject.updateState((event.key === 'q') ? 6 : gameObject.state);
          handle.gameState(gameObject, displayObject);
        });
        break;

      case 6:
        // console.log('Game Exit - game state:', gameObject.state);
        break;
      default:
    }
  };
};

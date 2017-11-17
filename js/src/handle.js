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
        // Handle and display player move
        displayObject.playerMoves(gameObject, player);

        // Check the distance between players
        var adjacent = (distance(player.x, player.y, gameObject.getOpponnent(player).x, gameObject.getOpponnent(player).y) < 2);

        // If players after move are at adjacent positions
        if (adjacent && (!gameObject.battleModeState)) {
          // and they haven't began battle yet - handle battle mode for first player
          if (gameObject.state === gameObject.states.PLAYERONE_TURN) {
            return gameObject.states.PLAYERTWO_BATTLEMODE;
          // or handle battle mode for second player and perform battle
          } else {
            return gameObject.states.PLAYERONE_BATTLEMODE;
          }
        }
        // Otherwise - handle turns
        if (gameObject.state === gameObject.states.PLAYERONE_TURN) {
          return gameObject.states.PLAYERTWO_TURN;
        } else {
          return gameObject.states.PLAYERONE_TURN;
        }
        break;
      case 'q':
        return gameObject.states.GAMEOVER;
      default:
    }
    return gameObject.state;
  };

  // Return game state depending on battle stage
  this.decision = function (gameObject, player, decision) {
    // If no player made a battle mode decision
    if (!gameObject.battleModeState) {
      // Update battle state
      gameObject.updateBattleModeState(gameObject.battleModeStates.ON);
      // Set first player decision
      player.updateBattleMode(decision);
      // Go to second player decision setting
      if (gameObject.state === gameObject.states.PLAYERONE_BATTLEMODE) {
        return gameObject.states.PLAYERTWO_BATTLEMODE;
      } else {
        return gameObject.states.PLAYERONE_BATTLEMODE;
      }
    // If first player has made decision
    } else if (gameObject.battleModeState) {
      // Set second player decision
      player.updateBattleMode(decision);
      // Handle battle
      gameObject.actionBattle(gameObject.playerOne, gameObject.playerTwo);
      // Reset battle state
      gameObject.updateBattleModeState(gameObject.battleModeStates.OFF);
      // If one of players power is lower then zero go to GAMEOVER state
      if (gameObject.playerOne.power <= 0 || gameObject.playerTwo.power <= 0) {
        return gameObject.states.GAMEOVER;
      }
      // Go to first player turn
      if (gameObject.state === gameObject.states.PLAYERONE_BATTLEMODE) {
        return gameObject.states.PLAYERTWO_TURN;
      } else {
        return gameObject.states.PLAYERONE_TURN;
      }
    }
  };

  this.gameState = function (gameObject, displayObject) {
    // Reset event listeners
    $(window).off();
    displayObject.modal.buttonAttack.off('click');
    displayObject.modal.buttonDefend.off('click');

    var handle = this;

    switch (gameObject.state) {
      // Handle welcome screen
      case gameObject.states.START:
        // console.log('Welcome - game state:', gameObject.state);
        console.log('Press Enter to begin ');
        $(window).keydown(function (event) {
          if (event.key === 'Enter') {
            gameObject.updateState(gameObject.states.PLAYERONE_TURN);
          }
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle player One move
      case gameObject.states.PLAYERONE_TURN:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Handle player turn
        $(window).keydown(function (event) {
          // Handle player moves
          gameObject.updateState(handle.playerTurn(event, gameObject, gameObject.playerOne, displayObject));
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle player Two move
      case gameObject.states.PLAYERTWO_TURN:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Handle player turn
        $(window).keydown(function (event) {
          // Handle player moves and update game state
          gameObject.updateState(handle.playerTurn(event, gameObject, gameObject.playerTwo, displayObject));
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle player One battle mode selection and battle
      case gameObject.states.PLAYERONE_BATTLEMODE:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Display modal for battle mode selection
        displayObject.modal.setTitle(gameObject.playerOne.customClass);
        displayObject.modal.window.fadeIn(200);

        // Handle player battle mode selection for ATTACK
        displayObject.modal.buttonAttack.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.ATTACK));
          displayObject.modal.window.fadeOut(100);
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });

        // Handle player battle mode selection for DEFEND
        displayObject.modal.buttonDefend.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.DEFEND));
          displayObject.modal.window.fadeOut();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle player Two battle mode selection and battle
      case gameObject.states.PLAYERTWO_BATTLEMODE:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Display modal for battle mode selection
        displayObject.modal.setTitle(gameObject.playerTwo.customClass);
        displayObject.modal.window.fadeIn(200);

        // Handle player battle mode selection for ATTACK
        displayObject.modal.buttonAttack.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.ATTACK));
          displayObject.modal.window.fadeOut(100);
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });

        // Handle player battle mode selection for DEFEND
        displayObject.modal.buttonDefend.on('click', function (event) {
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.DEFEND));
          displayObject.modal.window.fadeOut();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle Game Over
      case gameObject.states.GAMEOVER:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        console.log('Press Q to exit program');
        $(window).keydown(function (event) {
          if (event.key === 'q') {
            gameObject.updateState(gameObject.states.QUIT);
          }
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle Quit gamwe
      case 6:
        console.log('Game Exit - game state:', gameObject.state);
        break;
      default:
    }
  };
};

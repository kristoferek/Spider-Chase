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

  this.restart = function (gameObject, displayObject) {
    gameObject.restart();
    displayObject.init(gameObject);
  };

  this.gameState = function (gameObject, displayObject) {
    // Reset event listeners
    $(window).off();
    displayObject.modal.buttonAttack.off('click');
    displayObject.modal.buttonDefend.off('click');

    // Add global listeners for Restart game button
    displayObject.buttonRestart.on('click', function () {
      // Reinitialize game and display objects
      handle.restart(gameObject, displayObject);
      // Start game with player One turn
      gameObject.updateState(gameObject.states.START);
      // Hide modal window
      displayObject.modal.emptyAndHide();
      // Handle game state
      handle.gameState(gameObject, displayObject);
    });

    var handle = this;

    switch (gameObject.state) {
      // Handle welcome screen
      case gameObject.states.START:
        // Display wecome modal
        displayObject.modal.welcomeShow();
        // When Enter pressed
        $(window).keydown(function (event) {
          if (event.key === 'Enter') {
            // Start with player one turn
            gameObject.updateState(gameObject.states.PLAYERONE_TURN);
          }
          // hide modal window
          displayObject.modal.emptyAndHide();
          // Handle game state
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
        displayObject.modal.decisionShow(gameObject.playerOne.customClass);
        // Show opposite player range
        displayObject.hidePlayerRange(gameObject.playerOne);
        displayObject.showPlayerRange(gameObject.playerTwo);

        // Handle player battle mode selection for ATTACK
        $(window).keydown(function (event) {
          if (event.key === 'Enter') {
            // Set current player battle mode to Attack
            gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.ATTACK));
            // Remove modal
            displayObject.modal.emptyAndHide();
            // Handle game state
            handle.gameState(gameObject, displayObject);
          }
        });
        displayObject.modal.buttonAttack.on('click', function (event) {
          // Set current player battle mode to Attack
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.ATTACK));
          // Remove modal
          displayObject.modal.emptyAndHide();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });

        // Handle player battle mode selection for DEFEND on click and Esc
        $(window).keydown(function (event) {
          if (event.key === 'Escape') {
            // Set current player battle mode to Defend
            gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.DEFEND));
            // Remove modal
            displayObject.modal.emptyAndHide();
            // Handle game state
            handle.gameState(gameObject, displayObject);
          }
        });
        displayObject.modal.buttonDefend.on('click', function (event) {
          // Set current player battle mode to Defend
          gameObject.updateState(handle.decision(gameObject, gameObject.playerOne, gameObject.decisions.DEFEND));
          // Remove modal
          displayObject.modal.emptyAndHide();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        break;

      // Handle player Two battle mode selection and battle
      case gameObject.states.PLAYERTWO_BATTLEMODE:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Display modal for battle mode selection
        displayObject.modal.decisionShow(gameObject.playerTwo.customClass)
        // Show opposite player range
        displayObject.hidePlayerRange(gameObject.playerTwo);
        displayObject.showPlayerRange(gameObject.playerOne);

        // Handle player battle mode selection for ATTACK
        displayObject.modal.buttonAttack.on('click', function (event) {
          // Set current player battle mode to Attack
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.ATTACK));
          // Show opposite player range
          displayObject.modal.emptyAndHide();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        $(window).keydown(function (event) {
          if (event.key === 'Enter') {
            // Set current player battle mode to Attack
            gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.ATTACK));
            // Show opposite player range
            displayObject.modal.emptyAndHide();
            // Handle game state
            handle.gameState(gameObject, displayObject);
          }
        });

        // Handle player battle mode selection for DEFEND
        displayObject.modal.buttonDefend.on('click', function (event) {
          // Set current player battle mode to Defend
          gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.DEFEND));
          // Show opposite player range
          displayObject.modal.emptyAndHide();
          // Handle game state
          handle.gameState(gameObject, displayObject);
        });
        $(window).keydown(function (event) {
          if (event.key === 'Escape') {
            // Set current player battle mode to Defend
            gameObject.updateState(handle.decision(gameObject, gameObject.playerTwo, gameObject.decisions.DEFEND));
            // Show opposite player range
            displayObject.modal.emptyAndHide();
            // Handle game state
            handle.gameState(gameObject, displayObject);
          }
        });
        break;

      // Handle Game Over
      case gameObject.states.GAMEOVER:
        // Activate player information
        displayObject.updateGameInformation(gameObject.playerOne, gameObject.playerTwo, gameObject);

        // Player One wins
        if (gameObject.playerOne.power > 0 && gameObject.playerTwo.power <= 0) {
          displayObject.modal.gameOverShow(gameObject.gameOverStates.PLAYERONE_WINS, gameObject.gameOverStates, displayObject);
        // Player Two wins
        } else if (gameObject.playerOne.power <= 0 && gameObject.playerTwo.power > 0) {
          displayObject.modal.gameOverShow(gameObject.gameOverStates.PLAYERTWO_WINS, gameObject.gameOverStates, displayObject);
        // Draw
        } else if (gameObject.playerOne.power <= 0 && gameObject.playerTwo.power <= 0) {
          displayObject.modal.gameOverShow(gameObject.gameOverStates.DRAW, gameObject.gameOverStates, displayObject);
        } else {
          displayObject.modal.gameOverShow('', gameObject.gameOverStates);
        }

        $(window).keydown(function (event) {
          if (event.key === 'Enter') {
            handle.restart(gameObject, displayObject);
            gameObject.updateState(gameObject.states.PLAYERONE_TURN);
          }
          displayObject.modal.emptyAndHide();
          handle.gameState(gameObject, displayObject);
        });
        break;
      default:
    }
  };
};
